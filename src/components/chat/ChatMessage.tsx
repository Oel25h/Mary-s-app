'use client'

import { Bot, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatMessageProps {
  message: {
    id: string
    content: string
    sender: 'user' | 'ai'
    timestamp: Date
  }
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === 'user'

  return (
    <div className={cn(
      "flex gap-4 mb-8 animate-in",
      isUser ? "justify-end" : "justify-start"
    )}>
      {!isUser && (
        <div className="relative">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-colored">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="absolute -inset-1 bg-gradient-to-r from-primary-500/30 to-primary-600/30 rounded-2xl opacity-50 -z-10 blur-sm" />
        </div>
      )}

      <div className={cn(
        "max-w-[75%] rounded-3xl px-6 py-4 shadow-soft",
        isUser
          ? "bg-gradient-to-br from-primary-500 to-primary-600 text-white"
          : "bg-white/90 backdrop-blur-sm text-secondary-900 border border-white/20"
      )}>
        <p className="text-base leading-relaxed whitespace-pre-wrap font-medium">
          {message.content}
        </p>
        <p className={cn(
          "text-xs mt-3 font-semibold",
          isUser ? "text-primary-100" : "text-secondary-500"
        )}>
          {message.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>

      {isUser && (
        <div className="relative">
          <div className="w-10 h-10 bg-gradient-to-br from-secondary-200 to-secondary-300 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-soft">
            <User className="w-5 h-5 text-secondary-700" />
          </div>
          <div className="absolute -inset-1 bg-gradient-to-r from-secondary-300/30 to-secondary-400/30 rounded-2xl opacity-50 -z-10 blur-sm" />
        </div>
      )}
    </div>
  )
}
