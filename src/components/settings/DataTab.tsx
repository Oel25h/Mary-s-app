'use client'

import { Download, Upload, Database, FileText } from 'lucide-react'

export default function DataTab() {
  const handleExportData = (format: string) => {
    // TODO: Implement data export
    console.log('Export data as:', format)
  }

  const handleImportData = () => {
    // TODO: Implement data import
    console.log('Import data')
  }

  return (
    <div className="space-y-6">
      {/* Data Export */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <Download className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Export Data</h3>
        </div>
        
        <p className="text-gray-600 mb-6">
          Download your financial data in various formats for backup or analysis.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => handleExportData('csv')}
            className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-center"
          >
            <FileText className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900">CSV Format</h4>
            <p className="text-sm text-gray-500">Spreadsheet compatible</p>
          </button>
          
          <button
            type="button"
            onClick={() => handleExportData('json')}
            className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-center"
          >
            <Database className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900">JSON Format</h4>
            <p className="text-sm text-gray-500">Developer friendly</p>
          </button>
          
          <button
            type="button"
            onClick={() => handleExportData('pdf')}
            className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-center"
          >
            <FileText className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900">PDF Report</h4>
            <p className="text-sm text-gray-500">Formatted report</p>
          </button>
        </div>
      </div>

      {/* Data Import */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <Upload className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Import Data</h3>
        </div>
        
        <p className="text-gray-600 mb-6">
          Import transactions from bank statements or other financial apps.
        </p>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            Drop files here or click to browse
          </h4>
          <p className="text-gray-500 mb-4">
            Supports CSV, OFX, QIF, PDF, and Image files (JPG, PNG, etc.)
          </p>
          <button
            type="button"
            onClick={handleImportData}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Choose Files
          </button>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <Database className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Data Management</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Storage Used</h4>
              <p className="text-sm text-gray-500">2.4 MB of 100 MB used</p>
            </div>
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div className="bg-primary-500 h-2 rounded-full" style={{ width: '2.4%' }}></div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Last Backup</h4>
              <p className="text-sm text-gray-500">January 15, 2024 at 3:42 PM</p>
            </div>
            <button
              type="button"
              className="px-3 py-1 text-sm bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors"
            >
              Backup Now
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
            <div>
              <h4 className="font-medium text-red-900">Clear All Data</h4>
              <p className="text-sm text-red-700">Permanently delete all transactions and budgets</p>
            </div>
            <button
              type="button"
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Clear Data
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
