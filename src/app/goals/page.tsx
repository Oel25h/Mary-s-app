'use client'

import { useState, useEffect } from 'react'
import { Target, Plus, TrendingUp, AlertTriangle, CheckCircle, Clock, Lightbulb, Trophy, Sparkles } from 'lucide-react'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import { useApp } from '@/contexts/AppContext'
import { goalAchievementAIService } from '@/services/goalAchievementAIService'
import { FinancialGoal, GoalPortfolio, GoalProgress } from '@/types'

export default function GoalsPage() {
  const { transactions, goals: contextGoals, getTotalIncome, addGoal, updateGoal, deleteGoal, loading: appLoading } = useApp()
  const [localGoals, setLocalGoals] = useState<FinancialGoal[]>(contextGoals)
  const [portfolio, setPortfolio] = useState<GoalPortfolio | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState<'overview' | 'goals' | 'insights' | 'recommendations'>('overview')
  const [showAddGoal, setShowAddGoal] = useState(false)

  // Update local goals state when AppContext goals change
  useEffect(() => {
    setLocalGoals(contextGoals)
  }, [contextGoals])

  useEffect(() => {
    analyzeGoals()
  }, [transactions, localGoals])

  const analyzeGoals = () => {
    if (appLoading) return // Don't analyze while app is still loading
    
    setLoading(true)
    try {
      const monthlyIncome = getTotalIncome() // This should be calculated monthly
      const portfolioAnalysis = goalAchievementAIService.analyzeGoalPortfolio(
        localGoals,
        transactions,
        monthlyIncome / 12 // Convert to monthly if needed
      )
      setPortfolio(portfolioAnalysis)
    } catch (error) {
      console.error('Error analyzing goals:', error)
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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getStatusColor = (status: GoalProgress['onTrackStatus']) => {
    switch (status) {
      case 'ahead': return 'text-green-600 bg-green-50 border-green-200'
      case 'on_track': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'behind': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'at_risk': return 'text-red-600 bg-red-50 border-red-200'
    }
  }

  const getPriorityIcon = (priority: FinancialGoal['priority']) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-600" />
      case 'high': return <TrendingUp className="w-4 h-4 text-orange-600" />
      case 'medium': return <Target className="w-4 h-4 text-blue-600" />
      case 'low': return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getHealthColor = (health: GoalPortfolio['portfolioHealth']) => {
    switch (health) {
      case 'excellent': return 'text-green-600'
      case 'good': return 'text-blue-600'
      case 'needs_attention': return 'text-yellow-600'
      case 'critical': return 'text-red-600'
    }
  }

  if (loading || appLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header title="Goals" />
        <div className="flex">
          <Sidebar currentPage="goals" />
          <main className="flex-1 p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Sparkles className="w-12 h-12 text-blue-600 animate-pulse mx-auto mb-4" />
                  <p className="text-gray-600">Analyzing your financial goals...</p>
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
      <Header title="Financial Goals" />
      
      <div className="flex">
        <Sidebar currentPage="goals" />
        
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Financial Goals</h1>
                  <p className="text-gray-600">AI-powered goal tracking and optimization</p>
                </div>
              </div>
              
              <button
                onClick={() => setShowAddGoal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Goal</span>
              </button>
            </div>

            {/* Portfolio Overview */}
            {portfolio && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-xs font-medium text-gray-500">PROGRESS</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {portfolio.overallProgress.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Overall Goals</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${Math.min(portfolio.overallProgress, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-xs font-medium text-gray-500">SAVED</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {formatCurrency(portfolio.totalCurrentAmount)}
                  </div>
                  <div className="text-sm text-gray-600">
                    of {formatCurrency(portfolio.totalTargetAmount)}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="text-xs font-medium text-gray-500">MONTHLY</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {formatCurrency(portfolio.monthlyCommitment)}
                  </div>
                  <div className="text-sm text-gray-600">Total Commitment</div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-orange-600" />
                    </div>
                    <span className="text-xs font-medium text-gray-500">HEALTH</span>
                  </div>
                  <div className={`text-2xl font-bold mb-1 ${getHealthColor(portfolio.portfolioHealth)}`}>
                    {portfolio.portfolioHealth.replace('_', ' ').toUpperCase()}
                  </div>
                  <div className="text-sm text-gray-600">Portfolio Status</div>
                </div>
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {[
                { key: 'overview', label: 'Overview', icon: Target },
                { key: 'goals', label: 'My Goals', icon: CheckCircle },
                { key: 'insights', label: 'AI Insights', icon: Lightbulb },
                { key: 'recommendations', label: 'Recommendations', icon: Sparkles }
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
            {selectedTab === 'overview' && portfolio && (
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Portfolio Summary</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{portfolio.goals.length}</div>
                      <div className="text-sm text-gray-600">Active Goals</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {portfolio.goals.filter(g => (g.currentAmount / g.targetAmount) >= 0.5).length}
                      </div>
                      <div className="text-sm text-gray-600">50%+ Complete</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">
                        {portfolio.conflicts.length}
                      </div>
                      <div className="text-sm text-gray-600">Conflicts to Resolve</div>
                    </div>
                  </div>
                </div>

                {/* Conflicts */}
                {portfolio.conflicts.length > 0 && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-3 mb-4">
                      <AlertTriangle className="w-6 h-6 text-yellow-600" />
                      <h3 className="text-lg font-bold text-gray-900">Goal Conflicts</h3>
                    </div>
                    {portfolio.conflicts.map((conflict, index) => (
                      <div key={index} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                        <div className="font-medium text-yellow-900 mb-2">{conflict.issue}</div>
                        <div className="text-sm text-yellow-700 mb-3">{conflict.prioritySuggestion}</div>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          {conflict.recommendations.map((rec, i) => (
                            <li key={i} className="flex items-start space-x-2">
                              <span className="text-yellow-500">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedTab === 'goals' && (
              <div className="space-y-6">
                {localGoals.map((goal) => {
                  const progressPercentage = (goal.currentAmount / goal.targetAmount) * 100
                  const remainingAmount = goal.targetAmount - goal.currentAmount
                  
                  return (
                    <div key={goal.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <Target className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="text-lg font-bold text-gray-900">{goal.name}</h3>
                              {getPriorityIcon(goal.priority)}
                            </div>
                            <p className="text-gray-600 text-sm">{goal.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span>Target: {formatDate(goal.targetDate)}</span>
                              <span>•</span>
                              <span>{goal.type.replace('_', ' ')}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            {formatCurrency(goal.currentAmount)}
                          </div>
                          <div className="text-sm text-gray-600">
                            of {formatCurrency(goal.targetAmount)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{progressPercentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-300" 
                            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>Remaining: {formatCurrency(remainingAmount)}</span>
                          <span>Priority: {goal.priority}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {selectedTab === 'insights' && portfolio && (
              <div className="space-y-6">
                {portfolio.insights.map((insight, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-start space-x-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        insight.type === 'achievement' ? 'bg-green-100' :
                        insight.type === 'opportunity' ? 'bg-blue-100' :
                        insight.type === 'warning' ? 'bg-yellow-100' :
                        'bg-purple-100'
                      }`}>
                        {insight.type === 'achievement' && <Trophy className="w-5 h-5 text-green-600" />}
                        {insight.type === 'opportunity' && <Lightbulb className="w-5 h-5 text-blue-600" />}
                        {insight.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-600" />}
                        {insight.type === 'optimization' && <TrendingUp className="w-5 h-5 text-purple-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-gray-900">{insight.title}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            insight.impact === 'high' ? 'bg-red-100 text-red-700' :
                            insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {insight.impact} impact
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{insight.description}</p>
                        {insight.estimatedBenefit && (
                          <p className="text-sm text-green-600 font-medium mb-3">
                            Potential benefit: {formatCurrency(insight.estimatedBenefit)}
                          </p>
                        )}
                        <ul className="space-y-1">
                          {insight.suggestions.map((suggestion, i) => (
                            <li key={i} className="flex items-start space-x-2 text-sm text-gray-700">
                              <span className="text-blue-500 mt-1">•</span>
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedTab === 'recommendations' && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="text-center py-8">
                  <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">AI Recommendations</h3>
                  <p className="text-gray-600">Personalized goal recommendations coming soon!</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}