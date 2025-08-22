'use client'

import { useState } from 'react'
import { CheckCircle, AlertTriangle, XCircle, Eye, EyeOff } from 'lucide-react'
import { Transaction, ValidationResult } from '@/types'
import { cn } from '@/lib/utils'

interface ImportValidationProps {
  validationResult: ValidationResult
  onConfirm: (selectedTransactions: Transaction[]) => Promise<void>
  onCancel: () => void
}

export default function ImportValidation({ validationResult, onConfirm, onCancel }: ImportValidationProps) {
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(
    new Set(validationResult.valid.map(t => t.id))
  )
  const [showDuplicates, setShowDuplicates] = useState(false)
  const [showConflicts, setShowConflicts] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  // Safety check for validationResult
  if (!validationResult) {
    return (
      <div className="bg-white rounded-2xl border border-white/20 shadow-soft p-6">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Validation Error</h2>
          <p className="text-gray-600 mb-4">No validation result available.</p>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const toggleTransaction = (transactionId: string) => {
    const newSelected = new Set(selectedTransactions)
    if (newSelected.has(transactionId)) {
      newSelected.delete(transactionId)
    } else {
      newSelected.add(transactionId)
    }
    setSelectedTransactions(newSelected)
  }

  const handleConfirm = async () => {
    console.log('ImportValidation: handleConfirm called')
    console.log('ImportValidation: Selected transaction IDs:', Array.from(selectedTransactions))

    const transactionsToImport = validationResult.valid.filter(t =>
      selectedTransactions.has(t.id)
    )

    console.log('ImportValidation: Transactions to import:', transactionsToImport.length)
    console.log('ImportValidation: Transaction details:', transactionsToImport.map(t => ({
      id: t.id,
      description: t.description,
      amount: t.amount
    })))

    setIsImporting(true)

    try {
      await onConfirm(transactionsToImport)
      console.log('ImportValidation: onConfirm completed successfully')
    } catch (error) {
      console.error('ImportValidation: Error in onConfirm:', error)
    } finally {
      setIsImporting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const TransactionRow = ({ transaction, isSelected, onToggle, showCheckbox = true }: {
    transaction: Transaction
    isSelected?: boolean
    onToggle?: () => void
    showCheckbox?: boolean
  }) => (
    <div className={cn(
      "flex items-center space-x-3 p-3 rounded-lg border",
      isSelected ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"
    )}>
      {showCheckbox && (
        <input
          type="checkbox"
          checked={isSelected || false}
          onChange={onToggle}
          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
        />
      )}
      <div className="flex-1 grid grid-cols-4 gap-4 text-sm">
        <div>
          <div className="font-medium text-gray-900">{formatDate(transaction.date)}</div>
        </div>
        <div>
          <div className="text-gray-900">{transaction.description}</div>
          <div className="text-xs text-gray-500">{transaction.category}</div>
        </div>
        <div className={cn(
          "font-medium",
          transaction.type === 'income' ? "text-green-600" : "text-red-600"
        )}>
          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
        </div>
        <div>
          <span className={cn(
            "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
            transaction.type === 'income' 
              ? "bg-green-100 text-green-800" 
              : "bg-red-100 text-red-800"
          )}>
            {transaction.type}
          </span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="bg-white rounded-2xl border border-white/20 shadow-soft overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-secondary-100">
        <h2 className="text-2xl font-bold text-secondary-900">Review Import Data</h2>
        <p className="text-secondary-600 mt-1">Review and confirm the transactions to import</p>
      </div>

      {/* Summary Stats */}
      <div className="p-6 border-b border-secondary-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{validationResult.valid.length}</div>
            <div className="text-sm text-gray-600">Valid</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{validationResult.duplicates.length}</div>
            <div className="text-sm text-gray-600">Duplicates</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{validationResult.conflicts.length}</div>
            <div className="text-sm text-gray-600">Conflicts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{selectedTransactions.size}</div>
            <div className="text-sm text-gray-600">Selected</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-h-96 overflow-y-auto">
        {/* Valid Transactions */}
        {validationResult.valid.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-secondary-900 flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-success-600" />
                <span>Valid Transactions ({validationResult.valid.length})</span>
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedTransactions(new Set(validationResult.valid.map(t => t.id)))}
                  className="text-xs text-primary-600 hover:text-primary-800"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTransactions(new Set())}
                  className="text-xs text-gray-600 hover:text-gray-800"
                >
                  Select None
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {validationResult.valid.map((transaction) => (
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction}
                  isSelected={selectedTransactions.has(transaction.id)}
                  onToggle={() => toggleTransaction(transaction.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Duplicates */}
        {validationResult.duplicates.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-secondary-900 flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-warning-600" />
                <span>Duplicate Transactions ({validationResult.duplicates.length})</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowDuplicates(!showDuplicates)}
                className="flex items-center space-x-1 text-xs text-gray-600 hover:text-gray-800"
              >
                {showDuplicates ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{showDuplicates ? 'Hide' : 'Show'}</span>
              </button>
            </div>
            {showDuplicates && (
              <div className="space-y-2">
                {validationResult.duplicates.map((transaction) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    showCheckbox={false}
                  />
                ))}
              </div>
            )}
            {!showDuplicates && (
              <p className="text-sm text-gray-600 italic">
                These transactions appear to already exist in your account and will be skipped.
              </p>
            )}
          </div>
        )}

        {/* Conflicts */}
        {validationResult.conflicts.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-secondary-900 flex items-center space-x-2">
                <XCircle className="w-5 h-5 text-error-600" />
                <span>Conflicting Transactions ({validationResult.conflicts.length})</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowConflicts(!showConflicts)}
                className="flex items-center space-x-1 text-xs text-gray-600 hover:text-gray-800"
              >
                {showConflicts ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{showConflicts ? 'Hide' : 'Show'}</span>
              </button>
            </div>
            {showConflicts && (
              <div className="space-y-2">
                {validationResult.conflicts.map((transaction) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    showCheckbox={false}
                  />
                ))}
              </div>
            )}
            {!showConflicts && (
              <p className="text-sm text-gray-600 italic">
                These transactions have similar dates/descriptions but different amounts. Review manually.
              </p>
            )}
          </div>
        )}

        {/* Errors */}
        {validationResult.errors.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-red-900 flex items-center space-x-2 mb-4">
              <XCircle className="w-5 h-5 text-red-600" />
              <span>Validation Errors</span>
            </h3>
            <div className="bg-red-50 rounded-lg p-4">
              <ul className="text-sm text-red-700 space-y-1">
                {validationResult.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Warnings */}
        {validationResult.warnings.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-yellow-900 flex items-center space-x-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <span>Warnings</span>
            </h3>
            <div className="bg-yellow-50 rounded-lg p-4">
              <ul className="text-sm text-yellow-700 space-y-1">
                {validationResult.warnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-secondary-100">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-secondary-600 hover:text-secondary-800 hover:bg-secondary-50 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {selectedTransactions.size} of {validationResult.valid.length} transactions selected
            </span>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={selectedTransactions.size === 0 || isImporting}
              className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isImporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Importing...</span>
                </>
              ) : (
                <span>Import {selectedTransactions.size} Transactions</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
