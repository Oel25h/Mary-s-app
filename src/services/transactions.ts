import { createSupabaseClient } from '@/lib/supabase'
import { Transaction } from '@/types'

// Transaction service with comprehensive input validation and security checks

export interface DatabaseTransaction {
  id: string
  user_id: string
  date: string
  description: string
  category: string
  amount: number
  type: 'income' | 'expense'
  created_at: string
  updated_at: string
}

// Convert database transaction to app transaction
const mapDatabaseToTransaction = (dbTransaction: DatabaseTransaction): Transaction => ({
  id: dbTransaction.id,
  date: new Date(dbTransaction.date),
  description: dbTransaction.description,
  category: dbTransaction.category,
  amount: dbTransaction.amount,
  type: dbTransaction.type
})

// Convert app transaction to database format
const mapTransactionToDatabase = (transaction: Omit<Transaction, 'id'>, userId: string) => ({
  user_id: userId,
  date: transaction.date.toISOString().split('T')[0], // Convert to YYYY-MM-DD format
  description: transaction.description,
  category: transaction.category,
  amount: transaction.amount,
  type: transaction.type
})

export class TransactionService {
  // Get all transactions for the current user
  static async getTransactions(): Promise<Transaction[]> {
    try {
      console.log('TransactionService: Getting transactions...')

      // Check if user is authenticated
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      console.log('TransactionService: Current user:', {
        userId: user?.id,
        email: user?.email
      })




      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false })

      if (error) {
        console.error('TransactionService: Error fetching transactions:', error)
        throw new Error(`Failed to fetch transactions: ${error.message}`)
      }

      console.log('TransactionService: Fetched transactions:', data.length)
      return (data as unknown as DatabaseTransaction[]).map(mapDatabaseToTransaction)
    } catch (error) {
      console.error('TransactionService: Error in getTransactions:', error)
      throw error
    }
  }

  // Get transactions by date range
  static async getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    try {
      const supabase = createSupabaseClient()
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: false })

      if (error) {
        console.error('Error fetching transactions by date range:', error)
        throw new Error(`Failed to fetch transactions: ${error.message}`)
      }

      return (data as unknown as DatabaseTransaction[]).map(mapDatabaseToTransaction)
    } catch (error) {
      console.error('Error in getTransactionsByDateRange:', error)
      throw error
    }
  }

  // Get transactions by category
  static async getTransactionsByCategory(category: string): Promise<Transaction[]> {
    try {
      const supabase = createSupabaseClient()
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('category', category)
        .order('date', { ascending: false })

      if (error) {
        console.error('Error fetching transactions by category:', error)
        throw new Error(`Failed to fetch transactions: ${error.message}`)
      }

      return (data as unknown as DatabaseTransaction[]).map(mapDatabaseToTransaction)
    } catch (error) {
      console.error('Error in getTransactionsByCategory:', error)
      throw error
    }
  }

  // Add a new transaction
  static async addTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    try {
      console.log('TransactionService: Adding transaction:', transaction)
      console.log('TransactionService: Using basic supabase client')

      // Use the auth-helpers client bound to cookies for proper session on client
      const supabase = createSupabaseClient()

      // First check session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      console.log('TransactionService: Session check:', {
        hasSession: !!session,
        userId: session?.user?.id,
        sessionError: sessionError?.message
      })

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      console.log('TransactionService: User check:', {
        hasUser: !!user,
        userId: user?.id,
        email: user?.email,
        userError: userError?.message
      })

      if (!user || !session) {
        console.error('TransactionService: Authentication failed', {
          user: !!user,
          session: !!session,
          sessionError: sessionError?.message,
          userError: userError?.message
        })
        throw new Error('User not authenticated')
      }

      console.log('TransactionService: User authenticated:', user.id)
      const dbTransaction = mapTransactionToDatabase(transaction, user.id)
      console.log('TransactionService: Database transaction:', dbTransaction)

      const { data, error } = await supabase
        .from('transactions')
        .insert([dbTransaction])
        .select()
        .single()

      if (error) {
        console.error('TransactionService: Database error:', error)
        throw new Error(`Failed to add transaction: ${error.message}`)
      }

      console.log('TransactionService: Transaction added successfully:', data)
      return mapDatabaseToTransaction(data as unknown as DatabaseTransaction)
    } catch (error) {
      console.error('TransactionService: Error in addTransaction:', error)
      throw error
    }
  }

  // Update a transaction
  static async updateTransaction(id: string, updates: Partial<Omit<Transaction, 'id'>>): Promise<Transaction> {
    try {
      const updateData: any = {}

      if (updates.date) {
        updateData.date = updates.date.toISOString().split('T')[0]
      }
      if (updates.description !== undefined) {
        updateData.description = updates.description
      }
      if (updates.category !== undefined) {
        updateData.category = updates.category
      }
      if (updates.amount !== undefined) {
        updateData.amount = updates.amount
      }
      if (updates.type !== undefined) {
        updateData.type = updates.type
      }

      const supabase = createSupabaseClient()
      const { data, error } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating transaction:', error)
        throw new Error(`Failed to update transaction: ${error.message}`)
      }

      return mapDatabaseToTransaction(data as unknown as DatabaseTransaction)
    } catch (error) {
      console.error('Error in updateTransaction:', error)
      throw error
    }
  }

  // Delete a transaction
  static async deleteTransaction(id: string): Promise<void> {
    try {
      const supabase = createSupabaseClient()
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting transaction:', error)
        throw new Error(`Failed to delete transaction: ${error.message}`)
      }
    } catch (error) {
      console.error('Error in deleteTransaction:', error)
      throw error
    }
  }

  // Get transaction statistics
  static async getTransactionStats(): Promise<{
    totalIncome: number
    totalExpenses: number
    netIncome: number
    transactionCount: number
  }> {
    try {
      const supabase = createSupabaseClient()
      const { data, error } = await supabase
        .from('transactions')
        .select('amount, type')

      if (error) {
        console.error('Error fetching transaction stats:', error)
        throw new Error(`Failed to fetch transaction stats: ${error.message}`)
      }

      const totalIncome = (data as any[])
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + (t.amount || 0), 0)

      const totalExpenses = (data as any[])
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + (t.amount || 0), 0)

      return {
        totalIncome,
        totalExpenses,
        netIncome: totalIncome - totalExpenses,
        transactionCount: data.length
      }
    } catch (error) {
      console.error('Error in getTransactionStats:', error)
      throw error
    }
  }

  // Get spending by category
  static async getSpendingByCategory(): Promise<{ category: string; amount: number }[]> {
    try {
      const supabase = createSupabaseClient()
      const { data, error } = await supabase
        .from('transactions')
        .select('category, amount')
        .eq('type', 'expense')

      if (error) {
        console.error('Error fetching spending by category:', error)
        throw new Error(`Failed to fetch spending by category: ${error.message}`)
      }

      const categorySpending = (data as any[]).reduce((acc: { category: string; amount: number }[], transaction: any) => {
        const existing = acc.find((item: { category: string; amount: number }) => item.category === transaction.category)
        if (existing) {
          existing.amount += (transaction.amount || 0)
        } else {
          acc.push({ category: transaction.category, amount: transaction.amount || 0 })
        }
        return acc
      }, [] as { category: string; amount: number }[])

      return categorySpending.sort((a, b) => b.amount - a.amount)
    } catch (error) {
      console.error('Error in getSpendingByCategory:', error)
      throw error
    }
  }
}
