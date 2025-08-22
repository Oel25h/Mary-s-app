import { createSupabaseClient } from '@/lib/supabase'
import { FinancialGoal } from '@/types'

export interface DatabaseGoal {
  id: string
  user_id: string
  name: string
  type: string
  target_amount: number
  current_amount: number
  target_date: string
  priority: string
  category: string | null
  description: string | null
  created_at: string
  updated_at: string
}

// Convert database goal to app goal
const mapDatabaseToGoal = (dbGoal: DatabaseGoal): FinancialGoal => ({
  id: dbGoal.id,
  name: dbGoal.name,
  type: dbGoal.type as FinancialGoal['type'],
  targetAmount: dbGoal.target_amount,
  currentAmount: dbGoal.current_amount,
  targetDate: new Date(dbGoal.target_date),
  priority: dbGoal.priority as FinancialGoal['priority'],
  category: dbGoal.category || undefined,
  description: dbGoal.description || undefined,
  createdAt: new Date(dbGoal.created_at),
  updatedAt: new Date(dbGoal.updated_at)
})

// Convert app goal to database format
const mapGoalToDatabase = (goal: Omit<FinancialGoal, 'id' | 'createdAt' | 'updatedAt'>, userId: string) => ({
  user_id: userId,
  name: goal.name,
  type: goal.type,
  target_amount: goal.targetAmount,
  current_amount: goal.currentAmount,
  target_date: goal.targetDate.toISOString().split('T')[0],
  priority: goal.priority,
  category: goal.category || null,
  description: goal.description || null
})

export class GoalService {
  // Get all goals for the current user
  static async getGoals(): Promise<FinancialGoal[]> {
    try {
      console.log('GoalService: Getting goals...')

      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        console.log('GoalService: No authenticated user')
        return []
      }

      console.log('GoalService: Current user:', user.id)

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('GoalService: Error fetching goals:', error)
        // Return empty array instead of throwing to handle missing table gracefully
        return []
      }

      console.log('GoalService: Fetched goals:', data?.length || 0)
      return (data as unknown as DatabaseGoal[])?.map(mapDatabaseToGoal) || []
    } catch (error) {
      console.error('GoalService: Error in getGoals:', error)
      return []
    }
  }

  // Add a new goal
  static async addGoal(goal: Omit<FinancialGoal, 'id' | 'createdAt' | 'updatedAt'>): Promise<FinancialGoal> {
    try {
      console.log('GoalService: Adding goal:', goal)

      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('User not authenticated')
      }

      const dbGoal = mapGoalToDatabase(goal, user.id)
      console.log('GoalService: Database goal object:', dbGoal)

      const { data, error } = await supabase
        .from('goals')
        .insert([dbGoal])
        .select()
        .single()

      if (error) {
        console.error('GoalService: Database error:', error)
        throw new Error(`Failed to add goal: ${error.message}`)
      }

      console.log('GoalService: Goal added successfully:', data)
      return mapDatabaseToGoal(data as unknown as DatabaseGoal)
    } catch (error) {
      console.error('GoalService: Error in addGoal:', error)
      throw error
    }
  }

  // Update a goal
  static async updateGoal(id: string, updates: Partial<Omit<FinancialGoal, 'id' | 'createdAt' | 'updatedAt'>>): Promise<FinancialGoal> {
    try {
      const updateData: any = {}

      if (updates.name !== undefined) updateData.name = updates.name
      if (updates.type !== undefined) updateData.type = updates.type
      if (updates.targetAmount !== undefined) updateData.target_amount = updates.targetAmount
      if (updates.currentAmount !== undefined) updateData.current_amount = updates.currentAmount
      if (updates.targetDate !== undefined) updateData.target_date = updates.targetDate.toISOString().split('T')[0]
      if (updates.priority !== undefined) updateData.priority = updates.priority
      if (updates.category !== undefined) updateData.category = updates.category
      if (updates.description !== undefined) updateData.description = updates.description

      const supabase = createSupabaseClient()
      const { data, error } = await supabase
        .from('goals')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating goal:', error)
        throw new Error(`Failed to update goal: ${error.message}`)
      }

      return mapDatabaseToGoal(data as unknown as DatabaseGoal)
    } catch (error) {
      console.error('Error in updateGoal:', error)
      throw error
    }
  }

  // Delete a goal
  static async deleteGoal(id: string): Promise<void> {
    try {
      const supabase = createSupabaseClient()
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting goal:', error)
        throw new Error(`Failed to delete goal: ${error.message}`)
      }
    } catch (error) {
      console.error('Error in deleteGoal:', error)
      throw error
    }
  }

  // Update goal progress (current amount)
  static async updateGoalProgress(id: string, currentAmount: number): Promise<FinancialGoal> {
    try {
      return await this.updateGoal(id, { currentAmount })
    } catch (error) {
      console.error('Error updating goal progress:', error)
      throw error
    }
  }

  // Get goals by type
  static async getGoalsByType(type: FinancialGoal['type']): Promise<FinancialGoal[]> {
    try {
      const allGoals = await this.getGoals()
      return allGoals.filter(goal => goal.type === type)
    } catch (error) {
      console.error('Error in getGoalsByType:', error)
      throw error
    }
  }

  // Get goals by priority
  static async getGoalsByPriority(priority: FinancialGoal['priority']): Promise<FinancialGoal[]> {
    try {
      const allGoals = await this.getGoals()
      return allGoals.filter(goal => goal.priority === priority)
    } catch (error) {
      console.error('Error in getGoalsByPriority:', error)
      throw error
    }
  }
}