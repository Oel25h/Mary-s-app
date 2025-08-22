'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCw, ArrowLeft, Home } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    // In production, this would be sent to an error monitoring service
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-soft border border-white/20 p-8 text-center">
        {/* Error Icon */}
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-orange-600" />
        </div>

        {/* Error Title */}
        <h1 className="text-2xl font-bold text-secondary-900 mb-4">
          Oops! Something went wrong
        </h1>

        {/* Error Description */}
        <p className="text-secondary-600 mb-6 leading-relaxed">
          We encountered an error while loading this page. Don't worry, this has been logged and we're working to fix it.
        </p>

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg text-left border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              Development Error Details:
            </h3>
            <div className="text-xs text-gray-600 font-mono bg-white p-3 rounded border">
              <div className="mb-2">
                <strong>Message:</strong> {error.message}
              </div>
              {error.digest && (
                <div className="mb-2">
                  <strong>Digest:</strong> {error.digest}
                </div>
              )}
              {error.stack && (
                <div>
                  <strong>Stack:</strong>
                  <pre className="mt-1 text-xs overflow-x-auto whitespace-pre-wrap">
                    {error.stack.split('\n').slice(0, 5).join('\n')}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={() => window.history.back()}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 transition-colors font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
            
            <button
              onClick={() => window.location.href = '/'}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 transition-colors font-semibold"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Need help?</strong> If this error persists, try refreshing the page or clearing your browser cache.
          </p>
        </div>
      </div>
    </div>
  )
}
