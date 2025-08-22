'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, MessageCircle, Sparkles, Clock, User, Bot, Loader2, RefreshCw } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { useAuth } from '@/contexts/AuthContext'
import { ChatMessage, ChatResponse } from '@/types'
import { cn } from '@/lib/utils'

// Generate stable IDs for chat messages
const generateChatId = (() => {
  let counter = 0
  return () => {
    counter++
    const timestamp = typeof window !== 'undefined' ? Date.now() : 1704067200000
    return `enhanced-chat-${timestamp}-${counter}`
  }
})()

export default function EnhancedChatInterface() {
  const { transactions, budgets, getTotalIncome, getTotalExpenses, getNetIncome, getSavingsRate } = useApp()
  const { user, session } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [conversationId] = useState(() => `conv-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`)
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([])
  const [showWelcome, setShowWelcome] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'error'>('connected')
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Default suggested questions
  const defaultSuggestions = [
    "What's my current financial health?",
    "How much did I spend this month?",
    "Which category do I spend the most on?",
    "How can I improve my savings rate?",
    "Help me analyze my spending patterns",
    "What's my biggest expense this month?"
  ]

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initialize suggested questions
  useEffect(() => {
    setSuggestedQuestions(defaultSuggestions)
  }, [])

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    const textarea = inputRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
    }
  }

  const handleSendMessage = async (messageText?: string) => {
    const message = messageText || inputMessage.trim()
    if (!message || isLoading) return

    // Hide welcome screen
    if (showWelcome) {
      setShowWelcome(false)
    }

    const userMessage: ChatMessage = {
      id: generateChatId(),
      content: message,
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)
    setIsTyping(true)
    setConnectionStatus('connecting')

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }

    try {
      // Ensure user is authenticated before making API call
      if (!user || !session) {
        throw new Error('Please log in to use the AI assistant')
      }

      // Prepare headers with session token
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      // Add session token if available
      if (session.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const response = await fetch('/api/ai/enhanced-chat', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          message,
          conversationId,
          options: {
            includeFinancialContext: true,
            responseStyle: 'detailed',
            maxContextMessages: 5
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data: ChatResponse & { conversationId: string } = await response.json()

      const aiMessage: ChatMessage = {
        id: generateChatId(),
        content: data.message,
        isUser: false,
        timestamp: new Date(data.timestamp),
        isError: data.isError,
        errorType: data.errorType,
        metadata: data.metadata
      }

      setMessages(prev => [...prev, aiMessage])
      setConnectionStatus('connected')

      // Update suggested questions if provided
      if (data.metadata?.suggestedQuestions) {
        setSuggestedQuestions(data.metadata.suggestedQuestions)
      }

    } catch (error) {
      setConnectionStatus('error')

      const errorMessage: ChatMessage = {
        id: generateChatId(),
        content: `I'm sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        isUser: false,
        timestamp: new Date(),
        isError: true,
        errorType: 'api_error'
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setIsTyping(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSuggestedQuestion = (question: string) => {
    handleSendMessage(question)
  }

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-500'
      case 'connecting': return 'text-yellow-500'
      case 'error': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  return (
    <div className="h-full flex flex-col bg-white rounded-2xl shadow-soft border border-white/20 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-secondary-100 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-secondary-900">AI Financial Assistant</h2>
              <div className="flex items-center space-x-2 text-sm text-secondary-600">
                <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                <span className={getConnectionStatusColor()}>
                  {connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'connecting' ? 'Connecting...' : 'Connection Error'}
                </span>
              </div>
            </div>
          </div>
          <div className="text-sm text-secondary-600">
            {transactions.length} transactions • {budgets.length} budgets
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {showWelcome && messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-secondary-900 mb-2">Welcome to your AI Financial Assistant!</h3>
            <p className="text-secondary-600 mb-6 max-w-md mx-auto">
              I have access to your financial data and can help you understand your spending, create budgets, and improve your financial health.
            </p>
            
            {/* Suggested Questions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
              {suggestedQuestions.slice(0, 6).map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="p-3 text-left bg-white border border-secondary-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 text-sm"
                >
                  <MessageCircle className="w-4 h-4 text-primary-500 mb-1" />
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex items-start space-x-3",
              message.isUser ? "justify-end" : "justify-start"
            )}
          >
            {!message.isUser && (
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            
            <div className={cn(
              "max-w-[80%] rounded-2xl px-4 py-3",
              message.isUser
                ? "bg-primary-500 text-white"
                : message.isError
                ? "bg-red-50 border border-red-200 text-red-800"
                : "bg-secondary-50 border border-secondary-200 text-secondary-800"
            )}>
              <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>
              <div className={cn(
                "text-xs mt-2 flex items-center space-x-2",
                message.isUser ? "text-primary-100" : "text-secondary-500"
              )}>
                <Clock className="w-3 h-3" />
                <span>{formatTimestamp(message.timestamp)}</span>
                {message.metadata?.processingTime && (
                  <span>• {message.metadata.processingTime}ms</span>
                )}
              </div>
            </div>

            {message.isUser && (
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-secondary-50 border border-secondary-200 rounded-2xl px-4 py-3">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-secondary-600" />
                <span className="text-sm text-secondary-600">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-secondary-100 bg-white p-6">
        {/* Suggested Questions (when not welcome screen) */}
        {!showWelcome && suggestedQuestions.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.slice(0, 3).map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuestion(question)}
                  disabled={isLoading}
                  className="px-3 py-1.5 text-xs bg-secondary-100 text-secondary-700 rounded-full hover:bg-secondary-200 transition-colors disabled:opacity-50"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-3">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => {
                setInputMessage(e.target.value)
                adjustTextareaHeight()
              }}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your finances..."
              className="w-full px-4 py-3 bg-white border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm placeholder-secondary-400 shadow-sm"
              rows={1}
              style={{
                minHeight: '48px',
                maxHeight: '120px'
              }}
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className={cn(
              "px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center min-w-[48px]",
              !inputMessage.trim() || isLoading
                ? "bg-secondary-200 text-secondary-400 cursor-not-allowed"
                : "bg-primary-500 text-white hover:bg-primary-600 hover:scale-105 shadow-sm"
            )}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>

        {/* Status Bar */}
        <div className="mt-3 flex items-center justify-between text-xs text-secondary-500">
          <div className="flex items-center space-x-4">
            <span>Powered by Google Gemini AI</span>
            <span>•</span>
            <span>Financial data protected</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-1.5 h-1.5 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
            <span>{connectionStatus}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
