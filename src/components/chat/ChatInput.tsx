'use client'

import { useState } from 'react'
import { Send, Loader2 } from 'lucide-react'

interface ChatInputProps {
  onSendMessage: (message: string) => void
  isLoading?: boolean
}

export default function ChatInput({ onSendMessage, isLoading = false }: ChatInputProps) {
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!message.trim() || isLoading) {
      return
    }

    onSendMessage(message.trim())
    setMessage('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="border-t border-white/20 bg-white/90 backdrop-blur-sm p-6">
      <form onSubmit={handleSubmit} className="flex gap-4">
        <div className="flex-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your finances..."
            className="w-full px-6 py-4 bg-white border border-secondary-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-base font-medium placeholder-secondary-400 shadow-soft"
            rows={1}
            style={{
              minHeight: '56px',
              maxHeight: '120px',
              resize: 'none'
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement
              target.style.height = 'auto'
              target.style.height = Math.min(target.scrollHeight, 120) + 'px'
            }}
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={!message.trim() || isLoading}
          className="px-6 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl hover:shadow-colored disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center hover:scale-105 shadow-soft"
        >
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <Send className="w-6 h-6" />
          )}
        </button>
      </form>

      <div className="mt-4 text-sm text-secondary-500 text-center font-medium">
        Press <kbd className="px-2 py-1 bg-secondary-100 rounded text-xs font-bold">Enter</kbd> to send, <kbd className="px-2 py-1 bg-secondary-100 rounded text-xs font-bold">Shift+Enter</kbd> for new line
      </div>
    </div>
  )
}
