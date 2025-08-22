'use client'

import { AlertTriangle, TrendingUp, Edit } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BudgetCardProps {
  id: string
  category: string
  budgetAmount: number
  spentAmount: number
  period: string
  onEdit: (id: string) => void
}

export default function BudgetCard({ 
  id, 
  category, 
  budgetAmount, 
  spentAmount, 
  period, 
  onEdit 
}: BudgetCardProps) {
  const percentage = (spentAmount / budgetAmount) * 100
  const remaining = budgetAmount - spentAmount
  const isOverBudget = spentAmount > budgetAmount

  const getProgressColor = () => {
    if (isOverBudget) return 'bg-red-500'
    if (percentage > 80) return 'bg-yellow-500'
    if (percentage > 60) return 'bg-orange-500'
    return 'bg-green-500'
  }

  const getStatusIcon = () => {
    if (isOverBudget) {
      return <AlertTriangle className="w-5 h-5 text-red-500" />
    }
    return <TrendingUp className="w-5 h-5 text-green-500" />
  }

  return (
    <div className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-8 shadow-soft hover:shadow-large transition-all duration-300 card-hover animate-in">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            {getStatusIcon()}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-500/30 to-success-500/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-secondary-900 mb-1">{category}</h3>
            <p className="text-sm font-semibold text-secondary-600 uppercase tracking-wide">{period}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onEdit(id)}
          className="p-3 text-secondary-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200 hover:scale-110"
          title="Edit budget"
        >
          <Edit className="w-5 h-5" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-base font-bold text-secondary-800">
            ${spentAmount.toFixed(2)} of ${budgetAmount.toFixed(2)}
          </span>
          <span className={cn(
            "text-lg font-bold px-3 py-1 rounded-xl",
            isOverBudget ? 'text-danger-600 bg-danger-50' : 'text-secondary-700 bg-secondary-50'
          )}>
            {percentage.toFixed(1)}%
          </span>
        </div>
        <div className="relative w-full bg-secondary-100 rounded-full h-4 overflow-hidden">
          <div
            className={cn(
              "h-4 rounded-full transition-all duration-500 relative overflow-hidden",
              getProgressColor(),
              percentage >= 100 ? 'w-full' : percentage >= 75 ? 'w-3/4' : percentage >= 50 ? 'w-1/2' : percentage >= 25 ? 'w-1/4' : 'w-1/12'
            )}
          >
            {/* Animated shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between">
        <div>
          {isOverBudget ? (
            <p className="text-base font-bold text-danger-600">
              Over budget by ${Math.abs(remaining).toFixed(2)}
            </p>
          ) : (
            <p className="text-base font-bold text-success-600">
              ${remaining.toFixed(2)} remaining
            </p>
          )}
        </div>
        <div className={cn(
          "px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide",
          isOverBudget
            ? 'bg-danger-100 text-danger-800'
            : percentage > 80
            ? 'bg-warning-100 text-warning-800'
            : 'bg-success-100 text-success-800'
        )}>
          {isOverBudget ? 'Over Budget' : percentage > 80 ? 'Warning' : 'On Track'}
        </div>
      </div>
    </div>
  )
}
