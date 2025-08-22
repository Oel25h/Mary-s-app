import { createSupabaseClient } from '@/lib/supabase'
import { Budget } from '@/types'

export interface DatabaseBudget {
  id: string
  user_id: string
  category: string
  budget_amount: number
  spent_amount: number
  period: string
  created_at: string
  updated_at: string
}

// Convert database budget to app budget
const mapDatabaseToBudget = (dbBudget: DatabaseBudget): Budget => ({
  id: dbBudget.id,
  category: dbBudget.category,
  budgetAmount: dbBudget.budget_amount,
  spentAmount: dbBudget.spent_amount,
  period: dbBudget.period
})

// Convert app budget to database format
const mapBudgetToDatabase = (budget: Omit<Budget, 'id' | 'spentAmount'>, userId: string) => ({
  user_id: userId,
  category: budget.category,
  budget_amount: budget.budgetAmount,
  spent_amount: 0, // Initialize spent amount to 0
  period: budget.period
})

export class BudgetService {
  // Get all budgets for the current user
  static async getBudgets(): Promise<Budget[]> {
    try {
      console.log('BudgetService: Getting budgets...')

      const supabase = createSupabaseClient()
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser()
      console.log('BudgetService: Current user:', {
        userId: user?.id,
        email: user?.email
      })



      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .order('category', { ascending: true })

      if (error) {
        console.error('BudgetService: Error fetching budgets:', error)
        throw new Error(`Failed to fetch budgets: ${error.message}`)
      }

      console.log('BudgetService: Fetched budgets:', data.length)
      return (data as unknown as DatabaseBudget[]).map(mapDatabaseToBudget)
    } catch (error) {
      console.error('BudgetService: Error in getBudgets:', error)
      throw error
    }
  }

  // Get budget by category
  static async getBudgetByCategory(category: string): Promise<Budget | null> {
    try {
      const supabase = createSupabaseClient()
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('category', category)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null
        }
        console.error('Error fetching budget by category:', error)
        throw new Error(`Failed to fetch budget: ${error.message}`)
      }

      return mapDatabaseToBudget(data as unknown as DatabaseBudget)
    } catch (error) {
      console.error('Error in getBudgetByCategory:', error)
      throw error
    }
  }

  // Add a new budget
  static async addBudget(budget: Omit<Budget, 'id' | 'spentAmount'>): Promise<Budget> {
    try {
      console.log('BudgetService: Adding budget:', budget)

      const supabase = createSupabaseClient()

      // Check authentication
      const { data: { session } } = await supabase.auth.getSession()
      const { data: { user } } = await supabase.auth.getUser()

      console.log('BudgetService: Auth check:', {
        hasUser: !!user,
        hasSession: !!session,
        userId: user?.id,
        email: user?.email
      })

      if (!user || !session) {
        throw new Error('User not authenticated')
      }

      const dbBudget = mapBudgetToDatabase(budget, user.id)
      console.log('BudgetService: Database budget object:', dbBudget)

      const { data, error } = await supabase
        .from('budgets')
        .insert([dbBudget])
        .select()
        .single()

      if (error) {
        console.error('BudgetService: Database error:', error)
        console.error('BudgetService: Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw new Error(`Failed to add budget: ${error.message}`)
      }

      console.log('BudgetService: Budget added successfully:', data)
      return mapDatabaseToBudget(data as unknown as DatabaseBudget)
    } catch (error) {
      console.error('BudgetService: Error in addBudget:', error)
      console.error('BudgetService: Error type:', typeof error)
      console.error('BudgetService: Error message:', error instanceof Error ? error.message : 'Unknown error')
      throw error
    }
  }

  // Update a budget
  static async updateBudget(id: string, updates: Partial<Omit<Budget, 'id'>>): Promise<Budget> {
    try {
      const updateData: any = {}

      if (updates.category !== undefined) {
        updateData.category = updates.category
      }
      if (updates.budgetAmount !== undefined) {
        updateData.budget_amount = updates.budgetAmount
      }
      if (updates.spentAmount !== undefined) {
        updateData.spent_amount = updates.spentAmount
      }
      if (updates.period !== undefined) {
        updateData.period = updates.period
      }

      const supabase = createSupabaseClient()
      const { data, error } = await supabase
        .from('budgets')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating budget:', error)
        throw new Error(`Failed to update budget: ${error.message}`)
      }

      return mapDatabaseToBudget(data as unknown as DatabaseBudget)
    } catch (error) {
      console.error('Error in updateBudget:', error)
      throw error
    }
  }

  // Delete a budget
  static async deleteBudget(id: string): Promise<void> {
    try {
      const supabase = createSupabaseClient()
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting budget:', error)
        throw new Error(`Failed to delete budget: ${error.message}`)
      }
    } catch (error) {
      console.error('Error in deleteBudget:', error)
      throw error
    }
  }

  // Get budget utilization stats
  static async getBudgetStats(): Promise<{
    totalBudget: number
    totalSpent: number
    utilizationRate: number
    budgetCount: number
  }> {
    try {
      const supabase = createSupabaseClient()
      const { data, error } = await supabase
        .from('budgets')
        .select('budget_amount, spent_amount')

      if (error) {
        console.error('Error fetching budget stats:', error)
        throw new Error(`Failed to fetch budget stats: ${error.message}`)
      }

      const totalBudget = (data as any[]).reduce((sum, b) => sum + (b.budget_amount || 0), 0)
      const totalSpent = (data as any[]).reduce((sum, b) => sum + (b.spent_amount || 0), 0)

      return {
        totalBudget,
        totalSpent,
        utilizationRate: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
        budgetCount: data.length
      }
    } catch (error) {
      console.error('Error in getBudgetStats:', error)
      throw error
    }
  }

  // Get over-budget categories
  static async getOverBudgetCategories(): Promise<Budget[]> {
    try {
      const supabase = createSupabaseClient()
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .gt('spent_amount', 'budget_amount')
        .order('spent_amount', { ascending: false })

      if (error) {
        console.error('Error fetching over-budget categories:', error)
        throw new Error(`Failed to fetch over-budget categories: ${error.message}`)
      }

      return (data as unknown as DatabaseBudget[]).map(mapDatabaseToBudget)
    } catch (error) {
      console.error('Error in getOverBudgetCategories:', error)
      throw error
    }
  }

  // Refresh spent amounts for all budgets (useful for data consistency)
  static async refreshSpentAmounts(): Promise<void> {
    try {
      // This will trigger the database function to recalculate spent amounts
      // The trigger function will automatically update spent amounts when transactions change
      // This method is mainly for manual refresh if needed

      const supabase = createSupabaseClient()
      const { data: budgets, error: budgetsError } = await supabase
        .from('budgets')
        .select('id, category')

      if (budgetsError) {
        console.error('Error fetching budgets for refresh:', budgetsError)
        throw new Error(`Failed to refresh spent amounts: ${budgetsError.message}`)
      }

      // For each budget, get the current spent amount from transactions
      for (const budget of budgets) {
        const supabase = createSupabaseClient()
        const { data: transactions, error: transactionsError } = await supabase
          .from('transactions')
          .select('amount')
          .eq('category', (budget as any).category)
          .eq('type', 'expense')

        if (transactionsError) {
          console.error('Error fetching transactions for budget refresh:', transactionsError)
          continue
        }

        const spentAmount = (transactions as any[]).reduce((sum, t) => sum + (t.amount || 0), 0)

        const { error: updateError } = await supabase
          .from('budgets')
          .update({ spent_amount: spentAmount })
          .eq('id', (budget as any).id)

        if (updateError) {
          console.error('Error updating spent amount:', updateError)
        }
      }
    } catch (error) {
      console.error('Error in refreshSpentAmounts:', error)
      throw error
    }
  }
}
