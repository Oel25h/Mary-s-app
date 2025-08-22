import { Transaction, Budget } from '@/types'

// Forecasting types
export interface ForecastPeriod {
  date: Date
  predictedIncome: number
  predictedExpenses: number
  predictedBalance: number
  confidence: number
}

export interface CashFlowForecast {
  periods: ForecastPeriod[]
  summary: {
    currentBalance: number
    projectedBalanceIn30Days: number
    projectedBalanceIn90Days: number
    averageMonthlyIncome: number
    averageMonthlyExpenses: number
    burnRate: number // How many months until balance reaches zero
    confidenceScore: number
  }
  insights: string[]
  warnings: string[]
}

export interface RecurringPattern {
  type: 'income' | 'expense'
  description: string
  amount: number
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  confidence: number
  nextOccurrence: Date
}

export interface SeasonalPattern {
  month: number
  averageIncome: number
  averageExpenses: number
  transactionCount: number
  confidence: number
}

/**
 * Cash Flow Forecasting Service
 * Predicts future cash flows based on historical transaction data
 */
class CashFlowForecastingService {
  /**
   * Generate cash flow forecast for the next 90 days
   */
  generateForecast(
    transactions: Transaction[], 
    currentBalance: number = 0,
    forecastDays: number = 90
  ): CashFlowForecast {
    try {
      // Analyze historical patterns
      const recurringPatterns = this.identifyRecurringPatterns(transactions)
      const seasonalPatterns = this.analyzeSeasonalPatterns(transactions)
      const trends = this.analyzeTrends(transactions)

      // Generate daily forecasts
      const periods = this.generateForecastPeriods(
        transactions,
        recurringPatterns,
        seasonalPatterns,
        trends,
        currentBalance,
        forecastDays
      )

      // Calculate summary metrics
      const summary = this.calculateSummary(periods, transactions, currentBalance)

      // Generate insights and warnings
      const insights = this.generateInsights(periods, trends, recurringPatterns)
      const warnings = this.generateWarnings(periods, summary)

      return {
        periods,
        summary,
        insights,
        warnings
      }
    } catch (error) {
      console.error('Error generating cash flow forecast:', error)
      
      // Return empty forecast on error
      return {
        periods: [],
        summary: {
          currentBalance,
          projectedBalanceIn30Days: currentBalance,
          projectedBalanceIn90Days: currentBalance,
          averageMonthlyIncome: 0,
          averageMonthlyExpenses: 0,
          burnRate: Infinity,
          confidenceScore: 0
        },
        insights: ['Unable to generate forecast due to insufficient data'],
        warnings: ['Forecasting requires at least 30 days of transaction history']
      }
    }
  }

  /**
   * Identify recurring income and expense patterns
   */
  private identifyRecurringPatterns(transactions: Transaction[]): RecurringPattern[] {
    const patterns: RecurringPattern[] = []
    
    // Group transactions by description (simplified matching)
    const transactionGroups = new Map<string, Transaction[]>()
    
    transactions.forEach(transaction => {
      const key = this.normalizeDescription(transaction.description)
      if (!transactionGroups.has(key)) {
        transactionGroups.set(key, [])
      }
      transactionGroups.get(key)!.push(transaction)
    })

    // Analyze each group for patterns
    transactionGroups.forEach((groupTransactions, description) => {
      if (groupTransactions.length < 3) return // Need at least 3 occurrences
      
      const pattern = this.analyzeTransactionGroup(groupTransactions, description)
      if (pattern && pattern.confidence > 0.5) {
        patterns.push(pattern)
      }
    })

    return patterns.sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * Analyze seasonal spending patterns
   */
  private analyzeSeasonalPatterns(transactions: Transaction[]): SeasonalPattern[] {
    const monthlyData = new Map<number, { income: number[], expenses: number[], count: number }>()

    // Initialize months
    for (let month = 0; month < 12; month++) {
      monthlyData.set(month, { income: [], expenses: [], count: 0 })
    }

    // Group transactions by month
    transactions.forEach(transaction => {
      const month = transaction.date.getMonth()
      const data = monthlyData.get(month)!
      
      if (transaction.type === 'income') {
        data.income.push(transaction.amount)
      } else {
        data.expenses.push(transaction.amount)
      }
      data.count++
    })

    // Calculate averages and confidence for each month
    const patterns: SeasonalPattern[] = []
    monthlyData.forEach((data, month) => {
      const averageIncome = data.income.length > 0 
        ? data.income.reduce((sum, amount) => sum + amount, 0) / data.income.length 
        : 0
      
      const averageExpenses = data.expenses.length > 0 
        ? data.expenses.reduce((sum, amount) => sum + amount, 0) / data.expenses.length 
        : 0

      // Confidence based on number of data points
      const confidence = Math.min(data.count / 10, 1) // Full confidence at 10+ transactions per month

      patterns.push({
        month,
        averageIncome,
        averageExpenses,
        transactionCount: data.count,
        confidence
      })
    })

    return patterns
  }

  /**
   * Analyze overall trends in income and expenses
   */
  private analyzeTrends(transactions: Transaction[]): {
    incomeGrowthRate: number
    expenseGrowthRate: number
    volatility: number
    confidence: number
  } {
    if (transactions.length < 30) {
      return { incomeGrowthRate: 0, expenseGrowthRate: 0, volatility: 0.5, confidence: 0.2 }
    }

    // Sort transactions by date
    const sortedTransactions = [...transactions].sort((a, b) => a.date.getTime() - b.date.getTime())
    
    // Calculate monthly totals
    const monthlyTotals = new Map<string, { income: number, expenses: number }>()
    
    sortedTransactions.forEach(transaction => {
      const monthKey = `${transaction.date.getFullYear()}-${transaction.date.getMonth()}`
      if (!monthlyTotals.has(monthKey)) {
        monthlyTotals.set(monthKey, { income: 0, expenses: 0 })
      }
      
      const totals = monthlyTotals.get(monthKey)!
      if (transaction.type === 'income') {
        totals.income += transaction.amount
      } else {
        totals.expenses += transaction.amount
      }
    })

    const months = Array.from(monthlyTotals.values())
    if (months.length < 2) {
      return { incomeGrowthRate: 0, expenseGrowthRate: 0, volatility: 0.5, confidence: 0.3 }
    }

    // Calculate growth rates (simplified linear trend)
    const incomes = months.map(m => m.income)
    const expenses = months.map(m => m.expenses)
    
    const incomeGrowthRate = this.calculateGrowthRate(incomes)
    const expenseGrowthRate = this.calculateGrowthRate(expenses)
    const volatility = this.calculateVolatility([...incomes, ...expenses])
    
    // Confidence based on data consistency and amount
    const confidence = Math.min(months.length / 6, 1) * (1 - volatility)

    return {
      incomeGrowthRate,
      expenseGrowthRate,
      volatility,
      confidence
    }
  }

  /**
   * Generate forecast periods for the specified number of days
   */
  private generateForecastPeriods(
    transactions: Transaction[],
    recurringPatterns: RecurringPattern[],
    seasonalPatterns: SeasonalPattern[],
    trends: any,
    currentBalance: number,
    forecastDays: number
  ): ForecastPeriod[] {
    const periods: ForecastPeriod[] = []
    let runningBalance = currentBalance
    
    const today = new Date()
    
    for (let day = 1; day <= forecastDays; day++) {
      const forecastDate = new Date(today)
      forecastDate.setDate(today.getDate() + day)
      
      // Calculate predicted income and expenses for this day
      const { income, expenses, confidence } = this.predictDayValues(
        forecastDate,
        recurringPatterns,
        seasonalPatterns,
        trends,
        transactions
      )
      
      runningBalance += income - expenses
      
      periods.push({
        date: forecastDate,
        predictedIncome: income,
        predictedExpenses: expenses,
        predictedBalance: runningBalance,
        confidence
      })
    }
    
    return periods
  }

  /**
   * Predict income and expenses for a specific day
   */
  private predictDayValues(
    date: Date,
    recurringPatterns: RecurringPattern[],
    seasonalPatterns: SeasonalPattern[],
    trends: any,
    historicalTransactions: Transaction[]
  ): { income: number, expenses: number, confidence: number } {
    let income = 0
    let expenses = 0
    let confidenceSum = 0
    let confidenceCount = 0

    // Check for recurring patterns that might occur on this date
    recurringPatterns.forEach(pattern => {
      const probability = this.calculateOccurrenceProbability(date, pattern)
      if (probability > 0.1) { // 10% threshold
        if (pattern.type === 'income') {
          income += pattern.amount * probability
        } else {
          expenses += pattern.amount * probability
        }
        confidenceSum += pattern.confidence * probability
        confidenceCount++
      }
    })

    // Apply seasonal adjustments
    const month = date.getMonth()
    const seasonalPattern = seasonalPatterns[month]
    if (seasonalPattern && seasonalPattern.confidence > 0.3) {
      // Add base daily averages from seasonal data
      income += seasonalPattern.averageIncome / 30 // Rough daily average
      expenses += seasonalPattern.averageExpenses / 30
      confidenceSum += seasonalPattern.confidence
      confidenceCount++
    }

    // Apply trend adjustments
    if (trends.confidence > 0.4) {
      const daysSinceStart = Math.floor((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      const trendMultiplier = 1 + (daysSinceStart / 365) // Annual trend application
      
      income *= (1 + trends.incomeGrowthRate * trendMultiplier)
      expenses *= (1 + trends.expenseGrowthRate * trendMultiplier)
    }

    // Calculate overall confidence
    const confidence = confidenceCount > 0 ? confidenceSum / confidenceCount : 0.3

    return { income, expenses, confidence }
  }

  /**
   * Calculate summary metrics from forecast periods
   */
  private calculateSummary(
    periods: ForecastPeriod[], 
    transactions: Transaction[], 
    currentBalance: number
  ) {
    const balance30Days = periods[29]?.predictedBalance || currentBalance
    const balance90Days = periods[89]?.predictedBalance || currentBalance

    // Calculate averages from historical data
    const monthlyIncome = this.calculateMonthlyAverage(transactions, 'income')
    const monthlyExpenses = this.calculateMonthlyAverage(transactions, 'expense')

    // Calculate burn rate (months until balance reaches zero)
    const netMonthlyFlow = monthlyIncome - monthlyExpenses
    const burnRate = netMonthlyFlow < 0 ? currentBalance / Math.abs(netMonthlyFlow) : Infinity

    // Calculate overall confidence
    const confidenceScore = periods.length > 0 
      ? periods.reduce((sum, p) => sum + p.confidence, 0) / periods.length 
      : 0

    return {
      currentBalance,
      projectedBalanceIn30Days: balance30Days,
      projectedBalanceIn90Days: balance90Days,
      averageMonthlyIncome: monthlyIncome,
      averageMonthlyExpenses: monthlyExpenses,
      burnRate,
      confidenceScore
    }
  }

  // Helper methods
  private normalizeDescription(description: string): string {
    return description.toLowerCase().replace(/[0-9]/g, '').trim()
  }

  private analyzeTransactionGroup(transactions: Transaction[], description: string): RecurringPattern | null {
    if (transactions.length < 3) return null

    const amounts = transactions.map(t => t.amount)
    const averageAmount = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length
    const dates = transactions.map(t => t.date).sort((a, b) => a.getTime() - b.getTime())

    // Calculate intervals between transactions
    const intervals: number[] = []
    for (let i = 1; i < dates.length; i++) {
      const daysDiff = Math.floor((dates[i].getTime() - dates[i-1].getTime()) / (1000 * 60 * 60 * 24))
      intervals.push(daysDiff)
    }

    const averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length
    
    // Determine frequency
    let frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
    if (averageInterval <= 10) frequency = 'weekly'
    else if (averageInterval <= 40) frequency = 'monthly'
    else if (averageInterval <= 120) frequency = 'quarterly'
    else frequency = 'yearly'

    // Calculate confidence based on consistency
    const intervalVariance = intervals.reduce((sum, interval) => sum + Math.pow(interval - averageInterval, 2), 0) / intervals.length
    const amountVariance = amounts.reduce((sum, amount) => sum + Math.pow(amount - averageAmount, 2), 0) / amounts.length
    
    const confidence = Math.max(0, 1 - (intervalVariance / (averageInterval * averageInterval)) - (amountVariance / (averageAmount * averageAmount)))

    return {
      type: transactions[0].type,
      description,
      amount: averageAmount,
      frequency,
      confidence: Math.min(confidence, 1),
      nextOccurrence: new Date(dates[dates.length - 1].getTime() + averageInterval * 24 * 60 * 60 * 1000)
    }
  }

  private calculateGrowthRate(values: number[]): number {
    if (values.length < 2) return 0
    
    let totalGrowth = 0
    for (let i = 1; i < values.length; i++) {
      if (values[i-1] > 0) {
        totalGrowth += (values[i] - values[i-1]) / values[i-1]
      }
    }
    
    return totalGrowth / (values.length - 1)
  }

  private calculateVolatility(values: number[]): number {
    if (values.length < 2) return 0.5
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    const stdDev = Math.sqrt(variance)
    
    return mean > 0 ? Math.min(stdDev / mean, 1) : 0.5
  }

  private calculateOccurrenceProbability(date: Date, pattern: RecurringPattern): number {
    const daysSinceNext = Math.floor((date.getTime() - pattern.nextOccurrence.getTime()) / (1000 * 60 * 60 * 24))
    
    // Simple probability based on frequency
    const frequencyDays = {
      weekly: 7,
      monthly: 30,
      quarterly: 90,
      yearly: 365
    }
    
    const expectedDays = frequencyDays[pattern.frequency]
    const daysDiff = Math.abs(daysSinceNext % expectedDays)
    
    // Higher probability when closer to expected date
    return Math.max(0, 1 - (daysDiff / expectedDays)) * pattern.confidence
  }

  private calculateMonthlyAverage(transactions: Transaction[], type: 'income' | 'expense'): number {
    const relevantTransactions = transactions.filter(t => t.type === type)
    if (relevantTransactions.length === 0) return 0

    const total = relevantTransactions.reduce((sum, t) => sum + t.amount, 0)
    const oldestDate = Math.min(...relevantTransactions.map(t => t.date.getTime()))
    const monthsSpan = Math.max(1, (Date.now() - oldestDate) / (1000 * 60 * 60 * 24 * 30))
    
    return total / monthsSpan
  }

  private generateInsights(periods: ForecastPeriod[], trends: any, patterns: RecurringPattern[]): string[] {
    const insights: string[] = []

    // Balance trend insights
    if (periods.length >= 30) {
      const balanceChange = periods[29].predictedBalance - periods[0].predictedBalance
      if (balanceChange > 0) {
        insights.push(`Your balance is projected to grow by $${balanceChange.toFixed(2)} over the next 30 days`)
      } else {
        insights.push(`Your balance is projected to decrease by $${Math.abs(balanceChange).toFixed(2)} over the next 30 days`)
      }
    }

    // Recurring pattern insights
    const highConfidencePatterns = patterns.filter(p => p.confidence > 0.7)
    if (highConfidencePatterns.length > 0) {
      insights.push(`Identified ${highConfidencePatterns.length} reliable recurring transactions that help predict your cash flow`)
    }

    // Trend insights
    if (trends.confidence > 0.5) {
      if (trends.incomeGrowthRate > 0.02) {
        insights.push('Your income shows a positive growth trend')
      }
      if (trends.expenseGrowthRate > trends.incomeGrowthRate) {
        insights.push('Your expenses are growing faster than your income - consider reviewing your spending')
      }
    }

    return insights
  }

  private generateWarnings(periods: ForecastPeriod[], summary: any): string[] {
    const warnings: string[] = []

    // Low balance warnings
    if (summary.projectedBalanceIn30Days < 1000) {
      warnings.push('Your projected balance in 30 days is quite low - consider increasing income or reducing expenses')
    }

    // Burn rate warnings
    if (summary.burnRate < 6 && summary.burnRate > 0) {
      warnings.push(`At current spending rate, your balance may reach zero in ${summary.burnRate.toFixed(1)} months`)
    }

    // Confidence warnings
    if (summary.confidenceScore < 0.4) {
      warnings.push('Forecast confidence is low due to limited or inconsistent transaction data')
    }

    // Volatility warnings
    const balanceChanges = periods.slice(1).map((p, i) => p.predictedBalance - periods[i].predictedBalance)
    const volatility = this.calculateVolatility(balanceChanges)
    if (volatility > 0.7) {
      warnings.push('High volatility detected in your cash flow - consider building an emergency fund')
    }

    return warnings
  }
}

// Export singleton instance
export const cashFlowForecastingService = new CashFlowForecastingService()
export default cashFlowForecastingService