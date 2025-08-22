'use client'

import { Plus, Download, FileText, MessageCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface QuickActionProps {
  icon: React.ReactNode
  label: string
  color: string
  onClick?: () => void
}

function QuickActionButton({ icon, label, color, onClick }: QuickActionProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-soft hover:shadow-medium transition-all duration-300 card-hover animate-in">
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "group relative w-full flex flex-col items-center justify-center p-6 rounded-2xl text-white font-semibold transition-all duration-300 hover:scale-105 hover:-translate-y-1 overflow-hidden",
          color
        )}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform duration-300">{icon}</div>
          <span className="text-xs font-bold tracking-wide">{label}</span>
        </div>

        {/* Shine effect */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
      </button>
    </div>
  )
}

export default function QuickActions() {
  const router = useRouter()

  const actions = [
    {
      icon: <Plus />,
      label: 'Add Transaction',
      color: 'bg-teal-500 hover:bg-teal-600',
      onClick: () => router.push('/transactions')
    },
    {
      icon: <Download />,
      label: 'Import Data',
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: () => router.push('/import')
    },
    {
      icon: <FileText />,
      label: 'AI Reports',
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: () => router.push('/reports')
    },
    {
      icon: <MessageCircle />,
      label: 'AI Assistant',
      color: 'bg-pink-500 hover:bg-pink-600',
      onClick: () => router.push('/ai-assistant')
    },
  ]

  return (
    <div className="grid grid-cols-4 gap-4">
      {actions.map((action, index) => (
        <QuickActionButton
          key={index}
          icon={action.icon}
          label={action.label}
          color={action.color}
          onClick={action.onClick}
        />
      ))}
    </div>
  )
}
