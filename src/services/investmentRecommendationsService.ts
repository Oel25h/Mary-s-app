import { Transaction, Budget } from '@/types'

// Investment Recommendation Types
export interface InvestmentRecommendation {
  userProfile: InvestorProfile
  recommendedPortfolio: PortfolioAllocation
  investmentOptions: InvestmentOption[]
  riskAssessment: RiskAssessment
  recommendations: PersonalizedRecommendation[]
  nextSteps: string[]
}

export interface InvestorProfile {
  riskTolerance: 'conservative' | 'moderate' | 'aggressive'
  timeHorizon: number // years
  investmentGoals: string[]
  monthlyInvestmentCapacity: number
  currentInvestments: number
  age: number
  financialKnowledge: 'beginner' | 'intermediate' | 'advanced'
  liquidityNeeds: 'low' | 'medium' | 'high'
}

export interface PortfolioAllocation {
  stocks: number // percentage
  bonds: number // percentage
  reits: number // percentage
  cash: number // percentage
  international: number // percentage
  description: string
  expectedReturn: number // annual percentage
  volatility: number // annual standard deviation
  reasoning: string[]
}

export interface InvestmentOption {
  id: string
  name: string
  type: 'etf' | 'mutual_fund' | 'individual_stock' | 'bond'
  category: 'domestic_stock' | 'international_stock' | 'bonds' | 'real_estate'
  ticker?: string
  expenseRatio: number
  minimumInvestment: number
  description: string
  pros: string[]
  cons: string[]
  riskLevel: 'low' | 'medium' | 'high'
  expectedReturn: number
  recommendation: 'highly_recommended' | 'recommended' | 'consider' | 'avoid'
  allocationPercentage: number
}

export interface RiskAssessment {
  score: number // 1-10 scale
  category: 'conservative' | 'moderate' | 'aggressive'
  factors: RiskFactor[]
  recommendations: string[]
  warnings: string[]
}

export interface RiskFactor {
  factor: string
  impact: 'positive' | 'negative'
  weight: number
  description: string
}

export interface PersonalizedRecommendation {
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  timeframe: 'immediate' | 'short_term' | 'long_term'
  actionSteps: string[]
  expectedBenefit: string
}

export interface MarketInsight {
  type: 'trend' | 'opportunity' | 'warning' | 'general'
  title: string
  description: string
  impact: 'low' | 'medium' | 'high'
  timeframe: 'short_term' | 'medium_term' | 'long_term'
  relevantAssets: string[]
}

/**
 * Investment Recommendations Service
 * Provides personalized investment advice based on financial profile and goals
 */
class InvestmentRecommendationsService {
  private readonly DEFAULT_PORTFOLIOS = {
    conservative: { stocks: 30, bonds: 60, reits: 5, cash: 5, international: 10 },
    moderate: { stocks: 60, bonds: 30, reits: 5, cash: 5, international: 20 },
    aggressive: { stocks: 80, bonds: 10, reits: 5, cash: 5, international: 30 }
  }

  /**
   * Generate comprehensive investment recommendations
   */
  generateRecommendations(
    transactions: Transaction[],
    userInputs?: {
      age?: number
      riskTolerance?: 'conservative' | 'moderate' | 'aggressive'
      timeHorizon?: number
      investmentGoals?: string[]
      currentInvestments?: number
      financialKnowledge?: 'beginner' | 'intermediate' | 'advanced'
    }
  ): InvestmentRecommendation {
    try {
      // Build investor profile
      const userProfile = this.buildInvestorProfile(transactions, userInputs)
      
      // Assess risk tolerance
      const riskAssessment = this.assessRiskTolerance(userProfile, transactions)
      
      // Generate portfolio allocation
      const recommendedPortfolio = this.generatePortfolioAllocation(userProfile, riskAssessment)
      
      // Generate investment options
      const investmentOptions = this.generateInvestmentOptions(userProfile, recommendedPortfolio)
      
      // Create personalized recommendations
      const recommendations = this.generatePersonalizedRecommendations(userProfile, riskAssessment)
      
      // Create next steps
      const nextSteps = this.generateNextSteps(userProfile, recommendedPortfolio)

      return {
        userProfile,
        recommendedPortfolio,
        investmentOptions,
        riskAssessment,
        recommendations,
        nextSteps
      }

    } catch (error) {
      console.error('Error generating investment recommendations:', error)
      return this.getDefaultRecommendations()
    }
  }

  /**
   * Generate market insights and trends
   */
  generateMarketInsights(): MarketInsight[] {
    return [
      {
        type: 'trend',
        title: 'Technology Sector Growth',
        description: 'Technology stocks continue to show strong growth potential driven by AI and digital transformation.',
        impact: 'medium',
        timeframe: 'long_term',
        relevantAssets: ['VTI', 'QQQ', 'TECH']
      },
      {
        type: 'opportunity',
        title: 'Emerging Markets Recovery',
        description: 'Emerging market ETFs may present opportunities as valuations remain attractive.',
        impact: 'medium',
        timeframe: 'medium_term',
        relevantAssets: ['VWO', 'EEM', 'IEMG']
      },
      {
        type: 'warning',
        title: 'Interest Rate Environment',
        description: 'Rising interest rates may impact bond prices. Consider diversification strategies.',
        impact: 'high',
        timeframe: 'short_term',
        relevantAssets: ['BND', 'TLT', 'REIT']
      }
    ]
  }

  // Private helper methods

  private buildInvestorProfile(transactions: Transaction[], userInputs?: any): InvestorProfile {
    const monthlyIncome = this.calculateMonthlyIncome(transactions)
    const monthlyExpenses = this.calculateMonthlyExpenses(transactions)
    const monthlyInvestmentCapacity = Math.max(monthlyIncome - monthlyExpenses, 0) * 0.15

    return {
      riskTolerance: userInputs?.riskTolerance || this.inferRiskTolerance(transactions),
      timeHorizon: userInputs?.timeHorizon || 20,
      investmentGoals: userInputs?.investmentGoals || ['retirement', 'wealth_building'],
      monthlyInvestmentCapacity,
      currentInvestments: userInputs?.currentInvestments || 0,
      age: userInputs?.age || 35,
      financialKnowledge: userInputs?.financialKnowledge || 'beginner',
      liquidityNeeds: this.assessLiquidityNeeds(transactions)
    }
  }

  private assessRiskTolerance(profile: InvestorProfile, transactions: Transaction[]): RiskAssessment {
    const factors: RiskFactor[] = []
    let score = 5 // Base score (moderate)

    // Age factor
    if (profile.age < 30) {
      factors.push({
        factor: 'Young Age',
        impact: 'positive',
        weight: 0.15,
        description: 'Longer time horizon allows for higher risk tolerance'
      })
      score += 1.5
    } else if (profile.age > 55) {
      factors.push({
        factor: 'Approaching Retirement',
        impact: 'negative',
        weight: 0.2,
        description: 'Shorter time horizon requires more conservative approach'
      })
      score -= 2
    }

    // Time horizon factor
    if (profile.timeHorizon > 15) {
      factors.push({
        factor: 'Long Time Horizon',
        impact: 'positive',
        weight: 0.2,
        description: 'Extended investment period allows for growth-focused strategy'
      })
      score += 1
    }

    // Income stability factor
    const incomeStability = this.assessIncomeStability(transactions)
    if (incomeStability === 'stable') {
      factors.push({
        factor: 'Stable Income',
        impact: 'positive',
        weight: 0.15,
        description: 'Consistent income supports higher risk investments'
      })
      score += 0.5
    }

    score = Math.max(1, Math.min(10, score))
    const category = score <= 3.5 ? 'conservative' : score <= 6.5 ? 'moderate' : 'aggressive'

    return {
      score,
      category,
      factors,
      recommendations: this.generateRiskRecommendations(category),
      warnings: this.generateRiskWarnings(category)
    }
  }

  private generatePortfolioAllocation(profile: InvestorProfile, riskAssessment: RiskAssessment): PortfolioAllocation {
    const baseAllocation = { ...this.DEFAULT_PORTFOLIOS[riskAssessment.category] }

    // Adjust based on age
    if (profile.age > 40) {
      const ageAdjustment = Math.min((profile.age - 40) * 0.5, 15)
      baseAllocation.bonds += ageAdjustment
      baseAllocation.stocks -= ageAdjustment
    }

    // Adjust for time horizon
    if (profile.timeHorizon < 10) {
      baseAllocation.bonds += 10
      baseAllocation.stocks -= 10
    }

    const expectedReturn = this.calculateExpectedReturn(baseAllocation)
    const volatility = this.calculatePortfolioVolatility(baseAllocation)

    return {
      ...baseAllocation,
      description: `${riskAssessment.category.charAt(0).toUpperCase() + riskAssessment.category.slice(1)} portfolio for ${profile.timeHorizon}-year horizon`,
      expectedReturn,
      volatility,
      reasoning: [
        `${riskAssessment.category} risk approach matches your profile`,
        'Diversified across asset classes for optimal risk-return balance',
        'Age-appropriate allocation balancing growth and preservation'
      ]
    }
  }

  private generateInvestmentOptions(profile: InvestorProfile, portfolio: PortfolioAllocation): InvestmentOption[] {
    const options: InvestmentOption[] = []

    // Stock ETFs
    if (portfolio.stocks > 0) {
      options.push({
        id: 'vti',
        name: 'Vanguard Total Stock Market ETF (VTI)',
        type: 'etf',
        category: 'domestic_stock',
        ticker: 'VTI',
        expenseRatio: 0.03,
        minimumInvestment: 0,
        description: 'Broad diversification across the entire U.S. stock market',
        pros: ['Low fees', 'Broad diversification', 'High liquidity'],
        cons: ['U.S. only exposure', 'Market volatility'],
        riskLevel: 'medium',
        expectedReturn: 0.08,
        recommendation: 'highly_recommended',
        allocationPercentage: Math.round(portfolio.stocks * 0.7)
      })
    }

    // Bond ETFs
    if (portfolio.bonds > 0) {
      options.push({
        id: 'bnd',
        name: 'Vanguard Total Bond Market ETF (BND)',
        type: 'etf',
        category: 'bonds',
        ticker: 'BND',
        expenseRatio: 0.03,
        minimumInvestment: 0,
        description: 'Broad exposure to U.S. investment-grade bonds',
        pros: ['Capital preservation', 'Income generation', 'Low volatility'],
        cons: ['Interest rate risk', 'Lower growth potential'],
        riskLevel: 'low',
        expectedReturn: 0.03,
        recommendation: 'recommended',
        allocationPercentage: portfolio.bonds
      })
    }

    // International ETFs
    if (portfolio.international > 0) {
      options.push({
        id: 'vtiax',
        name: 'Vanguard Total International Stock ETF (VTIAX)',
        type: 'etf',
        category: 'international_stock',
        ticker: 'VTIAX',
        expenseRatio: 0.11,
        minimumInvestment: 0,
        description: 'Exposure to developed and emerging international markets',
        pros: ['Geographic diversification', 'Currency exposure', 'Growth potential'],
        cons: ['Higher fees than domestic', 'Currency risk'],
        riskLevel: 'medium',
        expectedReturn: 0.07,
        recommendation: 'recommended',
        allocationPercentage: portfolio.international
      })
    }

    return options
  }

  private generatePersonalizedRecommendations(profile: InvestorProfile, riskAssessment: RiskAssessment): PersonalizedRecommendation[] {
    return [
      {
        title: 'Build Emergency Fund First',
        description: 'Ensure you have 3-6 months of expenses saved before investing significantly',
        priority: 'high',
        timeframe: 'immediate',
        actionSteps: [
          'Calculate monthly expenses',
          'Set up separate high-yield savings account',
          'Automate monthly transfers until target is reached'
        ],
        expectedBenefit: 'Financial security and peace of mind for investment decisions'
      },
      {
        title: 'Start Dollar-Cost Averaging',
        description: 'Invest consistently each month to reduce timing risk',
        priority: 'high',
        timeframe: 'immediate',
        actionSteps: [
          'Set up automatic monthly investments',
          `Start with $${Math.min(profile.monthlyInvestmentCapacity, 500)} per month`,
          'Increase amount annually or with income growth'
        ],
        expectedBenefit: 'Reduced market timing risk and disciplined wealth building'
      },
      {
        title: 'Maximize Tax-Advantaged Accounts',
        description: 'Prioritize 401(k), IRA, and HSA contributions for tax benefits',
        priority: 'high',
        timeframe: 'immediate',
        actionSteps: [
          'Contribute enough to 401(k) to get full employer match',
          'Consider opening and funding an IRA',
          'Maximize HSA contributions if available'
        ],
        expectedBenefit: 'Significant tax savings and accelerated wealth building'
      }
    ]
  }

  private generateNextSteps(profile: InvestorProfile, portfolio: PortfolioAllocation): string[] {
    return [
      'Open investment accounts (401k, IRA, or taxable brokerage)',
      `Start with $${Math.min(profile.monthlyInvestmentCapacity * 3, 1000)} initial investment`,
      'Set up automatic monthly contributions',
      'Review and rebalance portfolio quarterly',
      'Continue learning through books, courses, or financial advisor consultation',
      'Increase investment amounts as income grows'
    ]
  }

  // Utility methods
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

  private inferRiskTolerance(transactions: Transaction[]): 'conservative' | 'moderate' | 'aggressive' {
    const monthlyIncome = this.calculateMonthlyIncome(transactions)
    const monthlyExpenses = this.calculateMonthlyExpenses(transactions)
    const savingsRate = monthlyIncome > 0 ? (monthlyIncome - monthlyExpenses) / monthlyIncome : 0

    if (savingsRate > 0.2) return 'aggressive'
    if (savingsRate > 0.1) return 'moderate'
    return 'conservative'
  }

  private assessLiquidityNeeds(transactions: Transaction[]): 'low' | 'medium' | 'high' {
    const expenseTransactions = transactions.filter(t => t.type === 'expense')
    if (expenseTransactions.length < 3) return 'medium'

    const monthlyExpenses = this.calculateMonthlyExpenses(transactions)
    const expenseVariability = this.calculateExpenseVariability(expenseTransactions)
    
    if (expenseVariability > monthlyExpenses * 0.3) return 'high'
    if (expenseVariability > monthlyExpenses * 0.15) return 'medium'
    return 'low'
  }

  private assessIncomeStability(transactions: Transaction[]): 'stable' | 'moderate' | 'volatile' {
    const incomeTransactions = transactions.filter(t => t.type === 'income')
    if (incomeTransactions.length < 3) return 'moderate'

    const amounts = incomeTransactions.map(t => t.amount)
    const mean = amounts.reduce((sum, a) => sum + a, 0) / amounts.length
    const variance = amounts.reduce((sum, a) => sum + Math.pow(a - mean, 2), 0) / amounts.length
    const cv = mean > 0 ? Math.sqrt(variance) / mean : 0

    if (cv < 0.1) return 'stable'
    if (cv < 0.3) return 'moderate'
    return 'volatile'
  }

  private calculateExpectedReturn(allocation: any): number {
    const returns = { stocks: 0.08, bonds: 0.03, reits: 0.06, cash: 0.01, international: 0.07 }
    let weightedReturn = 0
    Object.keys(allocation).forEach(asset => {
      if (returns[asset as keyof typeof returns]) {
        weightedReturn += (allocation[asset] / 100) * returns[asset as keyof typeof returns]
      }
    })
    return weightedReturn
  }

  private calculatePortfolioVolatility(allocation: any): number {
    const volatilities = { stocks: 0.16, bonds: 0.04, reits: 0.20, cash: 0.01, international: 0.18 }
    let weightedVolatility = 0
    Object.keys(allocation).forEach(asset => {
      if (volatilities[asset as keyof typeof volatilities]) {
        weightedVolatility += Math.pow((allocation[asset] / 100) * volatilities[asset as keyof typeof volatilities], 2)
      }
    })
    return Math.sqrt(weightedVolatility)
  }

  private generateRiskRecommendations(category: string): string[] {
    switch (category) {
      case 'conservative':
        return ['Focus on capital preservation', 'Consider high-quality bonds', 'Maintain adequate cash reserves']
      case 'moderate':
        return ['Balance growth and stability', 'Regular rebalancing', 'Diversified portfolio approach']
      case 'aggressive':
        return ['Focus on long-term growth', 'Emphasize stock investments', 'Consider growth-oriented investments']
      default:
        return ['Diversify investments', 'Review regularly', 'Stay disciplined']
    }
  }

  private generateRiskWarnings(category: string): string[] {
    switch (category) {
      case 'aggressive':
        return ['High volatility expected', 'Ensure emotional tolerance for fluctuations']
      case 'conservative':
        return ['May not keep pace with inflation long-term']
      default:
        return ['All investments carry risk', 'Past performance doesn\'t guarantee future results']
    }
  }

  private getMonthsSpan(transactions: Transaction[]): number {
    if (transactions.length === 0) return 1
    const dates = transactions.map(t => t.date.getTime())
    const minDate = Math.min(...dates)
    const maxDate = Math.max(...dates)
    return Math.max((maxDate - minDate) / (1000 * 60 * 60 * 24 * 30), 1)
  }

  private calculateExpenseVariability(transactions: Transaction[]): number {
    const amounts = transactions.map(t => t.amount)
    const mean = amounts.reduce((sum, a) => sum + a, 0) / amounts.length
    const variance = amounts.reduce((sum, a) => sum + Math.pow(a - mean, 2), 0) / amounts.length
    return Math.sqrt(variance)
  }

  private getDefaultRecommendations(): InvestmentRecommendation {
    return {
      userProfile: {
        riskTolerance: 'moderate',
        timeHorizon: 20,
        investmentGoals: ['retirement'],
        monthlyInvestmentCapacity: 500,
        currentInvestments: 0,
        age: 35,
        financialKnowledge: 'beginner',
        liquidityNeeds: 'medium'
      },
      recommendedPortfolio: {
        stocks: 60,
        bonds: 30,
        reits: 5,
        cash: 5,
        international: 20,
        description: 'Moderate balanced portfolio',
        expectedReturn: 0.06,
        volatility: 0.12,
        reasoning: ['Balanced approach for long-term growth']
      },
      investmentOptions: [],
      riskAssessment: {
        score: 5,
        category: 'moderate',
        factors: [],
        recommendations: ['Diversify investments'],
        warnings: ['All investments carry risk']
      },
      recommendations: [],
      nextSteps: ['Open investment account', 'Start investing regularly']
    }
  }
}

// Export singleton instance
export const investmentRecommendationsService = new InvestmentRecommendationsService()
export default investmentRecommendationsService