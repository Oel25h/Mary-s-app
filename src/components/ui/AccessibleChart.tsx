'use client'

import { ReactNode, useId } from 'react'
import { cn } from '@/lib/utils'

interface AccessibleChartProps {
  children: ReactNode
  title: string
  description?: string
  className?: string
  ariaLabel?: string
}

export default function AccessibleChart({ 
  children, 
  title, 
  description, 
  className,
  ariaLabel 
}: AccessibleChartProps) {
  const titleId = useId()
  const descId = useId()

  return (
    <div 
      className={cn("relative", className)}
      role="img"
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      aria-label={ariaLabel || `Chart showing ${title}`}
    >
      <div id={titleId} className="sr-only">
        {title}
      </div>
      {description && (
        <div id={descId} className="sr-only">
          {description}
        </div>
      )}
      {children}
    </div>
  )
}

// Loading skeleton for charts
export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse", className)}>
      <div className="h-4 bg-secondary-200 rounded w-1/3 mb-4"></div>
      <div className="h-64 bg-secondary-100 rounded-lg mb-4"></div>
      <div className="flex space-x-4">
        <div className="h-3 bg-secondary-200 rounded w-16"></div>
        <div className="h-3 bg-secondary-200 rounded w-20"></div>
        <div className="h-3 bg-secondary-200 rounded w-14"></div>
      </div>
    </div>
  )
}

// Error boundary for charts
export function ChartError({ 
  error, 
  retry, 
  className 
}: { 
  error: string
  retry?: () => void
  className?: string 
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
      <div className="w-16 h-16 bg-danger-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-secondary-900 mb-2">Chart Error</h3>
      <p className="text-secondary-600 mb-4">{error}</p>
      {retry && (
        <button
          onClick={retry}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  )
}

// Performance optimized chart wrapper
export function OptimizedChart({ 
  children, 
  loading = false, 
  error,
  onRetry,
  className 
}: {
  children: ReactNode
  loading?: boolean
  error?: string
  onRetry?: () => void
  className?: string
}) {
  if (loading) {
    return <ChartSkeleton className={className} />
  }

  if (error) {
    return <ChartError error={error} retry={onRetry} className={className} />
  }

  return <div className={className}>{children}</div>
}
