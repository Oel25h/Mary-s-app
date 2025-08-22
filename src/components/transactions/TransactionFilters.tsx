'use client'

import { Search, Filter, Calendar } from 'lucide-react'

interface TransactionFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedCategory: string
  onCategoryChange: (value: string) => void
  dateRange: string
  onDateRangeChange: (value: string) => void
}

export default function TransactionFilters({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  dateRange,
  onDateRangeChange
}: TransactionFiltersProps) {
  const categories = [
    'All Categories',
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Income',
    'Other'
  ]

  const dateRanges = [
    'All Time',
    'This Month',
    'Last Month',
    'Last 3 Months',
    'This Year',
    'Custom Range'
  ]

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-8 shadow-soft mb-8 animate-in">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-secondary-900 mb-2">Filter Transactions</h3>
        <p className="text-secondary-600 font-medium">Find specific transactions quickly</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Search */}
        <div className="flex-1">
          <label className="block text-sm font-semibold text-secondary-700 mb-3">Search</label>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5 group-focus-within:text-primary-500 transition-colors" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="input-field pl-12 h-12 text-base"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="lg:w-56">
          <label className="block text-sm font-semibold text-secondary-700 mb-3">Category</label>
          <div className="relative group">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5 group-focus-within:text-primary-500 transition-colors" />
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="input-field pl-12 h-12 text-base appearance-none cursor-pointer"
              aria-label="Filter by category"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="lg:w-56">
          <label className="block text-sm font-semibold text-secondary-700 mb-3">Date Range</label>
          <div className="relative group">
            <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5 group-focus-within:text-primary-500 transition-colors" />
            <select
              value={dateRange}
              onChange={(e) => onDateRangeChange(e.target.value)}
              className="input-field pl-12 h-12 text-base appearance-none cursor-pointer"
              aria-label="Filter by date range"
            >
              {dateRanges.map((range) => (
                <option key={range} value={range}>
                  {range}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
