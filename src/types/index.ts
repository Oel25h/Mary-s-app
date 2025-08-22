// Core data types for the financial application

export interface Transaction {
  id: string
  date: Date
  description: string
  category: string
  amount: number
  type: 'income' | 'expense'
}

export interface Budget {
  id: string
  category: string
  budgetAmount: number
  spentAmount: number
  period: string
}

// New AI Import System Types
export interface ImportResult {
  transactions: Transaction[]
  errors: string[]
  warnings: string[]
  summary: {
    totalProcessed: number
    successfullyParsed: number
    failed: number
    duplicatesFound: number
  }
}

export interface FileProcessingResult {
  content: string
  metadata: {
    fileName: string
    fileSize: number
    fileType: string
    extractedAt: Date
  }
  error?: string
}

export interface AIParseResponse {
  transactions: Array<{
    date: string
    description: string
    amount: number
    category: string
    type: 'income' | 'expense'
    confidence: number
  }>
  errors: string[]
  warnings: string[]
  metadata: {
    totalFound: number
    processingTime: number
    model: string
  }
}

export interface ValidationResult {
  valid: Transaction[]
  duplicates: Transaction[]
  conflicts: Transaction[]
  errors: string[]
  warnings: string[]
}

export interface ImportOptions {
  skipDuplicates?: boolean
  dateFormat?: 'auto' | 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'
  currency?: string
  confidenceThreshold?: number
  categoryMapping?: Record<string, string>
}

// AI Reports System Types
export interface AIReport {
  id: string
  type: ReportType
  title: string
  content: string
  summary: string
  insights: string[]
  recommendations: string[]
  generatedAt: Date
  dataRange: {
    startDate: Date
    endDate: Date
  }
  metadata: {
    transactionsAnalyzed: number
    budgetsAnalyzed: number
    processingTime: number
    aiModel: string
  }
}

export type ReportType = 'monthly-summary' | 'spending-analysis' | 'budget-performance'

export interface ReportGenerationOptions {
  type: ReportType
  dateRange?: {
    startDate: Date
    endDate: Date
  }
  focusAreas?: string[]
  includeCharts?: boolean
  detailLevel?: 'basic' | 'detailed' | 'comprehensive'
}

export interface ReportAnalysisData {
  transactions: Transaction[]
  budgets: Budget[]
  totalIncome: number
  totalExpenses: number
  netIncome: number
  categoryBreakdown: Record<string, number>
  monthlyTrends: Array<{
    month: string
    income: number
    expenses: number
    net: number
  }>
  budgetPerformance: Array<{
    category: string
    budgeted: number
    spent: number
    remaining: number
    percentageUsed: number
  }>
}

export interface AIReportResponse {
  report: AIReport
  errors: string[]
  warnings: string[]
  processingTime: number
}

// Enhanced AI Chat System Types
export interface ChatMessage {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
  isError?: boolean
  errorType?: 'api_error' | 'rate_limit' | 'network_error' | 'validation_error'
  metadata?: {
    processingTime?: number
    model?: string
    contextUsed?: boolean
  }
}

export interface ChatConversation {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
  summary?: string
  tags?: string[]
}

export interface FinancialContext {
  transactions: Transaction[]
  budgets: Budget[]
  totalIncome: number
  totalExpenses: number
  netIncome: number
  savingsRate: number
  categoryBreakdown: Record<string, number>
  recentTransactions: Transaction[]
  budgetPerformance: Array<{
    category: string
    budgeted: number
    spent: number
    percentageUsed: number
  }>
}

export interface ChatResponse {
  message: string
  timestamp: Date
  isError?: boolean
  errorType?: 'api_error' | 'rate_limit' | 'network_error' | 'validation_error'
  metadata?: {
    processingTime: number
    model: string
    contextUsed: boolean
    suggestedQuestions?: string[]
  }
}

export interface ChatOptions {
  includeFinancialContext?: boolean
  conversationId?: string
  maxContextMessages?: number
  responseStyle?: 'concise' | 'detailed' | 'comprehensive'
}

// App state types
export interface AppState {
  transactions: Transaction[]
  budgets: Budget[]
}

// Context types
export interface AppContextType {
  // State
  transactions: Transaction[]
  budgets: Budget[]
  goals: FinancialGoal[]
  loading: boolean
  error: string | null

  // Transaction methods
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>

  // Budget methods
  addBudget: (budget: Omit<Budget, 'id' | 'spentAmount'>) => Promise<void>
  updateBudget: (id: string, budget: Partial<Budget>) => Promise<void>
  deleteBudget: (id: string) => Promise<void>

  // Goal methods
  addGoal: (goal: Omit<FinancialGoal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateGoal: (id: string, goal: Partial<FinancialGoal>) => Promise<void>
  deleteGoal: (id: string) => Promise<void>
  updateGoalProgress: (id: string, currentAmount: number) => Promise<void>

  // Computed values
  getTotalIncome: () => number
  getTotalExpenses: () => number
  getNetIncome: () => number
  getSavingsRate: () => number
  getCategorySpending: (category: string) => number
}

// Cash Flow Forecasting Types
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

// Goal Achievement AI Types
export interface FinancialGoal {
  id: string
  name: string
  type: 'savings' | 'debt_payoff' | 'investment' | 'emergency_fund' | 'major_purchase' | 'retirement' | 'custom'
  targetAmount: number
  currentAmount: number
  targetDate: Date
  priority: 'low' | 'medium' | 'high' | 'critical'
  category?: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface GoalProgress {
  goalId: string
  progressPercentage: number
  monthsRemaining: number
  onTrackStatus: 'ahead' | 'on_track' | 'behind' | 'at_risk'
  recommendedMonthlyAmount: number
  currentMonthlyAmount: number
  projectedCompletionDate: Date
  confidenceLevel: number
}

export interface GoalOptimization {
  goalId: string
  currentStrategy: string
  optimizedStrategy: string
  potentialTimeSaving: number // months
  potentialCostSaving: number
  actionSteps: string[]
  riskLevel: 'low' | 'medium' | 'high'
  effort: 'low' | 'medium' | 'high'
}

export interface GoalConflict {
  conflictingGoals: string[]
  issue: string
  severity: 'minor' | 'moderate' | 'major'
  recommendations: string[]
  prioritySuggestion: string
}

export interface AIGoalInsight {
  type: 'opportunity' | 'warning' | 'achievement' | 'optimization'
  goalId?: string
  title: string
  description: string
  impact: 'low' | 'medium' | 'high'
  actionable: boolean
  suggestions: string[]
  estimatedBenefit?: number
}

export interface GoalAchievementPlan {
  goalId: string
  strategy: 'aggressive' | 'balanced' | 'conservative'
  monthlyContribution: number
  timeToCompletion: number
  milestones: Array<{
    date: Date
    amount: number
    description: string
    celebration: string
  }>
  adjustments: Array<{
    month: number
    reason: string
    newAmount: number
    rationale: string
  }>
  contingencyPlans: Array<{
    scenario: string
    impact: string
    response: string
  }>
}

export interface GoalPortfolio {
  goals: FinancialGoal[]
  totalTargetAmount: number
  totalCurrentAmount: number
  overallProgress: number
  monthlyCommitment: number
  conflicts: GoalConflict[]
  optimizations: GoalOptimization[]
  insights: AIGoalInsight[]
  portfolioHealth: 'excellent' | 'good' | 'needs_attention' | 'critical'
}

export interface GoalRecommendation {
  goalId: string
  action: 'increase_priority' | 'adjust_target' | 'extend_deadline' | 'reduce_scope'
  reason: string
  impact: string
  effort: 'low' | 'medium' | 'high'
  expectedOutcome: string
  implementationSteps: string[]
}

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
  timeHorizon: number
  investmentGoals: string[]
  monthlyInvestmentCapacity: number
  currentInvestments: number
  age: number
  financialKnowledge: 'beginner' | 'intermediate' | 'advanced'
  liquidityNeeds: 'low' | 'medium' | 'high'
}

export interface PortfolioAllocation {
  stocks: number
  bonds: number
  reits: number
  cash: number
  international: number
  description: string
  expectedReturn: number
  volatility: number
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
  score: number
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
