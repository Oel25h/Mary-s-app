'use client'

import { Search, Home, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-soft border border-white/20 p-8 text-center">
        {/* 404 Icon */}
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Search className="w-10 h-10 text-blue-600" />
        </div>

        {/* 404 Title */}
        <h1 className="text-6xl font-bold text-secondary-900 mb-4">404</h1>

        <h2 className="text-2xl font-bold text-secondary-900 mb-4">
          Page Not Found
        </h2>

        {/* Description */}
        <p className="text-secondary-600 mb-8 leading-relaxed">
          Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or you entered the wrong URL.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/"
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold shadow-sm"
          >
            <Home className="w-4 h-4" />
            <span>Go Home</span>
          </Link>

          <button
            onClick={() => window.history.back()}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 transition-colors font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </div>

        {/* Popular Pages */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Popular Pages:</h3>
          <div className="space-y-2">
            <Link
              href="/transactions"
              className="block text-sm text-primary-600 hover:text-primary-700 hover:underline"
            >
              Transactions
            </Link>
            <Link
              href="/budgets"
              className="block text-sm text-primary-600 hover:text-primary-700 hover:underline"
            >
              Budgets
            </Link>
            <Link
              href="/reports"
              className="block text-sm text-primary-600 hover:text-primary-700 hover:underline"
            >
              AI Reports
            </Link>
            <Link
              href="/ai-assistant"
              className="block text-sm text-primary-600 hover:text-primary-700 hover:underline"
            >
              AI Assistant
            </Link>
            <Link
              href="/import"
              className="block text-sm text-primary-600 hover:text-primary-700 hover:underline"
            >
              Import Data
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
