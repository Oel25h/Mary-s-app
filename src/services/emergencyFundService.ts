import { Transaction, Budget } from '@/types'

// Emergency Fund Types
export interface EmergencyFundRecommendation {
  recommendedAmount: number
  currentAmount: number
  monthsCovered: number
  targetMonths: number
  progressPercentage: number
  riskLevel: 'low' | 'medium' | 'high'
  customRecommendation: string
  savingsTimeline: Array<{
    months: number
    amount: number
    description: string
  }>
}

export interface RiskAssessment {
  incomeStability: 'stable' | 'moderate' | 'volatile'
  jobSecurity: 'high' | 'medium' | 'low'
  dependents: number
  expenseVolatility: 'low' | 'medium' | 'high'
  overallRisk: 'low' | 'medium' | 'high'
  factors: Array<{
    factor: string
    impact: 'positive' | 'negative'
    description: string
    weight: number
  }>
}

export interface EmergencyFundStrategy {
  strategy: string
  monthlyAmount: number
  timeToTarget: number
  milestones: Array<{
    month: number
    amount: number
    achievement: string
  }>
  tips: string[]
}

export interface EmergencyScenario {
  scenario: string
  probability: 'low' | 'medium' | 'high'
  estimatedCost: number
  monthsToRecover: number
  description: string
  mitigation: string[]
}

/**
 * Emergency Fund Recommendation Service
 * Analyzes financial data to provide personalized emergency fund recommendations
 */
class EmergencyFundService {
  private readonly STANDARD_MONTHS = 6 // Default emergency fund target
  private readonly MIN_MONTHS = 3
  private readonly MAX_MONTHS = 12

  /**
   * Generate comprehensive emergency fund recommendation
   */
  generateRecommendation(
    transactions: Transaction[],
    budgets: Budget[],
    currentEmergencyFund: number = 0,
    userProfile?: {
      dependents?: number
      jobType?: 'stable' | 'contract' | 'freelance'
      industry?: string
    }
  ): EmergencyFundRecommendation {
    try {
      // Calculate monthly expenses
      const monthlyExpenses = this.calculateMonthlyExpenses(transactions)
      
      // Assess risk factors
      const riskAssessment = this.assessRiskFactors(transactions, userProfile)
      
      // Determine target months based on risk
      const targetMonths = this.calculateTargetMonths(riskAssessment, userProfile)
      
      // Calculate recommended amount
      const recommendedAmount = monthlyExpenses * targetMonths
      
      // Calculate current coverage
      const monthsCovered = monthlyExpenses > 0 ? currentEmergencyFund / monthlyExpenses : 0
      const progressPercentage = recommendedAmount > 0 ? (currentEmergencyFund / recommendedAmount) * 100 : 0
      
      // Generate custom recommendation
      const customRecommendation = this.generateCustomRecommendation(
        monthlyExpenses,
        targetMonths,
        currentEmergencyFund,
        riskAssessment
      )
      
      // Create savings timeline
      const savingsTimeline = this.createSavingsTimeline(
        currentEmergencyFund,
        recommendedAmount,
        this.calculateSuggestedMonthlySavings(transactions, recommendedAmount - currentEmergencyFund)
      )

      return {
        recommendedAmount,
        currentAmount: currentEmergencyFund,
        monthsCovered,
        targetMonths,
        progressPercentage: Math.min(progressPercentage, 100),
        riskLevel: riskAssessment.overallRisk,
        customRecommendation,
        savingsTimeline
      }
    } catch (error) {
      console.error('Error generating emergency fund recommendation:', error)
      return this.getDefaultRecommendation(currentEmergencyFund)
    }
  }

  /**
   * Assess financial risk factors
   */
  assessRiskFactors(
    transactions: Transaction[],
    userProfile?: { dependents?: number; jobType?: string; industry?: string }
  ): RiskAssessment {
    const factors: Array<{ factor: string; impact: 'positive' | 'negative'; description: string; weight: number }> = []
    
    // Income stability analysis
    const incomeStability = this.analyzeIncomeStability(transactions)
    if (incomeStability === 'volatile') {
      factors.push({
        factor: 'Income Volatility',
        impact: 'negative',
        description: 'Your income varies significantly month to month',
        weight: 0.3
      })
    } else if (incomeStability === 'stable') {
      factors.push({
        factor: 'Income Stability',
        impact: 'positive',
        description: 'Your income is consistent and predictable',
        weight: 0.2
      })
    }

    // Expense volatility analysis
    const expenseVolatility = this.analyzeExpenseVolatility(transactions)
    if (expenseVolatility === 'high') {
      factors.push({
        factor: 'Expense Volatility',
        impact: 'negative',
        description: 'Your expenses fluctuate significantly',
        weight: 0.2
      })
    }

    // Job type assessment
    let jobSecurity: 'high' | 'medium' | 'low' = 'medium'
    if (userProfile?.jobType) {
      switch (userProfile.jobType) {
        case 'stable':
          jobSecurity = 'high'
          factors.push({
            factor: 'Job Security',
            impact: 'positive',
            description: 'Stable employment provides financial security',
            weight: 0.25
          })
          break
        case 'contract':
          jobSecurity = 'medium'
          factors.push({
            factor: 'Contract Work',
            impact: 'negative',
            description: 'Contract work may have income gaps',
            weight: 0.15
          })
          break
        case 'freelance':
          jobSecurity = 'low'
          factors.push({
            factor: 'Freelance Work',
            impact: 'negative',
            description: 'Freelance income can be unpredictable',
            weight: 0.3
          })
          break
      }
    }

    // Dependents factor
    const dependents = userProfile?.dependents || 0
    if (dependents > 0) {
      factors.push({
        factor: 'Financial Dependents',
        impact: 'negative',
        description: `Supporting ${dependents} dependent(s) increases financial responsibility`,
        weight: 0.1 * dependents
      })
    }

    // Industry risk (simplified)
    if (userProfile?.industry) {
      const highRiskIndustries = ['hospitality', 'retail', 'entertainment', 'travel']
      const stableIndustries = ['healthcare', 'education', 'government', 'utilities']
      
      if (highRiskIndustries.some(industry => userProfile.industry?.toLowerCase().includes(industry))) {
        factors.push({
          factor: 'Industry Risk',
          impact: 'negative',
          description: 'Working in a volatile industry increases job security risk',
          weight: 0.2
        })
      } else if (stableIndustries.some(industry => userProfile.industry?.toLowerCase().includes(industry))) {
        factors.push({
          factor: 'Stable Industry',
          impact: 'positive',
          description: 'Working in a stable industry provides security',
          weight: 0.15
        })
      }
    }

    // Calculate overall risk
    const riskScore = factors.reduce((score, factor) => {
      const impact = factor.impact === 'negative' ? factor.weight : -factor.weight
      return score + impact
    }, 0.5) // Base risk score

    const overallRisk: 'low' | 'medium' | 'high' = 
      riskScore <= 0.3 ? 'low' : 
      riskScore <= 0.7 ? 'medium' : 'high'

    return {
      incomeStability,
      jobSecurity,
      dependents,
      expenseVolatility,
      overallRisk,
      factors
    }
  }

  /**
   * Generate emergency fund strategies
   */
  generateStrategies(
    recommendation: EmergencyFundRecommendation,
    monthlyIncome: number
  ): EmergencyFundStrategy[] {
    const strategies: EmergencyFundStrategy[] = []
    const remainingAmount = recommendation.recommendedAmount - recommendation.currentAmount
    
    if (remainingAmount <= 0) {
      return [{
        strategy: 'Maintain Current Fund',
        monthlyAmount: 0,
        timeToTarget: 0,
        milestones: [],
        tips: [
          'Your emergency fund is fully funded!',
          'Review and adjust annually for expense changes',
          'Consider high-yield savings account for better returns',
          'Don\'t forget to replenish after any emergency use'
        ]
      }]
    }

    // Conservative strategy (2% of income)
    const conservativeAmount = monthlyIncome * 0.02
    if (conservativeAmount > 0) {
      strategies.push({
        strategy: 'Conservative Approach',
        monthlyAmount: conservativeAmount,
        timeToTarget: Math.ceil(remainingAmount / conservativeAmount),
        milestones: this.generateMilestones(remainingAmount, conservativeAmount),
        tips: [
          'Start with small, consistent contributions',
          'Automate savings to build the habit',
          'Use a separate high-yield savings account',
          'Celebrate small wins along the way'
        ]
      })
    }

    // Moderate strategy (5% of income)
    const moderateAmount = monthlyIncome * 0.05
    if (moderateAmount > 0) {
      strategies.push({
        strategy: 'Balanced Approach',
        monthlyAmount: moderateAmount,
        timeToTarget: Math.ceil(remainingAmount / moderateAmount),
        milestones: this.generateMilestones(remainingAmount, moderateAmount),
        tips: [
          'Good balance between emergency fund and other goals',
          'Consider increasing during bonus months',
          'Review monthly spending for optimization opportunities',
          'Keep funds easily accessible but separate from checking'
        ]
      })
    }

    // Aggressive strategy (10% of income)
    const aggressiveAmount = monthlyIncome * 0.10
    if (aggressiveAmount > 0) {
      strategies.push({
        strategy: 'Aggressive Approach',
        monthlyAmount: aggressiveAmount,
        timeToTarget: Math.ceil(remainingAmount / aggressiveAmount),
        milestones: this.generateMilestones(remainingAmount, aggressiveAmount),
        tips: [
          'Fastest way to build your emergency fund',
          'May require significant lifestyle adjustments',
          'Consider side income to boost savings',
          'Prioritize this over non-essential expenses'
        ]
      })
    }

    return strategies
  }

  /**
   * Generate potential emergency scenarios
   */
  generateEmergencyScenarios(
    transactions: Transaction[],
    monthlyExpenses: number,
    userProfile?: any
  ): EmergencyScenario[] {
    const scenarios: EmergencyScenario[] = []

    // Job loss scenario
    scenarios.push({
      scenario: 'Job Loss',
      probability: userProfile?.jobType === 'freelance' ? 'high' : 
                   userProfile?.jobType === 'contract' ? 'medium' : 'low',
      estimatedCost: monthlyExpenses * 4, // 4 months of expenses typically
      monthsToRecover: 4,
      description: 'Temporary loss of primary income source',
      mitigation: [
        'Maintain professional network',
        'Keep resume updated',
        'Consider skills training',
        'Have job search budget ready'
      ]
    })

    // Medical emergency
    scenarios.push({
      scenario: 'Medical Emergency',
      probability: 'medium',
      estimatedCost: 5000, // Average out-of-pocket medical expense
      monthsToRecover: 2,
      description: 'Unexpected medical bills not covered by insurance',
      mitigation: [
        'Maintain good health insurance',
        'Use HSA/FSA accounts',
        'Research medical providers',
        'Negotiate payment plans if needed'
      ]
    })

    // Home/Car repair
    const hasCarExpenses = transactions.some(t => 
      t.category.toLowerCase().includes('transport') || 
      t.category.toLowerCase().includes('car') ||
      t.category.toLowerCase().includes('gas')
    )
    
    if (hasCarExpenses) {
      scenarios.push({
        scenario: 'Major Car Repair',
        probability: 'medium',
        estimatedCost: 2500,
        monthsToRecover: 1,
        description: 'Unexpected vehicle breakdown or major repair',
        mitigation: [
          'Regular vehicle maintenance',
          'Keep receipts for warranty claims',
          'Research reliable mechanics',
          'Consider extended warranties for older cars'
        ]
      })
    }

    // Home repair (if home-related expenses exist)
    const hasHomeExpenses = transactions.some(t => 
      t.category.toLowerCase().includes('home') || 
      t.category.toLowerCase().includes('utilities') ||
      t.category.toLowerCase().includes('maintenance')
    )
    
    if (hasHomeExpenses) {
      scenarios.push({
        scenario: 'Home Repair',
        probability: 'medium',
        estimatedCost: 3500,
        monthsToRecover: 1,
        description: 'Unexpected home maintenance or appliance replacement',
        mitigation: [
          'Regular home maintenance',
          'Home warranty or insurance',
          'Build relationships with trusted contractors',
          'Learn basic home repair skills'
        ]
      })
    }

    // Economic downturn
    scenarios.push({
      scenario: 'Economic Downturn',
      probability: 'low',
      estimatedCost: monthlyExpenses * 6,
      monthsToRecover: 8,
      description: 'Extended period of reduced income or increased expenses',
      mitigation: [
        'Diversify income sources',
        'Maintain marketable skills',
        'Keep low debt levels',
        'Build larger emergency fund during good times'
      ]
    })

    return scenarios.sort((a, b) => {
      const probabilityOrder = { high: 3, medium: 2, low: 1 }
      return probabilityOrder[b.probability] - probabilityOrder[a.probability]
    })
  }

  // Private helper methods

  private calculateMonthlyExpenses(transactions: Transaction[]): number {
    const expenseTransactions = transactions.filter(t => t.type === 'expense')
    if (expenseTransactions.length === 0) return 0

    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0)
    const monthsSpan = this.getMonthsSpan(expenseTransactions)
    
    return totalExpenses / Math.max(monthsSpan, 1)
  }

  private calculateTargetMonths(
    riskAssessment: RiskAssessment,
    userProfile?: { dependents?: number; jobType?: string }
  ): number {
    let baseMonths = this.STANDARD_MONTHS

    // Adjust based on risk level
    switch (riskAssessment.overallRisk) {
      case 'high':
        baseMonths = Math.min(baseMonths + 3, this.MAX_MONTHS)
        break
      case 'low':
        baseMonths = Math.max(baseMonths - 1, this.MIN_MONTHS)
        break
    }

    // Adjust for dependents
    const dependents = userProfile?.dependents || 0
    if (dependents > 0) {
      baseMonths += Math.min(dependents, 2) // Add up to 2 months for dependents
    }

    // Adjust for job type
    if (userProfile?.jobType === 'freelance') {
      baseMonths += 2
    } else if (userProfile?.jobType === 'contract') {
      baseMonths += 1
    }

    return Math.min(Math.max(baseMonths, this.MIN_MONTHS), this.MAX_MONTHS)
  }

  private generateCustomRecommendation(
    monthlyExpenses: number,
    targetMonths: number,
    currentAmount: number,
    riskAssessment: RiskAssessment
  ): string {
    const recommendedAmount = monthlyExpenses * targetMonths
    const progressPercentage = recommendedAmount > 0 ? (currentAmount / recommendedAmount) * 100 : 0

    if (progressPercentage >= 100) {
      return `Excellent! Your emergency fund is fully funded with ${targetMonths} months of expenses. Focus on maintaining this level and consider investing additional savings.`
    } else if (progressPercentage >= 75) {
      return `You're almost there! You have ${progressPercentage.toFixed(0)}% of your target emergency fund. Consider boosting your savings to reach the full ${targetMonths}-month target.`
    } else if (progressPercentage >= 50) {
      return `Good progress! You've saved ${progressPercentage.toFixed(0)}% of your target. Continue building toward ${targetMonths} months of expenses based on your ${riskAssessment.overallRisk} risk profile.`
    } else if (progressPercentage >= 25) {
      return `You've made a start with ${progressPercentage.toFixed(0)}% of your target. Given your ${riskAssessment.overallRisk} risk level, prioritize building your emergency fund to ${targetMonths} months of expenses.`
    } else {
      return `Building an emergency fund should be a priority. With your ${riskAssessment.overallRisk} risk profile, aim for ${targetMonths} months of expenses (${this.formatCurrency(recommendedAmount)}) to protect against financial emergencies.`
    }
  }

  private createSavingsTimeline(
    currentAmount: number,
    targetAmount: number,
    monthlySavings: number
  ): Array<{ months: number; amount: number; description: string }> {
    const timeline: Array<{ months: number; amount: number; description: string }> = []
    const remainingAmount = targetAmount - currentAmount

    if (remainingAmount <= 0) {
      return [{
        months: 0,
        amount: currentAmount,
        description: 'Emergency fund is fully funded!'
      }]
    }

    if (monthlySavings <= 0) {
      return [{
        months: 0,
        amount: currentAmount,
        description: 'Set a monthly savings goal to see timeline'
      }]
    }

    const monthsToTarget = Math.ceil(remainingAmount / monthlySavings)
    const milestones = [1, 3, 6, 12, 18, 24]

    milestones.forEach(months => {
      if (months <= monthsToTarget) {
        const projectedAmount = Math.min(currentAmount + (monthlySavings * months), targetAmount)
        const progressPercentage = (projectedAmount / targetAmount) * 100

        let description = ''
        if (progressPercentage >= 100) {
          description = 'Emergency fund complete!'
        } else if (progressPercentage >= 75) {
          description = 'Nearly there - maintain momentum!'
        } else if (progressPercentage >= 50) {
          description = 'Halfway to your goal!'
        } else if (progressPercentage >= 25) {
          description = 'Good progress - keep going!'
        } else {
          description = 'Building your foundation'
        }

        timeline.push({
          months,
          amount: projectedAmount,
          description
        })
      }
    })

    // Add final milestone if not already included
    if (!timeline.some(t => t.months === monthsToTarget)) {
      timeline.push({
        months: monthsToTarget,
        amount: targetAmount,
        description: 'Emergency fund target reached!'
      })
    }

    return timeline.sort((a, b) => a.months - b.months)
  }

  private calculateSuggestedMonthlySavings(transactions: Transaction[], remainingAmount: number): number {
    const monthlyIncome = this.calculateMonthlyIncome(transactions)
    const monthlyExpenses = this.calculateMonthlyExpenses(transactions)
    const availableIncome = monthlyIncome - monthlyExpenses

    // Suggest 20% of available income or minimum $50, whichever is higher
    const suggestedAmount = Math.max(availableIncome * 0.2, 50)
    
    // Cap at what would take maximum 2 years to complete
    const maxMonthlyAmount = remainingAmount / 24
    
    return Math.min(suggestedAmount, maxMonthlyAmount)
  }

  private generateMilestones(remainingAmount: number, monthlyAmount: number): Array<{ month: number; amount: number; achievement: string }> {
    const milestones: Array<{ month: number; amount: number; achievement: string }> = []
    const totalMonths = Math.ceil(remainingAmount / monthlyAmount)
    
    const checkpoints = [
      { percentage: 0.25, achievement: 'First quarter complete!' },
      { percentage: 0.5, achievement: 'Halfway there!' },
      { percentage: 0.75, achievement: 'Three quarters done!' },
      { percentage: 1.0, achievement: 'Emergency fund fully funded!' }
    ]

    checkpoints.forEach(checkpoint => {
      const targetAmount = remainingAmount * checkpoint.percentage
      const monthsNeeded = Math.ceil(targetAmount / monthlyAmount)
      
      if (monthsNeeded <= totalMonths) {
        milestones.push({
          month: monthsNeeded,
          amount: targetAmount,
          achievement: checkpoint.achievement
        })
      }
    })

    return milestones
  }

  private analyzeIncomeStability(transactions: Transaction[]): 'stable' | 'moderate' | 'volatile' {
    const incomeTransactions = transactions.filter(t => t.type === 'income')
    if (incomeTransactions.length < 3) return 'moderate'

    const monthlyIncomes = this.groupByMonth(incomeTransactions)
    const incomeAmounts = Array.from(monthlyIncomes.values())
    
    if (incomeAmounts.length < 2) return 'moderate'

    const mean = incomeAmounts.reduce((sum, amount) => sum + amount, 0) / incomeAmounts.length
    const variance = incomeAmounts.reduce((sum, amount) => sum + Math.pow(amount - mean, 2), 0) / incomeAmounts.length
    const coefficientOfVariation = mean > 0 ? Math.sqrt(variance) / mean : 0

    if (coefficientOfVariation < 0.15) return 'stable'
    if (coefficientOfVariation < 0.35) return 'moderate'
    return 'volatile'
  }

  private analyzeExpenseVolatility(transactions: Transaction[]): 'low' | 'medium' | 'high' {
    const expenseTransactions = transactions.filter(t => t.type === 'expense')
    if (expenseTransactions.length < 3) return 'medium'

    const monthlyExpenses = this.groupByMonth(expenseTransactions)
    const expenseAmounts = Array.from(monthlyExpenses.values())
    
    if (expenseAmounts.length < 2) return 'medium'

    const mean = expenseAmounts.reduce((sum, amount) => sum + amount, 0) / expenseAmounts.length
    const variance = expenseAmounts.reduce((sum, amount) => sum + Math.pow(amount - mean, 2), 0) / expenseAmounts.length
    const coefficientOfVariation = mean > 0 ? Math.sqrt(variance) / mean : 0

    if (coefficientOfVariation < 0.2) return 'low'
    if (coefficientOfVariation < 0.4) return 'medium'
    return 'high'
  }

  private calculateMonthlyIncome(transactions: Transaction[]): number {
    const incomeTransactions = transactions.filter(t => t.type === 'income')
    if (incomeTransactions.length === 0) return 0

    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0)
    const monthsSpan = this.getMonthsSpan(incomeTransactions)
    
    return totalIncome / Math.max(monthsSpan, 1)
  }

  private getMonthsSpan(transactions: Transaction[]): number {
    if (transactions.length === 0) return 1

    const dates = transactions.map(t => t.date.getTime())
    const minDate = Math.min(...dates)
    const maxDate = Math.max(...dates)
    
    return Math.max((maxDate - minDate) / (1000 * 60 * 60 * 24 * 30), 1)
  }

  private groupByMonth(transactions: Transaction[]): Map<string, number> {
    const monthlyData = new Map<string, number>()

    transactions.forEach(transaction => {
      const monthKey = `${transaction.date.getFullYear()}-${transaction.date.getMonth()}`
      const currentAmount = monthlyData.get(monthKey) || 0
      monthlyData.set(monthKey, currentAmount + transaction.amount)
    })

    return monthlyData
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  private getDefaultRecommendation(currentAmount: number): EmergencyFundRecommendation {
    return {
      recommendedAmount: 15000, // Default $15k recommendation
      currentAmount,
      monthsCovered: 0,
      targetMonths: 6,
      progressPercentage: currentAmount > 0 ? (currentAmount / 15000) * 100 : 0,
      riskLevel: 'medium',
      customRecommendation: 'Add more transaction data to get personalized emergency fund recommendations.',
      savingsTimeline: [{
        months: 12,
        amount: 15000,
        description: 'Target emergency fund goal'
      }]
    }
  }
}

// Export singleton instance
export const emergencyFundService = new EmergencyFundService()
export default emergencyFundService