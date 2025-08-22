'use client'

import { Bot, TrendingUp, PieChart, Target, HelpCircle } from 'lucide-react'

interface ChatWelcomeProps {
  onSuggestedQuestion: (question: string) => void
}

export default function ChatWelcome({ onSuggestedQuestion }: ChatWelcomeProps) {
  const suggestedQuestions = [
    {
      icon: <TrendingUp className="w-5 h-5" />,
      question: "How is my spending trending this month?",
      category: "Spending Analysis"
    },
    {
      icon: <PieChart className="w-5 h-5" />,
      question: "Show me my expense breakdown by category",
      category: "Category Analysis"
    },
    {
      icon: <Target className="w-5 h-5" />,
      question: "Am I on track to meet my savings goals?",
      category: "Goals & Budgets"
    },
    {
      icon: <HelpCircle className="w-5 h-5" />,
      question: "What financial advice do you have for me?",
      category: "General Advice"
    }
  ]

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mb-6">
        <Bot className="w-8 h-8 text-white" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Welcome to your AI Financial Assistant
      </h2>
      
      <p className="text-gray-600 mb-8 max-w-md">
        I'm here to help you understand your finances, track your spending, and provide personalized insights. Ask me anything!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
        {suggestedQuestions.map((item, index) => (
          <button
            key={index}
            onClick={() => onSuggestedQuestion(item.question)}
            className="p-4 bg-white border border-gray-200 rounded-xl hover:border-primary-300 hover:shadow-md transition-all text-left group"
          >
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center text-primary-500 group-hover:bg-primary-100 transition-colors">
                {item.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {item.question}
                </p>
                <p className="text-xs text-gray-500">
                  {item.category}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8 text-sm text-gray-500">
        You can also type your own questions in the chat box below
      </div>
    </div>
  )
}
