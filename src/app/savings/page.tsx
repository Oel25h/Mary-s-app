'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, DollarSign, Target, Zap, Calendar, PiggyBank, ArrowRight, CheckCircle } from 'lucide-react'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import { useApp } from '@/contexts/AppContext'
import { savingsOptimizationService } from '@/services/savingsOptimizationService'
import { SavingsOptimization, SavingsChallenge } from '@/types'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

export default function SavingsOptimizationPage() {
  const { transactions, getTotalIncome, getTotalExpenses } = useApp()
  const [optimization, setOptimization] = useState<SavingsOptimization | null>(null)
  const [challenges, setChallenges] = useState<SavingsChallenge[]>([])
  const [loading, setLoading] = useState(true)
  const [currentSavings, setCurrentSavings] = useState(5000) // Default savings amount
  const [selectedTab, setSelectedTab] = useState<'overview' | 'opportunities' | 'automation' | 'challenges'>('overview')

  useEffect(() => {
    generateOptimization()
  }, [transactions, currentSavings])

  const generateOptimization = () => {
    setLoading(true)
    try {
      // Generate optimization analysis
      const optimizationData = savingsOptimizationService.optimizeSavings(
        transactions,
        currentSavings
      )
      setOptimization(optimizationData)
      
      // Generate savings challenges
      const monthlyIncome = getTotalIncome() / Math.max(transactions.length > 0 ? 12 : 1, 1) // Rough monthly income
      const challengeData = savingsOptimizationService.generateSavingsChallenges(
        monthlyIncome,
        optimizationData.currentSavingsRate
      )
      setChallenges(challengeData)
      
    } catch (error) {
      console.error('Error generating savings optimization:', error)
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

  // Prepare chart data for compound interest projection
  const chartData = optimization?.compoundInterestProjection.projections.map(projection => ({
    year: projection.year,
    balance: projection.balance,
    contributions: projection.totalContributions,
    interest: projection.interestEarned
  })) || []

  // Colors for charts
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
        <Header title="Savings Optimization" />
        <div className="flex">
          <Sidebar currentPage="savings" />
          <main className="flex-1 p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <PiggyBank className="w-12 h-12 text-green-600 animate-pulse mx-auto mb-4" />
                  <p className="text-gray-600">Analyzing your savings potential...</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <Header title="Savings Optimization" />
      
      <div className="flex">
        <Sidebar currentPage="savings" />
        
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Header Section */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <PiggyBank className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Savings Optimization</h1>
                  <p className="text-gray-600">Maximize your savings potential with AI-powered strategies</p>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Savings Amount
                </label>
                <input
                  type="number"
                  value={currentSavings}
                  onChange={(e) => setCurrentSavings(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter current savings"
                />
              </div>
              
              <button
                onClick={generateOptimization}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-colors"
              >
                Refresh Analysis
              </button>
            </div>

            {optimization && (
              <>
                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-500">CURRENT</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {formatPercentage(optimization.currentSavingsRate)}
                    </div>
                    <div className="text-sm text-gray-600">Savings Rate</div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Target className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-500">TARGET</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {formatPercentage(optimization.recommendedSavingsRate)}
                    </div>
                    <div className="text-sm text-gray-600">Recommended Rate</div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-yellow-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-500">POTENTIAL</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {formatCurrency(optimization.optimizationOpportunities.reduce((sum, opp) => sum + opp.potentialSavings, 0))}
                    </div>
                    <div className="text-sm text-gray-600">Monthly Savings</div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Zap className="w-5 h-5 text-purple-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-500">AUTOMATION</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {optimization.automationStrategies.length}
                    </div>
                    <div className="text-sm text-gray-600">Strategies Available</div>
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
                  <div className="border-b border-gray-200">
                    <nav className="-mb-px flex">
                      {[
                        { id: 'overview', label: 'Overview', icon: TrendingUp },
                        { id: 'opportunities', label: 'Opportunities', icon: Target },
                        { id: 'automation', label: 'Automation', icon: Zap },
                        { id: 'challenges', label: 'Challenges', icon: Calendar }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setSelectedTab(tab.id as any)}
                          className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                            selectedTab === tab.id
                              ? 'border-green-500 text-green-600'
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
                    {selectedTab === 'overview' && (
                      <div className="space-y-6">
                        {/* Compound Interest Projection Chart */}
                        <div className="mb-8">
                          <h3 className="text-lg font-bold text-gray-900 mb-4">Compound Interest Projection</h3>
                          <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={chartData.slice(0, 20)}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                  dataKey="year" 
                                  fontSize={12}
                                  axisLine={false}
                                  tickLine={false}
                                />
                                <YAxis 
                                  fontSize={12}
                                  axisLine={false}
                                  tickLine={false}
                                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                                />
                                <Tooltip 
                                  formatter={(value, name) => [
                                    formatCurrency(Number(value)), 
                                    name === 'balance' ? 'Total Balance' : 
                                    name === 'contributions' ? 'Total Contributions' : 'Interest Earned'
                                  ]}
                                  labelFormatter={(label) => `Year ${label}`}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="balance"
                                  stroke="#3B82F6"
                                  strokeWidth={3}
                                  dot={false}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="contributions"
                                  stroke="#10B981"
                                  strokeWidth={2}
                                  dot={false}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="interest"
                                  stroke="#F59E0B"
                                  strokeWidth={2}
                                  dot={false}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Monthly Recommendations */}
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-4">Monthly Action Plan</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {optimization.monthlyRecommendations.slice(0, 6).map((rec, index) => (
                              <div key={index} className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="font-medium text-gray-900">{rec.month}</h4>
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    rec.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                    rec.difficulty === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                  }`}>
                                    {rec.difficulty}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{rec.focusArea}</p>
                                <div className="text-sm font-medium text-green-600">
                                  Save {formatCurrency(rec.expectedSavings)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedTab === 'opportunities' && (
                      <div className="space-y-6">
                        <h3 className="text-lg font-bold text-gray-900">Optimization Opportunities</h3>
                        
                        {optimization.optimizationOpportunities.map((opportunity, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-lg font-medium text-gray-900">{opportunity.category}</h4>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  opportunity.impact === 'high' ? 'bg-red-100 text-red-700' :
                                  opportunity.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                  {opportunity.impact} impact
                                </span>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  opportunity.effort === 'low' ? 'bg-green-100 text-green-700' :
                                  opportunity.effort === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {opportunity.effort} effort
                                </span>
                              </div>
                            </div>
                            
                            <p className="text-gray-600 mb-4">{opportunity.description}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900">{formatCurrency(opportunity.currentSpending)}</div>
                                <div className="text-sm text-gray-500">Current Spending</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">{formatCurrency(opportunity.recommendedSpending)}</div>
                                <div className="text-sm text-gray-500">Recommended</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">{formatCurrency(opportunity.potentialSavings)}</div>
                                <div className="text-sm text-gray-500">Monthly Savings</div>
                              </div>
                            </div>

                            <div className="mb-4">
                              <h5 className="font-medium text-gray-900 mb-2">Action Steps:</h5>
                              <ul className="space-y-1">
                                {opportunity.actionSteps.map((step, stepIndex) => (
                                  <li key={stepIndex} className="flex items-start space-x-2 text-sm text-gray-600">
                                    <ArrowRight className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <span>{step}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="text-sm text-gray-500">
                              <strong>Timeline:</strong> {opportunity.timeline}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedTab === 'automation' && (
                      <div className="space-y-6">
                        <h3 className="text-lg font-bold text-gray-900">Automation Strategies</h3>
                        
                        {optimization.automationStrategies.map((strategy, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-lg font-medium text-gray-900">{strategy.strategy}</h4>
                              <div className="text-lg font-bold text-green-600">
                                {formatCurrency(strategy.potentialSavings)}/month
                              </div>
                            </div>
                            
                            <p className="text-gray-600 mb-4">{strategy.description}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                              <div>
                                <h5 className="font-medium text-gray-900 mb-2">Implementation Steps:</h5>
                                <ul className="space-y-1">
                                  {strategy.implementation.map((step, stepIndex) => (
                                    <li key={stepIndex} className="flex items-start space-x-2 text-sm text-gray-600">
                                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                      <span>{step}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <div className="mb-4">
                                  <h5 className="font-medium text-gray-900 mb-2">Pros:</h5>
                                  <ul className="space-y-1">
                                    {strategy.pros.map((pro, proIndex) => (
                                      <li key={proIndex} className="flex items-start space-x-2 text-sm text-green-600">
                                        <span>+</span>
                                        <span>{pro}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                
                                <div>
                                  <h5 className="font-medium text-gray-900 mb-2">Cons:</h5>
                                  <ul className="space-y-1">
                                    {strategy.cons.map((con, conIndex) => (
                                      <li key={conIndex} className="flex items-start space-x-2 text-sm text-red-600">
                                        <span>-</span>
                                        <span>{con}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-between text-sm text-gray-500">
                              <span><strong>Setup Effort:</strong> {strategy.setupEffort}</span>
                              <span><strong>Maintenance:</strong> {strategy.ongoingMaintenance}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedTab === 'challenges' && (
                      <div className="space-y-6">
                        <h3 className="text-lg font-bold text-gray-900">Savings Challenges</h3>
                        
                        {challenges.map((challenge, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-lg font-medium text-gray-900">{challenge.challengeName}</h4>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  challenge.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                                  challenge.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {challenge.difficulty}
                                </span>
                                <div className="text-lg font-bold text-green-600">
                                  {formatCurrency(challenge.targetSavings)}
                                </div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h5 className="font-medium text-gray-900 mb-2">Rules:</h5>
                                <ul className="space-y-1 mb-4">
                                  {challenge.rules.map((rule, ruleIndex) => (
                                    <li key={ruleIndex} className="flex items-start space-x-2 text-sm text-gray-600">
                                      <span className="text-blue-500">•</span>
                                      <span>{rule}</span>
                                    </li>
                                  ))}
                                </ul>

                                <h5 className="font-medium text-gray-900 mb-2">Tips:</h5>
                                <ul className="space-y-1">
                                  {challenge.tips.map((tip, tipIndex) => (
                                    <li key={tipIndex} className="flex items-start space-x-2 text-sm text-gray-600">
                                      <span className="text-green-500">💡</span>
                                      <span>{tip}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <h5 className="font-medium text-gray-900 mb-2">Milestones:</h5>
                                <div className="space-y-2">
                                  {challenge.milestones.map((milestone, milestoneIndex) => (
                                    <div key={milestoneIndex} className="flex items-center justify-between p-3 bg-white rounded-lg">
                                      <div>
                                        <div className="font-medium text-gray-900">Week {milestone.week}</div>
                                        <div className="text-sm text-gray-600">{milestone.reward}</div>
                                      </div>
                                      <div className="text-green-600 font-medium">
                                        {formatCurrency(milestone.target)}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="text-sm text-gray-500">
                                <strong>Duration:</strong> {challenge.duration} weeks | 
                                <strong> Target:</strong> {formatCurrency(challenge.targetSavings)}
                              </div>
                            </div>
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