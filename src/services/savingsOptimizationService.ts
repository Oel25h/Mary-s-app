import { Transaction, Budget } from '@/types'
import { goalAchievementAIService } from './goalAchievementAIService'

// Savings Optimization Types
export interface SavingsOptimization {
  currentSavingsRate: number
  recommendedSavingsRate: number
  optimizationOpportunities: OptimizationOpportunity[]
  automationStrategies: AutomationStrategy[]
  compoundInterestProjection: CompoundInterestProjection
  savingsAllocation: SavingsAllocation
  monthlyRecommendations: MonthlyRecommendation[]
}

export interface OptimizationOpportunity {
  category: string
  currentSpending: number
  recommendedSpending: number
  potentialSavings: number
  effort: 'low' | 'medium' | 'high'
  impact: 'low' | 'medium' | 'high'
  description: string
  actionSteps: string[]
  timeline: string
}

export interface AutomationStrategy {
  strategy: string
  description: string
  potentialSavings: number
  setupEffort: 'low' | 'medium' | 'high'
  ongoingMaintenance: 'low' | 'medium' | 'high'
  implementation: string[]
  pros: string[]
  cons: string[]
}

export interface CompoundInterestProjection {
  initialAmount: number
  monthlyContribution: number
  annualInterestRate: number
  projections: Array<{
    year: number
    balance: number
    totalContributions: number
    interestEarned: number
  }>
}

export interface SavingsAllocation {
  emergencyFund: {
    currentAmount: number
    targetAmount: number
    monthlyAllocation: number
    priority: number
    timeToComplete: number
  }
  shortTermGoals: Array<{
    goalName: string
    currentAmount: number
    targetAmount: number
    monthlyAllocation: number
    priority: number
    timeToComplete: number
    category: 'vacation' | 'purchase' | 'home' | 'car' | 'other'
  }>
  longTermGoals: Array<{
    goalName: string
    currentAmount: number
    targetAmount: number
    monthlyAllocation: number
    priority: number
    timeToComplete: number
    category: 'retirement' | 'education' | 'house' | 'business' | 'other'
  }>
}

export interface MonthlyRecommendation {
  month: string
  focusArea: string
  actions: string[]
  expectedSavings: number
  difficulty: 'easy' | 'moderate' | 'challenging'
  metrics: {
    targetSavingsRate: number
    emergencyFundProgress: number
    goalCompletionProgress: number
  }
}

export interface SavingsChallenge {
  challengeName: string
  duration: number
  targetSavings: number
  rules: string[]
  tips: string[]
  milestones: Array<{
    week: number
    target: number
    reward: string
  }>
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

/**
 * Savings Goal Optimization Service
 * Provides intelligent savings strategies, automation recommendations, and goal optimization
 */
class SavingsOptimizationService {
  private readonly IDEAL_SAVINGS_RATE = 0.20 // 20% of income
  private readonly MIN_SAVINGS_RATE = 0.10 // 10% minimum
  private readonly EMERGENCY_FUND_MONTHS = 6
  private readonly DEFAULT_INTEREST_RATE = 0.04 // 4% annual return

  /**
   * Generate comprehensive savings optimization analysis
   */
  optimizeSavings(
    transactions: Transaction[],
    currentSavings: number = 0,
    savingsGoals?: Array<{
      name: string
      targetAmount: number
      currentAmount: number
      targetDate: Date
      priority: number
    }>
  ): SavingsOptimization {
    try {
      // Calculate current financial metrics
      const monthlyIncome = this.calculateMonthlyIncome(transactions)
      const monthlyExpenses = this.calculateMonthlyExpenses(transactions)
      const currentSavingsRate = monthlyIncome > 0 ? (monthlyIncome - monthlyExpenses) / monthlyIncome : 0
      
      // Determine recommended savings rate based on income and goals
      const recommendedSavingsRate = this.calculateRecommendedSavingsRate(
        monthlyIncome,
        monthlyExpenses,
        savingsGoals
      )

      // Identify optimization opportunities
      const optimizationOpportunities = this.identifyOptimizationOpportunities(transactions)

      // Generate automation strategies
      const automationStrategies = this.generateAutomationStrategies(
        monthlyIncome,
        monthlyExpenses,
        currentSavingsRate
      )

      // Calculate compound interest projections
      const monthlyContribution = Math.max(monthlyIncome * recommendedSavingsRate, 0)
      const compoundInterestProjection = this.calculateCompoundInterestProjection(
        currentSavings,
        monthlyContribution,
        this.DEFAULT_INTEREST_RATE
      )

      // Generate savings allocation strategy
      const savingsAllocation = this.generateSavingsAllocation(
        monthlyIncome,
        monthlyExpenses,
        savingsGoals,
        currentSavings
      )

      // Create monthly recommendations
      const monthlyRecommendations = this.generateMonthlyRecommendations(
        optimizationOpportunities,
        savingsAllocation,
        recommendedSavingsRate
      )

      return {
        currentSavingsRate,
        recommendedSavingsRate,
        optimizationOpportunities,
        automationStrategies,
        compoundInterestProjection,
        savingsAllocation,
        monthlyRecommendations
      }

    } catch (error) {
      console.error('Error optimizing savings:', error)
      return this.getDefaultOptimization(currentSavings)
    }
  }

  /**
   * Generate savings challenges to boost motivation
   */
  generateSavingsChallenges(
    monthlyIncome: number,
    currentSavingsRate: number
  ): SavingsChallenge[] {
    const challenges: SavingsChallenge[] = []

    // 52-Week Savings Challenge
    challenges.push({
      challengeName: '52-Week Progressive Challenge',
      duration: 52,
      targetSavings: 1378, // $1 + $2 + ... + $52 = $1,378
      rules: [
        'Week 1: Save $1',
        'Week 2: Save $2',
        'Continue increasing by $1 each week',
        'Week 52: Save $52'
      ],
      tips: [
        'Start in January for best results',
        'Use a separate savings jar or account',
        'Track progress visually with a chart',
        'Consider reversing the order (start with $52)'
      ],
      milestones: [
        { week: 13, target: 364, reward: 'Treat yourself to something small' },
        { week: 26, target: 689, reward: 'Half-way celebration dinner' },
        { week: 39, target: 1053, reward: 'Weekend getaway fund started' },
        { week: 52, target: 1378, reward: 'Full challenge completed!' }
      ],
      difficulty: 'beginner'
    })

    // No-Spend Challenge
    const noSpendTarget = monthlyIncome * 0.15 // 15% of monthly income
    challenges.push({
      challengeName: '30-Day No-Spend Challenge',
      duration: 4,
      targetSavings: noSpendTarget,
      rules: [
        'Only spend on necessities (groceries, bills, gas)',
        'No dining out, entertainment, or impulse purchases',
        'Use items you already own',
        'Find free activities for entertainment'
      ],
      tips: [
        'Plan meals using pantry items',
        'Find free community events',
        'Use library for entertainment',
        'Invite friends over instead of going out'
      ],
      milestones: [
        { week: 1, target: noSpendTarget * 0.25, reward: 'First week success!' },
        { week: 2, target: noSpendTarget * 0.5, reward: 'Halfway there!' },
        { week: 3, target: noSpendTarget * 0.75, reward: 'Almost done!' },
        { week: 4, target: noSpendTarget, reward: 'Challenge completed!' }
      ],
      difficulty: 'intermediate'
    })

    return challenges
  }

  // Private helper methods

  private calculateMonthlyIncome(transactions: Transaction[]): number {
    const incomeTransactions = transactions.filter(t => t.type === 'income')
    if (incomeTransactions.length === 0) return 0

    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0)
    const monthsSpan = this.getMonthsSpan(incomeTransactions)
    
    return totalIncome / Math.max(monthsSpan, 1)
  }

  private calculateMonthlyExpenses(transactions: Transaction[]): number {
    const expenseTransactions = transactions.filter(t => t.type === 'expense')
    if (expenseTransactions.length === 0) return 0

    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0)
    const monthsSpan = this.getMonthsSpan(expenseTransactions)
    
    return totalExpenses / Math.max(monthsSpan, 1)
  }

  private calculateRecommendedSavingsRate(
    monthlyIncome: number,
    monthlyExpenses: number,
    savingsGoals?: Array<any>
  ): number {
    if (monthlyIncome <= 0) return this.MIN_SAVINGS_RATE

    // Base rate on current capacity
    const availableRate = (monthlyIncome - monthlyExpenses) / monthlyIncome
    
    // Adjust based on goals
    let targetRate = Math.max(this.MIN_SAVINGS_RATE, Math.min(availableRate * 0.8, this.IDEAL_SAVINGS_RATE))
    
    // Increase if there are urgent goals
    if (savingsGoals && savingsGoals.length > 0) {
      const urgentGoals = savingsGoals.filter(goal => {
        const timeToTarget = (goal.targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 365)
        return timeToTarget < 2 // Less than 2 years
      })
      
      if (urgentGoals.length > 0) {
        targetRate = Math.min(targetRate * 1.2, this.IDEAL_SAVINGS_RATE)
      }
    }

    return Math.max(this.MIN_SAVINGS_RATE, Math.min(targetRate, 0.5)) // Cap at 50%
  }

  private identifyOptimizationOpportunities(transactions: Transaction[]): OptimizationOpportunity[] {
    const opportunities: OptimizationOpportunity[] = []
    
    // Analyze spending by category
    const categorySpending = this.analyzeCategorySpending(transactions)
    
    // Dining out optimization
    const diningSpending = categorySpending.get('dining') || 0
    if (diningSpending > 300) { // More than $300/month
      opportunities.push({
        category: 'Dining Out',
        currentSpending: diningSpending,
        recommendedSpending: diningSpending * 0.7,
        potentialSavings: diningSpending * 0.3,
        effort: 'medium',
        impact: 'high',
        description: 'Reduce dining out expenses by cooking more meals at home',
        actionSteps: [
          'Plan weekly meals in advance',
          'Batch cook on weekends',
          'Set a monthly dining out budget',
          'Try new recipes at home'
        ],
        timeline: '2-4 weeks to establish new habits'
      })
    }

    // Subscription optimization
    const subscriptionSpending = categorySpending.get('subscriptions') || 0
    if (subscriptionSpending > 50) {
      opportunities.push({
        category: 'Subscriptions',
        currentSpending: subscriptionSpending,
        recommendedSpending: subscriptionSpending * 0.6,
        potentialSavings: subscriptionSpending * 0.4,
        effort: 'low',
        impact: 'medium',
        description: 'Cancel unused subscriptions and negotiate better rates',
        actionSteps: [
          'Audit all active subscriptions',
          'Cancel unused services',
          'Negotiate annual payment discounts',
          'Share family plans where possible'
        ],
        timeline: '1-2 weeks for immediate impact'
      })
    }

    return opportunities.sort((a, b) => b.potentialSavings - a.potentialSavings)
  }

  private generateAutomationStrategies(
    monthlyIncome: number,
    monthlyExpenses: number,
    currentSavingsRate: number
  ): AutomationStrategy[] {
    const strategies: AutomationStrategy[] = []

    // Automatic transfers
    strategies.push({
      strategy: 'Automatic Savings Transfer',
      description: 'Set up automatic transfers from checking to savings on payday',
      potentialSavings: monthlyIncome * 0.1, // 10% of income
      setupEffort: 'low',
      ongoingMaintenance: 'low',
      implementation: [
        'Set up automatic transfer with your bank',
        'Schedule transfer for 1-2 days after payday',
        'Start with a small amount and increase gradually',
        'Use a separate high-yield savings account'
      ],
      pros: [
        'Saves before you can spend it',
        'Builds consistent saving habits',
        'Reduces temptation to spend',
        'No ongoing effort required'
      ],
      cons: [
        'Less flexibility for variable expenses',
        'May need to adjust during tight months',
        'Requires initial setup'
      ]
    })

    return strategies
  }

  private calculateCompoundInterestProjection(
    initialAmount: number,
    monthlyContribution: number,
    annualInterestRate: number,
    years: number = 30
  ): CompoundInterestProjection {
    const projections: Array<{
      year: number
      balance: number
      totalContributions: number
      interestEarned: number
    }> = []

    let currentBalance = initialAmount
    let totalContributions = initialAmount
    let totalInterest = 0

    const monthlyRate = annualInterestRate / 12

    for (let year = 1; year <= years; year++) {
      // Calculate monthly for this year
      for (let month = 1; month <= 12; month++) {
        // Add monthly contribution
        currentBalance += monthlyContribution
        totalContributions += monthlyContribution

        // Apply monthly interest
        const monthInterest = currentBalance * monthlyRate
        currentBalance += monthInterest
        totalInterest += monthInterest
      }

      projections.push({
        year,
        balance: currentBalance,
        totalContributions,
        interestEarned: totalInterest
      })
    }

    return {
      initialAmount,
      monthlyContribution,
      annualInterestRate,
      projections
    }
  }

  private generateSavingsAllocation(
    monthlyIncome: number,
    monthlyExpenses: number,
    savingsGoals?: Array<any>,
    currentSavings: number = 0
  ): SavingsAllocation {
    const availableSavings = Math.max(monthlyIncome - monthlyExpenses, 0)

    // Emergency fund allocation (highest priority)
    const emergencyFundTarget = monthlyExpenses * this.EMERGENCY_FUND_MONTHS
    const emergencyFundAllocation = Math.min(availableSavings * 0.4, emergencyFundTarget / 12)

    const allocation: SavingsAllocation = {
      emergencyFund: {
        currentAmount: Math.min(currentSavings, emergencyFundTarget),
        targetAmount: emergencyFundTarget,
        monthlyAllocation: emergencyFundAllocation,
        priority: 1,
        timeToComplete: emergencyFundAllocation > 0 ? Math.ceil(emergencyFundTarget / emergencyFundAllocation) : 0
      },
      shortTermGoals: [],
      longTermGoals: []
    }

    return allocation
  }

  private generateMonthlyRecommendations(
    opportunities: OptimizationOpportunity[],
    allocation: SavingsAllocation,
    targetSavingsRate: number
  ): MonthlyRecommendation[] {
    const recommendations: MonthlyRecommendation[] = []
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December']

    months.forEach((month, index) => {
      const focusOpportunity = opportunities[index % opportunities.length]
      
      recommendations.push({
        month,
        focusArea: focusOpportunity?.category || 'General Savings',
        actions: focusOpportunity?.actionSteps || [
          'Review monthly expenses',
          'Look for new optimization opportunities',
          'Increase savings rate by 1%'
        ],
        expectedSavings: focusOpportunity?.potentialSavings || 100,
        difficulty: index < 3 ? 'easy' : index < 8 ? 'moderate' : 'challenging',
        metrics: {
          targetSavingsRate: targetSavingsRate,
          emergencyFundProgress: (allocation.emergencyFund.currentAmount / allocation.emergencyFund.targetAmount) * 100,
          goalCompletionProgress: 0 // Simplified for now
        }
      })
    })

    return recommendations
  }

  // Additional helper methods
  private getMonthsSpan(transactions: Transaction[]): number {
    if (transactions.length === 0) return 1

    const dates = transactions.map(t => t.date.getTime())
    const minDate = Math.min(...dates)
    const maxDate = Math.max(...dates)
    
    return Math.max((maxDate - minDate) / (1000 * 60 * 60 * 24 * 30), 1)
  }

  private analyzeCategorySpending(transactions: Transaction[]): Map<string, number> {
    const categoryMap = new Map<string, number>()
    const expenseTransactions = transactions.filter(t => t.type === 'expense')
    const monthsSpan = this.getMonthsSpan(expenseTransactions)

    expenseTransactions.forEach(transaction => {
      const category = this.normalizeCategory(transaction.category)
      const currentAmount = categoryMap.get(category) || 0
      categoryMap.set(category, currentAmount + transaction.amount)
    })

    // Convert to monthly averages
    categoryMap.forEach((value, key) => {
      categoryMap.set(key, value / monthsSpan)
    })

    return categoryMap
  }

  private normalizeCategory(category: string): string {
    const lowerCategory = category.toLowerCase()
    
    if (lowerCategory.includes('food') || lowerCategory.includes('restaurant') || lowerCategory.includes('dining')) {
      return 'dining'
    }
    if (lowerCategory.includes('subscription') || lowerCategory.includes('streaming') || lowerCategory.includes('software')) {
      return 'subscriptions'
    }
    if (lowerCategory.includes('transport') || lowerCategory.includes('gas') || lowerCategory.includes('car') || lowerCategory.includes('uber')) {
      return 'transportation'
    }
    if (lowerCategory.includes('utility') || lowerCategory.includes('electric') || lowerCategory.includes('water') || lowerCategory.includes('internet')) {
      return 'utilities'
    }
    
    return lowerCategory
  }

  private getDefaultOptimization(currentSavings: number): SavingsOptimization {
    return {
      currentSavingsRate: 0.05,
      recommendedSavingsRate: 0.15,
      optimizationOpportunities: [],
      automationStrategies: [],
      compoundInterestProjection: {
        initialAmount: currentSavings,
        monthlyContribution: 500,
        annualInterestRate: 0.04,
        projections: []
      },
      savingsAllocation: {
        emergencyFund: {
          currentAmount: currentSavings,
          targetAmount: 15000,
          monthlyAllocation: 500,
          priority: 1,
          timeToComplete: 30
        },
        shortTermGoals: [],
        longTermGoals: []
      },
      monthlyRecommendations: []
    }
  }
}

// Export singleton instance
export const savingsOptimizationService = new SavingsOptimizationService()
export default savingsOptimizationService