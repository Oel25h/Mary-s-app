import { GoogleGenerativeAI } from '@google/generative-ai'
import { Transaction, ImportResult, FileProcessingResult, AIParseResponse, ValidationResult, ImportOptions } from '@/types'
import { ocrService } from './ocrService'

/**
 * AI-Powered Import Service using Google Gemini
 * Intelligently parses financial data from various formats including PDF, CSV, and text
 */
class AIImportService {
  private genAI: GoogleGenerativeAI
  private model: any

  constructor() {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('Google Gemini API key not found')
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey)
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  }

  /**
   * Process multiple files for transaction import
   */
  async processFiles(files: File[], options: ImportOptions = {}): Promise<ImportResult> {
    const result: ImportResult = {
      transactions: [],
      errors: [],
      warnings: [],
      summary: {
        totalProcessed: files.length,
        successfullyParsed: 0,
        failed: 0,
        duplicatesFound: 0
      }
    }

    for (const file of files) {
      try {
        // Extract content from file
        const extractResult = await this.extractFileContent(file)
        
        if (extractResult.error) {
          result.errors.push(`${file.name}: ${extractResult.error}`)
          result.summary.failed++
          continue
        }

        // Validate request size before processing
        const sizeValidation = this.validateRequestSize(extractResult.content, file.name)
        if (!sizeValidation.isValid) {
          result.errors.push(`${file.name}: ${sizeValidation.error}`)
          if (sizeValidation.warning) {
            result.warnings.push(`${file.name}: ${sizeValidation.warning}`)
          }
          result.summary.failed++
          continue
        }

        if (sizeValidation.warning) {
          result.warnings.push(`${file.name}: ${sizeValidation.warning}`)
        }

        // Parse content with AI
        const aiResult = await this.parseWithAI(extractResult.content, file.name, options)
        
        // Add transactions to result
        result.transactions.push(...aiResult.transactions.map(t => ({
          id: this.generateImportId(),
          date: new Date(t.date),
          description: t.description,
          amount: Math.abs(t.amount),
          category: t.category,
          type: t.type
        })))

        result.errors.push(...aiResult.errors)
        result.warnings.push(...aiResult.warnings)
        result.summary.successfullyParsed++

      } catch (error) {
        result.errors.push(`${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        result.summary.failed++
      }
    }

    return result
  }

  /**
   * Process text input for transaction import
   */
  async processText(text: string, options: ImportOptions = {}): Promise<ImportResult> {
    const result: ImportResult = {
      transactions: [],
      errors: [],
      warnings: [],
      summary: {
        totalProcessed: 1,
        successfullyParsed: 0,
        failed: 0,
        duplicatesFound: 0
      }
    }

    try {
      // Validate request size before processing
      const sizeValidation = this.validateRequestSize(text, 'text-input')
      if (!sizeValidation.isValid) {
        result.errors.push(sizeValidation.error!)
        if (sizeValidation.warning) {
          result.warnings.push(sizeValidation.warning)
        }
        result.summary.failed = 1
        return result
      }

      if (sizeValidation.warning) {
        result.warnings.push(sizeValidation.warning)
      }

      const aiResult = await this.parseWithAI(text, 'text-input', options)
      
      result.transactions = aiResult.transactions.map(t => ({
        id: this.generateImportId(),
        date: new Date(t.date),
        description: t.description,
        amount: Math.abs(t.amount),
        category: t.category,
        type: t.type
      }))

      result.errors = aiResult.errors
      result.warnings = aiResult.warnings
      result.summary.successfullyParsed = result.transactions.length > 0 ? 1 : 0
      result.summary.failed = result.transactions.length === 0 ? 1 : 0

    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Unknown error')
      result.summary.failed = 1
    }

    return result
  }

  /**
   * Extract content from various file types
   */
  private async extractFileContent(file: File): Promise<FileProcessingResult> {
    const result: FileProcessingResult = {
      content: '',
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        extractedAt: new Date()
      }
    }

    try {
      const extension = file.name.toLowerCase().split('.').pop()
      
      switch (extension) {
        case 'csv':
        case 'txt':
          result.content = await file.text()
          break
          
        case 'pdf':
          result.content = await this.extractPDFContent(file)
          break
          
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'bmp':
        case 'webp':
          result.content = await this.extractImageContent(file)
          break
          
        default:
          result.error = `Unsupported file type: ${extension}. Supported types: CSV, TXT, PDF, JPG, PNG, GIF, BMP, WEBP`
      }
    } catch (error) {
      result.error = `Failed to extract content: ${error instanceof Error ? error.message : 'Unknown error'}`
    }

    return result
  }

  /**
   * Extract text content from PDF files using PDF.js
   */
  private async extractPDFContent(file: File): Promise<string> {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        throw new Error('PDF processing is only available in browser environment')
      }

      // Dynamically import PDF.js to avoid SSR issues
      const pdfjsLib = await import('pdfjs-dist')
      
      // Configure PDF.js worker for Next.js with environment check
      if (typeof window !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
      }
      
      // Convert file to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer()
      
      // Load the PDF document
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      
      let extractedText = ''
      
      // Extract text from each page
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum)
        const textContent = await page.getTextContent()
        
        // Combine text items into readable format
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ')
          .replace(/\s+/g, ' ') // Normalize whitespace
          .trim()
        
        if (pageText) {
          extractedText += pageText + '\n\n'
        }
      }
      
      if (!extractedText.trim()) {
        throw new Error('No text content found in PDF. This might be a scanned document that requires OCR.')
      }
      
      return extractedText.trim()
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      // Provide helpful error messages
      if (errorMessage.includes('Invalid PDF') || errorMessage.includes('corrupted')) {
        throw new Error('Invalid or corrupted PDF file. Please check the file and try again.')
      } else if (errorMessage.includes('OCR')) {
        throw new Error('This PDF appears to be a scanned document. OCR functionality is coming soon - for now, please copy the text manually.')
      } else if (errorMessage.includes('browser environment')) {
        throw new Error('PDF processing is only available on the client side. Please try again.')
      } else {
        throw new Error(`Failed to extract PDF content: ${errorMessage}`)
      }
    }
  }

  /**
   * Extract text content from images using OCR
   */
  private async extractImageContent(file: File): Promise<string> {
    try {
      // Check if OCR is supported in this environment
      if (!ocrService.isSupported()) {
        throw new Error('OCR is not supported in this browser. Please use a modern browser with WebAssembly support.')
      }
      
      // Process the image with OCR
      const result = await ocrService.processImage(file)
      
      // Check if we got useful text
      if (!result.text || result.text.trim().length < 10) {
        throw new Error('No readable text found in the image. Make sure the image is clear and contains financial data.')
      }
      
      // Check confidence level
      if (result.confidence < 0.5) {
        console.warn(`Low OCR confidence (${(result.confidence * 100).toFixed(1)}%) for file: ${file.name}`)
      }
      
      return result.text
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      // Provide helpful error messages
      if (errorMessage.includes('not supported')) {
        throw new Error('OCR is not supported in this browser. Please use a modern browser or try the text input option.')
      } else if (errorMessage.includes('too large')) {
        throw new Error('Image file is too large. Please reduce the file size to under 10MB.')
      } else if (errorMessage.includes('No readable text')) {
        throw new Error('No readable text found in the image. Please ensure the image is clear and contains financial data, or try using the text input option.')
      } else {
        throw new Error(`Failed to process image: ${errorMessage}`)
      }
    }
  }

  /**
   * Parse content using Google Gemini AI with retry logic
   */
  private async parseWithAI(content: string, source: string, options: ImportOptions = {}): Promise<AIParseResponse> {
    const startTime = Date.now()
    const prompt = this.buildPrompt(content, options)

    // Retry configuration
    const maxRetries = 3
    const baseDelay = 1000 // 1 second
    const maxDelay = 10000 // 10 seconds

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Add timeout to prevent hanging requests
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000)
        })

        const apiPromise = this.model.generateContent(prompt)
        const result = await Promise.race([apiPromise, timeoutPromise]) as any
        const response = await result.response
        const text = response.text()

        // Parse the JSON response
        const aiResponse = this.parseAIResponse(text)

        return {
          ...aiResponse,
          metadata: {
            totalFound: aiResponse.transactions.length,
            processingTime: Date.now() - startTime,
            model: 'gemini-1.5-flash'
          }
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'

        // Check if this is a retryable error
        const isRetryable = this.isRetryableError(error)

        if (attempt === maxRetries || !isRetryable) {
          // Final attempt failed or non-retryable error
          const finalError = isRetryable
            ? `AI parsing failed after ${maxRetries + 1} attempts. Google's servers may be overloaded. Please try again later.`
            : `AI parsing failed: ${errorMessage}`

          return {
            transactions: [],
            errors: [finalError],
            warnings: isRetryable ? ['This appears to be a temporary issue with Google\'s AI service. You may have better luck trying again in a few minutes.'] : [],
            metadata: {
              totalFound: 0,
              processingTime: Date.now() - startTime,
              model: 'gemini-1.5-flash'
            }
          }
        }

        // Calculate delay with exponential backoff and jitter
        const delay = Math.min(
          baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
          maxDelay
        )

        await this.sleep(delay)
      }
    }

    // This should never be reached, but TypeScript requires it
    throw new Error('Unexpected error in retry logic')
  }

  /**
   * Check if an error is retryable (temporary server issues)
   */
  private isRetryableError(error: any): boolean {
    const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase()

    // Common retryable error patterns
    const retryablePatterns = [
      'overloaded',
      'service unavailable',
      '503',
      '502',
      '500',
      'timeout',
      'network error',
      'connection error',
      'rate limit',
      'quota exceeded'
    ]

    return retryablePatterns.some(pattern => errorMessage.includes(pattern))
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Build the AI prompt for transaction parsing
   */
  private buildPrompt(content: string, options: ImportOptions): string {
    const dateFormat = options.dateFormat === 'auto' ? 'any common format' : options.dateFormat || 'any common format'
    const currency = options.currency || 'USD'
    
    return `You are a financial data parser. Parse the following financial data and extract transactions.

IMPORTANT: Respond ONLY with valid JSON in this exact format:
{
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "description": "Transaction description",
      "amount": 123.45,
      "category": "Category name",
      "type": "income" or "expense",
      "confidence": 0.95
    }
  ],
  "errors": ["Any parsing errors"],
  "warnings": ["Any warnings or notes"]
}

Rules:
1. Extract ALL financial transactions you can identify
2. Convert dates to YYYY-MM-DD format (expected input format: ${dateFormat})
3. Use positive numbers for amounts (we'll handle income/expense in the type field)
4. Categorize transactions appropriately (Food & Dining, Transportation, Income, etc.)
5. Set confidence between 0.0 and 1.0 based on how certain you are about the parsing
6. If you can't parse something, add it to errors array
7. Currency: ${currency}

Data to parse:
${content}

Remember: Respond ONLY with the JSON object, no additional text.`
  }

  /**
   * Parse AI response with error handling
   */
  private parseAIResponse(text: string): AIParseResponse {
    try {
      // Clean the response text
      const cleanText = text.trim()
      let jsonText = cleanText
      
      // Remove markdown code blocks if present
      if (cleanText.startsWith('```json')) {
        jsonText = cleanText.replace(/```json\n?/, '').replace(/\n?```$/, '')
      } else if (cleanText.startsWith('```')) {
        jsonText = cleanText.replace(/```\n?/, '').replace(/\n?```$/, '')
      }
      
      const parsed = JSON.parse(jsonText)
      
      // Validate the response structure
      if (!parsed.transactions || !Array.isArray(parsed.transactions)) {
        throw new Error('Invalid response format: missing transactions array')
      }
      
      return {
        transactions: parsed.transactions || [],
        errors: parsed.errors || [],
        warnings: parsed.warnings || [],
        metadata: {
          totalFound: 0,
          processingTime: 0,
          model: 'gemini-1.5-flash'
        }
      }
      
    } catch (error) {
      return {
        transactions: [],
        errors: [`Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: ['The AI response was not in the expected format'],
        metadata: {
          totalFound: 0,
          processingTime: 0,
          model: 'gemini-1.5-flash'
        }
      }
    }
  }

  /**
   * Validate imported transactions against existing ones
   */
  validateTransactions(importedTransactions: Transaction[], existingTransactions: Transaction[]): ValidationResult {
    const valid: Transaction[] = []
    const duplicates: Transaction[] = []
    const conflicts: Transaction[] = []
    const errors: string[] = []
    const warnings: string[] = []

    for (const imported of importedTransactions) {
      try {
        // Check for exact duplicates
        const exactDuplicate = existingTransactions.find(existing =>
          existing.date.toDateString() === imported.date.toDateString() &&
          existing.description.toLowerCase() === imported.description.toLowerCase() &&
          Math.abs(existing.amount - imported.amount) < 0.01
        )

        if (exactDuplicate) {
          duplicates.push(imported)
          continue
        }

        // Check for potential conflicts (same date/description, different amount)
        const conflict = existingTransactions.find(existing =>
          existing.date.toDateString() === imported.date.toDateString() &&
          existing.description.toLowerCase().includes(imported.description.toLowerCase().substring(0, 10)) &&
          Math.abs(existing.amount - imported.amount) >= 0.01
        )

        if (conflict) {
          conflicts.push(imported)
          warnings.push(`Potential conflict found for transaction: ${imported.description}`)
        } else {
          valid.push(imported)
        }

      } catch (error) {
        errors.push(`Validation error for transaction ${imported.description}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return {
      valid,
      duplicates,
      conflicts,
      errors,
      warnings
    }
  }

  /**
   * Validate request size to prevent API overload
   */
  private validateRequestSize(content: string, source: string): { isValid: boolean; error?: string; warning?: string } {
    const contentLength = content.length
    const estimatedTokens = Math.ceil(contentLength / 4) // Rough estimate: 4 chars per token

    // Define size thresholds
    const MAX_SAFE_SIZE = 50000 // 50KB - safe for most requests
    const MAX_ALLOWED_SIZE = 200000 // 200KB - absolute maximum
    const MAX_SAFE_TOKENS = 12000 // Conservative token limit
    const MAX_ALLOWED_TOKENS = 30000 // Gemini's context window is larger, but we're being conservative



    // Check absolute limits
    if (contentLength > MAX_ALLOWED_SIZE || estimatedTokens > MAX_ALLOWED_TOKENS) {
      return {
        isValid: false,
        error: `File is too large to process (${Math.round(contentLength / 1000)}KB, ~${estimatedTokens} tokens). Maximum supported size is ${Math.round(MAX_ALLOWED_SIZE / 1000)}KB. Consider breaking the file into smaller parts.`
      }
    }

    // Check if file is large but still processable
    if (contentLength > MAX_SAFE_SIZE || estimatedTokens > MAX_SAFE_TOKENS) {
      return {
        isValid: true,
        warning: `Large file detected (${Math.round(contentLength / 1000)}KB). Processing may take longer and could fail if Google's servers are busy. Consider processing during off-peak hours for better reliability.`
      }
    }

    return { isValid: true }
  }

  /**
   * Generate unique ID for imported transactions
   */
  private generateImportId(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    return `ai-import-${timestamp}-${random}`
  }
}

// Export singleton instance
export const aiImportService = new AIImportService()
export default aiImportService
