import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { aiChatService } from '@/services/aiChatService'
import { FinancialContext } from '@/types'

// Ensure Node.js runtime for compatibility with Google Gemini SDK
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const { message, conversationId, options = {} } = body

    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { error: 'Message is too long. Please keep it under 2000 characters.' },
        { status: 400 }
      )
    }

    // Authenticate user and fetch financial data from Supabase
    const supabase = createRouteHandlerClient({ cookies })

    // Check for Authorization header first
    const authHeader = request.headers.get('authorization')
    let user = null
    let authError = null

    if (authHeader) {
      // Use token-based authentication
      const token = authHeader.replace('Bearer ', '')
      const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(token)
      user = tokenUser
      authError = tokenError
    } else {
      // Fall back to cookie-based authentication
      const { data: { user: cookieUser }, error: cookieError } = await supabase.auth.getUser()
      user = cookieUser
      authError = cookieError
    }

    if (authError || !user) {
      console.warn('[enhanced-chat] Authentication failed', {
        hasAuthHeader: Boolean(authHeader),
        error: authError?.message || authError || 'no-user'
      })
      return NextResponse.json(
        { error: 'Authentication required. Please try again.' },
        { status: 401 }
      )
    }

    // Fetch user's financial data
    const [transactionsResult, budgetsResult] = await Promise.all([
      supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(500), // Limit for performance
      supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
    ])

    if (transactionsResult.error) {
      console.error('[enhanced-chat] Supabase transactions fetch error:', transactionsResult.error)
      return NextResponse.json(
        { error: 'Failed to fetch financial data' },
        { status: 500 }
      )
    }

    if (budgetsResult.error) {
      console.error('[enhanced-chat] Supabase budgets fetch error:', budgetsResult.error)
      return NextResponse.json(
        { error: 'Failed to fetch budget data' },
        { status: 500 }
      )
    }

    const transactions = (transactionsResult.data || []).map(t => ({
      ...t,
      date: new Date(t.date)
    }))

    // Map budgets from DB shape to app shape with safe defaults
    const budgets = (budgetsResult.data || []).map((b: any) => ({
      id: b.id,
      category: b.category,
      budgetAmount: Number(b.budget_amount) || 0,
      spentAmount: Number(b.spent_amount) || 0,
      period: b.period || 'monthly'
    }))

    // Build financial context with strict types and safe aggregations
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)

    const financialContext: FinancialContext = {
      transactions,
      budgets,
      totalIncome,
      totalExpenses,
      netIncome: 0, // Will be calculated
      savingsRate: 0, // Will be calculated
      categoryBreakdown: {},
      recentTransactions: transactions.slice(0, 10),
      budgetPerformance: []
    }

    // Calculate derived metrics
    financialContext.netIncome = financialContext.totalIncome - financialContext.totalExpenses
    financialContext.savingsRate = financialContext.totalIncome > 0 
      ? (financialContext.netIncome / financialContext.totalIncome) * 100 
      : 0

    // Calculate category breakdown
    transactions.forEach(t => {
      if (t.type === 'expense') {
        financialContext.categoryBreakdown[t.category] = 
          (financialContext.categoryBreakdown[t.category] || 0) + t.amount
      }
    })

    // Calculate budget performance (guard against division by zero)
    financialContext.budgetPerformance = budgets.map(budget => {
      const spent = transactions
        .filter(t => t.type === 'expense' && t.category === budget.category)
        .reduce((sum, t) => sum + t.amount, 0)

      const budgeted = Number(budget.budgetAmount) || 0
      const percentageUsed = budgeted > 0 ? (spent / budgeted) * 100 : 0

      return {
        category: budget.category,
        budgeted,
        spent,
        percentageUsed
      }
    })

    // Generate AI response
    const aiResponse = await aiChatService.generateResponse(message, financialContext, {
      ...options,
      conversationId,
      includeFinancialContext: true
    })

    return NextResponse.json({
      message: aiResponse.message,
      timestamp: aiResponse.timestamp,
      isError: aiResponse.isError,
      errorType: aiResponse.errorType,
      metadata: aiResponse.metadata,
      conversationId: conversationId || aiChatService.generateConversationId()
    })

  } catch (error: any) {
    // Handle specific error types
    if (error.message?.includes('rate limit') || error.status === 429) {
      return NextResponse.json(
        { error: 'AI service is currently busy. Please try again in a moment.' },
        { status: 429 }
      )
    }

    if (error.message?.includes('API key') || error.message?.includes('authentication')) {
      return NextResponse.json(
        { error: 'AI service configuration error' },
        { status: 500 }
      )
    }

    console.error('[enhanced-chat] Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Health check endpoint
  try {
    const isHealthy = await aiChatService.healthCheck()
    return NextResponse.json({ 
      status: isHealthy ? 'healthy' : 'unhealthy',
      service: 'enhanced-ai-chat',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        service: 'enhanced-ai-chat',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
