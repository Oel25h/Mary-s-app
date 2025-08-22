'use client'

import { useState } from 'react'
import { useApp } from '@/contexts/AppContext'
import { useChartResponsive } from '@/hooks/useResponsive'
import {
  PieChart,
  Pie,
  ResponsiveContainer,
  Cell,
  Tooltip,
  Legend
} from 'recharts'
import { PieChart as PieChartIcon, BarChart3, Grid3X3, ArrowUpDown, Calendar } from 'lucide-react'

interface CategoryData {
  category: string
  amount: number
  percentage: number
  color: string
  transactionCount: number
  budgetAmount?: number
}

type ChartType = 'pie' | 'donut'
type SortType = 'amount' | 'alphabetical' | 'percentage'
type TimePeriod = 'all' | 'month' | 'quarter'

export default function ExpenseCategoriesChart() {
  const { transactions, budgets } = useApp()
  const { chartConfig, isMobile } = useChartResponsive()
  const [chartType, setChartType] = useState<ChartType>('pie')
  const [sortType, setSortType] = useState<SortType>('amount')
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Filter transactions by time period with proper date handling
  const getFilteredTransactions = () => {
    const allExpenseTransactions = transactions.filter(t => t.type === 'expense')

    if (timePeriod === 'all') {
      return allExpenseTransactions
    }

    const now = new Date()
    let startDate: Date
    let endDate: Date = new Date(now.getFullYear(), now.getMonth() + 1, 0) // End of current month

    switch (timePeriod) {
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        break
      case 'quarter':
        const quarterStart = Math.floor(now.getMonth() / 3) * 3
        startDate = new Date(now.getFullYear(), quarterStart, 1)
        endDate = new Date(now.getFullYear(), quarterStart + 3, 0)
        break
      default:
        return allExpenseTransactions
    }

    return allExpenseTransactions.filter(t => {
      const transactionDate = new Date(t.date)
      return transactionDate >= startDate && transactionDate <= endDate
    })
  }

  const expenseTransactions = getFilteredTransactions()
  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0)

  // Enhanced color palette with more sophisticated colors
  const categoryColors: Record<string, string> = {
    'Food & Dining': '#ef4444',
    'Transportation': '#3b82f6',
    'Shopping': '#8b5cf6',
    'Entertainment': '#ec4899',
    'Bills & Utilities': '#f59e0b',
    'Healthcare': '#10b981',
    'Income': '#06b6d4',
    'Other': '#6b7280',
    'Travel': '#14b8a6',
    'Education': '#f97316',
    'Insurance': '#84cc16',
    'Investments': '#6366f1'
  }

  if (expenseTransactions.length === 0 || totalExpenses === 0) {
    const periodText = timePeriod === 'month' ? 'this month' :
                      timePeriod === 'quarter' ? 'this quarter' :
                      'in the selected period'

    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-8 shadow-soft hover:shadow-large transition-all duration-300 card-hover animate-in">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-secondary-900">Expense Categories</h3>
          <div className="px-2 py-1 bg-secondary-100 rounded-lg">
            <span className="text-xs font-medium text-secondary-700">
              {timePeriod === 'all' ? 'All Time' :
               timePeriod === 'month' ? 'This Month' :
               'This Quarter'}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl flex items-center justify-center mb-6">
              <PieChartIcon className="w-12 h-12 text-primary-400" />
            </div>
            <div className="absolute -inset-2 bg-gradient-to-r from-primary-500/20 to-success-500/20 rounded-2xl opacity-50 -z-10 blur-sm" />
          </div>
          <p className="text-secondary-700 font-semibold mb-3 text-lg">No expense data available</p>
          <p className="text-secondary-500 font-medium max-w-sm">
            No expenses found {periodText}. Try selecting a different time period or add some expenses.
          </p>
        </div>
      </div>
    )
  }

  // Group expenses by category with enhanced data
  const categoryTotals = expenseTransactions.reduce((acc, transaction) => {
    if (!acc[transaction.category]) {
      acc[transaction.category] = { amount: 0, count: 0 }
    }
    acc[transaction.category].amount += transaction.amount
    acc[transaction.category].count += 1
    return acc
  }, {} as Record<string, { amount: number; count: number }>)

  // Create enhanced category data with budget comparison
  const categoryData: CategoryData[] = Object.entries(categoryTotals)
    .map(([category, data]) => {
      const budget = budgets.find(b => b.category === category)
      return {
        category,
        amount: data.amount,
        percentage: (data.amount / totalExpenses) * 100,
        color: categoryColors[category] || '#6b7280',
        transactionCount: data.count,
        budgetAmount: budget?.budgetAmount
      }
    })

  // Sort data based on selected sort type
  const sortedCategoryData = [...categoryData].sort((a, b) => {
    switch (sortType) {
      case 'alphabetical':
        return a.category.localeCompare(b.category)
      case 'percentage':
        return b.percentage - a.percentage
      default:
        return b.amount - a.amount
    }
  })

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-xl p-4 shadow-large">
          <p className="font-semibold text-secondary-900 mb-2">{data.category}</p>
          <div className="space-y-1">
            <p className="text-secondary-700">Amount: ${data.amount.toFixed(2)}</p>
            <p className="text-secondary-700">Percentage: {data.percentage.toFixed(1)}%</p>
            <p className="text-secondary-700">Transactions: {data.transactionCount}</p>
            {data.budgetAmount && (
              <p className={`font-medium ${
                data.amount > data.budgetAmount ? 'text-danger-600' : 'text-success-600'
              }`}>
                Budget: ${data.budgetAmount.toFixed(2)}
                ({data.amount > data.budgetAmount ? 'Over' : 'Under'} budget)
              </p>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category)
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 mobile-padding py-4 sm:py-6 shadow-soft hover:shadow-large transition-all duration-300 card-hover animate-in h-full flex flex-col">
      {/* Header with Controls */}
      <div className="flex flex-col space-y-3 sm:space-y-4 mb-4 sm:mb-6">
        {/* Title and Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <h3 className="text-lg sm:text-xl font-bold text-secondary-900">Expense Categories</h3>
          <div className="flex items-center space-x-2">
            <div className="px-2 sm:px-3 py-1 bg-danger-50 rounded-lg">
              <span className="text-xs font-bold text-danger-700">${totalExpenses.toFixed(0)}</span>
            </div>
            <div className="px-2 sm:px-3 py-1 bg-secondary-100 rounded-lg">
              <span className="text-xs font-medium text-secondary-700">
                {expenseTransactions.length} txns
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          {/* Time Period Selector */}
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-secondary-600" />
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
              className="flex-1 sm:flex-none text-sm py-2 px-3 border border-secondary-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[44px]"
              aria-label="Select time period"
            >
              <option value="all">All Time</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
          </div>

          {/* Chart Type Selector */}
          <div className="flex items-center space-x-2">
            <Grid3X3 className="w-4 h-4 text-secondary-600" />
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value as ChartType)}
              className="flex-1 sm:flex-none text-sm py-2 px-3 border border-secondary-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[44px]"
              aria-label="Select chart type"
            >
              <option value="pie">Pie Chart</option>
              <option value="donut">Donut Chart</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="w-4 h-4 text-secondary-600" />
            <select
              value={sortType}
              onChange={(e) => setSortType(e.target.value as SortType)}
              className="flex-1 sm:flex-none text-sm py-2 px-3 border border-secondary-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[44px]"
              aria-label="Select sort type"
            >
              <option value="amount">By Amount</option>
              <option value="percentage">By Percentage</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mobile-Optimized Chart Rendering */}
      <div className="flex flex-col lg:flex-row items-start gap-4 lg:gap-6 flex-1 min-h-0">
        {/* Chart Container */}
        <div className="w-full lg:flex-1 min-h-0">
          <ResponsiveContainer width="100%" height={280} className="sm:h-80">
            <PieChart key={`${timePeriod}-${chartType}-${sortType}`}>
              <Pie
                data={sortedCategoryData}
                cx="50%"
                cy="45%"
                outerRadius={chartType === 'donut' ? chartConfig.pieOuterRadius : chartConfig.pieOuterRadius + 10}
                innerRadius={chartType === 'donut' ? chartConfig.pieInnerRadius : 0}
                paddingAngle={sortType === 'amount' ? 2 : 1}
                dataKey="amount"
                onClick={(data) => handleCategoryClick(data.category)}
                className="cursor-pointer focus:outline-none"
                startAngle={sortType === 'alphabetical' ? 0 : 90}
                endAngle={sortType === 'alphabetical' ? 360 : 450}
              >
                {sortedCategoryData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke={selectedCategory === entry.category ? '#1f2937' : 'none'}
                    strokeWidth={selectedCategory === entry.category ? 2 : 0}
                    className={`transition-all duration-200 ${
                      selectedCategory === entry.category ? 'brightness-110' : ''
                    } ${
                      selectedCategory && selectedCategory !== entry.category ? 'opacity-60' : 'opacity-100'
                    }`}
                  />
                ))}
              </Pie>
              <Tooltip
                content={<CustomTooltip />}
                wrapperStyle={{ zIndex: 1000 }}
                position={{ x: undefined, y: undefined }}
              />
              <Legend
                verticalAlign="bottom"
                height={40}
                iconSize={chartConfig.iconSize}
                wrapperStyle={{
                  fontSize: chartConfig.legendFontSize,
                  paddingTop: '10px'
                }}
                formatter={(value: string, entry: any) => (
                  <span className="font-bold" style={{ color: entry.color }}>
                    {value.length > chartConfig.maxCategoryLength
                      ? value.substring(0, chartConfig.maxCategoryLength) + '...'
                      : value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Mobile-Optimized Category List */}
        <div className="w-full lg:w-80 space-y-2 max-h-64 sm:max-h-80 lg:max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-3 sticky top-0 bg-white/90 backdrop-blur-sm py-2 z-10">
            <h4 className="font-semibold text-secondary-900 text-sm sm:text-base">Categories</h4>
            <span className="text-xs sm:text-sm text-secondary-600">{sortedCategoryData.length} total</span>
          </div>

          {sortedCategoryData.slice(0, chartConfig.maxCategoriesShown).map((item, index) => (
            <div
              key={index}
              className={`p-3 sm:p-4 rounded-lg border transition-all duration-200 cursor-pointer touch-manipulation ${
                selectedCategory === item.category
                  ? 'border-primary-300 bg-primary-50 shadow-sm'
                  : 'border-secondary-100 bg-secondary-50 hover:bg-secondary-100 hover:border-secondary-200 active:bg-secondary-200'
              }`}
              onClick={() => handleCategoryClick(item.category)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleCategoryClick(item.category)
                }
              }}
              aria-label={`Select ${item.category} category`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <div
                    className="w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-sm border border-white flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                    aria-hidden="true"
                  />
                  <span className="font-semibold text-secondary-900 text-sm sm:text-base truncate">
                    {item.category.length > (chartConfig.maxCategoryLength + 6)
                      ? item.category.substring(0, chartConfig.maxCategoryLength + 6) + '...'
                      : item.category}
                  </span>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="font-bold text-secondary-900 text-sm sm:text-base">${item.amount.toFixed(0)}</p>
                  <p className="text-xs sm:text-sm text-secondary-600">{item.percentage.toFixed(0)}%</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-secondary-600">{item.transactionCount} transaction{item.transactionCount !== 1 ? 's' : ''}</span>
                {item.budgetAmount && (
                  <span className={`font-medium px-2 py-1 rounded text-xs ${
                    item.amount > item.budgetAmount
                      ? 'bg-danger-100 text-danger-700'
                      : 'bg-success-100 text-success-700'
                  }`}>
                    {item.amount > item.budgetAmount ? 'Over Budget' : 'Under Budget'}
                  </span>
                )}
              </div>

              {item.budgetAmount && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-secondary-600">Budget Progress</span>
                    <span className="text-secondary-600">
                      ${item.amount.toFixed(0)} / ${item.budgetAmount.toFixed(0)}
                    </span>
                  </div>
                  <div className="w-full bg-secondary-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        item.amount > item.budgetAmount
                          ? 'bg-danger-500'
                          : 'bg-success-500'
                      }`}
                      style={{
                        width: `${Math.min((item.amount / item.budgetAmount) * 100, 100)}%`
                      }}
                      aria-label={`${Math.min((item.amount / item.budgetAmount) * 100, 100).toFixed(0)}% of budget used`}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}

          {sortedCategoryData.length > chartConfig.maxCategoriesShown && (
            <div className="text-center py-3">
              <span className="text-xs sm:text-sm text-secondary-600">
                +{sortedCategoryData.length - chartConfig.maxCategoriesShown} more categories
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Compact Selected Category Details */}
      {selectedCategory && (
        <div className="mt-4 p-4 bg-primary-50 rounded-lg border border-primary-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-primary-900 text-sm">
              {selectedCategory} Transactions
            </h4>
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className="text-primary-600 hover:text-primary-800 text-xs font-medium"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {expenseTransactions
              .filter(t => t.category === selectedCategory)
              .slice(0, 4)
              .map((transaction, index) => (
                <div key={index} className="bg-white rounded-lg p-2 border border-primary-100">
                  <p className="font-semibold text-secondary-900 text-xs truncate">
                    {transaction.description.length > 20
                      ? transaction.description.substring(0, 20) + '...'
                      : transaction.description}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-secondary-600">
                      {new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="font-bold text-danger-600 text-xs">${transaction.amount.toFixed(0)}</span>
                  </div>
                </div>
              ))}
          </div>
          {expenseTransactions.filter(t => t.category === selectedCategory).length > 4 && (
            <p className="text-xs text-primary-700 mt-2 text-center">
              +{expenseTransactions.filter(t => t.category === selectedCategory).length - 4} more
            </p>
          )}
        </div>
      )}
    </div>
  )
}
