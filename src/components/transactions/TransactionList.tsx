'use client'

import { Edit, Trash2, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

import type { Transaction } from '@/types'

interface TransactionListProps {
  transactions: Transaction[]
  onEdit: (transaction: Transaction) => void
  onDelete: (id: string) => void
}

export default function TransactionList({ transactions, onEdit, onDelete }: TransactionListProps) {
  const formatAmount = (amount: number, type: 'income' | 'expense') => {
    const formatted = Math.abs(amount).toFixed(2)
    return type === 'income' ? `+$${formatted}` : `-$${formatted}`
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Food & Dining': 'bg-orange-100 text-orange-800',
      'Transportation': 'bg-blue-100 text-blue-800',
      'Shopping': 'bg-purple-100 text-purple-800',
      'Entertainment': 'bg-pink-100 text-pink-800',
      'Bills & Utilities': 'bg-red-100 text-red-800',
      'Healthcare': 'bg-green-100 text-green-800',
      'Income': 'bg-emerald-100 text-emerald-800',
      'Other': 'bg-gray-100 text-gray-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-16 shadow-soft text-center animate-in">
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <MoreHorizontal className="w-10 h-10 text-primary-400" />
          </div>
          <div className="absolute -inset-2 bg-gradient-to-r from-primary-500/20 to-success-500/20 rounded-2xl opacity-50 -z-10 blur-sm" />
        </div>
        <h3 className="text-xl font-bold text-secondary-900 mb-3">No transactions found</h3>
        <p className="text-secondary-600 font-medium">Add your first transaction to get started</p>
      </div>
    )
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-soft overflow-hidden animate-in">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-secondary-50 to-primary-50/30 border-b border-white/20">
            <tr>
              <th className="px-8 py-5 text-left text-sm font-bold text-secondary-800 uppercase tracking-wide">Date</th>
              <th className="px-8 py-5 text-left text-sm font-bold text-secondary-800 uppercase tracking-wide">Description</th>
              <th className="px-8 py-5 text-left text-sm font-bold text-secondary-800 uppercase tracking-wide">Category</th>
              <th className="px-8 py-5 text-right text-sm font-bold text-secondary-800 uppercase tracking-wide">Amount</th>
              <th className="px-8 py-5 text-center text-sm font-bold text-secondary-800 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/20">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="group hover:bg-white/60 transition-all duration-200 animate-in">
                <td className="px-8 py-6 text-sm font-semibold text-secondary-700">
                  {new Date(transaction.date).toLocaleDateString()}
                </td>
                <td className="px-8 py-6">
                  <div className="text-base font-bold text-secondary-900">{transaction.description}</div>
                </td>
                <td className="px-8 py-6">
                  <span className={cn(
                    "inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wide",
                    getCategoryColor(transaction.category)
                  )}>
                    {transaction.category}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <span className={cn(
                    "text-lg font-bold",
                    transaction.type === 'income' ? 'text-success-600' : 'text-danger-600'
                  )}>
                    {formatAmount(transaction.amount, transaction.type)}
                  </span>
                </td>
                <td className="px-8 py-6 text-center">
                  <div className="flex items-center justify-center space-x-3">
                    <button
                      type="button"
                      onClick={() => onEdit(transaction)}
                      className="p-2 text-secondary-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200 hover:scale-110"
                      title="Edit transaction"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(transaction.id)}
                      className="p-2 text-secondary-400 hover:text-danger-600 hover:bg-danger-50 rounded-xl transition-all duration-200 hover:scale-110"
                      title="Delete transaction"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
