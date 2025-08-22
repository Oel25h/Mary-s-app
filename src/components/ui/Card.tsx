'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'glass' | 'solid'
  size?: 'sm' | 'md' | 'lg'
  hover?: boolean
  fullHeight?: boolean
}

export default function Card({ 
  children, 
  className, 
  variant = 'glass',
  size = 'md',
  hover = true,
  fullHeight = false
}: CardProps) {
  const baseClasses = "rounded-2xl border transition-all duration-300 animate-in"
  
  const variantClasses = {
    default: "bg-white border-gray-200 shadow-sm",
    glass: "bg-white/80 backdrop-blur-sm border-white/20 shadow-soft",
    solid: "bg-white border-gray-100 shadow-md"
  }
  
  const sizeClasses = {
    sm: "p-4",
    md: "p-4 sm:p-6",
    lg: "p-6 sm:p-8"
  }
  
  const hoverClasses = hover ? "hover:shadow-large card-hover" : ""
  const heightClasses = fullHeight ? "h-full flex flex-col" : ""
  
  return (
    <div 
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        hoverClasses,
        heightClasses,
        className
      )}
    >
      {children}
    </div>
  )
}

// Specialized card components
export function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  iconColor, 
  trend, 
  className 
}: {
  title: string
  value: string
  subtitle: string
  icon: ReactNode
  iconColor: string
  trend: string
  className?: string
}) {
  return (
    <Card className={cn("group", className)} size="md">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-colored", iconColor)}>
          {icon}
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold text-secondary-600 uppercase tracking-wide mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-secondary-900 group-hover:scale-105 transition-transform duration-200">
            {value}
          </p>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <p className="text-sm text-secondary-600 font-medium">{subtitle}</p>
        <span className="text-sm font-bold text-success-600">{trend}</span>
      </div>
    </Card>
  )
}

export function ChartCard({ 
  title, 
  children, 
  controls,
  className 
}: {
  title: string
  children: ReactNode
  controls?: ReactNode
  className?: string
}) {
  return (
    <Card className={className} fullHeight size="md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-2 sm:space-y-0">
        <h3 className="text-lg sm:text-xl font-bold text-secondary-900">{title}</h3>
        {controls && <div className="flex items-center space-x-2">{controls}</div>}
      </div>
      <div className="flex-1 min-h-0">
        {children}
      </div>
    </Card>
  )
}
