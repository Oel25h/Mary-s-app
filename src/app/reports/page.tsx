'use client'

import { useState } from 'react'
import { FileText, TrendingUp, PieChart, Calendar, Sparkles, Clock, Download } from 'lucide-react'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import { useApp } from '@/contexts/AppContext'
import { ToastContainer, useToast } from '@/components/ui/Toast'
import { aiReportService } from '@/services/aiReportService'
import { ReportType, AIReport } from '@/types'

export default function ReportsPage() {
  const { transactions, budgets } = useApp()
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentReport, setCurrentReport] = useState<AIReport | null>(null)
  const [generatingType, setGeneratingType] = useState<ReportType | null>(null)
  const { toasts, removeToast, success, error: showError } = useToast()

  const reportTypes = [
    {
      type: 'monthly-summary' as ReportType,
      icon: <Calendar className="w-8 h-8 text-blue-500" />,
      title: 'Monthly Financial Summary',
      description: 'Comprehensive overview of your monthly financial performance with AI insights',
      color: 'bg-blue-500',
      features: ['Income vs Expenses Analysis', 'Monthly Trends', 'Financial Health Score', 'Performance Insights']
    },
    {
      type: 'spending-analysis' as ReportType,
      icon: <PieChart className="w-8 h-8 text-green-500" />,
      title: 'Spending Analysis & Insights',
      description: 'Deep dive into your spending patterns with AI-powered recommendations',
      color: 'bg-green-500',
      features: ['Category Breakdown', 'Spending Patterns', 'Cost Optimization', 'Behavioral Insights']
    },
    {
      type: 'budget-performance' as ReportType,
      icon: <TrendingUp className="w-8 h-8 text-purple-500" />,
      title: 'Budget Performance & Recommendations',
      description: 'Analyze budget adherence and get personalized improvement suggestions',
      color: 'bg-purple-500',
      features: ['Budget vs Actual', 'Performance Metrics', 'Adjustment Recommendations', 'Goal Tracking']
    }
  ]

  const handleGenerateReport = async (reportType: ReportType) => {
    if (transactions.length === 0) {
      showError('No Data Available', 'You need some transactions to generate a report. Add some transactions first!')
      return
    }

    setIsGenerating(true)
    setGeneratingType(reportType)
    setCurrentReport(null)

    try {
      console.log(`ReportsPage: Generating ${reportType} report`)
      
      const result = await aiReportService.generateReport(transactions, budgets, {
        type: reportType,
        detailLevel: 'detailed',
        includeCharts: true
      })

      if (result.errors.length > 0) {
        showError('Report Generation Failed', result.errors[0])
        return
      }

      setCurrentReport(result.report)
      success('Report Generated!', `Your ${reportType.replace('-', ' ')} report is ready.`)
      
    } catch (error) {
      console.error('ReportsPage: Error generating report:', error)
      showError('Generation Error', error instanceof Error ? error.message : 'Failed to generate report')
    } finally {
      setIsGenerating(false)
      setGeneratingType(null)
    }
  }

  const handleCloseReport = () => {
    setCurrentReport(null)
  }

  const formatReportContent = (content: string) => {
    // Convert markdown-style content to HTML for better display
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
  }

  return (
    <div className="min-h-screen">
      <Header title="AI Reports" />

      <div className="flex">
        <Sidebar currentPage="reports" />

        <main className="flex-1 p-4 sm:p-8">
          <div className="max-w-7xl mx-auto w-full">
            {!currentReport ? (
              <>
                {/* Header */}
                <div className="mb-8">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-secondary-900">AI-Powered Financial Reports</h1>
                      <p className="text-secondary-600">Generate intelligent insights and recommendations from your financial data</p>
                    </div>
                  </div>
                </div>

                {/* Report Types */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  {reportTypes.map((report) => (
                    <div key={report.type} className="bg-white rounded-2xl border border-white/20 shadow-soft p-6 hover:shadow-medium transition-all duration-300">
                      <div className="flex items-center space-x-3 mb-4">
                        {report.icon}
                        <h3 className="text-lg font-bold text-secondary-900">{report.title}</h3>
                      </div>
                      
                      <p className="text-secondary-600 mb-4 text-sm leading-relaxed">{report.description}</p>
                      
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-secondary-800 mb-2">What's Included:</h4>
                        <ul className="text-xs text-secondary-600 space-y-1">
                          {report.features.map((feature, index) => (
                            <li key={index} className="flex items-center space-x-2">
                              <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => handleGenerateReport(report.type)}
                        disabled={isGenerating}
                        className={`w-full px-4 py-3 text-white rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                          isGenerating && generatingType === report.type
                            ? 'bg-gray-400 cursor-not-allowed'
                            : `${report.color} hover:opacity-90 hover:scale-105`
                        }`}
                      >
                        {isGenerating && generatingType === report.type ? (
                          <>
                            <Sparkles className="w-4 h-4 animate-pulse" />
                            <span>Generating with AI...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            <span>Generate Report</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="bg-white rounded-2xl border border-white/20 shadow-soft p-6">
                  <h2 className="text-lg font-bold text-secondary-900 mb-4">Your Data Overview</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-600">{transactions.length}</div>
                      <div className="text-sm text-secondary-600">Transactions Available</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-success-600">{budgets.length}</div>
                      <div className="text-sm text-secondary-600">Active Budgets</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {transactions.length > 0 
                          ? Math.ceil((Date.now() - Math.min(...transactions.map(t => t.date.getTime()))) / (1000 * 60 * 60 * 24))
                          : 0
                        }
                      </div>
                      <div className="text-sm text-secondary-600">Days of Data</div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Report Display */
              <div className="bg-white rounded-2xl border border-white/20 shadow-soft overflow-hidden">
                {/* Report Header */}
                <div className="p-6 border-b border-secondary-100 bg-gradient-to-r from-blue-50 to-purple-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Sparkles className="w-6 h-6 text-primary-600" />
                      <div>
                        <h2 className="text-xl font-bold text-secondary-900">{currentReport.title}</h2>
                        <div className="flex items-center space-x-4 text-sm text-secondary-600 mt-1">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>Generated {currentReport.generatedAt.toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FileText className="w-4 h-4" />
                            <span>{currentReport.metadata.transactionsAnalyzed} transactions analyzed</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Export</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleCloseReport}
                        className="px-4 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition-colors"
                      >
                        Back to Reports
                      </button>
                    </div>
                  </div>
                </div>

                {/* Report Content */}
                <div className="p-6">
                  {/* Summary */}
                  <div className="mb-8 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">Executive Summary</h3>
                    <p className="text-blue-800">{currentReport.summary}</p>
                  </div>

                  {/* Key Insights */}
                  {currentReport.insights.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-secondary-900 mb-4">Key Insights</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentReport.insights.map((insight, index) => (
                          <div key={index} className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-start space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                              <p className="text-green-800 text-sm">{insight}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Main Content */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-4">Detailed Analysis</h3>
                    <div 
                      className="prose prose-sm max-w-none text-secondary-700"
                      dangerouslySetInnerHTML={{ __html: `<p>${formatReportContent(currentReport.content)}</p>` }}
                    />
                  </div>

                  {/* Recommendations */}
                  {currentReport.recommendations.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-secondary-900 mb-4">AI Recommendations</h3>
                      <div className="space-y-3">
                        {currentReport.recommendations.map((recommendation, index) => (
                          <div key={index} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                            <div className="flex items-start space-x-3">
                              <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {index + 1}
                              </div>
                              <p className="text-purple-800 text-sm">{recommendation}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
