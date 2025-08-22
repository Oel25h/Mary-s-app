import { Transaction, Budget } from '@/types'

// Sample transactions for testing
export const sampleTransactions: Omit<Transaction, 'id'>[] = [
  // Current month (January 2024)
  {
    date: new Date('2024-01-15'),
    description: 'Grocery Shopping',
    category: 'Food & Dining',
    amount: 85.50,
    type: 'expense'
  },
  {
    date: new Date('2024-01-14'),
    description: 'Salary Payment',
    category: 'Income',
    amount: 3500.00,
    type: 'income'
  },
  {
    date: new Date('2024-01-13'),
    description: 'Gas Station',
    category: 'Transportation',
    amount: 45.20,
    type: 'expense'
  },
  {
    date: new Date('2024-01-10'),
    description: 'Coffee Shop',
    category: 'Food & Dining',
    amount: 12.50,
    type: 'expense'
  },
  {
    date: new Date('2024-01-08'),
    description: 'Movie Tickets',
    category: 'Entertainment',
    amount: 28.00,
    type: 'expense'
  },
  {
    date: new Date('2024-01-05'),
    description: 'Freelance Payment',
    category: 'Income',
    amount: 800.00,
    type: 'income'
  },
  // Previous month (December 2023)
  {
    date: new Date('2023-12-28'),
    description: 'Holiday Shopping',
    category: 'Shopping',
    amount: 150.00,
    type: 'expense'
  },
  {
    date: new Date('2023-12-25'),
    description: 'Christmas Dinner',
    category: 'Food & Dining',
    amount: 75.00,
    type: 'expense'
  },
  {
    date: new Date('2023-12-20'),
    description: 'Bonus Payment',
    category: 'Income',
    amount: 1200.00,
    type: 'income'
  },
  {
    date: new Date('2023-12-15'),
    description: 'Uber Ride',
    category: 'Transportation',
    amount: 22.50,
    type: 'expense'
  },
  {
    date: new Date('2023-12-10'),
    description: 'Gym Membership',
    category: 'Healthcare',
    amount: 45.00,
    type: 'expense'
  },
  {
    date: new Date('2023-12-05'),
    description: 'Electricity Bill',
    category: 'Utilities',
    amount: 120.00,
    type: 'expense'
  },
  // Earlier transactions
  {
    date: new Date('2023-11-28'),
    description: 'Internet Bill',
    category: 'Utilities',
    amount: 60.00,
    type: 'expense'
  },
  {
    date: new Date('2023-11-25'),
    description: 'Thanksgiving Groceries',
    category: 'Food & Dining',
    amount: 95.00,
    type: 'expense'
  },
  {
    date: new Date('2023-11-20'),
    description: 'Consulting Work',
    category: 'Income',
    amount: 1500.00,
    type: 'income'
  },
  {
    date: new Date('2023-11-15'),
    description: 'Car Insurance',
    category: 'Insurance',
    amount: 180.00,
    type: 'expense'
  },
  {
    date: new Date('2023-11-10'),
    description: 'Pharmacy',
    category: 'Healthcare',
    amount: 25.00,
    type: 'expense'
  },
  {
    date: new Date('2023-11-05'),
    description: 'Streaming Services',
    category: 'Entertainment',
    amount: 35.00,
    type: 'expense'
  }
]

// Sample budgets for testing
export const sampleBudgets: Omit<Budget, 'id' | 'spentAmount'>[] = [
  {
    category: 'Food & Dining',
    budgetAmount: 500,
    period: 'Monthly'
  },
  {
    category: 'Transportation',
    budgetAmount: 200,
    period: 'Monthly'
  },
  {
    category: 'Entertainment',
    budgetAmount: 150,
    period: 'Monthly'
  },
  {
    category: 'Shopping',
    budgetAmount: 300,
    period: 'Monthly'
  },
  {
    category: 'Healthcare',
    budgetAmount: 100,
    period: 'Monthly'
  },
  {
    category: 'Utilities',
    budgetAmount: 250,
    period: 'Monthly'
  },
  {
    category: 'Insurance',
    budgetAmount: 200,
    period: 'Monthly'
  }
]

// Categories for reference
export const expenseCategories = [
  'Food & Dining',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Healthcare',
  'Utilities',
  'Insurance',
  'Education',
  'Travel',
  'Personal Care',
  'Home & Garden',
  'Gifts & Donations',
  'Business',
  'Other'
]

export const incomeCategories = [
  'Income',
  'Salary',
  'Freelance',
  'Business',
  'Investment',
  'Bonus',
  'Gift',
  'Other'
]
