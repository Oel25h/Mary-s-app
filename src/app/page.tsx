'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import MetricCard from '@/components/dashboard/MetricCard'
import QuickActions from '@/components/dashboard/QuickActions'
import ExpenseCategoriesChart from '@/components/charts/ExpenseCategoriesChart'
import IncomeVsExpensesChart from '@/components/charts/IncomeVsExpensesChart'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useApp } from '@/contexts/AppContext'
import { useResponsive } from '@/hooks/useResponsive'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target
} from 'lucide-react'

export default function Dashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isMobile } = useResponsive()
  
  const {
    transactions,
    getTotalIncome,
    getTotalExpenses,
    getNetIncome,
    getSavingsRate,
    loading,
    error
  } = useApp()

  const totalIncome = getTotalIncome()
  const totalExpenses = getTotalExpenses()
  const netIncome = getNetIncome()
  const savingsRate = getSavingsRate()

  const incomeTransactions = transactions.filter(t => t.type === 'income').length
  const expenseTransactions = transactions.filter(t => t.type === 'expense').length

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your financial data...</p>
          <p className="text-sm text-gray-400 mt-2">This should only take a few seconds</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-red-600 mb-4">
            <DollarSign className="w-12 h-12 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Unable to Load Dashboard</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen-safe">
        <Header 
          title="Dashboard" 
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMobileMenuOpen={isMobileMenuOpen}
        />

        <div className="flex">
          <Sidebar 
            currentPage="dashboard" 
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          />

          <main className="flex-1 mobile-padding py-4 sm:py-8">
            <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
              {/* Metrics Grid */}
              <div className="grid mobile-grid gap-4 sm:gap-6">
                <MetricCard
                  title="Total Income"
                  value={`$${totalIncome.toLocaleString()}`}
                  subtitle={`${incomeTransactions} transactions`}
                  icon={<TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
                  iconColor="bg-gradient-to-br from-green-500 to-emerald-600"
                  trend={incomeTransactions > 0 ? '+12.5%' : undefined}
                />
                <MetricCard
                  title="Total Expenses"
                  value={`$${totalExpenses.toLocaleString()}`}
                  subtitle={`${expenseTransactions} transactions`}
                  icon={<TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
                  iconColor="bg-gradient-to-br from-red-500 to-pink-600"
                  trend={expenseTransactions > 0 ? '-8.2%' : undefined}
                />
                <MetricCard
                  title="Net Income"
                  value={`$${netIncome.toLocaleString()}`}
                  subtitle={netIncome >= 0 ? 'Positive cash flow' : 'Negative cash flow'}
                  icon={<DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
                  iconColor={netIncome >= 0 ? "bg-gradient-to-br from-blue-500 to-indigo-600" : "bg-gradient-to-br from-orange-500 to-red-600"}
                />
                <MetricCard
                  title="Savings Rate"
                  value={`${savingsRate.toFixed(1)}%`}
                  subtitle="Of total income"
                  icon={<Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
                  iconColor="bg-gradient-to-br from-purple-500 to-violet-600"
                  trend={savingsRate > 20 ? 'Excellent' : savingsRate > 10 ? 'Good' : 'Needs improvement'}
                />
              </div>

              {/* Quick Actions */}
              <QuickActions />

              {/* Charts */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
                <ExpenseCategoriesChart />
                <IncomeVsExpensesChart />
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}