'use client'

import { Clock } from 'lucide-react'

interface ChartCardProps {
  title: string
  emptyMessage: string
  emptySubMessage?: string
}

export default function ChartCard({ title, emptyMessage, emptySubMessage }: ChartCardProps) {
  return (
    <div className="group bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-soft hover:shadow-large transition-all duration-300 card-hover animate-in">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold text-secondary-900">{title}</h3>
        <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse-soft" />
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <Clock className="w-12 h-12 text-primary-400" />
          </div>
          <div className="absolute -inset-2 bg-gradient-to-r from-primary-500/20 to-success-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm" />
        </div>
        <p className="text-secondary-700 font-semibold mb-3 text-lg">{emptyMessage}</p>
        {emptySubMessage && (
          <p className="text-secondary-500 font-medium max-w-sm">{emptySubMessage}</p>
        )}
      </div>
    </div>
  )
}
