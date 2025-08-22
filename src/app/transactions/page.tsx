'use client'

import { useState } from 'react'
import { Plus, TrendingUp, DollarSign } from 'lucide-react'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import TransactionFilters from '@/components/transactions/TransactionFilters'
import TransactionList from '@/components/transactions/TransactionList'
import AddTransactionModal from '@/components/transactions/AddTransactionModal'
import { ToastContainer, useToast } from '@/components/ui/Toast'
import { useApp } from '@/contexts/AppContext'
import type { Transaction } from '@/types'

export default function TransactionsPage() {
  const {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction
  } = useApp()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [dateRange, setDateRange] = useState('This Month')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [testMessage, setTestMessage] = useState<string | null>(null)
  const { toasts, removeToast, success, error: showError } = useToast()

  const handleAddTransaction = async (newTransaction: Omit<Transaction, 'id'>) => {
    try {
      await addTransaction(newTransaction)
      setIsAddModalOpen(false)
      success('Transaction Added', `${newTransaction.description} has been added successfully.`)
    } catch (err) {
      showError('Failed to Add Transaction', err instanceof Error ? err.message : 'Unknown error occurred')
      throw err
    }
  }

  const handleEditTransaction = (transaction: Transaction) => {
    // TODO: Implement edit functionality
  }

  const handleDeleteTransaction = (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      deleteTransaction(id)
    }
  }

  const handleTestTransaction = async () => {
    try {
      setTestMessage('Testing transaction creation...')
      await addTransaction({
        description: 'Test Transaction',
        amount: 10.00,
        category: 'Other',
        date: new Date(),
        type: 'expense'
      })
      setTestMessage('✅ Test transaction created successfully!')
      success('Test Successful', 'Test transaction created successfully!')
      setTimeout(() => setTestMessage(null), 3000)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setTestMessage(`❌ Test failed: ${errorMsg}`)
      showError('Test Failed', errorMsg)
      setTimeout(() => setTestMessage(null), 5000)
    }
  }

  // Filter transactions based on search and filters
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All Categories' || transaction.category === selectedCategory
    // TODO: Implement date range filtering
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen">
      <Header />

      <div className="flex">
        <Sidebar currentPage="transactions" />

        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Page Header */}
            <div className="flex items-start justify-between mb-8 animate-in">
              <div>
                <h1 className="text-2xl font-bold text-secondary-900 mb-2">
                  Transaction Management 💳
                </h1>
                <p className="text-secondary-600 font-medium">
                  Track, organize, and analyze all your financial transactions in one place
                </p>
              </div>
              <div className="flex space-x-3">
                {process.env.NODE_ENV === 'development' && (
                  <button
                    type="button"
                    onClick={handleTestTransaction}
                    className="btn-secondary inline-flex items-center space-x-2 px-4 py-2"
                  >
                    <span>🧪 Test Add</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="btn-primary inline-flex items-center space-x-2 px-6 py-3"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add New Transaction</span>
                </button>
              </div>
            </div>

            {/* Test Message */}
            {testMessage && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-700">{testMessage}</p>
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-soft">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-success-100 rounded-xl flex items-center justify-center">
                    <Plus className="w-5 h-5 text-success-600" />
                  </div>
                  <h3 className="font-bold text-secondary-900">Total Transactions</h3>
                </div>
                <p className="text-2xl font-bold text-secondary-900">{transactions.length}</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-soft">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-primary-600" />
                  </div>
                  <h3 className="font-bold text-secondary-900">This Month</h3>
                </div>
                <p className="text-2xl font-bold text-secondary-900">{filteredTransactions.length}</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-soft">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-warning-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-warning-600" />
                  </div>
                  <h3 className="font-bold text-secondary-900">Categories</h3>
                </div>
                <p className="text-2xl font-bold text-secondary-900">8</p>
              </div>
            </div>

            {/* Filters */}
            <TransactionFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />

            {/* Transaction List */}
            <TransactionList
              transactions={filteredTransactions}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
            />

            {/* Add Transaction Modal */}
            <AddTransactionModal
              isOpen={isAddModalOpen}
              onClose={() => setIsAddModalOpen(false)}
              onAdd={handleAddTransaction}
            />
          </div>
        </main>
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  )
}
