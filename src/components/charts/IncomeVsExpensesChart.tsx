'use client'

import { useState } from 'react'
import { useApp } from '@/contexts/AppContext'
import { useChartResponsive } from '@/hooks/useResponsive'
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart
} from 'recharts'
import { BarChart3, TrendingUp, TrendingDown, Calendar, Filter, DollarSign } from 'lucide-react'

type TimePeriod = 'weekly' | 'monthly' | 'quarterly'
type ChartType = 'combo' | 'area' | 'bar'

interface ChartData {
  period: string
  income: number
  expenses: number
  net: number
  incomeCount: number
  expenseCount: number
}

export default function IncomeVsExpensesChart() {
  const { transactions, getTotalIncome, getTotalExpenses } = useApp()
  const { chartConfig, isMobile } = useChartResponsive()
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('monthly')
  const [chartType, setChartType] = useState<ChartType>('combo')

  const totalIncome = getTotalIncome()
  const totalExpenses = getTotalExpenses()
  const netIncome = totalIncome - totalExpenses

  if (transactions.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-8 shadow-soft hover:shadow-large transition-all duration-300 card-hover animate-in">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-secondary-900">Income vs Expenses</h3>
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse-soft" />
        </div>

        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl flex items-center justify-center mb-6">
              <BarChart3 className="w-12 h-12 text-primary-400" />
            </div>
            <div className="absolute -inset-2 bg-gradient-to-r from-primary-500/20 to-success-500/20 rounded-2xl opacity-50 -z-10 blur-sm" />
          </div>
          <p className="text-secondary-700 font-semibold mb-3 text-lg">No transaction data available</p>
          <p className="text-secondary-500 font-medium max-w-sm">Add transactions to view spending comparison</p>
        </div>
      </div>
    )
  }

  // Process data based on selected time period
  const processDataByPeriod = (): ChartData[] => {
    const dataMap = new Map<string, ChartData>()

    transactions.forEach(transaction => {
      const date = new Date(transaction.date)
      let periodKey: string

      switch (timePeriod) {
        case 'weekly':
          const weekStart = new Date(date)
          weekStart.setDate(date.getDate() - date.getDay())
          periodKey = weekStart.toISOString().split('T')[0]
          break
        case 'quarterly':
          const quarter = Math.floor(date.getMonth() / 3) + 1
          periodKey = `${date.getFullYear()}-Q${quarter}`
          break
        default: // monthly
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      }

      if (!dataMap.has(periodKey)) {
        dataMap.set(periodKey, {
          period: periodKey,
          income: 0,
          expenses: 0,
          net: 0,
          incomeCount: 0,
          expenseCount: 0
        })
      }

      const data = dataMap.get(periodKey)!
      if (transaction.type === 'income') {
        data.income += transaction.amount
        data.incomeCount++
      } else {
        data.expenses += transaction.amount
        data.expenseCount++
      }
      data.net = data.income - data.expenses
    })

    return Array.from(dataMap.values()).sort((a, b) => a.period.localeCompare(b.period))
  }

  const chartData = processDataByPeriod()

  // Calculate trend indicators
  const calculateTrend = (data: ChartData[], key: keyof Pick<ChartData, 'income' | 'expenses' | 'net'>) => {
    if (data.length < 2) return 0
    const current = data[data.length - 1][key]
    const previous = data[data.length - 2][key]
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  const incomeTrend = calculateTrend(chartData, 'income')
  const expenseTrend = calculateTrend(chartData, 'expenses')
  const netTrend = calculateTrend(chartData, 'net')

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-xl p-4 shadow-large">
          <p className="font-semibold text-secondary-900 mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-success-600 font-medium">
              Income: ${data.income.toFixed(2)} ({data.incomeCount} transactions)
            </p>
            <p className="text-danger-600 font-medium">
              Expenses: ${data.expenses.toFixed(2)} ({data.expenseCount} transactions)
            </p>
            <p className={`font-bold ${data.net >= 0 ? 'text-success-700' : 'text-danger-700'}`}>
              Net: ${data.net.toFixed(2)}
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  const formatPeriodLabel = (period: string) => {
    if (timePeriod === 'quarterly') {
      return period.replace('-Q', ' Q')
    } else if (timePeriod === 'weekly') {
      return new Date(period).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } else {
      const [year, month] = period.split('-')
      const date = new Date(parseInt(year), parseInt(month) - 1)
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    }
  }

  const formatAxisLabel = (period: string) => {
    if (timePeriod === 'quarterly') {
      return period.replace('-Q', '\nQ')
    } else if (timePeriod === 'weekly') {
      return new Date(period).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })
    } else {
      const [year, month] = period.split('-')
      const date = new Date(parseInt(year), parseInt(month) - 1)
      return date.toLocaleDateString('en-US', { month: 'short' })
    }
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 mobile-padding py-4 sm:py-6 shadow-soft hover:shadow-large transition-all duration-300 card-hover animate-in h-full flex flex-col">
      {/* Mobile-Optimized Header with Controls */}
      <div className="flex flex-col space-y-3 sm:space-y-4 mb-4 sm:mb-6">
        {/* Title and Net Income */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <h3 className="text-lg sm:text-xl font-bold text-secondary-900">Income vs Expenses</h3>
          <div className="px-2 sm:px-3 py-1 bg-success-50 rounded-lg self-start sm:self-auto">
            <span className="text-xs sm:text-sm font-bold text-success-700">Net: ${netIncome.toFixed(0)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          {/* Time Period Selector */}
          <div className="flex items-center space-x-2 flex-1 sm:flex-none">
            <Calendar className="w-4 h-4 text-secondary-600 flex-shrink-0" />
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
              className="flex-1 sm:w-auto text-sm py-2 px-3 border border-secondary-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent touch-target"
              aria-label="Select time period"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
            </select>
          </div>

          {/* Chart Type Selector */}
          <div className="flex items-center space-x-2 flex-1 sm:flex-none">
            <Filter className="w-4 h-4 text-secondary-600 flex-shrink-0" />
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value as ChartType)}
              className="flex-1 sm:w-auto text-sm py-2 px-3 border border-secondary-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent touch-target"
              aria-label="Select chart type"
            >
              <option value="combo">Combo Chart</option>
              <option value="area">Area Chart</option>
              <option value="bar">Bar Chart</option>
            </select>
          </div>
        </div>
      </div>



      {/* Mobile-Optimized Chart */}
      <div className="flex-1 min-h-0 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'combo' ? (
            <ComposedChart
              data={chartData}
              margin={chartConfig.margin}
            >
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.2}/>
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 2" stroke="#e2e8f0" opacity={0.3} />
              <XAxis
                dataKey="period"
                tickFormatter={formatAxisLabel}
                stroke="#64748b"
                fontSize={chartConfig.fontSize}
                fontWeight={500}
                interval="preserveStartEnd"
                angle={chartConfig.xAxisAngle}
                textAnchor="end"
                height={chartConfig.xAxisHeight}
              />
              <YAxis
                stroke="#64748b"
                fontSize={chartConfig.fontSize}
                fontWeight={500}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                width={chartConfig.yAxisWidth}
              />
              <Tooltip
                content={<CustomTooltip />}
                wrapperStyle={{ zIndex: 1000 }}
                position={{ x: undefined, y: undefined }}
              />
              <Legend
                wrapperStyle={{
                  paddingTop: '10px',
                  fontSize: chartConfig.legendFontSize
                }}
                iconType="rect"
                iconSize={chartConfig.iconSize}
              />
              <Bar
                dataKey="income"
                fill="url(#incomeGradient)"
                name="Income"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="expenses"
                fill="url(#expenseGradient)"
                name="Expenses"
                radius={[2, 2, 0, 0]}
              />
              <Line
                type="monotone"
                dataKey="net"
                stroke="#6366f1"
                strokeWidth={chartConfig.strokeWidth}
                name="Net"
                dot={{ fill: '#6366f1', strokeWidth: 1, r: chartConfig.dotRadius }}
                activeDot={{ r: chartConfig.activeDotRadius, stroke: '#6366f1', strokeWidth: 1 }}
              />
            </ComposedChart>
          ) : chartType === 'area' ? (
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 10, bottom: 40 }}
            >
              <defs>
                <linearGradient id="incomeAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="expenseAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 2" stroke="#e2e8f0" opacity={0.3} />
              <XAxis
                dataKey="period"
                tickFormatter={formatAxisLabel}
                stroke="#64748b"
                fontSize={10}
                fontWeight={500}
                interval="preserveStartEnd"
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                stroke="#64748b"
                fontSize={10}
                fontWeight={500}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} iconSize={8} />
              <Area
                type="monotone"
                dataKey="income"
                stackId="1"
                stroke="#10b981"
                fill="url(#incomeAreaGradient)"
                name="Income"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stackId="2"
                stroke="#ef4444"
                fill="url(#expenseAreaGradient)"
                name="Expenses"
              />
            </AreaChart>
          ) : (
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 10, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="2 2" stroke="#e2e8f0" opacity={0.3} />
              <XAxis
                dataKey="period"
                tickFormatter={formatAxisLabel}
                stroke="#64748b"
                fontSize={10}
                fontWeight={500}
                interval="preserveStartEnd"
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                stroke="#64748b"
                fontSize={10}
                fontWeight={500}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} iconSize={8} />
              <Bar
                dataKey="income"
                fill="#10b981"
                name="Income"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="expenses"
                fill="#ef4444"
                name="Expenses"
                radius={[2, 2, 0, 0]}
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Compact Period Summary */}
      {chartData.length > 1 && (
        <div className="pt-3 border-t border-secondary-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-secondary-900 text-sm">Recent Periods</h4>
            <span className="text-xs text-secondary-600">{chartData.length} periods</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {chartData.slice(-6).map((entry, index) => {
              const periodLabel = formatPeriodLabel(entry.period)
              return (
                <div key={index} className="bg-secondary-50 rounded-lg p-2 hover:bg-secondary-100 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-secondary-900 text-xs">{periodLabel}</span>
                    <span className={`text-xs font-bold px-1 py-0.5 rounded ${
                      entry.net >= 0
                        ? 'bg-success-100 text-success-700'
                        : 'bg-danger-100 text-danger-700'
                    }`}>
                      ${entry.net.toFixed(0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-success-600">+${entry.income.toFixed(0)}</span>
                    <span className="text-danger-600">-${entry.expenses.toFixed(0)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
