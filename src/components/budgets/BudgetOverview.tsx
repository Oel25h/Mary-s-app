'use client'

import { TrendingUp, TrendingDown, AlertCircle, Target } from 'lucide-react'

interface BudgetOverviewProps {
  totalBudget: number
  totalSpent: number
  categoriesOverBudget: number
  totalCategories: number
}

export default function BudgetOverview({ 
  totalBudget, 
  totalSpent, 
  categoriesOverBudget, 
  totalCategories 
}: BudgetOverviewProps) {
  const remaining = totalBudget - totalSpent
  const spentPercentage = (totalSpent / totalBudget) * 100
  const onTrackCategories = totalCategories - categoriesOverBudget

  const overviewCards = [
    {
      title: 'Total Budget',
      value: `$${totalBudget.toFixed(2)}`,
      subtitle: 'This month',
      icon: <Target className="w-5 h-5 text-white" />,
      iconColor: 'bg-blue-500',
    },
    {
      title: 'Total Spent',
      value: `$${totalSpent.toFixed(2)}`,
      subtitle: `${spentPercentage.toFixed(1)}% of budget`,
      icon: <TrendingDown className="w-5 h-5 text-white" />,
      iconColor: 'bg-red-500',
    },
    {
      title: 'Remaining',
      value: `$${remaining.toFixed(2)}`,
      subtitle: remaining >= 0 ? 'Available to spend' : 'Over budget',
      icon: <TrendingUp className="w-5 h-5 text-white" />,
      iconColor: remaining >= 0 ? 'bg-green-500' : 'bg-red-500',
    },
    {
      title: 'Categories Status',
      value: `${onTrackCategories}/${totalCategories}`,
      subtitle: `${categoriesOverBudget} over budget`,
      icon: <AlertCircle className="w-5 h-5 text-white" />,
      iconColor: categoriesOverBudget > 0 ? 'bg-yellow-500' : 'bg-green-500',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {overviewCards.map((card, index) => (
        <div key={index} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.iconColor}`}>
              {card.icon}
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-600">{card.title}</p>
            <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-500">{card.subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
