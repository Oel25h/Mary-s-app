import { GoogleGenerativeAI } from '@google/generative-ai'
import { Transaction, Budget, ChatMessage, ChatResponse, ChatOptions, FinancialContext, ChatConversation } from '@/types'

/**
 * Enhanced AI Chat Service using Google Gemini
 * Provides intelligent financial advisory with conversation memory and context awareness
 */
// AI Chat service with rate limiting and error handling
class AIChatService {
  private genAI: GoogleGenerativeAI
  private model: any
  private conversations: Map<string, ChatConversation> = new Map()

  constructor() {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY
    if (!apiKey) {
      // Provide a clearer error to surface config issues in logs
      throw new Error('Google Gemini API key not found. Set GOOGLE_GEMINI_API_KEY or NEXT_PUBLIC_GEMINI_API_KEY in environment.')
    }

    // Defensive: ensure this code only runs in a Node.js context when used server-side
    // The SDK is intended for server usage; our route handler explicitly sets runtime='nodejs'
    this.genAI = new GoogleGenerativeAI(apiKey)
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1500,
      }
    })
  }

  /**
   * Generate AI response with enhanced context and conversation memory
   */
  async generateResponse(
    userMessage: string,
    financialContext: FinancialContext,
    options: ChatOptions = {}
  ): Promise<ChatResponse> {
    const startTime = Date.now()

    try {
      // Validate input
      if (!userMessage.trim()) {
        return {
          message: "Please ask me a question about your finances, and I'll be happy to help!",
          timestamp: new Date(),
          isError: true,
          errorType: 'validation_error',
          metadata: {
            processingTime: Date.now() - startTime,
            model: 'gemini-1.5-flash',
            contextUsed: false
          }
        }
      }

      // Build enhanced prompt with conversation context
      const prompt = this.buildEnhancedPrompt(userMessage, financialContext, options)

      // Generate response with retry logic
      const result = await this.generateWithRetry(prompt, 3)
      const response = await result.response
      const text = response.text()

      // Parse and enhance the response
      const enhancedResponse = this.enhanceResponse(text, financialContext)

      return {
        message: enhancedResponse.message,
        timestamp: new Date(),
        isError: false,
        metadata: {
          processingTime: Date.now() - startTime,
          model: 'gemini-1.5-flash',
          contextUsed: true,
          suggestedQuestions: enhancedResponse.suggestedQuestions
        }
      }

    } catch (error) {
      // Surface error details to server logs for diagnostics
      console.error('AIChatService.generateResponse error:', error instanceof Error ? error.message : error)
      return {
        message: this.getErrorMessage(error),
        timestamp: new Date(),
        isError: true,
        errorType: this.categorizeError(error),
        metadata: {
          processingTime: Date.now() - startTime,
          model: 'gemini-1.5-flash',
          contextUsed: false
        }
      }
    }
  }

  /**
   * Build enhanced prompt with financial context and conversation memory
   */
  private buildEnhancedPrompt(
    userMessage: string, 
    financialContext: FinancialContext, 
    options: ChatOptions
  ): string {
    const conversationHistory = this.getConversationHistory(options.conversationId, options.maxContextMessages)
    
    return `You are an expert personal financial advisor with access to the user's real financial data. Your role is to provide personalized, actionable financial advice in a conversational, friendly tone.

**FINANCIAL CONTEXT:**
- Total Income: $${financialContext.totalIncome.toFixed(2)}
- Total Expenses: $${financialContext.totalExpenses.toFixed(2)}
- Net Income: $${financialContext.netIncome.toFixed(2)}
- Savings Rate: ${financialContext.savingsRate.toFixed(1)}%
- Total Transactions: ${financialContext.transactions.length}

**TOP SPENDING CATEGORIES:**
${Object.entries(financialContext.categoryBreakdown)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 5)
  .map(([category, amount]) => `- ${category}: $${amount.toFixed(2)}`)
  .join('\n')}

**RECENT TRANSACTIONS (Last 5):**
${financialContext.recentTransactions.slice(0, 5).map(t => 
  `- ${t.date.toLocaleDateString()}: ${t.description} - $${t.amount.toFixed(2)} (${t.category})`
).join('\n')}

**BUDGET PERFORMANCE:**
${financialContext.budgetPerformance
  .filter(bp => isFinite(bp.spent) && isFinite(bp.budgeted))
  .map(bp => `- ${bp.category}: ${isFinite(bp.percentageUsed) ? bp.percentageUsed.toFixed(1) : '0.0'}% used ($${bp.spent.toFixed(2)}/$${bp.budgeted.toFixed(2)})`)
  .join('\n')}

${conversationHistory ? `**CONVERSATION HISTORY:**\n${conversationHistory}\n` : ''}

**CONVERSATION GUIDELINES:**
- Be conversational, friendly, and encouraging
- Use simple language, avoid financial jargon
- Provide specific, actionable advice based on their actual data
- Reference their real transactions and spending patterns
- Be supportive, not judgmental about spending habits
- Keep responses concise but helpful (2-3 paragraphs max)
- End with a relevant follow-up question when appropriate

**USER QUESTION:** ${userMessage}

**RESPONSE STYLE:** ${options.responseStyle || 'detailed'}

Provide a helpful, personalized response based on their actual financial data:`
  }

  /**
   * Enhance AI response with additional context and suggestions
   */
  private enhanceResponse(text: string, financialContext: FinancialContext): {
    message: string
    suggestedQuestions: string[]
  } {
    // Clean up the response
    let message = text.trim()
    
    // Generate contextual suggested questions
    const suggestedQuestions = this.generateSuggestedQuestions(financialContext, message)

    return {
      message,
      suggestedQuestions
    }
  }

  /**
   * Generate contextual suggested questions based on financial data and current conversation
   */
  private generateSuggestedQuestions(financialContext: FinancialContext, lastResponse: string): string[] {
    const suggestions: string[] = []
    
    // Budget-related suggestions
    if (financialContext.budgetPerformance.some(bp => bp.percentageUsed > 90)) {
      suggestions.push("How can I stay within my budget this month?")
    }
    
    // Spending pattern suggestions
    const topCategory = Object.entries(financialContext.categoryBreakdown)
      .sort(([,a], [,b]) => b - a)[0]
    if (topCategory) {
      suggestions.push(`How can I reduce my ${topCategory[0].toLowerCase()} spending?`)
    }
    
    // Savings suggestions
    if (financialContext.savingsRate < 20) {
      suggestions.push("What are some ways I can increase my savings?")
    }
    
    // Income suggestions
    if (financialContext.netIncome < 0) {
      suggestions.push("How can I improve my financial situation?")
    }
    
    // General suggestions
    suggestions.push("What's my financial health score?")
    suggestions.push("Show me my spending trends")
    suggestions.push("Help me plan next month's budget")
    
    // Return 3-4 most relevant suggestions
    return suggestions.slice(0, 4)
  }

  /**
   * Get conversation history for context
   */
  private getConversationHistory(conversationId?: string, maxMessages: number = 5): string | null {
    if (!conversationId) return null
    
    const conversation = this.conversations.get(conversationId)
    if (!conversation) return null
    
    const recentMessages = conversation.messages.slice(-maxMessages * 2) // Get last few exchanges
    
    return recentMessages
      .map(msg => `${msg.isUser ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n')
  }

  /**
   * Save conversation for memory
   */
  saveConversation(conversationId: string, messages: ChatMessage[]): void {
    const existing = this.conversations.get(conversationId)
    
    if (existing) {
      existing.messages = messages
      existing.updatedAt = new Date()
    } else {
      const conversation: ChatConversation = {
        id: conversationId,
        title: this.generateConversationTitle(messages),
        messages,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      this.conversations.set(conversationId, conversation)
    }
  }

  /**
   * Generate conversation title from first user message
   */
  private generateConversationTitle(messages: ChatMessage[]): string {
    const firstUserMessage = messages.find(m => m.isUser)
    if (!firstUserMessage) return 'New Conversation'
    
    const content = firstUserMessage.content
    if (content.length <= 50) return content
    
    return content.substring(0, 47) + '...'
  }

  /**
   * Generate response with retry logic
   */
  private async generateWithRetry(prompt: string, maxRetries: number): Promise<any> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000)
        })

        const apiPromise = this.model.generateContent(prompt)
        return await Promise.race([apiPromise, timeoutPromise])
        
      } catch (error) {
        if (attempt === maxRetries) throw error
        
        // Wait before retry with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  /**
   * Categorize errors for better handling
   */
  private categorizeError(error: any): 'api_error' | 'rate_limit' | 'network_error' | 'validation_error' {
    const message = error?.message?.toLowerCase() || ''
    
    if (message.includes('rate limit') || message.includes('quota')) {
      return 'rate_limit'
    }
    if (message.includes('network') || message.includes('timeout') || message.includes('fetch')) {
      return 'network_error'
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return 'validation_error'
    }
    
    return 'api_error'
  }

  /**
   * Get user-friendly error message
   */
  private getErrorMessage(error: any): string {
    const errorType = this.categorizeError(error)
    
    switch (errorType) {
      case 'rate_limit':
        return "I'm currently handling a lot of requests. Please wait a moment and try again."
      case 'network_error':
        return "I'm having trouble connecting right now. Please check your internet connection and try again."
      case 'validation_error':
        return "I didn't understand your question. Could you please rephrase it?"
      default:
        return "I encountered an unexpected issue. Please try again in a moment."
    }
  }

  /**
   * Health check for the AI service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.model.generateContent("Hello")
      const response = await result.response
      await response.text()
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Get all conversations
   */
  getConversations(): ChatConversation[] {
    return Array.from(this.conversations.values())
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  }

  /**
   * Delete a conversation
   */
  deleteConversation(conversationId: string): boolean {
    return this.conversations.delete(conversationId)
  }

  /**
   * Generate unique conversation ID
   */
  generateConversationId(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    return `chat-${timestamp}-${random}`
  }
}

// Export singleton instance
export const aiChatService = new AIChatService()
export default aiChatService
