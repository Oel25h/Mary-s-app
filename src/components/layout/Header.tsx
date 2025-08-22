'use client'

import { useState, useEffect, useRef } from 'react'
import { Circle, User, LogOut, Settings, ChevronDown, Menu, X } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useResponsive } from '@/hooks/useResponsive'

interface HeaderProps {
  title?: string
  onMenuToggle?: () => void
  isMobileMenuOpen?: boolean
}

export default function Header({ title, onMenuToggle, isMobileMenuOpen }: HeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, profile, signOut } = useAuth()
  const { isMobile, isTablet } = useResponsive()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

  const getPageTitle = () => {
    if (title) return title

    switch (pathname) {
      case '/':
        return 'Dashboard'
      case '/transactions':
        return 'Transactions'
      case '/budgets':
        return 'Budgets'
      case '/import-data':
        return 'Import Data'
      case '/reports':
        return 'Reports'
      case '/ai-assistant':
        return 'AI Assistant'
      case '/settings':
        return 'Settings'
      default:
        return 'Dashboard'
    }
  }
  return (
    <header className="relative bg-white/80 backdrop-blur-md border-b border-white/20 mobile-padding py-4 sm:py-6 shadow-soft safe-area">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-50/50 to-success-50/30 opacity-50" />

      <div className="relative z-10 flex items-center justify-between">
        {/* Mobile Menu Button */}
        {(isMobile || isTablet) && (
          <button
            type="button"
            onClick={onMenuToggle}
            className="touch-target lg:hidden bg-white/60 hover:bg-white/80 rounded-xl border border-white/30 transition-all duration-200 mr-3"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-gray-700" />
            ) : (
              <Menu className="w-5 h-5 text-gray-700" />
            )}
          </button>
        )}

        {/* Left - Logo */}
        <div className="flex items-center space-x-3 sm:space-x-4 group">
          <div className="relative">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-colored group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
              <Circle className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-current" />
            </div>
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-500/30 to-primary-600/30 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg sm:text-2xl font-bold gradient-text">FinanceAI</span>
            <span className="text-xs text-secondary-500 font-medium tracking-wide hidden sm:block">Smart Financial Management</span>
          </div>
        </div>

        {/* Center - Page Title (Hidden on mobile) */}
        <div className="flex-1 text-center hidden md:block">
          <h1 className="text-xl lg:text-2xl font-bold text-secondary-900 tracking-tight">{getPageTitle()}</h1>
          <div className="w-12 h-0.5 bg-gradient-to-r from-primary-500 to-success-500 mx-auto mt-2 rounded-full" />
        </div>

        {/* Right - User Menu and Status */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Status Indicator (Simplified on mobile) */}
          <div className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-success-50 rounded-full border border-success-200">
            <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse-soft" />
            <span className="text-xs sm:text-sm font-semibold text-success-700">Live</span>
          </div>

          {/* User Menu */}
          {user && (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 sm:space-x-3 px-2 sm:px-4 py-2 bg-white/60 hover:bg-white/80 rounded-xl border border-white/30 transition-all duration-200 group touch-target"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-24 lg:max-w-none">
                    {profile?.full_name || user.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate max-w-24 lg:max-w-none">{user.email}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors hidden sm:block" />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {profile?.full_name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false)
                      router.push('/settings')
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors touch-target"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      setShowUserMenu(false)
                      try {
                        await signOut()
                        router.push('/auth/login')
                      } catch (error) {
                        console.error('Error signing out:', error)
                      }
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors touch-target"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Page Title */}
      {(isMobile || isTablet) && (
        <div className="mt-4 md:hidden">
          <h1 className="text-xl font-bold text-secondary-900 tracking-tight">{getPageTitle()}</h1>
          <div className="w-12 h-0.5 bg-gradient-to-r from-primary-500 to-success-500 mt-2 rounded-full" />
        </div>
      )}
    </header>
  )
}
