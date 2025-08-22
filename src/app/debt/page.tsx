'use client'

import { useState, useEffect } from 'react'
import { CreditCard, TrendingDown, Target, Plus, Trash2 } from 'lucide-react'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import { useApp } from '@/contexts/AppContext'
import { debtPayoffService } from '@/services/debtPayoffService'
import { DebtPayoffAnalysis, DebtAccount } from '@/types'

export default function DebtPage() {
  const { transactions } = useApp()
  const [analysis, setAnalysis] = useState<DebtPayoffAnalysis | null>(null)
  const [debts, setDebts] = useState<DebtAccount[]>([])
  const [extraPayment, setExtraPayment] = useState(0)
  const [showAddDebt, setShowAddDebt] = useState(false)
  const [newDebt, setNewDebt] = useState({
    name: '',
    type: 'credit_card' as DebtAccount['type'],
    balance: 0,
    interestRate: 0,
    minimumPayment: 0,
    creditLimit: 0
  })

  useEffect(() => {
    if (debts.length > 0) {
      const debtAnalysis = debtPayoffService.analyzeDebtPayoff(transactions, debts, extraPayment)
      setAnalysis(debtAnalysis)
    }
  }, [debts, extraPayment])

  const addDebt = () => {
    if (newDebt.name && newDebt.balance > 0) {
      const debt: DebtAccount = {
        id: Date.now().toString(),
        ...newDebt,
        creditLimit: newDebt.type === 'credit_card' ? newDebt.creditLimit : undefined
      }
      setDebts([...debts, debt])
      setNewDebt({ name: '', type: 'credit_card', balance: 0, interestRate: 0, minimumPayment: 0, creditLimit: 0 })
      setShowAddDebt(false)
    }
  }

  const removeDebt = (id: string) => {
    setDebts(debts.filter(debt => debt.id !== id))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  if (debts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
        <Header title="Debt Payoff Strategies" />
        <div className="flex">
          <Sidebar currentPage="debt" />
          <main className="flex-1 p-8">
            <div className="max-w-4xl mx-auto text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Debt Payoff Strategies</h1>
              <p className="text-gray-600 mb-8">Add your debts to get personalized payoff strategies</p>
              
              <button
                onClick={() => setShowAddDebt(true)}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition-colors flex items-center space-x-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                <span>Add Your First Debt</span>
              </button>
            </div>
          </main>
        </div>
        
        {/* Add Debt Modal */}
        {showAddDebt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Add Debt</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Debt name"
                  value={newDebt.name}
                  onChange={(e) => setNewDebt({...newDebt, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
                <select
                  value={newDebt.type}
                  onChange={(e) => setNewDebt({...newDebt, type: e.target.value as DebtAccount['type']})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                >
                  <option value="credit_card">Credit Card</option>
                  <option value="personal_loan">Personal Loan</option>
                  <option value="student_loan">Student Loan</option>
                  <option value="auto_loan">Auto Loan</option>
                  <option value="other">Other</option>
                </select>
                <input
                  type="number"
                  placeholder="Balance"
                  value={newDebt.balance || ''}
                  onChange={(e) => setNewDebt({...newDebt, balance: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
                <input
                  type="number"
                  placeholder="Interest rate (%)"
                  value={newDebt.interestRate || ''}
                  onChange={(e) => setNewDebt({...newDebt, interestRate: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
                <input
                  type="number"
                  placeholder="Minimum payment"
                  value={newDebt.minimumPayment || ''}
                  onChange={(e) => setNewDebt({...newDebt, minimumPayment: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
                {newDebt.type === 'credit_card' && (
                  <input
                    type="number"
                    placeholder="Credit limit"
                    value={newDebt.creditLimit || ''}
                    onChange={(e) => setNewDebt({...newDebt, creditLimit: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                )}
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={addDebt}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Add Debt
                </button>
                <button
                  onClick={() => setShowAddDebt(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      <Header title="Debt Payoff Strategies" />
      
      <div className="flex">
        <Sidebar currentPage="debt" />
        
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Debt Payoff Strategies</h1>
              <p className="text-gray-600">Optimize your debt payoff with AI-powered strategies</p>
            </div>

            {/* Controls */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Extra Monthly Payment</label>
                <input
                  type="number"
                  value={extraPayment}
                  onChange={(e) => setExtraPayment(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="$0"
                />
              </div>
              
              <button
                onClick={() => setShowAddDebt(true)}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Debt</span>
              </button>
            </div>

            {/* Current Debts */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Your Debts</h3>
              <div className="space-y-3">
                {debts.map((debt) => (
                  <div key={debt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium text-gray-900">{debt.name}</h4>
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full capitalize">
                          {debt.type.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-4 mt-2 text-sm text-gray-600">
                        <div>Balance: {formatCurrency(debt.balance)}</div>
                        <div>Rate: {debt.interestRate}%</div>
                        <div>Min Payment: {formatCurrency(debt.minimumPayment)}</div>
                        {debt.creditLimit && <div>Limit: {formatCurrency(debt.creditLimit)}</div>}
                      </div>
                    </div>
                    <button
                      onClick={() => removeDebt(debt.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {analysis && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-red-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-500">TOTAL DEBT</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {formatCurrency(debts.reduce((sum, d) => sum + d.balance, 0))}
                    </div>
                    <div className="text-sm text-gray-600">{debts.length} accounts</div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Target className="w-5 h-5 text-green-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-500">SAVINGS</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {formatCurrency(analysis.payoffComparison.optimizedPath.totalSavings)}
                    </div>
                    <div className="text-sm text-gray-600">With optimization</div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <TrendingDown className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-500">TIME SAVED</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {analysis.payoffComparison.optimizedPath.timeSaved} months
                    </div>
                    <div className="text-sm text-gray-600">Faster payoff</div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-yellow-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-500">UTILIZATION</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {analysis.creditImpact.creditUtilization.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Credit Usage</div>
                  </div>
                </div>

                {/* Strategies */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Payoff Strategies</h3>
                  <div className="space-y-6">
                    {analysis.strategies.map((strategy, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-medium text-gray-900">{strategy.name}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            strategy.effectiveness === 'high' ? 'bg-green-100 text-green-700' :
                            strategy.effectiveness === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {strategy.effectiveness} effectiveness
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-4">{strategy.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-xl font-bold text-gray-900">{formatCurrency(strategy.totalInterestPaid)}</div>
                            <div className="text-sm text-gray-500">Total Interest</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-blue-600">{strategy.timeToPayoff} months</div>
                            <div className="text-sm text-gray-500">Time to Payoff</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-green-600">{formatCurrency(strategy.monthlyPayment)}</div>
                            <div className="text-sm text-gray-500">Monthly Payment</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Recommendations</h3>
                  <div className="space-y-4">
                    {analysis.recommendations.map((rec, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{rec.title}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                            rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {rec.priority} priority
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{rec.description}</p>
                        {rec.potentialSavings > 0 && (
                          <div className="text-green-600 font-medium text-sm">
                            Potential Savings: {formatCurrency(rec.potentialSavings)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Add Debt Modal */}
            {showAddDebt && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Add Debt</h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Debt name"
                      value={newDebt.name}
                      onChange={(e) => setNewDebt({...newDebt, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                    <select
                      value={newDebt.type}
                      onChange={(e) => setNewDebt({...newDebt, type: e.target.value as DebtAccount['type']})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    >
                      <option value="credit_card">Credit Card</option>
                      <option value="personal_loan">Personal Loan</option>
                      <option value="student_loan">Student Loan</option>
                      <option value="auto_loan">Auto Loan</option>
                      <option value="other">Other</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Balance"
                      value={newDebt.balance || ''}
                      onChange={(e) => setNewDebt({...newDebt, balance: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                    <input
                      type="number"
                      placeholder="Interest rate (%)"
                      value={newDebt.interestRate || ''}
                      onChange={(e) => setNewDebt({...newDebt, interestRate: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                    <input
                      type="number"
                      placeholder="Minimum payment"
                      value={newDebt.minimumPayment || ''}
                      onChange={(e) => setNewDebt({...newDebt, minimumPayment: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                    {newDebt.type === 'credit_card' && (
                      <input
                        type="number"
                        placeholder="Credit limit"
                        value={newDebt.creditLimit || ''}
                        onChange={(e) => setNewDebt({...newDebt, creditLimit: Number(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      />
                    )}
                  </div>
                  <div className="flex space-x-3 mt-6">
                    <button
                      onClick={addDebt}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Add Debt
                    </button>
                    <button
                      onClick={() => setShowAddDebt(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}