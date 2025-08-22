'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import BudgetOverview from '@/components/budgets/BudgetOverview'
import BudgetCard from '@/components/budgets/BudgetCard'
import AddBudgetModal from '@/components/budgets/AddBudgetModal'
import { ToastContainer, useToast } from '@/components/ui/Toast'
import { useApp } from '@/contexts/AppContext'
import type { Budget } from '@/types'

export default function BudgetsPage() {
  const { budgets, addBudget, updateBudget } = useApp()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const { toasts, removeToast, success, error: showError } = useToast()

  const handleAddBudget = async (newBudget: Omit<Budget, 'id' | 'spentAmount'>) => {
    try {
      await addBudget(newBudget)
      setIsAddModalOpen(false)
      success('Budget Added', `${newBudget.category} budget has been added successfully.`)
    } catch (err) {
      showError('Failed to Add Budget', err instanceof Error ? err.message : 'Unknown error occurred')
      throw err
    }
  }

  const handleEditBudget = (id: string) => {
    // TODO: Implement edit functionality
    console.log('Edit budget:', id)
  }

  const handleTestBudget = async () => {
    try {
      await addBudget({
        category: 'Test Category',
        budgetAmount: 500.00,
        period: 'Monthly'
      })
      success('Test Successful', 'Test budget created successfully!')
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      showError('Test Failed', errorMsg)
    }
  }

  // Calculate overview stats
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.budgetAmount, 0)
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spentAmount, 0)
  const categoriesOverBudget = budgets.filter(budget => budget.spentAmount > budget.budgetAmount).length

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex">
        <Sidebar currentPage="budgets" />

        <main className="flex-1 p-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Budgets</h1>
                <p className="text-gray-600">Track and manage your spending budgets</p>
              </div>
              <div className="flex space-x-3">
                {process.env.NODE_ENV === 'development' && (
                  <button
                    type="button"
                    onClick={handleTestBudget}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <span>🧪 Test Add</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Budget</span>
                </button>
              </div>
            </div>

            {/* Budget Overview */}
            <BudgetOverview
              totalBudget={totalBudget}
              totalSpent={totalSpent}
              categoriesOverBudget={categoriesOverBudget}
              totalCategories={budgets.length}
            />

            {/* Budget Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {budgets.map((budget) => (
                <BudgetCard
                  key={budget.id}
                  id={budget.id}
                  category={budget.category}
                  budgetAmount={budget.budgetAmount}
                  spentAmount={budget.spentAmount}
                  period={budget.period}
                  onEdit={handleEditBudget}
                />
              ))}
            </div>

            {/* Add Budget Modal */}
            <AddBudgetModal
              isOpen={isAddModalOpen}
              onClose={() => setIsAddModalOpen(false)}
              onAdd={handleAddBudget}
            />
          </div>
        </main>
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  )
}
