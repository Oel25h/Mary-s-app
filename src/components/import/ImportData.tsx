'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, Sparkles, AlertCircle, CheckCircle, X, Download } from 'lucide-react'
import { aiImportService } from '@/services/aiImportService'
import { ImportResult, ImportOptions } from '@/types'

interface ImportDataProps {
  onImportComplete?: (result: ImportResult) => void
  onClose?: () => void
}

export default function ImportData({ onImportComplete, onClose }: ImportDataProps) {
  const [dragActive, setDragActive] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [textInput, setTextInput] = useState('')
  const [activeTab, setActiveTab] = useState<'file' | 'text'>('file')
  const [options, setOptions] = useState<ImportOptions>({
    skipDuplicates: true,
    dateFormat: 'auto',
    currency: 'USD',
    confidenceThreshold: 0.7
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFiles(files)
  }

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return

    setIsProcessing(true)
    setResult(null)

    try {
      console.log('ImportData: Processing files with AI:', files.map(f => f.name))
      const importResult = await aiImportService.processFiles(files, options)
      console.log('ImportData: AI Import result:', importResult)
      
      setResult(importResult)
      onImportComplete?.(importResult)
    } catch (error) {
      console.error('ImportData: Error processing files:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

      // Enhanced error messages for better user experience
      let userFriendlyError = errorMessage
      let warnings: string[] = []

      if (errorMessage.toLowerCase().includes('overloaded') || errorMessage.toLowerCase().includes('503')) {
        userFriendlyError = 'Google\'s AI service is currently busy. This is temporary - please try again in a few minutes.'
        warnings.push('Large files are more likely to encounter this issue. Consider breaking very large files into smaller parts.')
      } else if (errorMessage.toLowerCase().includes('timeout')) {
        userFriendlyError = 'The request took too long to process. This often happens with very large files.'
        warnings.push('Try processing smaller files or breaking large files into sections.')
      } else if (errorMessage.toLowerCase().includes('rate limit') || errorMessage.toLowerCase().includes('quota')) {
        userFriendlyError = 'API usage limit reached. Please wait a few minutes before trying again.'
        warnings.push('This is a temporary limitation that will reset automatically.')
      }

      setResult({
        transactions: [],
        errors: [userFriendlyError],
        warnings,
        summary: { totalProcessed: files.length, successfullyParsed: 0, failed: files.length, duplicatesFound: 0 }
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleTextSubmit = async () => {
    if (!textInput.trim()) return

    setIsProcessing(true)
    setResult(null)

    try {
      console.log('ImportData: Processing text input with AI')
      const importResult = await aiImportService.processText(textInput, options)
      console.log('ImportData: AI Text import result:', importResult)
      
      setResult(importResult)
      onImportComplete?.(importResult)
    } catch (error) {
      console.error('ImportData: Error processing text:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

      // Enhanced error messages for better user experience
      let userFriendlyError = errorMessage
      let warnings: string[] = []

      if (errorMessage.toLowerCase().includes('overloaded') || errorMessage.toLowerCase().includes('503')) {
        userFriendlyError = 'Google\'s AI service is currently busy. This is temporary - please try again in a few minutes.'
        warnings.push('Large amounts of text are more likely to encounter this issue. Consider breaking very large data into smaller sections.')
      } else if (errorMessage.toLowerCase().includes('timeout')) {
        userFriendlyError = 'The request took too long to process. This often happens with very large amounts of text.'
        warnings.push('Try processing smaller sections of data at a time.')
      } else if (errorMessage.toLowerCase().includes('rate limit') || errorMessage.toLowerCase().includes('quota')) {
        userFriendlyError = 'API usage limit reached. Please wait a few minutes before trying again.'
        warnings.push('This is a temporary limitation that will reset automatically.')
      } else if (errorMessage.toLowerCase().includes('too large')) {
        userFriendlyError = 'The text you\'re trying to process is too large for a single request.'
        warnings.push('Try breaking your data into smaller sections and processing them separately.')
      }

      setResult({
        transactions: [],
        errors: [userFriendlyError],
        warnings,
        summary: { totalProcessed: 1, successfullyParsed: 0, failed: 1, duplicatesFound: 0 }
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const clearResults = () => {
    setResult(null)
    setTextInput('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const downloadSampleCSV = () => {
    const sampleData = `Date,Description,Amount,Category,Type
01/15/2024,Grocery Store,-45.67,Food & Dining,expense
01/16/2024,Salary Deposit,2500.00,Income,income
01/17/2024,Gas Station,-32.50,Transportation,expense
01/18/2024,Restaurant,-28.75,Food & Dining,expense`

    const blob = new Blob([sampleData], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sample-transactions.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-white rounded-2xl border border-white/20 shadow-soft p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-secondary-900">AI-Powered Data Import</h2>
            <p className="text-secondary-600">Upload files or paste data - AI will intelligently parse your transactions</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* Import Options */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Import Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Date Format</label>
            <select
              value={options.dateFormat}
              onChange={(e) => setOptions(prev => ({ ...prev, dateFormat: e.target.value as any }))}
              className="w-full text-xs border border-gray-300 rounded px-2 py-1"
            >
              <option value="auto">Auto-detect</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Currency</label>
            <select
              value={options.currency}
              onChange={(e) => setOptions(prev => ({ ...prev, currency: e.target.value }))}
              className="w-full text-xs border border-gray-300 rounded px-2 py-1"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Confidence</label>
            <select
              value={options.confidenceThreshold}
              onChange={(e) => setOptions(prev => ({ ...prev, confidenceThreshold: parseFloat(e.target.value) }))}
              className="w-full text-xs border border-gray-300 rounded px-2 py-1"
            >
              <option value={0.5}>Low (50%)</option>
              <option value={0.7}>Medium (70%)</option>
              <option value={0.9}>High (90%)</option>
            </select>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="skipDuplicates"
              checked={options.skipDuplicates}
              onChange={(e) => setOptions(prev => ({ ...prev, skipDuplicates: e.target.checked }))}
              className="mr-2"
            />
            <label htmlFor="skipDuplicates" className="text-xs font-medium text-gray-700">Skip duplicates</label>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        <button
          type="button"
          onClick={() => setActiveTab('file')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'file'
              ? 'bg-white text-secondary-900 shadow-sm'
              : 'text-secondary-600 hover:text-secondary-900'
          }`}
        >
          <Upload className="w-4 h-4 inline mr-2" />
          File Upload
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('text')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'text'
              ? 'bg-white text-secondary-900 shadow-sm'
              : 'text-secondary-600 hover:text-secondary-900'
          }`}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Text Input
        </button>
      </div>

      {/* File Upload Tab */}
      {activeTab === 'file' && (
        <div className="space-y-4">
          {/* Drag & Drop Area */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Drop files here or click to browse
            </h3>
            <p className="text-gray-600 mb-4">
              Supports CSV, TXT, PDF, and Image files (max 10MB each)<br />
              <span className="text-sm text-green-600">✅ PDF & OCR processing now available! Bank statements, receipts, and invoices supported</span>
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".csv,.txt,.pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp"
              onChange={handleFileInput}
              className="hidden"
            />
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Choose Files
            </button>
          </div>

          {/* Sample CSV Download */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={downloadSampleCSV}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
            >
              <Download className="w-4 h-4" />
              <span>Download Sample CSV</span>
            </button>
          </div>
        </div>
      )}

      {/* Text Input Tab */}
      {activeTab === 'text' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paste your transaction data
            </label>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={`Paste any financial data here. Examples:

CSV format:
Date,Description,Amount,Category
01/15/2024,Grocery Store,-45.67,Food & Dining
01/16/2024,Salary Deposit,2500.00,Income

Bank statement format:
01/15/2024  -45.67  Grocery Store
01/16/2024  2500.00  Salary Deposit`}
              className="w-full h-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            />
          </div>
          
          <button
            type="button"
            onClick={handleTextSubmit}
            disabled={!textInput.trim() || isProcessing}
            className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center space-x-2">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>AI Processing...</span>
              </div>
            ) : (
              'Process with AI'
            )}
          </button>
        </div>
      )}

      {/* Processing Status */}
      {isProcessing && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
            <div>
              <p className="text-sm font-medium text-blue-900">AI is processing your data...</p>
              <p className="text-xs text-blue-700">This may take a few moments</p>
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      {result && !isProcessing && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Import Results</h3>
            <button
              type="button"
              onClick={clearResults}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Clear Results
            </button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{result.transactions.length}</div>
              <div className="text-xs text-green-700">Transactions Found</div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{result.summary.successfullyParsed}</div>
              <div className="text-xs text-blue-700">Successfully Parsed</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{result.warnings.length}</div>
              <div className="text-xs text-yellow-700">Warnings</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{result.errors.length}</div>
              <div className="text-xs text-red-700">Errors</div>
            </div>
          </div>

          {/* Errors */}
          {result.errors.length > 0 && (
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h4 className="font-medium text-red-900">Errors</h4>
              </div>
              <ul className="text-sm text-red-700 space-y-1">
                {result.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {result.warnings.length > 0 && (
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <h4 className="font-medium text-yellow-900">Warnings</h4>
              </div>
              <ul className="text-sm text-yellow-700 space-y-1">
                {result.warnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Success Message */}
          {result.transactions.length > 0 && (
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-sm font-medium text-green-900">
                  Successfully parsed {result.transactions.length} transactions! 
                  Review them in the next step before importing.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
