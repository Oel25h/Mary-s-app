import { Transaction } from '@/types'

// Seasonal Analysis Types
export interface SeasonalSpendingPattern {
  month: number
  monthName: string
  averageIncome: number
  averageExpenses: number
  netCashFlow: number
  transactionCount: number
  topCategories: Array<{
    category: string
    amount: number
    percentage: number
  }>
  yearOverYearGrowth: number
  confidence: number
}

export interface SeasonalInsight {
  type: 'spending_spike' | 'income_boost' | 'seasonal_trend' | 'anomaly'
  month: number
  description: string
  impact: number
  severity: 'low' | 'medium' | 'high'
  recommendations: string[]
}

export interface HolidayImpact {
  holiday: string
  period: { start: Date, end: Date }
  averageSpending: number
  categoryBreakdown: Record<string, number>
  yearOverYearChange: number
  budgetImpact: number
}

export interface SeasonalForecast {
  month: number
  predictedIncome: number
  predictedExpenses: number
  predictedNetFlow: number
  confidence: number
  adjustmentFactors: Array<{
    factor: string
    impact: number
    reasoning: string
  }>
}

export interface SeasonalAnalysisResult {
  patterns: SeasonalSpendingPattern[]
  insights: SeasonalInsight[]
  holidayImpacts: HolidayImpact[]
  yearlyTrends: {
    income: { trend: 'increasing' | 'decreasing' | 'stable', rate: number }
    expenses: { trend: 'increasing' | 'decreasing' | 'stable', rate: number }
    volatility: number
  }
  recommendations: string[]
  nextMonthForecast: SeasonalForecast
}

/**
 * Seasonal Spending Analysis Service
 * Analyzes spending patterns across seasons and provides insights
 */
class SeasonalAnalysisService {
  private readonly MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  private readonly HOLIDAYS = [
    { name: 'New Year', months: [0], categories: ['Entertainment', 'Food & Dining'] },
    { name: 'Valentine\'s Day', months: [1], categories: ['Entertainment', 'Gifts', 'Food & Dining'] },
    { name: 'Spring Break', months: [2, 3], categories: ['Travel', 'Entertainment'] },
    { name: 'Summer Vacation', months: [5, 6, 7], categories: ['Travel', 'Entertainment', 'Gas & Transportation'] },
    { name: 'Back to School', months: [7, 8], categories: ['Shopping', 'Education'] },
    { name: 'Halloween', months: [9], categories: ['Shopping', 'Entertainment'] },
    { name: 'Thanksgiving', months: [10], categories: ['Food & Dining', 'Travel'] },
    { name: 'Holiday Season', months: [10, 11], categories: ['Shopping', 'Gifts', 'Food & Dining', 'Travel'] }
  ]

  /**
   * Perform comprehensive seasonal analysis
   */
  analyzeSeasonalPatterns(transactions: Transaction[]): SeasonalAnalysisResult {
    if (transactions.length < 50) {
      return this.generateMinimalAnalysis(transactions)
    }

    try {
      // Group transactions by month
      const monthlyData = this.groupTransactionsByMonth(transactions)
      
      // Generate seasonal patterns
      const patterns = this.generateSeasonalPatterns(monthlyData, transactions)
      
      // Identify insights and anomalies
      const insights = this.identifySeasonalInsights(patterns, transactions)
      
      // Analyze holiday impacts
      const holidayImpacts = this.analyzeHolidayImpacts(transactions)
      
      // Calculate yearly trends
      const yearlyTrends = this.calculateYearlyTrends(transactions)
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(patterns, insights, yearlyTrends)
      
      // Forecast next month
      const nextMonthForecast = this.forecastNextMonth(patterns, transactions)

      return {
        patterns,
        insights,
        holidayImpacts,
        yearlyTrends,
        recommendations,
        nextMonthForecast
      }
    } catch (error) {
      console.error('Error in seasonal analysis:', error)
      return this.generateMinimalAnalysis(transactions)
    }
  }

  /**
   * Get seasonal spending recommendations for a specific month
   */
  getMonthlyRecommendations(month: number, transactions: Transaction[]): string[] {
    const analysis = this.analyzeSeasonalPatterns(transactions)
    const monthPattern = analysis.patterns.find(p => p.month === month)
    
    if (!monthPattern) {
      return ['Not enough data for this month - consider tracking more transactions']
    }

    const recommendations: string[] = []
    
    // High spending months
    if (monthPattern.averageExpenses > this.calculateOverallAverageExpenses(transactions) * 1.2) {
      recommendations.push(`${this.MONTHS[month]} typically has high expenses. Plan and budget accordingly.`)
      recommendations.push(`Consider setting aside extra funds in the months leading up to ${this.MONTHS[month]}.`)
    }
    
    // Low income months
    if (monthPattern.averageIncome < this.calculateOverallAverageIncome(transactions) * 0.8) {
      recommendations.push(`Income tends to be lower in ${this.MONTHS[month]}. Prepare for reduced cash flow.`)
    }
    
    // Category-specific recommendations
    monthPattern.topCategories.slice(0, 2).forEach(category => {
      if (category.percentage > 30) {
        recommendations.push(`${category.category} spending peaks in ${this.MONTHS[month]} (${category.percentage.toFixed(1)}% of expenses).`)
      }
    })
    
    // Holiday-related recommendations
    const holidayImpact = analysis.holidayImpacts.find(h => 
      h.period.start.getMonth() === month || h.period.end.getMonth() === month
    )
    
    if (holidayImpact) {
      recommendations.push(`${holidayImpact.holiday} affects spending this month. Budget an extra $${holidayImpact.averageSpending.toFixed(0)}.`)
    }

    return recommendations.length > 0 ? recommendations : ['Spending patterns are relatively stable for this month.']
  }

  /**
   * Compare spending across seasons
   */
  compareSeasons(transactions: Transaction[]): {
    spring: { income: number, expenses: number, net: number }
    summer: { income: number, expenses: number, net: number }
    fall: { income: number, expenses: number, net: number }
    winter: { income: number, expenses: number, net: number }
    insights: string[]
  } {
    const seasons = {
      spring: [2, 3, 4], // Mar, Apr, May
      summer: [5, 6, 7], // Jun, Jul, Aug
      fall: [8, 9, 10],  // Sep, Oct, Nov
      winter: [11, 0, 1] // Dec, Jan, Feb
    }

    const seasonalData = Object.entries(seasons).reduce((acc, [season, months]) => {
      const seasonTransactions = transactions.filter(t => months.includes(t.date.getMonth()))
      
      const income = seasonTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0) / (months.length * this.getYearsOfData(transactions))

      const expenses = seasonTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0) / (months.length * this.getYearsOfData(transactions))

      acc[season as keyof typeof acc] = {
        income: income || 0,
        expenses: expenses || 0,
        net: (income || 0) - (expenses || 0)
      }
      
      return acc
    }, {} as { [key: string]: { income: number, expenses: number, net: number } })

    // Generate insights
    const insights: string[] = []
    const seasonNames = Object.keys(seasonalData)
    
    // Find highest/lowest spending seasons
    const expenseRanking = seasonNames.sort((a, b) => seasonalData[b].expenses - seasonalData[a].expenses)
    insights.push(`Highest spending season: ${expenseRanking[0]} ($${seasonalData[expenseRanking[0]].expenses.toFixed(0)}/month)`)
    insights.push(`Lowest spending season: ${expenseRanking[expenseRanking.length - 1]} ($${seasonalData[expenseRanking[expenseRanking.length - 1]].expenses.toFixed(0)}/month)`)
    
    // Find best cash flow season
    const netRanking = seasonNames.sort((a, b) => seasonalData[b].net - seasonalData[a].net)
    insights.push(`Best cash flow season: ${netRanking[0]} (net $${seasonalData[netRanking[0]].net.toFixed(0)}/month)`)

    return {
      ...seasonalData,
      insights
    } as any
  }

  // Private helper methods

  private groupTransactionsByMonth(transactions: Transaction[]): Map<number, Transaction[]> {
    const monthlyData = new Map<number, Transaction[]>()
    
    for (let month = 0; month < 12; month++) {
      monthlyData.set(month, [])
    }
    
    transactions.forEach(transaction => {
      const month = transaction.date.getMonth()
      monthlyData.get(month)!.push(transaction)
    })
    
    return monthlyData
  }

  private generateSeasonalPatterns(
    monthlyData: Map<number, Transaction[]>, 
    allTransactions: Transaction[]
  ): SeasonalSpendingPattern[] {
    const patterns: SeasonalSpendingPattern[] = []
    
    monthlyData.forEach((transactions, month) => {
      const income = transactions.filter(t => t.type === 'income')
      const expenses = transactions.filter(t => t.type === 'expense')
      
      const avgIncome = this.calculateMonthlyAverage(income, allTransactions)
      const avgExpenses = this.calculateMonthlyAverage(expenses, allTransactions)
      
      // Calculate top categories for this month
      const categoryTotals = new Map<string, number>()
      expenses.forEach(t => {
        categoryTotals.set(t.category, (categoryTotals.get(t.category) || 0) + t.amount)
      })
      
      const totalExpenses = Array.from(categoryTotals.values()).reduce((sum, amount) => sum + amount, 0)
      const topCategories = Array.from(categoryTotals.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([category, amount]) => ({
          category,
          amount: amount / this.getYearsOfData(allTransactions),
          percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
        }))

      // Calculate year-over-year growth
      const yoyGrowth = this.calculateYearOverYearGrowth(transactions, month, allTransactions)
      
      // Calculate confidence based on data points
      const confidence = Math.min(transactions.length / 20, 1) // Full confidence at 20+ transactions
      
      patterns.push({
        month,
        monthName: this.MONTHS[month],
        averageIncome: avgIncome,
        averageExpenses: avgExpenses,
        netCashFlow: avgIncome - avgExpenses,
        transactionCount: transactions.length,
        topCategories,
        yearOverYearGrowth: yoyGrowth,
        confidence
      })
    })
    
    return patterns
  }

  private identifySeasonalInsights(patterns: SeasonalSpendingPattern[], transactions: Transaction[]): SeasonalInsight[] {
    const insights: SeasonalInsight[] = []
    
    const avgExpenses = patterns.reduce((sum, p) => sum + p.averageExpenses, 0) / patterns.length
    const avgIncome = patterns.reduce((sum, p) => sum + p.averageIncome, 0) / patterns.length
    
    patterns.forEach(pattern => {
      // Identify spending spikes
      if (pattern.averageExpenses > avgExpenses * 1.3) {
        insights.push({
          type: 'spending_spike',
          month: pattern.month,
          description: `${pattern.monthName} shows significantly higher spending (${((pattern.averageExpenses / avgExpenses - 1) * 100).toFixed(1)}% above average)`,
          impact: pattern.averageExpenses - avgExpenses,
          severity: pattern.averageExpenses > avgExpenses * 1.5 ? 'high' : 'medium',
          recommendations: [
            `Plan additional budget for ${pattern.monthName}`,
            `Save extra in preceding months to cover increased expenses`
          ]
        })
      }
      
      // Identify income boosts
      if (pattern.averageIncome > avgIncome * 1.2) {
        insights.push({
          type: 'income_boost',
          month: pattern.month,
          description: `${pattern.monthName} typically brings higher income (${((pattern.averageIncome / avgIncome - 1) * 100).toFixed(1)}% above average)`,
          impact: pattern.averageIncome - avgIncome,
          severity: 'low',
          recommendations: [
            `Take advantage of higher income to boost savings`,
            `Consider making extra debt payments during this period`
          ]
        })
      }
      
      // Identify concerning cash flow
      if (pattern.netCashFlow < -1000) {
        insights.push({
          type: 'anomaly',
          month: pattern.month,
          description: `${pattern.monthName} shows negative cash flow of $${Math.abs(pattern.netCashFlow).toFixed(0)}`,
          impact: pattern.netCashFlow,
          severity: Math.abs(pattern.netCashFlow) > 2000 ? 'high' : 'medium',
          recommendations: [
            `Review and reduce expenses during ${pattern.monthName}`,
            `Build emergency fund to cover cash flow gaps`
          ]
        })
      }
    })
    
    return insights.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
  }

  private analyzeHolidayImpacts(transactions: Transaction[]): HolidayImpact[] {
    const impacts: HolidayImpact[] = []
    
    this.HOLIDAYS.forEach(holiday => {
      const holidayTransactions = transactions.filter(t => 
        holiday.months.includes(t.date.getMonth()) &&
        holiday.categories.some(cat => t.category.includes(cat) || cat.includes(t.category))
      )
      
      if (holidayTransactions.length < 3) return // Not enough data
      
      const categoryBreakdown: Record<string, number> = {}
      let totalSpending = 0
      
      holidayTransactions.filter(t => t.type === 'expense').forEach(t => {
        categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount
        totalSpending += t.amount
      })
      
      const yearsOfData = this.getYearsOfData(transactions)
      const averageSpending = totalSpending / Math.max(yearsOfData, 1)
      
      // Calculate year-over-year change (simplified)
      const yoyChange = 0 // Would need more complex logic for actual calculation
      
      impacts.push({
        holiday: holiday.name,
        period: {
          start: new Date(new Date().getFullYear(), Math.min(...holiday.months), 1),
          end: new Date(new Date().getFullYear(), Math.max(...holiday.months) + 1, 0)
        },
        averageSpending,
        categoryBreakdown: Object.fromEntries(
          Object.entries(categoryBreakdown).map(([cat, amount]) => [cat, amount / Math.max(yearsOfData, 1)])
        ),
        yearOverYearChange: yoyChange,
        budgetImpact: averageSpending
      })
    })
    
    return impacts.sort((a, b) => b.averageSpending - a.averageSpending)
  }

  private calculateYearlyTrends(transactions: Transaction[]): {
    income: { trend: 'increasing' | 'decreasing' | 'stable', rate: number }
    expenses: { trend: 'increasing' | 'decreasing' | 'stable', rate: number }
    volatility: number
  } {
    const yearlyData = this.groupTransactionsByYear(transactions)
    
    if (yearlyData.size < 2) {
      return {
        income: { trend: 'stable', rate: 0 },
        expenses: { trend: 'stable', rate: 0 },
        volatility: 0.2
      }
    }
    
    const years = Array.from(yearlyData.keys()).sort()
    const incomeByYear = years.map(year => {
      const yearTransactions = yearlyData.get(year)!
      return yearTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    })
    
    const expensesByYear = years.map(year => {
      const yearTransactions = yearlyData.get(year)!
      return yearTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    })
    
    const incomeGrowthRate = this.calculateGrowthRate(incomeByYear)
    const expenseGrowthRate = this.calculateGrowthRate(expensesByYear)
    
    const volatility = this.calculateVolatility([...incomeByYear, ...expensesByYear])
    
    return {
      income: {
        trend: incomeGrowthRate > 0.05 ? 'increasing' : incomeGrowthRate < -0.05 ? 'decreasing' : 'stable',
        rate: incomeGrowthRate
      },
      expenses: {
        trend: expenseGrowthRate > 0.05 ? 'increasing' : expenseGrowthRate < -0.05 ? 'decreasing' : 'stable',
        rate: expenseGrowthRate
      },
      volatility
    }
  }

  private generateRecommendations(
    patterns: SeasonalSpendingPattern[],
    insights: SeasonalInsight[],
    trends: any
  ): string[] {
    const recommendations: string[] = []
    
    // High volatility recommendations
    const monthlyExpenses = patterns.map(p => p.averageExpenses)
    const expenseVolatility = this.calculateVolatility(monthlyExpenses)
    
    if (expenseVolatility > 0.3) {
      recommendations.push('Your spending varies significantly by month. Consider creating a seasonal budget plan.')
      recommendations.push('Build a larger emergency fund to handle seasonal expense fluctuations.')
    }
    
    // Trend-based recommendations
    if (trends.expenses.trend === 'increasing' && trends.expenses.rate > 0.1) {
      recommendations.push('Your expenses are trending upward. Review and optimize your spending habits.')
    }
    
    if (trends.income.trend === 'decreasing') {
      recommendations.push('Your income shows a declining trend. Consider diversifying income sources.')
    }
    
    // High-impact insight recommendations
    const highImpactInsights = insights.filter(i => i.severity === 'high')
    highImpactInsights.forEach(insight => {
      recommendations.push(...insight.recommendations)
    })
    
    // Seasonal planning recommendations
    const highSpendingMonths = patterns.filter(p => p.averageExpenses > this.calculateAverage(patterns.map(p => p.averageExpenses)) * 1.2)
    if (highSpendingMonths.length > 0) {
      const monthNames = highSpendingMonths.map(p => p.monthName).join(', ')
      recommendations.push(`Plan ahead for higher spending months: ${monthNames}`)
    }
    
    return recommendations.slice(0, 8) // Limit to most important recommendations
  }

  private forecastNextMonth(patterns: SeasonalSpendingPattern[], transactions: Transaction[]): SeasonalForecast {
    const nextMonth = new Date().getMonth()
    const pattern = patterns.find(p => p.month === nextMonth)
    
    if (!pattern) {
      return {
        month: nextMonth,
        predictedIncome: 0,
        predictedExpenses: 0,
        predictedNetFlow: 0,
        confidence: 0,
        adjustmentFactors: []
      }
    }
    
    const adjustmentFactors: Array<{ factor: string, impact: number, reasoning: string }> = []
    
    // Base prediction from historical data
    let predictedIncome = pattern.averageIncome
    let predictedExpenses = pattern.averageExpenses
    
    // Apply trend adjustments
    const trends = this.calculateYearlyTrends(transactions)
    if (trends.income.rate !== 0) {
      const incomeAdjustment = predictedIncome * trends.income.rate / 12
      predictedIncome += incomeAdjustment
      adjustmentFactors.push({
        factor: 'Income Trend',
        impact: incomeAdjustment,
        reasoning: `Applied ${(trends.income.rate * 100).toFixed(1)}% annual income growth rate`
      })
    }
    
    if (trends.expenses.rate !== 0) {
      const expenseAdjustment = predictedExpenses * trends.expenses.rate / 12
      predictedExpenses += expenseAdjustment
      adjustmentFactors.push({
        factor: 'Expense Trend',
        impact: expenseAdjustment,
        reasoning: `Applied ${(trends.expenses.rate * 100).toFixed(1)}% annual expense growth rate`
      })
    }
    
    return {
      month: nextMonth,
      predictedIncome,
      predictedExpenses,
      predictedNetFlow: predictedIncome - predictedExpenses,
      confidence: pattern.confidence,
      adjustmentFactors
    }
  }

  // Additional helper methods
  private calculateMonthlyAverage(transactions: Transaction[], allTransactions: Transaction[]): number {
    if (transactions.length === 0) return 0
    
    const total = transactions.reduce((sum, t) => sum + t.amount, 0)
    const yearsOfData = this.getYearsOfData(allTransactions)
    
    return total / Math.max(yearsOfData, 1)
  }

  private getYearsOfData(transactions: Transaction[]): number {
    if (transactions.length === 0) return 1
    
    const dates = transactions.map(t => t.date.getTime())
    const minDate = Math.min(...dates)
    const maxDate = Math.max(...dates)
    const yearsDiff = (maxDate - minDate) / (1000 * 60 * 60 * 24 * 365)
    
    return Math.max(yearsDiff, 1)
  }

  private calculateYearOverYearGrowth(monthTransactions: Transaction[], month: number, allTransactions: Transaction[]): number {
    const currentYear = new Date().getFullYear()
    const previousYear = currentYear - 1
    
    const currentYearTransactions = monthTransactions.filter(t => t.date.getFullYear() === currentYear)
    const previousYearTransactions = monthTransactions.filter(t => t.date.getFullYear() === previousYear)
    
    if (previousYearTransactions.length === 0) return 0
    
    const currentTotal = currentYearTransactions.reduce((sum, t) => sum + t.amount, 0)
    const previousTotal = previousYearTransactions.reduce((sum, t) => sum + t.amount, 0)
    
    return previousTotal > 0 ? (currentTotal - previousTotal) / previousTotal : 0
  }

  private groupTransactionsByYear(transactions: Transaction[]): Map<number, Transaction[]> {
    const yearlyData = new Map<number, Transaction[]>()
    
    transactions.forEach(transaction => {
      const year = transaction.date.getFullYear()
      if (!yearlyData.has(year)) {
        yearlyData.set(year, [])
      }
      yearlyData.get(year)!.push(transaction)
    })
    
    return yearlyData
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
    if (values.length < 2) return 0
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    const stdDev = Math.sqrt(variance)
    
    return mean > 0 ? Math.min(stdDev / mean, 1) : 0.5
  }

  private calculateAverage(values: number[]): number {
    return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0
  }

  private calculateOverallAverageExpenses(transactions: Transaction[]): number {
    const expenses = transactions.filter(t => t.type === 'expense')
    return this.calculateMonthlyAverage(expenses, transactions)
  }

  private calculateOverallAverageIncome(transactions: Transaction[]): number {
    const income = transactions.filter(t => t.type === 'income')
    return this.calculateMonthlyAverage(income, transactions)
  }

  private generateMinimalAnalysis(transactions: Transaction[]): SeasonalAnalysisResult {
    return {
      patterns: [],
      insights: [{
        type: 'anomaly',
        month: new Date().getMonth(),
        description: 'Not enough transaction data for seasonal analysis',
        impact: 0,
        severity: 'low',
        recommendations: ['Add more transaction history to enable seasonal insights']
      }],
      holidayImpacts: [],
      yearlyTrends: {
        income: { trend: 'stable', rate: 0 },
        expenses: { trend: 'stable', rate: 0 },
        volatility: 0.2
      },
      recommendations: [
        'Import more historical transaction data to enable seasonal analysis',
        'Track transactions for at least 6 months to see meaningful patterns'
      ],
      nextMonthForecast: {
        month: new Date().getMonth(),
        predictedIncome: 0,
        predictedExpenses: 0,
        predictedNetFlow: 0,
        confidence: 0,
        adjustmentFactors: []
      }
    }
  }
}

// Export singleton instance
export const seasonalAnalysisService = new SeasonalAnalysisService()
export default seasonalAnalysisService