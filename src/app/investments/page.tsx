'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Target, Shield, DollarSign, AlertTriangle, BookOpen, CheckCircle, Star } from 'lucide-react'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import { useApp } from '@/contexts/AppContext'
import { investmentRecommendationsService } from '@/services/investmentRecommendationsService'
import { InvestmentRecommendation, MarketInsight } from '@/types'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function InvestmentsPage() {
  const { transactions } = useApp()
  const [recommendation, setRecommendation] = useState<InvestmentRecommendation | null>(null)
  const [marketInsights, setMarketInsights] = useState<MarketInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState<'portfolio' | 'investments' | 'recommendations' | 'insights'>('portfolio')
  
  // User inputs for personalization
  const [userInputs, setUserInputs] = useState({
    age: 35,
    riskTolerance: 'moderate' as 'conservative' | 'moderate' | 'aggressive',
    timeHorizon: 20,
    currentInvestments: 0,
    financialKnowledge: 'beginner' as 'beginner' | 'intermediate' | 'advanced'
  })

  useEffect(() => {
    generateRecommendations()
  }, [transactions, userInputs])

  const generateRecommendations = () => {
    setLoading(true)
    try {
      // Generate investment recommendations
      const investmentData = investmentRecommendationsService.generateRecommendations(
        transactions,
        userInputs
      )
      setRecommendation(investmentData)
      
      // Generate market insights
      const insights = investmentRecommendationsService.generateMarketInsights()
      setMarketInsights(insights)
      
    } catch (error) {
      console.error('Error generating investment recommendations:', error)
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

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }

  // Prepare chart data for portfolio allocation
  const portfolioData = recommendation ? [
    { name: 'Stocks', value: recommendation.recommendedPortfolio.stocks, color: '#3B82F6' },
    { name: 'Bonds', value: recommendation.recommendedPortfolio.bonds, color: '#10B981' },
    { name: 'REITs', value: recommendation.recommendedPortfolio.reits, color: '#F59E0B' },
    { name: 'Cash', value: recommendation.recommendedPortfolio.cash, color: '#EF4444' },
    { name: 'International', value: recommendation.recommendedPortfolio.international, color: '#8B5CF6' }
  ].filter(item => item.value > 0) : []

  // Risk level colors
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'high': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'highly_recommended': return 'text-green-600 bg-green-100'
      case 'recommended': return 'text-blue-600 bg-blue-100'
      case 'consider': return 'text-yellow-600 bg-yellow-100'
      case 'avoid': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <Header title="Investment Recommendations" />
        <div className="flex">
          <Sidebar currentPage="investments" />
          <main className="flex-1 p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 text-blue-600 animate-pulse mx-auto mb-4" />
                  <p className="text-gray-600">Analyzing your investment profile...</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Header title="Investment Recommendations" />
      
      <div className="flex">
        <Sidebar currentPage="investments" />
        
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Header Section */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Investment Recommendations</h1>
                  <p className="text-gray-600">Personalized investment advice based on your financial profile</p>
                </div>
              </div>
            </div>

            {/* User Inputs */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Your Investment Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                  <input
                    type="number"
                    value={userInputs.age}
                    onChange={(e) => setUserInputs({...userInputs, age: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Risk Tolerance</label>
                  <select
                    value={userInputs.riskTolerance}
                    onChange={(e) => setUserInputs({...userInputs, riskTolerance: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="conservative">Conservative</option>
                    <option value="moderate">Moderate</option>
                    <option value="aggressive">Aggressive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time Horizon (years)</label>
                  <input
                    type="number"
                    value={userInputs.timeHorizon}
                    onChange={(e) => setUserInputs({...userInputs, timeHorizon: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Investments</label>
                  <input
                    type="number"
                    value={userInputs.currentInvestments}
                    onChange={(e) => setUserInputs({...userInputs, currentInvestments: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="$0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Knowledge Level</label>
                  <select
                    value={userInputs.financialKnowledge}
                    onChange={(e) => setUserInputs({...userInputs, financialKnowledge: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
            </div>

            {recommendation && (
              <>
                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-500">RISK SCORE</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {recommendation.riskAssessment.score.toFixed(1)}/10
                    </div>
                    <div className="text-sm text-gray-600 capitalize">{recommendation.riskAssessment.category}</div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-500">EXPECTED RETURN</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {formatPercentage(recommendation.recommendedPortfolio.expectedReturn)}
                    </div>
                    <div className="text-sm text-gray-600">Annual</div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-500">VOLATILITY</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {formatPercentage(recommendation.recommendedPortfolio.volatility)}
                    </div>
                    <div className="text-sm text-gray-600">Annual</div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-purple-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-500">MONTHLY CAPACITY</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {formatCurrency(recommendation.userProfile.monthlyInvestmentCapacity)}
                    </div>
                    <div className="text-sm text-gray-600">Available</div>
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
                  <div className="border-b border-gray-200">
                    <nav className="-mb-px flex">
                      {[
                        { id: 'portfolio', label: 'Portfolio', icon: Target },
                        { id: 'investments', label: 'Investment Options', icon: TrendingUp },
                        { id: 'recommendations', label: 'Recommendations', icon: CheckCircle },
                        { id: 'insights', label: 'Market Insights', icon: BookOpen }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setSelectedTab(tab.id as any)}
                          className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                            selectedTab === tab.id
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <tab.icon className="w-4 h-4" />
                          <span>{tab.label}</span>
                        </button>
                      ))}
                    </nav>
                  </div>

                  <div className="p-6">
                    {selectedTab === 'portfolio' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {/* Portfolio Pie Chart */}
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Recommended Allocation</h3>
                            <div className="h-80">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={portfolioData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    dataKey="value"
                                    label={({name, value}) => `${name}: ${value}%`}
                                  >
                                    {portfolioData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                  </Pie>
                                  <Tooltip />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          {/* Portfolio Details */}
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Portfolio Details</h3>
                            <div className="space-y-4">
                              <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                                <p className="text-gray-600">{recommendation.recommendedPortfolio.description}</p>
                              </div>
                              
                              <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 mb-2">Key Reasoning</h4>
                                <ul className="space-y-1">
                                  {recommendation.recommendedPortfolio.reasoning.map((reason, index) => (
                                    <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                      <span>{reason}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-lg p-4 text-center">
                                  <div className="text-xl font-bold text-green-600">
                                    {formatPercentage(recommendation.recommendedPortfolio.expectedReturn)}
                                  </div>
                                  <div className="text-sm text-gray-600">Expected Return</div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 text-center">
                                  <div className="text-xl font-bold text-yellow-600">
                                    {formatPercentage(recommendation.recommendedPortfolio.volatility)}
                                  </div>
                                  <div className="text-sm text-gray-600">Expected Volatility</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedTab === 'investments' && (
                      <div className="space-y-6">
                        <h3 className="text-lg font-bold text-gray-900">Recommended Investment Options</h3>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {recommendation.investmentOptions.map((option, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-6">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-medium text-gray-900">{option.name}</h4>
                                <div className="flex items-center space-x-2">
                                  <span className={`px-2 py-1 text-xs rounded-full ${getRiskColor(option.riskLevel)}`}>
                                    {option.riskLevel} risk
                                  </span>
                                  <span className={`px-2 py-1 text-xs rounded-full ${getRecommendationColor(option.recommendation)}`}>
                                    {option.recommendation.replace('_', ' ')}
                                  </span>
                                </div>
                              </div>
                              
                              <p className="text-gray-600 mb-4">{option.description}</p>
                              
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="text-center">
                                  <div className="text-lg font-bold text-gray-900">{option.ticker}</div>
                                  <div className="text-sm text-gray-500">Ticker</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-bold text-blue-600">{option.allocationPercentage}%</div>
                                  <div className="text-sm text-gray-500">Allocation</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-bold text-green-600">{formatPercentage(option.expectedReturn)}</div>
                                  <div className="text-sm text-gray-500">Expected Return</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-bold text-purple-600">{formatPercentage(option.expenseRatio)}</div>
                                  <div className="text-sm text-gray-500">Expense Ratio</div>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h5 className="font-medium text-gray-900 mb-2">Pros:</h5>
                                  <ul className="space-y-1">
                                    {option.pros.map((pro, proIndex) => (
                                      <li key={proIndex} className="text-sm text-green-600">+ {pro}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <h5 className="font-medium text-gray-900 mb-2">Cons:</h5>
                                  <ul className="space-y-1">
                                    {option.cons.map((con, conIndex) => (
                                      <li key={conIndex} className="text-sm text-red-600">- {con}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedTab === 'recommendations' && (
                      <div className="space-y-6">
                        <h3 className="text-lg font-bold text-gray-900">Personalized Recommendations</h3>
                        
                        {recommendation.recommendations.map((rec, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-lg font-medium text-gray-900">{rec.title}</h4>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                                  rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                  {rec.priority} priority
                                </span>
                                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                                  {rec.timeframe.replace('_', ' ')}
                                </span>
                              </div>
                            </div>
                            
                            <p className="text-gray-600 mb-4">{rec.description}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h5 className="font-medium text-gray-900 mb-2">Action Steps:</h5>
                                <ul className="space-y-1">
                                  {rec.actionSteps.map((step, stepIndex) => (
                                    <li key={stepIndex} className="flex items-start space-x-2 text-sm text-gray-600">
                                      <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                      <span>{step}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h5 className="font-medium text-gray-900 mb-2">Expected Benefit:</h5>
                                <p className="text-sm text-gray-600">{rec.expectedBenefit}</p>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Next Steps */}
                        <div className="bg-blue-50 rounded-lg p-6">
                          <h4 className="text-lg font-medium text-gray-900 mb-4">Your Next Steps</h4>
                          <ul className="space-y-2">
                            {recommendation.nextSteps.map((step, index) => (
                              <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">
                                  {index + 1}
                                </span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {selectedTab === 'insights' && (
                      <div className="space-y-6">
                        <h3 className="text-lg font-bold text-gray-900">Market Insights</h3>
                        
                        {marketInsights.map((insight, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                  insight.type === 'trend' ? 'bg-blue-100' :
                                  insight.type === 'opportunity' ? 'bg-green-100' :
                                  insight.type === 'warning' ? 'bg-red-100' : 'bg-gray-100'
                                }`}>
                                  {insight.type === 'trend' && <TrendingUp className="w-4 h-4 text-blue-600" />}
                                  {insight.type === 'opportunity' && <Star className="w-4 h-4 text-green-600" />}
                                  {insight.type === 'warning' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                                  {insight.type === 'general' && <BookOpen className="w-4 h-4 text-gray-600" />}
                                </div>
                                <h4 className="text-lg font-medium text-gray-900">{insight.title}</h4>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  insight.impact === 'high' ? 'bg-red-100 text-red-700' :
                                  insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                  {insight.impact} impact
                                </span>
                                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                                  {insight.timeframe.replace('_', ' ')}
                                </span>
                              </div>
                            </div>
                            
                            <p className="text-gray-600 mb-4">{insight.description}</p>
                            
                            {insight.relevantAssets.length > 0 && (
                              <div>
                                <h5 className="font-medium text-gray-900 mb-2">Relevant Assets:</h5>
                                <div className="flex flex-wrap gap-2">
                                  {insight.relevantAssets.map((asset, assetIndex) => (
                                    <span key={assetIndex} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                      {asset}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}