'use client'

import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string
  subtitle: string
  icon: React.ReactNode
  iconColor: string
  trend?: string
}

export default function MetricCard({
  title,
  value,
  subtitle,
  icon,
  iconColor,
  trend
}: MetricCardProps) {
  return (
    <div className="group relative bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-soft hover:shadow-large transition-all duration-300 card-hover animate-in">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center shadow-soft group-hover:shadow-medium transition-all duration-300 group-hover:scale-110",
            iconColor
          )}>
            {icon}
          </div>
          {trend && (
            <div className="px-3 py-1 bg-secondary-50 rounded-full">
              <span className="text-xs text-secondary-600 font-semibold">{trend}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-secondary-600 uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold text-secondary-900 leading-none">{value}</p>
          <p className="text-sm text-secondary-500 font-medium">{subtitle}</p>
        </div>
      </div>

      {/* Subtle glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500/20 to-success-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm" />
    </div>
  )
}
