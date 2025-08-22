import { Transaction, Budget } from '@/types'

// Debt Payoff Types
export interface DebtPayoffAnalysis {
  debts: DebtAccount[]
  strategies: PayoffStrategy[]
  recommendations: DebtRecommendation[]
  consolidationOptions: ConsolidationOption[]
  payoffComparison: PayoffComparison
  creditImpact: CreditImpact
}

export interface DebtAccount {
  id: string
  name: string
  type: 'credit_card' | 'student_loan' | 'personal_loan' | 'mortgage' | 'auto_loan' | 'other'
  balance: number
  interestRate: number
  minimumPayment: number
  creditLimit?: number
}

export interface PayoffStrategy {
  name: string
  description: string
  paymentOrder: PaymentPlan[]
  totalInterestPaid: number
  timeToPayoff: number
  monthlyPayment: number
  pros: string[]
  cons: string[]
  effectiveness: 'high' | 'medium' | 'low'
}

export interface PaymentPlan {
  debtId: string
  debtName: string
  monthlyPayment: number
  payoffOrder: number
  monthsToPayoff: number
  totalInterestPaid: number
}

export interface DebtRecommendation {
  type: 'payoff_strategy' | 'consolidation' | 'balance_transfer' | 'lifestyle_change'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  potentialSavings: number
  difficulty: 'easy' | 'moderate' | 'difficult'
  actionSteps: string[]
}

export interface ConsolidationOption {
  type: 'personal_loan' | 'balance_transfer' | 'home_equity'
  name: string
  description: string
  potentialInterestRate: number
  estimatedSavings: number
  pros: string[]
  cons: string[]
  riskLevel: 'low' | 'medium' | 'high'
}

export interface PayoffComparison {
  currentPath: {
    totalInterestPaid: number
    timeToPayoff: number
    monthlyPayment: number
  }
  optimizedPath: {
    strategy: string
    totalInterestPaid: number
    timeToPayoff: number
    totalSavings: number
    timeSaved: number
  }
}

export interface CreditImpact {
  creditUtilization: number
  impactDescription: string
  recommendations: string[]
}

/**
 * Debt Payoff Strategies Service
 * Provides intelligent debt management and payoff optimization strategies
 */
class DebtPayoffService {
  /**
   * Analyze debt situation and generate payoff strategies
   */
  analyzeDebtPayoff(
    transactions: Transaction[],
    debts: DebtAccount[],
    availableExtraPayment: number = 0
  ): DebtPayoffAnalysis {
    try {
      if (debts.length === 0) {
        return this.getDebtFreeAnalysis()
      }

      const validatedDebts = this.validateDebts(debts)
      const strategies = this.generatePayoffStrategies(validatedDebts, availableExtraPayment)
      const recommendations = this.generateRecommendations(validatedDebts, availableExtraPayment)
      const consolidationOptions = this.analyzeConsolidationOptions(validatedDebts)
      const payoffComparison = this.compareStrategies(strategies)
      const creditImpact = this.calculateCreditImpact(validatedDebts)

      return {
        debts: validatedDebts,
        strategies,
        recommendations,
        consolidationOptions,
        payoffComparison,
        creditImpact
      }

    } catch (error) {
      console.error('Error analyzing debt payoff:', error)
      return this.getDefaultAnalysis()
    }
  }

  /**
   * Calculate debt-free date for a specific strategy
   */
  calculateDebtFreeDate(strategy: PayoffStrategy): Date {
    const months = strategy.timeToPayoff
    const debtFreeDate = new Date()
    debtFreeDate.setMonth(debtFreeDate.getMonth() + months)
    return debtFreeDate
  }

  // Private helper methods

  private validateDebts(debts: DebtAccount[]): DebtAccount[] {
    return debts.map(debt => ({
      ...debt,
      interestRate: Math.max(0, debt.interestRate),
      balance: Math.max(0, debt.balance),
      minimumPayment: Math.max(0, debt.minimumPayment || debt.balance * 0.02)
    })).filter(debt => debt.balance > 0)
  }

  private generatePayoffStrategies(debts: DebtAccount[], extraPayment: number): PayoffStrategy[] {
    const strategies: PayoffStrategy[] = []
    const totalMinimumPayments = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0)
    const totalAvailablePayment = totalMinimumPayments + extraPayment

    // Debt Avalanche Strategy (Highest Interest First)
    const avalancheDebts = [...debts].sort((a, b) => b.interestRate - a.interestRate)
    const avalancheStrategy = this.calculateStrategyMetrics(
      'Debt Avalanche (Highest Interest First)',
      'Pay minimums on all debts, focus extra payments on highest interest debt first.',
      avalancheDebts,
      totalAvailablePayment,
      [
        'Minimizes total interest paid',
        'Mathematically optimal approach',
        'Saves the most money overall'
      ],
      [
        'May take longer to see progress',
        'Requires discipline',
        'Less immediate psychological wins'
      ]
    )
    strategies.push(avalancheStrategy)

    // Debt Snowball Strategy (Smallest Balance First)
    const snowballDebts = [...debts].sort((a, b) => a.balance - b.balance)
    const snowballStrategy = this.calculateStrategyMetrics(
      'Debt Snowball (Smallest Balance First)',
      'Pay minimums on all debts, focus extra payments on smallest balance first.',
      snowballDebts,
      totalAvailablePayment,
      [
        'Quick psychological wins',
        'Builds momentum and motivation',
        'Reduces number of payments quickly'
      ],
      [
        'May pay more in total interest',
        'Not mathematically optimal',
        'High-interest debts remain longer'
      ]
    )
    strategies.push(snowballStrategy)

    // Minimum Payments Only
    const minimumStrategy = this.calculateMinimumOnlyStrategy(debts)
    strategies.push(minimumStrategy)

    return strategies
  }

  private calculateStrategyMetrics(
    name: string,
    description: string,
    sortedDebts: DebtAccount[],
    totalPayment: number,
    pros: string[],
    cons: string[]
  ): PayoffStrategy {
    const paymentPlan = this.calculatePaymentPlan(sortedDebts, totalPayment)
    const totalInterest = paymentPlan.reduce((sum, plan) => sum + plan.totalInterestPaid, 0)
    const timeToPayoff = Math.max(...paymentPlan.map(plan => plan.monthsToPayoff))

    return {
      name,
      description,
      paymentOrder: paymentPlan,
      totalInterestPaid: totalInterest,
      timeToPayoff,
      monthlyPayment: totalPayment,
      pros,
      cons,
      effectiveness: 'high'
    }
  }

  private calculatePaymentPlan(debts: DebtAccount[], totalPayment: number): PaymentPlan[] {
    const plan: PaymentPlan[] = []
    let remainingDebts = [...debts]
    let order = 1

    while (remainingDebts.length > 0) {
      const targetDebt = remainingDebts[0]
      const otherMinimums = remainingDebts.slice(1).reduce((sum, d) => sum + d.minimumPayment, 0)
      const extraPayment = Math.max(0, totalPayment - otherMinimums - targetDebt.minimumPayment)
      const monthlyPayment = targetDebt.minimumPayment + extraPayment

      const monthsToPayoff = this.calculateMonthsToPayoff(targetDebt.balance, monthlyPayment, targetDebt.interestRate)
      const totalInterest = Math.max(0, (monthlyPayment * monthsToPayoff) - targetDebt.balance)

      plan.push({
        debtId: targetDebt.id,
        debtName: targetDebt.name,
        monthlyPayment,
        payoffOrder: order++,
        monthsToPayoff,
        totalInterestPaid: totalInterest
      })

      remainingDebts = remainingDebts.slice(1)
    }

    return plan
  }

  private calculateMinimumOnlyStrategy(debts: DebtAccount[]): PayoffStrategy {
    const paymentPlan: PaymentPlan[] = debts.map((debt, index) => {
      const monthsToPayoff = this.calculateMonthsToPayoff(debt.balance, debt.minimumPayment, debt.interestRate)
      const totalInterest = (debt.minimumPayment * monthsToPayoff) - debt.balance

      return {
        debtId: debt.id,
        debtName: debt.name,
        monthlyPayment: debt.minimumPayment,
        payoffOrder: index + 1,
        monthsToPayoff,
        totalInterestPaid: Math.max(0, totalInterest)
      }
    })

    const totalInterest = paymentPlan.reduce((sum, plan) => sum + plan.totalInterestPaid, 0)
    const timeToPayoff = Math.max(...paymentPlan.map(plan => plan.monthsToPayoff))
    const monthlyPayment = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0)

    return {
      name: 'Minimum Payments Only',
      description: 'Pay only minimum payments on all debts. Baseline comparison for other strategies.',
      paymentOrder: paymentPlan,
      totalInterestPaid: totalInterest,
      timeToPayoff,
      monthlyPayment,
      pros: ['Lowest monthly payment requirement', 'Preserves cash flow'],
      cons: ['Highest total interest paid', 'Longest payoff time'],
      effectiveness: 'low'
    }
  }

  private calculateMonthsToPayoff(balance: number, monthlyPayment: number, annualInterestRate: number): number {
    if (monthlyPayment <= 0) return Infinity
    if (annualInterestRate <= 0) return Math.ceil(balance / monthlyPayment)

    const monthlyRate = annualInterestRate / 100 / 12
    const monthlyInterest = balance * monthlyRate
    if (monthlyPayment <= monthlyInterest) return Infinity

    const months = Math.log(1 + (balance * monthlyRate) / monthlyPayment) / Math.log(1 + monthlyRate)
    return Math.ceil(months)
  }

  private generateRecommendations(debts: DebtAccount[], extraPayment: number): DebtRecommendation[] {
    const recommendations: DebtRecommendation[] = []

    // High interest debt recommendation
    const highInterestDebts = debts.filter(d => d.interestRate > 18)
    if (highInterestDebts.length > 0) {
      recommendations.push({
        type: 'payoff_strategy',
        title: 'Prioritize High-Interest Debt',
        description: `You have ${highInterestDebts.length} debt(s) with interest rates above 18%.`,
        priority: 'high',
        potentialSavings: highInterestDebts.reduce((sum, d) => sum + (d.balance * 0.1), 0),
        difficulty: 'moderate',
        actionSteps: [
          'List all debts by interest rate',
          'Pay minimums on all debts',
          'Apply extra payments to highest interest debt',
          'Consider balance transfer options'
        ]
      })
    }

    // Credit utilization recommendation
    const creditCards = debts.filter(d => d.type === 'credit_card')
    if (creditCards.length > 0) {
      const utilization = this.calculateCreditImpact(debts).creditUtilization
      if (utilization > 30) {
        recommendations.push({
          type: 'lifestyle_change',
          title: 'Reduce Credit Utilization',
          description: `Your credit utilization is ${utilization.toFixed(1)}%. Reduce below 30%.`,
          priority: 'high',
          potentialSavings: 0,
          difficulty: 'moderate',
          actionSteps: [
            'Calculate current utilization ratio',
            'Pay down balances below 30% of limits',
            'Make multiple payments per month',
            'Avoid closing paid-off cards'
          ]
        })
      }
    }

    // Extra payment recommendation
    if (extraPayment < 100) {
      recommendations.push({
        type: 'lifestyle_change',
        title: 'Increase Debt Payment Capacity',
        description: 'Finding additional funds will dramatically reduce payoff time.',
        priority: 'medium',
        potentialSavings: 2000,
        difficulty: 'moderate',
        actionSteps: [
          'Review monthly expenses for cuts',
          'Consider side income opportunities',
          'Sell unused items',
          'Reduce discretionary spending temporarily'
        ]
      })
    }

    return recommendations
  }

  private analyzeConsolidationOptions(debts: DebtAccount[]): ConsolidationOption[] {
    const options: ConsolidationOption[] = []
    const totalBalance = debts.reduce((sum, d) => sum + d.balance, 0)
    const weightedInterestRate = debts.reduce((sum, d) => sum + (d.balance * d.interestRate), 0) / totalBalance

    // Personal loan consolidation
    if (totalBalance > 1000 && totalBalance < 50000) {
      options.push({
        type: 'personal_loan',
        name: 'Personal Loan Consolidation',
        description: 'Consolidate all debts into a single personal loan with fixed payments',
        potentialInterestRate: Math.max(6, weightedInterestRate * 0.7),
        estimatedSavings: totalBalance * 0.15,
        pros: ['Single payment', 'Lower rate potential', 'Fixed schedule'],
        cons: ['Requires good credit', 'Origination fees', 'New debt risk'],
        riskLevel: 'medium'
      })
    }

    // Balance transfer option
    const creditCardDebt = debts.filter(d => d.type === 'credit_card').reduce((sum, d) => sum + d.balance, 0)
    if (creditCardDebt > 1000) {
      options.push({
        type: 'balance_transfer',
        name: 'Balance Transfer Credit Card',
        description: 'Transfer balances to 0% promotional APR card',
        potentialInterestRate: 0,
        estimatedSavings: creditCardDebt * (weightedInterestRate / 100) * 1.5,
        pros: ['0% promotional APR', 'Consolidates cards', 'Improves utilization'],
        cons: ['Promotional rate expires', 'Transfer fees', 'New credit required'],
        riskLevel: 'medium'
      })
    }

    return options
  }

  private compareStrategies(strategies: PayoffStrategy[]): PayoffComparison {
    const minimumOnly = strategies.find(s => s.name === 'Minimum Payments Only')!
    const bestStrategy = strategies
      .filter(s => s.name !== 'Minimum Payments Only')
      .reduce((best, current) => 
        current.totalInterestPaid < best.totalInterestPaid ? current : best
      )

    return {
      currentPath: {
        totalInterestPaid: minimumOnly.totalInterestPaid,
        timeToPayoff: minimumOnly.timeToPayoff,
        monthlyPayment: minimumOnly.monthlyPayment
      },
      optimizedPath: {
        strategy: bestStrategy.name,
        totalInterestPaid: bestStrategy.totalInterestPaid,
        timeToPayoff: bestStrategy.timeToPayoff,
        totalSavings: minimumOnly.totalInterestPaid - bestStrategy.totalInterestPaid,
        timeSaved: minimumOnly.timeToPayoff - bestStrategy.timeToPayoff
      }
    }
  }

  private calculateCreditImpact(debts: DebtAccount[]): CreditImpact {
    const creditCards = debts.filter(d => d.type === 'credit_card' && d.creditLimit)
    
    if (creditCards.length === 0) {
      return {
        creditUtilization: 0,
        impactDescription: 'No credit card debt detected',
        recommendations: ['Maintain low utilization when using credit cards']
      }
    }

    const totalBalance = creditCards.reduce((sum, card) => sum + card.balance, 0)
    const totalLimit = creditCards.reduce((sum, card) => sum + (card.creditLimit || 0), 0)
    const utilization = totalLimit > 0 ? (totalBalance / totalLimit) * 100 : 0

    let impactDescription = ''
    const recommendations: string[] = []

    if (utilization > 30) {
      impactDescription = 'High utilization is negatively impacting your credit score'
      recommendations.push('Pay down balances below 30% utilization')
      recommendations.push('Consider balance transfers to spread utilization')
    } else if (utilization > 10) {
      impactDescription = 'Moderate utilization - room for improvement'
      recommendations.push('Aim for utilization below 10% for optimal score')
    } else {
      impactDescription = 'Low utilization is positive for your credit score'
      recommendations.push('Maintain current low utilization levels')
    }

    return {
      creditUtilization: utilization,
      impactDescription,
      recommendations
    }
  }

  private getDebtFreeAnalysis(): DebtPayoffAnalysis {
    return {
      debts: [],
      strategies: [],
      recommendations: [
        {
          type: 'lifestyle_change',
          title: 'Congratulations! You\'re Debt-Free',
          description: 'Focus on building wealth and maintaining good financial habits',
          priority: 'high',
          potentialSavings: 0,
          difficulty: 'easy',
          actionSteps: [
            'Build emergency fund',
            'Invest for long-term goals',
            'Monitor credit score',
            'Avoid new debt'
          ]
        }
      ],
      consolidationOptions: [],
      payoffComparison: {
        currentPath: { totalInterestPaid: 0, timeToPayoff: 0, monthlyPayment: 0 },
        optimizedPath: { strategy: 'None needed', totalInterestPaid: 0, timeToPayoff: 0, totalSavings: 0, timeSaved: 0 }
      },
      creditImpact: {
        creditUtilization: 0,
        impactDescription: 'No current debt',
        recommendations: ['Keep monitoring credit health']
      }
    }
  }

  private getDefaultAnalysis(): DebtPayoffAnalysis {
    return {
      debts: [],
      strategies: [],
      recommendations: [],
      consolidationOptions: [],
      payoffComparison: {
        currentPath: { totalInterestPaid: 0, timeToPayoff: 0, monthlyPayment: 0 },
        optimizedPath: { strategy: 'Error', totalInterestPaid: 0, timeToPayoff: 0, totalSavings: 0, timeSaved: 0 }
      },
      creditImpact: {
        creditUtilization: 0,
        impactDescription: 'Unable to calculate',
        recommendations: []
      }
    }
  }
}

// Export singleton instance
export const debtPayoffService = new DebtPayoffService()
export default debtPayoffService