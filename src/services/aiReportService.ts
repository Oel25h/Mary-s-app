import { GoogleGenerativeAI } from '@google/generative-ai'
import { Transaction, Budget, AIReport, ReportType, ReportGenerationOptions, ReportAnalysisData, AIReportResponse } from '@/types'

/**
 * AI-Powered Report Service using Google Gemini
 * Generates intelligent, natural language financial reports with insights and recommendations
 */
class AIReportService {
  private genAI: GoogleGenerativeAI
  private model: any

  constructor() {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('Google Gemini API key not found')
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey)
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  }

  /**
   * Generate an AI-powered financial report
   */
  async generateReport(
    transactions: Transaction[], 
    budgets: Budget[], 
    options: ReportGenerationOptions
  ): Promise<AIReportResponse> {
    const startTime = Date.now()
    
    try {
      console.log(`AIReportService: Generating ${options.type} report`)
      
      // Analyze the data
      const analysisData = this.analyzeFinancialData(transactions, budgets, options)
      
      // Generate the report using AI
      const aiResponse = await this.generateReportWithAI(analysisData, options)
      
      // Create the final report object
      const report: AIReport = {
        id: this.generateReportId(),
        type: options.type,
        title: aiResponse.title,
        content: aiResponse.content,
        summary: aiResponse.summary,
        insights: aiResponse.insights,
        recommendations: aiResponse.recommendations,
        generatedAt: new Date(),
        dataRange: this.getDataRange(transactions, options),
        metadata: {
          transactionsAnalyzed: transactions.length,
          budgetsAnalyzed: budgets.length,
          processingTime: Date.now() - startTime,
          aiModel: 'gemini-1.5-flash'
        }
      }

      return {
        report,
        errors: [],
        warnings: [],
        processingTime: Date.now() - startTime
      }

    } catch (error) {
      console.error('AIReportService: Error generating report:', error)
      
      return {
        report: this.createErrorReport(options.type, error),
        errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
        warnings: [],
        processingTime: Date.now() - startTime
      }
    }
  }

  /**
   * Analyze financial data to prepare for AI processing
   */
  private analyzeFinancialData(
    transactions: Transaction[], 
    budgets: Budget[], 
    options: ReportGenerationOptions
  ): ReportAnalysisData {
    // Filter transactions by date range if specified
    let filteredTransactions = transactions
    if (options.dateRange) {
      filteredTransactions = transactions.filter(t => 
        t.date >= options.dateRange!.startDate && t.date <= options.dateRange!.endDate
      )
    }

    // Calculate basic metrics
    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    // Category breakdown
    const categoryBreakdown: Record<string, number> = {}
    filteredTransactions.forEach(t => {
      if (t.type === 'expense') {
        categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount
      }
    })

    // Monthly trends (last 6 months)
    const monthlyTrends = this.calculateMonthlyTrends(filteredTransactions)

    // Budget performance
    const budgetPerformance = this.calculateBudgetPerformance(budgets, filteredTransactions)

    return {
      transactions: filteredTransactions,
      budgets,
      totalIncome,
      totalExpenses,
      netIncome: totalIncome - totalExpenses,
      categoryBreakdown,
      monthlyTrends,
      budgetPerformance
    }
  }

  /**
   * Generate report content using Google Gemini AI
   */
  private async generateReportWithAI(
    data: ReportAnalysisData, 
    options: ReportGenerationOptions
  ): Promise<{
    title: string
    content: string
    summary: string
    insights: string[]
    recommendations: string[]
  }> {
    const prompt = this.buildReportPrompt(data, options)
    
    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      return this.parseAIReportResponse(text)
      
    } catch (error) {
      console.error('AIReportService: AI generation error:', error)
      throw new Error(`Failed to generate AI report: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Build the AI prompt for report generation
   */
  private buildReportPrompt(data: ReportAnalysisData, options: ReportGenerationOptions): string {
    const reportTypePrompts = {
      'monthly-summary': this.buildMonthlySummaryPrompt(data),
      'spending-analysis': this.buildSpendingAnalysisPrompt(data),
      'budget-performance': this.buildBudgetPerformancePrompt(data)
    }

    const basePrompt = `You are a professional financial advisor creating a ${options.type.replace('-', ' ')} report. 

IMPORTANT: Respond ONLY with valid JSON in this exact format:
{
  "title": "Report Title",
  "content": "Full report content in markdown format",
  "summary": "Brief 2-3 sentence summary",
  "insights": ["Key insight 1", "Key insight 2", "Key insight 3"],
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"]
}

Guidelines:
- Write in simple, clear language that anyone can understand
- Be encouraging and constructive, not judgmental
- Focus on actionable insights and practical recommendations
- Use specific numbers and percentages from the data
- Keep insights concise but meaningful
- Make recommendations specific and achievable

${reportTypePrompts[options.type]}

Remember: Respond ONLY with the JSON object, no additional text.`

    return basePrompt
  }

  /**
   * Build prompt for Monthly Financial Summary report
   */
  private buildMonthlySummaryPrompt(data: ReportAnalysisData): string {
    return `
DATA ANALYSIS:
- Total Income: $${data.totalIncome.toFixed(2)}
- Total Expenses: $${data.totalExpenses.toFixed(2)}
- Net Income: $${data.netIncome.toFixed(2)}
- Transactions Analyzed: ${data.transactions.length}

TOP SPENDING CATEGORIES:
${Object.entries(data.categoryBreakdown)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 5)
  .map(([category, amount]) => `- ${category}: $${amount.toFixed(2)}`)
  .join('\n')}

MONTHLY TRENDS (Last 6 months):
${data.monthlyTrends.map(trend => 
  `- ${trend.month}: Income $${trend.income.toFixed(2)}, Expenses $${trend.expenses.toFixed(2)}, Net $${trend.net.toFixed(2)}`
).join('\n')}

Create a comprehensive monthly financial summary that covers:
1. Overall financial health and performance
2. Income vs expenses analysis
3. Spending pattern insights
4. Month-over-month trends
5. Areas of concern or success
`
  }

  /**
   * Build prompt for Spending Analysis report
   */
  private buildSpendingAnalysisPrompt(data: ReportAnalysisData): string {
    return `
SPENDING BREAKDOWN:
${Object.entries(data.categoryBreakdown)
  .sort(([,a], [,b]) => b - a)
  .map(([category, amount]) => `- ${category}: $${amount.toFixed(2)} (${((amount/data.totalExpenses)*100).toFixed(1)}%)`)
  .join('\n')}

TRANSACTION PATTERNS:
- Average transaction amount: $${(data.totalExpenses / data.transactions.filter(t => t.type === 'expense').length).toFixed(2)}
- Most frequent categories: ${Object.entries(data.categoryBreakdown).sort(([,a], [,b]) => b - a).slice(0, 3).map(([cat]) => cat).join(', ')}

Create a detailed spending analysis that includes:
1. Category-wise spending breakdown with percentages
2. Spending patterns and habits analysis
3. Comparison with typical spending patterns
4. Identification of potential overspending areas
5. Opportunities for cost optimization
`
  }

  /**
   * Build prompt for Budget Performance report
   */
  private buildBudgetPerformancePrompt(data: ReportAnalysisData): string {
    return `
BUDGET PERFORMANCE:
${data.budgetPerformance.map(bp => 
  `- ${bp.category}: Budgeted $${bp.budgeted.toFixed(2)}, Spent $${bp.spent.toFixed(2)}, ${bp.percentageUsed.toFixed(1)}% used`
).join('\n')}

BUDGET SUMMARY:
- Total Budgets: ${data.budgets.length}
- Categories Over Budget: ${data.budgetPerformance.filter(bp => bp.percentageUsed > 100).length}
- Categories Under Budget: ${data.budgetPerformance.filter(bp => bp.percentageUsed < 80).length}

Create a comprehensive budget performance analysis that covers:
1. Overall budget adherence and performance
2. Categories that are over/under budget
3. Budget vs actual spending analysis
4. Seasonal or trend-based budget insights
5. Budget adjustment recommendations
`
  }

  /**
   * Parse AI response and extract structured data
   */
  private parseAIReportResponse(text: string): {
    title: string
    content: string
    summary: string
    insights: string[]
    recommendations: string[]
  } {
    try {
      // Clean the response text
      let cleanText = text.trim()
      
      // Remove markdown code blocks if present
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/```json\n?/, '').replace(/\n?```$/, '')
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/```\n?/, '').replace(/\n?```$/, '')
      }
      
      const parsed = JSON.parse(cleanText)
      
      return {
        title: parsed.title || 'Financial Report',
        content: parsed.content || 'Report content not available',
        summary: parsed.summary || 'Summary not available',
        insights: Array.isArray(parsed.insights) ? parsed.insights : [],
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : []
      }
      
    } catch (error) {
      console.error('AIReportService: Failed to parse AI response:', error)
      throw new Error('Failed to parse AI report response')
    }
  }

  /**
   * Calculate monthly trends for the last 6 months
   */
  private calculateMonthlyTrends(transactions: Transaction[]): Array<{
    month: string
    income: number
    expenses: number
    net: number
  }> {
    const monthlyData: Record<string, { income: number; expenses: number }> = {}
    
    transactions.forEach(t => {
      const monthKey = t.date.toISOString().substring(0, 7) // YYYY-MM format
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0 }
      }
      
      if (t.type === 'income') {
        monthlyData[monthKey].income += t.amount
      } else {
        monthlyData[monthKey].expenses += t.amount
      }
    })

    return Object.entries(monthlyData)
      .sort(([a], [b]) => b.localeCompare(a)) // Sort by date descending
      .slice(0, 6) // Last 6 months
      .reverse() // Oldest first
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
        income: data.income,
        expenses: data.expenses,
        net: data.income - data.expenses
      }))
  }

  /**
   * Calculate budget performance metrics
   */
  private calculateBudgetPerformance(budgets: Budget[], transactions: Transaction[]): Array<{
    category: string
    budgeted: number
    spent: number
    remaining: number
    percentageUsed: number
  }> {
    return budgets.map(budget => {
      const spent = transactions
        .filter(t => t.type === 'expense' && t.category === budget.category)
        .reduce((sum, t) => sum + t.amount, 0)
      
      return {
        category: budget.category,
        budgeted: budget.budgetAmount,
        spent,
        remaining: budget.budgetAmount - spent,
        percentageUsed: (spent / budget.budgetAmount) * 100
      }
    })
  }

  /**
   * Get data range for the report
   */
  private getDataRange(transactions: Transaction[], options: ReportGenerationOptions): { startDate: Date; endDate: Date } {
    if (options.dateRange) {
      return options.dateRange
    }

    // Default to last 30 days or all available data
    const dates = transactions.map(t => t.date).sort((a, b) => a.getTime() - b.getTime())
    const endDate = dates[dates.length - 1] || new Date()
    const startDate = dates[0] || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    return { startDate, endDate }
  }

  /**
   * Create error report when generation fails
   */
  private createErrorReport(type: ReportType, error: any): AIReport {
    return {
      id: this.generateReportId(),
      type,
      title: 'Report Generation Failed',
      content: 'We encountered an issue generating your financial report. Please try again later.',
      summary: 'Report generation failed due to a technical issue.',
      insights: [],
      recommendations: ['Please try generating the report again', 'Contact support if the issue persists'],
      generatedAt: new Date(),
      dataRange: { startDate: new Date(), endDate: new Date() },
      metadata: {
        transactionsAnalyzed: 0,
        budgetsAnalyzed: 0,
        processingTime: 0,
        aiModel: 'gemini-1.5-flash'
      }
    }
  }

  /**
   * Generate unique ID for reports
   */
  private generateReportId(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    return `ai-report-${timestamp}-${random}`
  }
}

// Export singleton instance
export const aiReportService = new AIReportService()
export default aiReportService
