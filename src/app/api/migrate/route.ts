import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { sampleTransactions, sampleBudgets } from '@/lib/sampleData'

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user already has data
    const { data: existingTransactions } = await supabase.from('transactions').select('id')
    const { data: existingBudgets } = await supabase.from('budgets').select('id')

    if ((existingTransactions?.length || 0) > 0 || (existingBudgets?.length || 0) > 0) {
      return NextResponse.json(
        {
          error: 'User already has data. Migration skipped.',
          existingData: {
            transactions: existingTransactions?.length || 0,
            budgets: existingBudgets?.length || 0
          }
        },
        { status: 400 }
      )
    }

    // Migrate sample data
    const results = {
      transactions: 0,
      budgets: 0,
      errors: [] as string[]
    }

    // Add sample transactions
    for (const transaction of sampleTransactions) {
      try {
        const { error } = await supabase
          .from('transactions')
          .insert([{
            user_id: user.id,
            date: transaction.date.toISOString().split('T')[0],
            description: transaction.description,
            category: transaction.category,
            amount: transaction.amount,
            type: transaction.type
          }])

        if (error) {
          throw error
        }
        results.transactions++
      } catch (error) {
        results.errors.push(`Failed to add transaction: ${transaction.description}`)
      }
    }

    // Add sample budgets
    for (const budget of sampleBudgets) {
      try {
        const { error } = await supabase
          .from('budgets')
          .insert([{
            user_id: user.id,
            category: budget.category,
            budget_amount: budget.budgetAmount,
            period: budget.period
          }])

        if (error) {
          throw error
        }
        results.budgets++
      } catch (error) {
        results.errors.push(`Failed to add budget: ${budget.category}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Sample data migrated successfully',
      results
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Migration failed' },
      { status: 500 }
    )
  }
}

// GET endpoint to check migration status
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check current data
    const { data: transactions } = await supabase.from('transactions').select('id')
    const { data: budgets } = await supabase.from('budgets').select('id')

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email
      },
      data: {
        transactions: transactions?.length || 0,
        budgets: budgets?.length || 0,
        hasData: (transactions?.length || 0) > 0 || (budgets?.length || 0) > 0
      }
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    )
  }
}
