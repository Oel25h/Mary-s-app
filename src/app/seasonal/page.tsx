'use client'

import { useState, useEffect } from 'react'
import { Calendar, TrendingUp, TrendingDown, AlertCircle, Snowflake, Sun, Leaf, Flower2, Gift, Sparkles } from 'lucide-react'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import { useApp } from '@/contexts/AppContext'
import { seasonalAnalysisService } from '@/services/seasonalAnalysisService'
import { SeasonalAnalysisResult } from '@/types'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

const SEASON_COLORS = {
  spring: '#22C55E',
  summer: '#F59E0B',
  fall: '#EF4444',
  winter: '#3B82F6'
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function SeasonalAnalysisPage() {
  const { transactions } = useApp()
  const [analysis, setAnalysis] = useState<SeasonalAnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState<'patterns' | 'holidays' | 'trends' | 'comparison'>('patterns')

  useEffect(() => {
    generateAnalysis()
  }, [transactions])

  const generateAnalysis = () => {
    setLoading(true)
    try {
      const analysisResult = seasonalAnalysisService.analyzeSeasonalPatterns(transactions)
      setAnalysis(analysisResult)
    } catch (error) {
      console.error('Error generating seasonal analysis:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getSeasonIcon = (month: number) => {
    if (month >= 2 && month <= 4) return <Flower2 className="w-4 h-4 text-green-500" />
    if (month >= 5 && month <= 7) return <Sun className="w-4 h-4 text-yellow-500" />
    if (month >= 8 && month <= 10) return <Leaf className="w-4 h-4 text-orange-500" />
    return <Snowflake className="w-4 h-4 text-blue-500" />
  }

  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header title="Seasonal Analysis" />
        <div className="flex">
          <Sidebar currentPage="seasonal" />
          <main className="flex-1 p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Sparkles className="w-12 h-12 text-blue-600 animate-pulse mx-auto mb-4" />
                  <p className="text-gray-600">Analyzing seasonal spending patterns...</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header title="Seasonal Analysis" />
        <div className="flex">
          <Sidebar currentPage="seasonal" />
          <main className="flex-1 p-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">No Analysis Available</h2>
                <p className="text-gray-600">Add more transaction data to enable seasonal analysis.</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const chartData = analysis.patterns.map(pattern => ({
    month: pattern.monthName.substring(0, 3),
    income: pattern.averageIncome,
    expenses: pattern.averageExpenses,
    net: pattern.netCashFlow,
    confidence: pattern.confidence * 100
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header title="Seasonal Analysis" />
      
      <div className="flex">
        <Sidebar currentPage="seasonal" />
        
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Seasonal Spending Analysis</h1>
                  <p className="text-gray-600">Discover your spending patterns throughout the year</p>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-8">
              {[
                { key: 'patterns', label: 'Monthly Patterns', icon: Calendar },
                { key: 'holidays', label: 'Holiday Impact', icon: Gift },
                { key: 'trends', label: 'Yearly Trends', icon: TrendingUp },
                { key: 'comparison', label: 'Season Comparison', icon: Sparkles }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setSelectedTab(key as any)}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                    selectedTab === key
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {selectedTab === 'patterns' && (
              <div className="space-y-8">
                {/* Monthly Overview Chart */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Monthly Income vs Expenses</h2>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" fontSize={12} />
                        <YAxis fontSize={12} tickFormatter={(value) => `$${value.toLocaleString()}`} />
                        <Tooltip formatter={(value, name) => [formatCurrency(Number(value)), name]} />
                        <Bar dataKey="income" fill="#22C55E" name="Income" />
                        <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Monthly Patterns Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {analysis.patterns.slice(0, 12).map((pattern) => (
                    <div key={pattern.month} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          {getSeasonIcon(pattern.month)}
                          <h3 className="font-bold text-gray-900">{pattern.monthName}</h3>
                        </div>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {(pattern.confidence * 100).toFixed(0)}% confidence
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm text-gray-600">Net Cash Flow</div>
                          <div className={`text-lg font-bold ${
                            pattern.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(pattern.netCashFlow)}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm text-gray-600">Top Category</div>
                          <div className="text-sm font-medium text-gray-900">
                            {pattern.topCategories[0]?.category || 'No data'}
                            {pattern.topCategories[0] && (
                              <span className="text-gray-500 ml-1">
                                ({pattern.topCategories[0].percentage.toFixed(1)}%)
                              </span>
                            )}
                          </div>
                        </div>

                        {pattern.yearOverYearGrowth !== 0 && (
                          <div className="flex items-center space-x-2">
                            {pattern.yearOverYearGrowth > 0 ? (
                              <TrendingUp className="w-4 h-4 text-green-600" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-600" />
                            )}
                            <span className={`text-sm font-medium ${
                              pattern.yearOverYearGrowth > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {pattern.yearOverYearGrowth > 0 ? '+' : ''}
                              {(pattern.yearOverYearGrowth * 100).toFixed(1)}% YoY
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTab === 'holidays' && (
              <div className="space-y-6">
                {analysis.holidayImpacts.length > 0 ? (
                  analysis.holidayImpacts.map((holiday, index) => (
                    <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <Gift className="w-6 h-6 text-purple-600" />
                          <h3 className="text-xl font-bold text-gray-900">{holiday.holiday}</h3>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-purple-600">
                            {formatCurrency(holiday.averageSpending)}
                          </div>
                          <div className="text-sm text-gray-600">Average Impact</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(holiday.categoryBreakdown).slice(0, 4).map(([category, amount]) => (
                          <div key={category} className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-sm font-medium text-gray-600">{category}</div>
                            <div className="text-lg font-bold text-gray-900">{formatCurrency(amount)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                    <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No Holiday Data</h3>
                    <p className="text-gray-600">Add more transaction data to see holiday spending patterns.</p>
                  </div>
                )}
              </div>
            )}

            {selectedTab === 'trends' && (
              <div className="space-y-6">
                {/* Yearly Trends Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-3 mb-4">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                      <h3 className="font-bold text-gray-900">Income Trend</h3>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-2">
                      {analysis.yearlyTrends.income.trend.charAt(0).toUpperCase() + analysis.yearlyTrends.income.trend.slice(1)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {analysis.yearlyTrends.income.rate !== 0 && (
                        <>
                          {analysis.yearlyTrends.income.rate > 0 ? '+' : ''}
                          {(analysis.yearlyTrends.income.rate * 100).toFixed(1)}% annually
                        </>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-3 mb-4">
                      <TrendingDown className="w-6 h-6 text-red-600" />
                      <h3 className="font-bold text-gray-900">Expense Trend</h3>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-2">
                      {analysis.yearlyTrends.expenses.trend.charAt(0).toUpperCase() + analysis.yearlyTrends.expenses.trend.slice(1)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {analysis.yearlyTrends.expenses.rate !== 0 && (
                        <>
                          {analysis.yearlyTrends.expenses.rate > 0 ? '+' : ''}
                          {(analysis.yearlyTrends.expenses.rate * 100).toFixed(1)}% annually
                        </>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-3 mb-4">
                      <AlertCircle className="w-6 h-6 text-orange-600" />
                      <h3 className="font-bold text-gray-900">Volatility</h3>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-2">
                      {(analysis.yearlyTrends.volatility * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">
                      {analysis.yearlyTrends.volatility < 0.2 ? 'Low' : 
                       analysis.yearlyTrends.volatility < 0.4 ? 'Moderate' : 'High'} variability
                    </div>
                  </div>
                </div>

                {/* Net Cash Flow Trend */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Monthly Net Cash Flow Trend</h2>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" fontSize={12} />
                        <YAxis fontSize={12} tickFormatter={(value) => `$${value.toLocaleString()}`} />
                        <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Net Cash Flow']} />
                        <Line 
                          type="monotone" 
                          dataKey="net" 
                          stroke="#3B82F6" 
                          strokeWidth={3}
                          dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'comparison' && (
              <div className="space-y-6">
                {/* Season comparison would go here */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Seasonal Comparison</h2>
                  <div className="text-center text-gray-600">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p>Seasonal comparison feature coming soon!</p>
                  </div>
                </div>
              </div>
            )}

            {/* Insights and Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Key Insights */}
              {analysis.insights.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-3 mb-4">
                    <Sparkles className="w-6 h-6 text-blue-600" />
                    <h3 className="text-lg font-bold text-gray-900">Key Insights</h3>
                  </div>
                  <div className="space-y-3">
                    {analysis.insights.slice(0, 5).map((insight, index) => (
                      <div key={index} className={`p-3 rounded-lg border ${getSeverityColor(insight.severity)}`}>
                        <div className="font-medium mb-1">{MONTHS[insight.month]} - {insight.description}</div>
                        {insight.impact !== 0 && (
                          <div className="text-sm">
                            Impact: {formatCurrency(Math.abs(insight.impact))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {analysis.recommendations.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-3 mb-4">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                    <h3 className="text-lg font-bold text-gray-900">Recommendations</h3>
                  </div>
                  <ul className="space-y-3">
                    {analysis.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Next Month Forecast */}
            {analysis.nextMonthForecast.confidence > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Next Month Forecast ({MONTHS[analysis.nextMonthForecast.month]})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(analysis.nextMonthForecast.predictedIncome)}
                    </div>
                    <div className="text-sm text-gray-600">Predicted Income</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {formatCurrency(analysis.nextMonthForecast.predictedExpenses)}
                    </div>
                    <div className="text-sm text-gray-600">Predicted Expenses</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${
                      analysis.nextMonthForecast.predictedNetFlow >= 0 ? 'text-blue-600' : 'text-orange-600'
                    }`}>
                      {formatCurrency(analysis.nextMonthForecast.predictedNetFlow)}
                    </div>
                    <div className="text-sm text-gray-600">Predicted Net Flow</div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <span className="text-sm text-gray-600">
                    Confidence: {(analysis.nextMonthForecast.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}