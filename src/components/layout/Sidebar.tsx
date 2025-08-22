'use client'

import { useEffect } from 'react'
import {
  LayoutDashboard,
  CreditCard,
  PiggyBank,
  Upload,
  FileText,
  Bot,
  Settings,
  X,
  TrendingUp,
  Calendar,
  Target
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useResponsive } from '@/hooks/useResponsive'

interface SidebarItemProps {
  icon: React.ReactNode
  label: string
  href: string
  isActive?: boolean
  onClick?: () => void
}

function SidebarItem({ icon, label, href, isActive = false, onClick }: SidebarItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group relative w-full flex items-center space-x-4 px-5 py-4 text-left rounded-2xl transition-all duration-300 font-semibold touch-target",
        isActive
          ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-colored"
          : "text-secondary-700 hover:bg-white/60 hover:shadow-soft hover:scale-105"
      )}
      suppressHydrationWarning
    >
      {/* Active indicator */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
      )}

      <div className={cn(
        "w-6 h-6 transition-transform duration-300 group-hover:scale-110",
        isActive ? "text-white" : "text-secondary-600"
      )}>
        {icon}
      </div>
      <span className="tracking-wide">{label}</span>

      {/* Hover glow effect */}
      {!isActive && (
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500/20 to-success-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm" />
      )}
    </Link>
  )
}

interface SidebarProps {
  currentPage?: string
  isOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ currentPage = 'dashboard', isOpen = true, onClose }: SidebarProps) {
  const { isMobile, isTablet } = useResponsive()
  const isMobileDrawer = isMobile || isTablet

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose()
      }
    }

    if (isMobileDrawer && isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when mobile menu is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isMobileDrawer, isOpen, onClose])
  const menuItems = [
    { icon: <LayoutDashboard />, label: 'Dashboard', href: '/', key: 'dashboard' },
    { icon: <CreditCard />, label: 'Transactions', href: '/transactions', key: 'transactions' },
    { icon: <PiggyBank />, label: 'Budgets', href: '/budgets', key: 'budgets' },
    { icon: <TrendingUp />, label: 'Forecasting', href: '/forecasting', key: 'forecasting' },
    { icon: <Calendar />, label: 'Seasonal Analysis', href: '/seasonal', key: 'seasonal' },
    { icon: <Target />, label: 'Goals', href: '/goals', key: 'goals' },
    { icon: <PiggyBank />, label: 'Savings', href: '/savings', key: 'savings' },
    { icon: <TrendingUp />, label: 'Investments', href: '/investments', key: 'investments' },
    { icon: <Upload />, label: 'Import Data', href: '/import', key: 'import' },
    { icon: <FileText />, label: 'AI Reports', href: '/reports', key: 'reports' },
    { icon: <Bot />, label: 'AI Assistant', href: '/ai-assistant', key: 'ai-assistant' },
    { icon: <Settings />, label: 'Settings', href: '/settings', key: 'settings' },
  ]

  // Handle click for mobile
  const handleItemClick = () => {
    if (isMobileDrawer && onClose) {
      onClose()
    }
  }

  if (isMobileDrawer) {
    return (
      <>
        {/* Mobile Overlay */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
        
        {/* Mobile Drawer */}
        <aside 
          className={cn(
            "fixed top-0 left-0 h-full w-80 bg-white/95 backdrop-blur-md border-r border-white/20 shadow-large z-50 transform transition-transform duration-300 ease-in-out lg:hidden safe-area",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
          suppressHydrationWarning
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/20">
            <h2 className="text-lg font-bold text-secondary-900">Menu</h2>
            <button
              type="button"
              onClick={onClose}
              className="touch-target bg-white/60 hover:bg-white/80 rounded-xl border border-white/30 transition-all duration-200"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="px-6 py-4 space-y-2" role="navigation" aria-label="Main navigation" suppressHydrationWarning>
            {menuItems.map((item) => (
              <SidebarItem
                key={item.key}
                icon={item.icon}
                label={item.label}
                href={item.href}
                isActive={currentPage === item.key}
                onClick={handleItemClick}
              />
            ))}
          </nav>
        </aside>
      </>
    )
  }

  // Desktop Sidebar
  return (
    <aside className="w-72 bg-white/80 backdrop-blur-md border-r border-white/20 px-6 py-8 shadow-soft hidden lg:block" suppressHydrationWarning>
      <nav className="space-y-3" suppressHydrationWarning>
        {menuItems.map((item) => (
          <SidebarItem
            key={item.key}
            icon={item.icon}
            label={item.label}
            href={item.href}
            isActive={currentPage === item.key}
          />
        ))}
      </nav>
    </aside>
  )
}
