import { Transaction, Budget } from '@/types'
import { cashFlowForecastingService } from './cashFlowForecastingService'

// Balance Prediction Types
export interface BalancePrediction {
  date: Date
  predictedBalance: number
  scenarios: {
    optimistic: number
    realistic: number
    pessimistic: number
  }
  confidence: number
  factors: PredictionFactor[]
}

export interface PredictionFactor {
  type: 'income' | 'expense' | 'recurring' | 'seasonal'
  description: string
  impact: number // Positive or negative impact on balance
  probability: number // 0-1
  timeframe: 'immediate' | 'short-term' | 'long-term'
}

export interface ScenarioAnalysis {
  scenarios: {
    optimistic: ScenarioOutcome
    realistic: ScenarioOutcome
    pessimistic: ScenarioOutcome
  }
  recommendations: string[]
  riskAssessment: {
    level: 'low' | 'medium' | 'high'
    factors: string[]
    mitigation: string[]
  }
}

export interface ScenarioOutcome {
  balanceIn30Days: number
  balanceIn90Days: number
  balanceIn1Year: number
  cashFlowHealth: 'excellent' | 'good' | 'fair' | 'poor'
  keyEvents: Array<{
    date: Date
    event: string
    balanceImpact: number
  }>
}

export interface WhatIfScenario {
  name: string
  changes: {
    incomeChange?: number // Monthly change
    expenseChange?: number // Monthly change
    oneTimeIncome?: number // One-time income boost
    oneTimeExpense?: number // One-time expense
    recurringIncome?: { amount: number, frequency: 'weekly' | 'monthly' | 'quarterly' }
    recurringExpense?: { amount: number, frequency: 'weekly' | 'monthly' | 'quarterly' }
  }
}

/**
 * Enhanced Balance Prediction Service
 * Provides detailed balance predictions with scenario analysis
 */
class BalancePredictionService {
  /**
   * Generate detailed balance predictions with multiple scenarios
   */
  generateBalancePredictions(
    transactions: Transaction[],
    currentBalance: number,
    predictionDays: number = 365
  ): BalancePrediction[] {
    const predictions: BalancePrediction[] = []
    
    // Get base forecast from cash flow service
    const forecast = cashFlowForecastingService.generateForecast(transactions, currentBalance, predictionDays)
    
    // Generate predictions for specific intervals
    const targetDays = [7, 14, 30, 60, 90, 180, 365]
    
    targetDays.forEach(days => {
      if (days <= predictionDays && forecast.periods[days - 1]) {
        const period = forecast.periods[days - 1]
        
        // Calculate scenario variations
        const scenarios = this.calculateScenarios(
          period.predictedBalance,
          transactions,
          days,
          currentBalance
        )
        
        // Identify prediction factors
        const factors = this.identifyPredictionFactors(transactions, days)
        
        predictions.push({
          date: period.date,
          predictedBalance: period.predictedBalance,
          scenarios,
          confidence: period.confidence,
          factors
        })
      }
    })
    
    return predictions
  }

  /**
   * Perform comprehensive scenario analysis
   */
  performScenarioAnalysis(
    transactions: Transaction[],
    currentBalance: number
  ): ScenarioAnalysis {
    const basePredicttions = this.generateBalancePredictions(transactions, currentBalance)
    
    // Calculate scenarios
    const optimistic = this.calculateOptimisticScenario(transactions, currentBalance)
    const realistic = this.calculateRealisticScenario(transactions, currentBalance)
    const pessimistic = this.calculatePessimisticScenario(transactions, currentBalance)
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(
      { optimistic, realistic, pessimistic },
      transactions,
      currentBalance
    )
    
    // Assess risk
    const riskAssessment = this.assessRisk(transactions, currentBalance, realistic)
    
    return {
      scenarios: { optimistic, realistic, pessimistic },
      recommendations,
      riskAssessment
    }
  }

  /**
   * Analyze "what-if" scenarios
   */
  analyzeWhatIfScenario(
    transactions: Transaction[],
    currentBalance: number,
    scenario: WhatIfScenario
  ): {
    originalBalance: number
    modifiedBalance: number
    balanceDifference: number
    percentageChange: number
    timeline: BalancePrediction[]
  } {
    // Get original predictions
    const originalPredictions = this.generateBalancePredictions(transactions, currentBalance, 365)
    const originalBalance = originalPredictions.find(p => 
      Math.abs(p.date.getTime() - new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).getTime()) < 24 * 60 * 60 * 1000
    )?.predictedBalance || currentBalance

    // Apply scenario changes to transactions
    const modifiedTransactions = this.applyScenarioChanges(transactions, scenario)
    
    // Get modified predictions
    const modifiedPredictions = this.generateBalancePredictions(modifiedTransactions, currentBalance, 365)
    const modifiedBalance = modifiedPredictions.find(p => 
      Math.abs(p.date.getTime() - new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).getTime()) < 24 * 60 * 60 * 1000
    )?.predictedBalance || currentBalance

    const balanceDifference = modifiedBalance - originalBalance
    const percentageChange = originalBalance !== 0 ? (balanceDifference / originalBalance) * 100 : 0

    return {
      originalBalance,
      modifiedBalance,
      balanceDifference,
      percentageChange,
      timeline: modifiedPredictions
    }
  }

  // Private helper methods

  private calculateScenarios(
    baseBalance: number,
    transactions: Transaction[],
    days: number,
    currentBalance: number
  ) {
    // Calculate variance based on historical volatility
    const volatility = this.calculateHistoricalVolatility(transactions)
    
    // Optimistic: 20% better than predicted
    const optimistic = baseBalance + (baseBalance - currentBalance) * 0.2
    
    // Realistic: Base prediction
    const realistic = baseBalance
    
    // Pessimistic: 20% worse than predicted, considering volatility
    const pessimistic = baseBalance - (baseBalance - currentBalance) * (0.2 + volatility)
    
    return {
      optimistic: Math.max(optimistic, 0),
      realistic: Math.max(realistic, 0),
      pessimistic: Math.max(pessimistic, 0)
    }
  }

  private identifyPredictionFactors(transactions: Transaction[], days: number): PredictionFactor[] {
    const factors: PredictionFactor[] = []
    
    // Analyze recurring transactions
    const recurringIncome = this.findRecurringTransactions(transactions, 'income')
    const recurringExpenses = this.findRecurringTransactions(transactions, 'expense')
    
    recurringIncome.forEach(pattern => {
      factors.push({
        type: 'recurring',
        description: `Recurring income: ${pattern.description}`,
        impact: pattern.amount * this.calculateOccurrences(pattern.frequency, days),
        probability: pattern.confidence,
        timeframe: days <= 30 ? 'short-term' : days <= 90 ? 'short-term' : 'long-term'
      })
    })
    
    recurringExpenses.forEach(pattern => {
      factors.push({
        type: 'recurring',
        description: `Recurring expense: ${pattern.description}`,
        impact: -pattern.amount * this.calculateOccurrences(pattern.frequency, days),
        probability: pattern.confidence,
        timeframe: days <= 30 ? 'short-term' : days <= 90 ? 'short-term' : 'long-term'
      })
    })
    
    // Seasonal factors
    if (days >= 90) {
      const seasonalFactors = this.identifySeasonalFactors(transactions, days)
      factors.push(...seasonalFactors)
    }
    
    return factors.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact)).slice(0, 10)
  }

  private calculateOptimisticScenario(transactions: Transaction[], currentBalance: number): ScenarioOutcome {
    // Assume 15% income increase and 10% expense decrease
    const modifiedTransactions = transactions.map(t => ({
      ...t,
      amount: t.type === 'income' ? t.amount * 1.15 : t.amount * 0.9
    }))
    
    const forecast = cashFlowForecastingService.generateForecast(modifiedTransactions, currentBalance, 365)
    
    return {
      balanceIn30Days: forecast.periods[29]?.predictedBalance || currentBalance,
      balanceIn90Days: forecast.periods[89]?.predictedBalance || currentBalance,
      balanceIn1Year: forecast.periods[364]?.predictedBalance || currentBalance,
      cashFlowHealth: this.assessCashFlowHealth(forecast.summary.averageMonthlyIncome, forecast.summary.averageMonthlyExpenses),
      keyEvents: this.identifyKeyEvents(forecast.periods, 'optimistic')
    }
  }

  private calculateRealisticScenario(transactions: Transaction[], currentBalance: number): ScenarioOutcome {
    const forecast = cashFlowForecastingService.generateForecast(transactions, currentBalance, 365)
    
    return {
      balanceIn30Days: forecast.periods[29]?.predictedBalance || currentBalance,
      balanceIn90Days: forecast.periods[89]?.predictedBalance || currentBalance,
      balanceIn1Year: forecast.periods[364]?.predictedBalance || currentBalance,
      cashFlowHealth: this.assessCashFlowHealth(forecast.summary.averageMonthlyIncome, forecast.summary.averageMonthlyExpenses),
      keyEvents: this.identifyKeyEvents(forecast.periods, 'realistic')
    }
  }

  private calculatePessimisticScenario(transactions: Transaction[], currentBalance: number): ScenarioOutcome {
    // Assume 10% income decrease and 15% expense increase
    const modifiedTransactions = transactions.map(t => ({
      ...t,
      amount: t.type === 'income' ? t.amount * 0.9 : t.amount * 1.15
    }))
    
    const forecast = cashFlowForecastingService.generateForecast(modifiedTransactions, currentBalance, 365)
    
    return {
      balanceIn30Days: forecast.periods[29]?.predictedBalance || currentBalance,
      balanceIn90Days: forecast.periods[89]?.predictedBalance || currentBalance,
      balanceIn1Year: forecast.periods[364]?.predictedBalance || currentBalance,
      cashFlowHealth: this.assessCashFlowHealth(forecast.summary.averageMonthlyIncome, forecast.summary.averageMonthlyExpenses),
      keyEvents: this.identifyKeyEvents(forecast.periods, 'pessimistic')
    }
  }

  private generateRecommendations(
    scenarios: { optimistic: ScenarioOutcome, realistic: ScenarioOutcome, pessimistic: ScenarioOutcome },
    transactions: Transaction[],
    currentBalance: number
  ): string[] {
    const recommendations: string[] = []
    
    // Balance-based recommendations
    if (scenarios.realistic.balanceIn30Days < currentBalance * 0.8) {
      recommendations.push('Consider reducing expenses or increasing income to maintain financial stability')
    }
    
    if (scenarios.pessimistic.balanceIn90Days < 1000) {
      recommendations.push('Build an emergency fund to protect against financial shocks')
    }
    
    if (scenarios.optimistic.balanceIn1Year > currentBalance * 3) {
      recommendations.push('Consider investing excess funds to maximize growth potential')
    }
    
    // Cash flow health recommendations
    if (scenarios.realistic.cashFlowHealth === 'poor') {
      recommendations.push('Review and optimize your budget to improve cash flow health')
    }
    
    // Income stability recommendations
    const incomeVariability = this.calculateIncomeVariability(transactions)
    if (incomeVariability > 0.3) {
      recommendations.push('Consider diversifying income sources to reduce financial volatility')
    }
    
    return recommendations
  }

  private assessRisk(
    transactions: Transaction[],
    currentBalance: number,
    realisticScenario: ScenarioOutcome
  ): { level: 'low' | 'medium' | 'high', factors: string[], mitigation: string[] } {
    const riskFactors: string[] = []
    const mitigation: string[] = []
    
    // Low balance risk
    if (realisticScenario.balanceIn90Days < currentBalance * 0.5) {
      riskFactors.push('Projected significant balance decline')
      mitigation.push('Create a detailed budget and spending plan')
    }
    
    // Income dependency risk
    const incomeConcentration = this.calculateIncomeConcentration(transactions)
    if (incomeConcentration > 0.8) {
      riskFactors.push('High dependency on single income source')
      mitigation.push('Develop alternative income streams')
    }
    
    // Expense volatility risk
    const expenseVolatility = this.calculateExpenseVolatility(transactions)
    if (expenseVolatility > 0.4) {
      riskFactors.push('High expense volatility')
      mitigation.push('Create emergency fund for unexpected expenses')
    }
    
    // Determine overall risk level
    let riskLevel: 'low' | 'medium' | 'high' = 'low'
    if (riskFactors.length >= 3) riskLevel = 'high'
    else if (riskFactors.length >= 1) riskLevel = 'medium'
    
    return { level: riskLevel, factors: riskFactors, mitigation }
  }

  // Additional helper methods
  private calculateHistoricalVolatility(transactions: Transaction[]): number {
    const monthlyBalances = this.calculateMonthlyBalances(transactions)
    if (monthlyBalances.length < 2) return 0.2 // Default volatility
    
    const mean = monthlyBalances.reduce((sum, b) => sum + b, 0) / monthlyBalances.length
    const variance = monthlyBalances.reduce((sum, b) => sum + Math.pow(b - mean, 2), 0) / monthlyBalances.length
    const stdDev = Math.sqrt(variance)
    
    return mean > 0 ? Math.min(stdDev / mean, 1) : 0.2
  }

  private findRecurringTransactions(transactions: Transaction[], type: 'income' | 'expense') {
    // Simplified recurring transaction detection
    const relevantTransactions = transactions.filter(t => t.type === type)
    const grouped = new Map<string, Transaction[]>()
    
    relevantTransactions.forEach(t => {
      const key = t.description.toLowerCase().substring(0, 20)
      if (!grouped.has(key)) grouped.set(key, [])
      grouped.get(key)!.push(t)
    })
    
    return Array.from(grouped.entries())
      .filter(([_, txns]) => txns.length >= 3)
      .map(([desc, txns]) => ({
        description: desc,
        amount: txns.reduce((sum, t) => sum + t.amount, 0) / txns.length,
        frequency: 'monthly' as const,
        confidence: Math.min(txns.length / 12, 1)
      }))
  }

  private calculateOccurrences(frequency: string, days: number): number {
    const frequencyMap = { weekly: 7, monthly: 30, quarterly: 90, yearly: 365 }
    return Math.floor(days / (frequencyMap[frequency as keyof typeof frequencyMap] || 30))
  }

  private identifySeasonalFactors(transactions: Transaction[], days: number): PredictionFactor[] {
    // Simplified seasonal analysis
    const factors: PredictionFactor[] = []
    
    // Holiday spending factor
    const currentMonth = new Date().getMonth()
    if (currentMonth >= 10 && days >= 60) { // Nov-Dec period
      factors.push({
        type: 'seasonal',
        description: 'Holiday season increased spending',
        impact: -this.calculateAverageMonthlyExpenses(transactions) * 0.3,
        probability: 0.8,
        timeframe: 'short-term'
      })
    }
    
    return factors
  }

  private calculateMonthlyBalances(transactions: Transaction[]): number[] {
    const monthlyMap = new Map<string, number>()
    let runningBalance = 0
    
    transactions.sort((a, b) => a.date.getTime() - b.date.getTime())
    
    transactions.forEach(t => {
      const monthKey = `${t.date.getFullYear()}-${t.date.getMonth()}`
      runningBalance += t.type === 'income' ? t.amount : -t.amount
      monthlyMap.set(monthKey, runningBalance)
    })
    
    return Array.from(monthlyMap.values())
  }

  private assessCashFlowHealth(avgIncome: number, avgExpenses: number): 'excellent' | 'good' | 'fair' | 'poor' {
    const ratio = avgIncome / (avgExpenses || 1)
    if (ratio >= 1.5) return 'excellent'
    if (ratio >= 1.2) return 'good'
    if (ratio >= 1.0) return 'fair'
    return 'poor'
  }

  private identifyKeyEvents(periods: any[], scenario: string): Array<{ date: Date, event: string, balanceImpact: number }> {
    const events: Array<{ date: Date, event: string, balanceImpact: number }> = []
    
    // Find significant balance changes
    for (let i = 1; i < periods.length; i++) {
      const change = periods[i].predictedBalance - periods[i-1].predictedBalance
      if (Math.abs(change) > 1000) {
        events.push({
          date: periods[i].date,
          event: change > 0 ? 'Significant income event' : 'Large expense event',
          balanceImpact: change
        })
      }
    }
    
    return events.slice(0, 5) // Top 5 events
  }

  private calculateIncomeVariability(transactions: Transaction[]): number {
    const incomeTransactions = transactions.filter(t => t.type === 'income')
    if (incomeTransactions.length < 2) return 0
    
    const amounts = incomeTransactions.map(t => t.amount)
    const mean = amounts.reduce((sum, a) => sum + a, 0) / amounts.length
    const variance = amounts.reduce((sum, a) => sum + Math.pow(a - mean, 2), 0) / amounts.length
    
    return mean > 0 ? Math.sqrt(variance) / mean : 0
  }

  private calculateIncomeConcentration(transactions: Transaction[]): number {
    const incomeBySource = new Map<string, number>()
    let totalIncome = 0
    
    transactions.filter(t => t.type === 'income').forEach(t => {
      const source = t.description.substring(0, 20)
      incomeBySource.set(source, (incomeBySource.get(source) || 0) + t.amount)
      totalIncome += t.amount
    })
    
    const maxSource = Math.max(...Array.from(incomeBySource.values()))
    return totalIncome > 0 ? maxSource / totalIncome : 0
  }

  private calculateExpenseVolatility(transactions: Transaction[]): number {
    const expenseTransactions = transactions.filter(t => t.type === 'expense')
    if (expenseTransactions.length < 2) return 0
    
    const amounts = expenseTransactions.map(t => t.amount)
    const mean = amounts.reduce((sum, a) => sum + a, 0) / amounts.length
    const variance = amounts.reduce((sum, a) => sum + Math.pow(a - mean, 2), 0) / amounts.length
    
    return mean > 0 ? Math.sqrt(variance) / mean : 0
  }

  private calculateAverageMonthlyExpenses(transactions: Transaction[]): number {
    const expenseTransactions = transactions.filter(t => t.type === 'expense')
    if (expenseTransactions.length === 0) return 0
    
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0)
    const oldestDate = Math.min(...expenseTransactions.map(t => t.date.getTime()))
    const monthsSpan = Math.max(1, (Date.now() - oldestDate) / (1000 * 60 * 60 * 24 * 30))
    
    return totalExpenses / monthsSpan
  }

  private applyScenarioChanges(transactions: Transaction[], scenario: WhatIfScenario): Transaction[] {
    let modifiedTransactions = [...transactions]
    
    // Apply monthly changes to existing transactions
    if (scenario.changes.incomeChange) {
      modifiedTransactions = modifiedTransactions.map(t => 
        t.type === 'income' 
          ? { ...t, amount: t.amount + scenario.changes.incomeChange! }
          : t
      )
    }
    
    if (scenario.changes.expenseChange) {
      modifiedTransactions = modifiedTransactions.map(t => 
        t.type === 'expense' 
          ? { ...t, amount: t.amount + scenario.changes.expenseChange! }
          : t
      )
    }
    
    // Add one-time transactions
    if (scenario.changes.oneTimeIncome) {
      modifiedTransactions.push({
        id: 'scenario-income',
        date: new Date(),
        description: `${scenario.name} - One-time income`,
        category: 'Income',
        amount: scenario.changes.oneTimeIncome,
        type: 'income'
      })
    }
    
    if (scenario.changes.oneTimeExpense) {
      modifiedTransactions.push({
        id: 'scenario-expense',
        date: new Date(),
        description: `${scenario.name} - One-time expense`,
        category: 'Other',
        amount: scenario.changes.oneTimeExpense,
        type: 'expense'
      })
    }
    
    // Add recurring transactions (simplified)
    if (scenario.changes.recurringIncome) {
      const { amount, frequency } = scenario.changes.recurringIncome
      const occurrences = frequency === 'weekly' ? 52 : frequency === 'monthly' ? 12 : 4
      
      for (let i = 0; i < occurrences; i++) {
        const date = new Date()
        date.setDate(date.getDate() + (i * (frequency === 'weekly' ? 7 : frequency === 'monthly' ? 30 : 90)))
        
        modifiedTransactions.push({
          id: `scenario-recurring-income-${i}`,
          date,
          description: `${scenario.name} - Recurring income`,
          category: 'Income',
          amount,
          type: 'income'
        })
      }
    }
    
    return modifiedTransactions
  }
}

// Export singleton instance
export const balancePredictionService = new BalancePredictionService()
export default balancePredictionService