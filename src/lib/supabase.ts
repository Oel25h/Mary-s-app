import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Do not throw at module load time to avoid breaking Next.js dev bundling.
// Warn instead; callers should handle downstream errors when the client is unusable.
if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window !== 'undefined') {
    console.warn('Supabase: Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. The app will run but API calls will fail until env vars are set.')
  }
}

// Client-side Supabase client (for use in components)
export const supabase = createClient(supabaseUrl || 'http://localhost', supabaseAnonKey || 'invalid-anon-key', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// Singleton client component helper (for use in client components with auth)
let clientComponentClient: ReturnType<typeof createClientComponentClient> | null = null

export const createSupabaseClient = () => {
  if (!clientComponentClient) {
    clientComponentClient = createClientComponentClient()
  }
  return clientComponentClient
}

// Function to reset the client (for debugging)
export const resetSupabaseClient = () => {
  clientComponentClient = null
  return createSupabaseClient()
}

// Test Supabase connection
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing Supabase connection...')
    const { data, error } = await supabase.from('profiles').select('count').limit(1)

    if (error) {
      console.error('Supabase connection test failed:', error)
      return false
    }

    console.log('Supabase connection test successful')
    return true
  } catch (error) {
    console.error('Supabase connection test error:', error)
    return false
  }
}

// Database types (will be updated after schema creation)
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
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
        Insert: {
          id?: string
          user_id: string
          date: string
          description: string
          category: string
          amount: number
          type: 'income' | 'expense'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          description?: string
          category?: string
          amount?: number
          type?: 'income' | 'expense'
          created_at?: string
          updated_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          category: string
          budget_amount: number
          spent_amount: number
          period: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category: string
          budget_amount: number
          spent_amount?: number
          period: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category?: string
          budget_amount?: number
          spent_amount?: number
          period?: string
          created_at?: string
          updated_at?: string
        }
      }
      goals: {
        Row: {
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
        Insert: {
          id?: string
          user_id: string
          name: string
          type: string
          target_amount: number
          current_amount?: number
          target_date: string
          priority: string
          category?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: string
          target_amount?: number
          current_amount?: number
          target_date?: string
          priority?: string
          category?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      transaction_type: 'income' | 'expense'
      goal_type: 'savings' | 'debt_payoff' | 'investment' | 'emergency_fund' | 'major_purchase' | 'retirement' | 'custom'
      goal_priority: 'low' | 'medium' | 'high' | 'critical'
    }
  }
}
