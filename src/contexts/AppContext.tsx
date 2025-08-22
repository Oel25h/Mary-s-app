'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import { Transaction, Budget, AppContextType, FinancialGoal } from '@/types'
import { TransactionService } from '@/services/transactions'
import { BudgetService } from '@/services/budgets'
import { GoalService } from '@/services/goals'
import { useAuth } from '@/contexts/AuthContext'

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [goals, setGoals] = useState<FinancialGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dataLoaded, setDataLoaded] = useState(false)

  // Load data when user is authenticated
  useEffect(() => {
    console.log('AppContext: Auth state changed:', {
      authLoading,
      user: !!user,
      dataLoaded
    })

    if (authLoading) {
      console.log('AppContext: Auth still loading, waiting...')
      return
    }

    if (user && !dataLoaded) {
      console.log('AppContext: User authenticated, loading data...')

      // Set a timeout to prevent infinite loading
      const loadTimeout = setTimeout(() => {
        console.warn('AppContext: Data loading timeout, forcing completion')
        setLoading(false)
        setError('Data loading timed out. Please refresh the page.')
      }, 12000)

      loadData().finally(() => {
        clearTimeout(loadTimeout)
      })
    } else if (!user) {
      console.log('AppContext: No user, clearing data...')
      // Clear data when user is not authenticated
      setTransactions([])
      setBudgets([])
      setGoals([])
      setDataLoaded(false)
      setLoading(false)
    } else if (user && dataLoaded) {
      console.log('AppContext: User authenticated and data already loaded')
      setLoading(false)
    }
  }, [user, authLoading, dataLoaded])

  const loadData = async () => {
    try {
      console.log('AppContext: Starting data load...')
      setLoading(true)
      setError(null)

      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Data loading timeout after 10 seconds')), 10000)
      })

      console.log('AppContext: Fetching transactions, budgets, and goals...')
      const [transactionsData, budgetsData, goalsData] = await Promise.race([
        Promise.all([
          TransactionService.getTransactions(),
          BudgetService.getBudgets(),
          GoalService.getGoals()
        ]),
        timeoutPromise
      ]) as [Transaction[], Budget[], FinancialGoal[]]

      console.log('AppContext: Data loaded successfully:', {
        transactions: transactionsData.length,
        budgets: budgetsData.length,
        goals: goalsData.length
      })

      setTransactions(transactionsData)
      setBudgets(budgetsData)
      setGoals(goalsData)
      setDataLoaded(true)
    } catch (err) {
      console.error('AppContext: Error loading data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
      setDataLoaded(false)
    } finally {
      console.log('AppContext: Data loading completed')
      setLoading(false)
    }
  }

  // Transaction methods
  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id'>) => {
    try {
      const newTransaction = await TransactionService.addTransaction(transaction)

      setTransactions(prev => [newTransaction, ...prev])

      // Refresh budgets to get updated spent amounts
      const updatedBudgets = await BudgetService.getBudgets()
      setBudgets(updatedBudgets)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add transaction')
      throw err
    }
  }, [])

  const updateTransaction = useCallback(async (id: string, updates: Partial<Transaction>) => {
    try {
      const updatedTransaction = await TransactionService.updateTransaction(id, updates)
      setTransactions(prev => prev.map(t => t.id === id ? updatedTransaction : t))

      // Refresh budgets to get updated spent amounts
      const updatedBudgets = await BudgetService.getBudgets()
      setBudgets(updatedBudgets)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update transaction')
      throw err
    }
  }, [])

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      await TransactionService.deleteTransaction(id)
      setTransactions(prev => prev.filter(t => t.id !== id))

      // Refresh budgets to get updated spent amounts
      const updatedBudgets = await BudgetService.getBudgets()
      setBudgets(updatedBudgets)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete transaction')
      throw err
    }
  }, [])

  // Budget methods
  const addBudget = useCallback(async (budget: Omit<Budget, 'id' | 'spentAmount'>) => {
    try {
      const newBudget = await BudgetService.addBudget(budget)
      setBudgets(prev => [...prev, newBudget])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add budget')
      throw err
    }
  }, [])

  const updateBudget = useCallback(async (id: string, updates: Partial<Budget>) => {
    try {
      const updatedBudget = await BudgetService.updateBudget(id, updates)
      setBudgets(prev => prev.map(b => b.id === id ? updatedBudget : b))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update budget')
      throw err
    }
  }, [])

  const deleteBudget = useCallback(async (id: string) => {
    try {
      await BudgetService.deleteBudget(id)
      setBudgets(prev => prev.filter(b => b.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete budget')
      throw err
    }
  }, [])

  // Goal methods
  const addGoal = useCallback(async (goal: Omit<FinancialGoal, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newGoal = await GoalService.addGoal(goal)
      setGoals(prev => [newGoal, ...prev])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add goal')
      throw err
    }
  }, [])

  const updateGoal = useCallback(async (id: string, updates: Partial<FinancialGoal>) => {
    try {
      const updatedGoal = await GoalService.updateGoal(id, updates)
      setGoals(prev => prev.map(g => g.id === id ? updatedGoal : g))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update goal')
      throw err
    }
  }, [])

  const deleteGoal = useCallback(async (id: string) => {
    try {
      await GoalService.deleteGoal(id)
      setGoals(prev => prev.filter(g => g.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete goal')
      throw err
    }
  }, [])

  const updateGoalProgress = useCallback(async (id: string, currentAmount: number) => {
    try {
      const updatedGoal = await GoalService.updateGoalProgress(id, currentAmount)
      setGoals(prev => prev.map(g => g.id === id ? updatedGoal : g))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update goal progress')
      throw err
    }
  }, [])

  // Computed values
  const getTotalIncome = useCallback(() => {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
  }, [transactions])

  const getTotalExpenses = useCallback(() => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  }, [transactions])

  const getNetIncome = useCallback(() => {
    return getTotalIncome() - getTotalExpenses()
  }, [getTotalIncome, getTotalExpenses])

  const getSavingsRate = useCallback(() => {
    const income = getTotalIncome()
    if (income === 0) return 0
    return (getNetIncome() / income) * 100
  }, [getTotalIncome, getNetIncome])

  const getCategorySpending = useCallback((category: string) => {
    return transactions
      .filter(t => t.type === 'expense' && t.category === category)
      .reduce((sum, t) => sum + t.amount, 0)
  }, [transactions])

  const contextValue: AppContextType = {
    transactions,
    budgets,
    goals,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addBudget,
    updateBudget,
    deleteBudget,
    addGoal,
    updateGoal,
    deleteGoal,
    updateGoalProgress,
    getTotalIncome,
    getTotalExpenses,
    getNetIncome,
    getSavingsRate,
    getCategorySpending,
    loading,
    error
  }

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
