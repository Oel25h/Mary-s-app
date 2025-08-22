'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, AlertTriangle, Calendar, Target, Clock, Sparkles } from 'lucide-react'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import { useApp } from '@/contexts/AppContext'
import { cashFlowForecastingService } from '@/services/cashFlowForecastingService'
import { balancePredictionService } from '@/services/balancePredictionService'
import { CashFlowForecast, BalancePrediction, ScenarioAnalysis } from '@/types'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

export default function ForecastingPage() {
  const { transactions, budgets, getTotalIncome, getTotalExpenses, getNetIncome, loading: appLoading } = useApp()
  const [forecast, setForecast] = useState<CashFlowForecast | null>(null)
  const [balancePredictions, setBalancePredictions] = useState<BalancePrediction[]>([])
  const [scenarioAnalysis, setScenarioAnalysis] = useState<ScenarioAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentBalance, setCurrentBalance] = useState(10000) // Default balance - could come from settings
  const [selectedPeriod, setSelectedPeriod] = useState<'30' | '90'>('30')
  const [activeTab, setActiveTab] = useState<'forecast' | 'scenarios' | 'predictions'>('forecast')

  useEffect(() => {
    generateForecast()
  }, [transactions, currentBalance, selectedPeriod])

  const generateForecast = () => {
    if (appLoading || transactions.length === 0) {
      setLoading(false)
      return
    }
    
    setLoading(true)
    try {
      const forecastDays = selectedPeriod === '30' ? 30 : 90
      
      // Generate cash flow forecast
      const forecastData = cashFlowForecastingService.generateForecast(
        transactions,
        currentBalance,
        forecastDays
      )
      setForecast(forecastData)
      
      // Generate balance predictions
      const predictions = balancePredictionService.generateBalancePredictions(
        transactions,
        currentBalance,
        forecastDays
      )
      setBalancePredictions(predictions)
      
      // Generate scenario analysis
      const scenarios = balancePredictionService.performScenarioAnalysis(
        transactions,
        currentBalance
      )
      setScenarioAnalysis(scenarios)
      
    } catch (error) {
      console.error('Error generating forecast:', error)
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Prepare chart data
  const chartData = forecast?.periods.slice(0, parseInt(selectedPeriod)).map(period => ({
    date: formatDate(period.date),
    balance: period.predictedBalance,
    income: period.predictedIncome,
    expenses: period.predictedExpenses,
    confidence: period.confidence * 100
  })) || []

  if (loading || appLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header title="Cash Flow Forecasting" />
        <div className="flex">
          <Sidebar currentPage="forecasting" />
          <main className="flex-1 p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Sparkles className="w-12 h-12 text-blue-600 animate-pulse mx-auto mb-4" />
                  <p className="text-gray-600">Analyzing your transaction patterns...</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header title="Cash Flow Forecasting" />
      
      <div className="flex">
        <Sidebar currentPage="forecasting" />
        
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Header Section */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Cash Flow Forecasting</h1>
                  <p className="text-gray-600">AI-powered predictions for your financial future</p>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex space-x-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Balance
                  </label>
                  <input
                    type="number"
                    value={currentBalance}
                    onChange={(e) => setCurrentBalance(Number(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter current balance"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Forecast Period
                  </label>
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value as '30' | '90')}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="30">30 Days</option>
                    <option value="90">90 Days</option>
                  </select>
                </div>
              </div>
              
              <button
                onClick={generateForecast}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
              >
                Refresh Forecast
              </button>
            </div>

            {forecast && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Target className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-500">30 DAYS</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {formatCurrency(forecast.summary.projectedBalanceIn30Days)}
                    </div>
                    <div className="text-sm text-gray-600">Projected Balance</div>
                    <div className={`text-xs mt-2 ${
                      forecast.summary.projectedBalanceIn30Days > currentBalance 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {forecast.summary.projectedBalanceIn30Days > currentBalance ? '+' : ''}
                      {formatCurrency(forecast.summary.projectedBalanceIn30Days - currentBalance)}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-500">MONTHLY</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {formatCurrency(forecast.summary.averageMonthlyIncome)}
                    </div>
                    <div className="text-sm text-gray-600">Average Income</div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <TrendingDown className="w-5 h-5 text-red-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-500">MONTHLY</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {formatCurrency(forecast.summary.averageMonthlyExpenses)}
                    </div>
                    <div className="text-sm text-gray-600">Average Expenses</div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-orange-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-500">BURN RATE</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {forecast.summary.burnRate === Infinity 
                        ? '∞' 
                        : `${forecast.summary.burnRate.toFixed(1)}m`
                      }
                    </div>
                    <div className="text-sm text-gray-600">
                      {forecast.summary.burnRate === Infinity 
                        ? 'Sustainable' 
                        : 'Months until zero'
                      }
                    </div>
                  </div>
                </div>

                {/* Chart */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Balance Projection</h2>
                    <div className="text-sm text-gray-500">
                      Confidence: {(forecast.summary.confidenceScore * 100).toFixed(0)}%
                    </div>
                  </div>
                  
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          fontSize={12}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis 
                          fontSize={12}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(value) => `$${value.toLocaleString()}`}
                        />
                        <Tooltip 
                          formatter={(value, name) => [
                            formatCurrency(Number(value)), 
                            name === 'balance' ? 'Balance' : name
                          ]}
                          labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Area
                          type="monotone"
                          dataKey="balance"
                          stroke="#3B82F6"
                          fillOpacity={1}
                          fill="url(#balanceGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Insights and Warnings */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Insights */}
                  {forecast.insights.length > 0 && (
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">AI Insights</h3>
                      </div>
                      <ul className="space-y-3">
                        {forecast.insights.map((insight, index) => (
                          <li key={index} className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-gray-700 text-sm">{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Warnings */}
                  {forecast.warnings.length > 0 && (
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <AlertTriangle className="w-4 h-4 text-yellow-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Warnings</h3>
                      </div>
                      <ul className="space-y-3">
                        {forecast.warnings.map((warning, index) => (
                          <li key={index} className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-gray-700 text-sm">{warning}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Data Quality Notice */}
                {forecast.summary.confidenceScore < 0.5 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      <div>
                        <h4 className="font-medium text-yellow-900">Low Forecast Confidence</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          Add more transaction history to improve forecast accuracy. 
                          Consider importing older bank statements or manually adding past transactions.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}