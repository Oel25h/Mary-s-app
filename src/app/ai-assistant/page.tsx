'use client'

import { useState, Suspense } from 'react'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import EnhancedChatInterface from '@/components/ai/EnhancedChatInterface'
import { useResponsive } from '@/hooks/useResponsive'
import { Sparkles, MessageCircle, TrendingUp, Shield } from 'lucide-react'

function ChatLoadingFallback() {
  return (
    <div className="h-full bg-white rounded-2xl shadow-soft border border-white/20 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-6 h-6 text-white animate-pulse" />
        </div>
        <h3 className="text-lg font-semibold text-secondary-900 mb-2">Loading AI Assistant...</h3>
        <p className="text-secondary-600">Preparing your personalized financial advisor</p>
        <div className="mt-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mx-auto"></div>
        </div>
      </div>
    </div>
  )
}

export default function AIAssistantPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isMobile } = useResponsive()
  
  return (
    <div className="min-h-screen-safe">
      <Header 
        title="AI Financial Assistant" 
        onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      <div className="flex">
        <Sidebar 
          currentPage="ai-assistant" 
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        <main className="flex-1 mobile-padding py-4 sm:py-8">
          <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] sm:h-[calc(100vh-10rem)]">
            {/* Page Header */}
            <div className="mb-4 sm:mb-6">
              <div className="flex items-center space-x-3 mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-secondary-900">AI Financial Assistant</h1>
                  <p className="text-sm sm:text-base text-secondary-600">Get personalized financial advice based on your actual data</p>
                </div>
              </div>

              {/* Features Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="flex items-center space-x-3 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-blue-900 text-sm sm:text-base">Conversational AI</h3>
                    <p className="text-xs sm:text-sm text-blue-700">Natural language financial discussions</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-green-900 text-sm sm:text-base">Data-Driven Insights</h3>
                    <p className="text-xs sm:text-sm text-green-700">Analysis based on your real transactions</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 sm:p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-purple-900 text-sm sm:text-base">Secure & Private</h3>
                    <p className="text-xs sm:text-sm text-purple-700">Your data stays protected and private</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Interface */}
            <div className="h-[calc(100%-12rem)] sm:h-[calc(100%-14rem)]">
              <Suspense fallback={<ChatLoadingFallback />}>
                <EnhancedChatInterface />
              </Suspense>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
