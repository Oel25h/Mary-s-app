'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import dynamic from 'next/dynamic'
import { useApp } from '@/contexts/AppContext'
import { ToastContainer, useToast } from '@/components/ui/Toast'
import { Transaction, ImportResult, ValidationResult } from '@/types'

// Dynamic imports to prevent SSR issues
const ImportData = dynamic(() => import('@/components/import/ImportData'), {
  ssr: false,
  loading: () => <div className="p-8 text-center">Loading import tools...</div>
})

const ImportValidation = dynamic(() => import('@/components/import/ImportValidation'), {
  ssr: false,
  loading: () => <div className="p-8 text-center">Loading validation...</div>
})

export default function ImportPage() {
  const router = useRouter()
  const { transactions: existingTransactions, addTransaction } = useApp()
  const [currentStep, setCurrentStep] = useState<'import' | 'validate' | 'complete'>('import')
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [importedCount, setImportedCount] = useState(0)
  const { toasts, removeToast, success, error: showError } = useToast()

  const handleImportComplete = async (result: ImportResult) => {
    console.log('Import completed with result:', result)
    setImportResult(result)

    if (result.transactions.length > 0) {
      // Dynamically import aiImportService to avoid SSR issues
      const { aiImportService } = await import('@/services/aiImportService')
      // Validate against existing transactions
      const validation = aiImportService.validateTransactions(result.transactions, existingTransactions)
      setValidationResult(validation)
      setCurrentStep('validate')
    } else {
      // No transactions to validate, show results directly
      setCurrentStep('complete')
    }
  }

  const handleValidationConfirm = async (selectedTransactions: Transaction[]) => {
    try {
      console.log('ImportPage: Starting import process for', selectedTransactions.length, 'transactions')
      console.log('ImportPage: Selected transactions:', selectedTransactions.map(t => ({
        id: t.id,
        description: t.description,
        amount: t.amount,
        type: t.type
      })))

      let successCount = 0
      const errors: string[] = []

      for (const transaction of selectedTransactions) {
        try {
          console.log(`ImportPage: Processing transaction: ${transaction.description}`)

          // Remove the id field since addTransaction expects Omit<Transaction, 'id'>
          const transactionWithoutId = {
            date: transaction.date,
            description: transaction.description,
            category: transaction.category,
            amount: transaction.amount,
            type: transaction.type
          }

          console.log('ImportPage: Transaction data for addTransaction:', transactionWithoutId)
          await addTransaction(transactionWithoutId)
          console.log(`ImportPage: Successfully imported: ${transaction.description}`)
          successCount++
        } catch (error) {
          console.error('ImportPage: Error importing transaction:', error)
          console.error('ImportPage: Failed transaction:', transaction)
          errors.push(`Failed to import "${transaction.description}": ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      setImportedCount(successCount)

      if (errors.length > 0) {
        showError(`Imported ${successCount} transactions with ${errors.length} errors`)
        console.error('ImportPage: Import errors:', errors)
      } else {
        success(`Successfully imported ${successCount} transactions!`)
      }

      setCurrentStep('complete')
    } catch (error) {
      console.error('ImportPage: Validation confirm error:', error)
      showError('Failed to import transactions')
    }
  }

  const handleValidationCancel = () => {
    setCurrentStep('import')
    setValidationResult(null)
  }

  const handleClose = () => {
    router.push('/dashboard')
  }

  const handleStartOver = () => {
    setCurrentStep('import')
    setImportResult(null)
    setValidationResult(null)
    setImportedCount(0)
  }

  return (
    <div className="min-h-screen">
      <Header title="Import Data" />

      <div className="flex">
        <Sidebar currentPage="import" />

        <main className="flex-1 p-4 sm:p-8">
          <div className="max-w-6xl mx-auto w-full">
            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`flex items-center space-x-2 ${
                    currentStep === 'import' ? 'text-blue-600' : 'text-green-600'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep === 'import' 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-green-100 text-green-600'
                    }`}>
                      {currentStep === 'import' ? '1' : '✓'}
                    </div>
                    <span className="font-medium">Upload & Parse</span>
                  </div>
                  
                  <div className={`w-16 h-0.5 ${
                    ['validate', 'complete'].includes(currentStep) ? 'bg-green-300' : 'bg-gray-300'
                  }`} />
                  
                  <div className={`flex items-center space-x-2 ${
                    currentStep === 'validate' ? 'text-blue-600' : 
                    currentStep === 'complete' ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep === 'validate' 
                        ? 'bg-blue-100 text-blue-600'
                        : currentStep === 'complete'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {currentStep === 'complete' ? '✓' : '2'}
                    </div>
                    <span className="font-medium">Review & Validate</span>
                  </div>
                  
                  <div className={`w-16 h-0.5 ${
                    currentStep === 'complete' ? 'bg-green-300' : 'bg-gray-300'
                  }`} />
                  
                  <div className={`flex items-center space-x-2 ${
                    currentStep === 'complete' ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep === 'complete'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {currentStep === 'complete' ? '✓' : '3'}
                    </div>
                    <span className="font-medium">Complete</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step Content */}
            {currentStep === 'import' && (
              <ImportData
                onImportComplete={handleImportComplete}
                onClose={handleClose}
              />
            )}

            {currentStep === 'validate' && validationResult && (
              <ImportValidation
                validationResult={validationResult}
                onConfirm={handleValidationConfirm}
                onCancel={handleValidationCancel}
              />
            )}

            {currentStep === 'complete' && (
              <div className="bg-white rounded-2xl border border-white/20 shadow-soft p-8 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
                
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Import Complete!</h2>
                
                {importedCount > 0 ? (
                  <div className="mb-6">
                    <p className="text-lg text-gray-600 mb-2">
                      Successfully imported <span className="font-semibold text-green-600">{importedCount}</span> transactions
                    </p>
                    {importResult && (
                      <div className="text-sm text-gray-500">
                        <p>Processed {importResult.summary.totalProcessed} files</p>
                        {importResult.errors.length > 0 && (
                          <p className="text-yellow-600">With {importResult.errors.length} warnings</p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mb-6">
                    <p className="text-lg text-gray-600 mb-2">
                      No new transactions were imported
                    </p>
                    {importResult && importResult.errors.length > 0 && (
                      <p className="text-sm text-red-600">
                        {importResult.errors.length} errors occurred during processing
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-center space-x-4">
                  <button
                    type="button"
                    onClick={handleStartOver}
                    className="px-6 py-2 text-secondary-600 hover:text-secondary-800 hover:bg-secondary-50 rounded-lg transition-colors"
                  >
                    Import More
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push('/transactions')}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    View Transactions
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push('/dashboard')}
                    className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    View Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  )
}
