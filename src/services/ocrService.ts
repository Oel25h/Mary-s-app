import { createWorker, Worker, PSM } from 'tesseract.js'

/**
 * OCR Service for processing scanned documents and images
 * Uses Tesseract.js for client-side optical character recognition
 */
class OCRService {
  private worker: Worker | null = null
  private isInitialized = false

  /**
   * Initialize the OCR worker
   */
  private async initializeWorker(): Promise<void> {
    if (this.isInitialized && this.worker) {
      return
    }

    try {
      this.worker = await createWorker('eng', 1, {
        logger: (m) => {
          // Log OCR progress for debugging
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`)
          }
        }
      })

      // Optimize for financial documents
      await this.worker.setParameters({
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz .,/-+()$€£¥₹',
        tessedit_pageseg_mode: PSM.SINGLE_BLOCK, // Uniform block of text
      })

      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize OCR worker:', error)
      throw new Error('OCR initialization failed')
    }
  }

  /**
   * Process an image file and extract text using OCR
   */
  async processImage(file: File): Promise<{
    text: string
    confidence: number
    processingTime: number
  }> {
    const startTime = Date.now()

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image (JPG, PNG, etc.)')
      }

      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Image file is too large. Maximum size is 10MB.')
      }

      // Initialize OCR worker if needed
      await this.initializeWorker()

      if (!this.worker) {
        throw new Error('OCR worker not initialized')
      }

      // Process the image
      const result = await this.worker.recognize(file)
      
      const processingTime = Date.now() - startTime
      
      return {
        text: result.data.text.trim(),
        confidence: result.data.confidence / 100, // Convert to 0-1 scale
        processingTime
      }

    } catch (error) {
      const processingTime = Date.now() - startTime
      console.error('OCR processing failed:', error)
      
      // Provide user-friendly error messages
      let errorMessage = 'Failed to process image'
      if (error instanceof Error) {
        if (error.message.includes('File must be an image')) {
          errorMessage = error.message
        } else if (error.message.includes('too large')) {
          errorMessage = error.message
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error while loading OCR engine. Please check your internet connection.'
        } else {
          errorMessage = `OCR processing failed: ${error.message}`
        }
      }
      
      throw new Error(errorMessage)
    }
  }

  /**
   * Process multiple images in sequence
   */
  async processImages(files: File[]): Promise<Array<{
    fileName: string
    text: string
    confidence: number
    processingTime: number
    error?: string
  }>> {
    const results = []

    for (const file of files) {
      try {
        const result = await this.processImage(file)
        results.push({
          fileName: file.name,
          ...result
        })
      } catch (error) {
        results.push({
          fileName: file.name,
          text: '',
          confidence: 0,
          processingTime: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return results
  }

  /**
   * Check if the current environment supports OCR
   */
  isSupported(): boolean {
    try {
      // Check for WebAssembly support (required by Tesseract.js)
      return typeof WebAssembly === 'object' && 
             typeof WebAssembly.instantiate === 'function'
    } catch {
      return false
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    if (this.worker) {
      try {
        await this.worker.terminate()
        this.worker = null
        this.isInitialized = false
      } catch (error) {
        console.error('Error cleaning up OCR worker:', error)
      }
    }
  }

  /**
   * Preprocess image for better OCR results
   * This could include noise reduction, contrast enhancement, etc.
   */
  async preprocessImage(file: File): Promise<File> {
    // For now, return the original file
    // In the future, we could add image preprocessing here
    return file
  }

  /**
   * Estimate processing time based on image size
   */
  estimateProcessingTime(file: File): number {
    // Rough estimate: 1-3 seconds per MB
    const sizeMB = file.size / (1024 * 1024)
    return Math.max(2, Math.min(30, sizeMB * 2)) // Between 2-30 seconds
  }
}

// Export singleton instance
export const ocrService = new OCRService()
export default ocrService