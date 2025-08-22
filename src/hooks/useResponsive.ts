'use client'

import { useState, useEffect } from 'react'

interface BreakpointConfig {
  sm: number
  md: number
  lg: number
  xl: number
  '2xl': number
}

const defaultBreakpoints: BreakpointConfig = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
}

export function useResponsive(breakpoints: BreakpointConfig = defaultBreakpoints) {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  })

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    window.addEventListener('resize', handleResize)
    handleResize() // Set initial size

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isMobile = windowSize.width < breakpoints.sm
  const isTablet = windowSize.width >= breakpoints.sm && windowSize.width < breakpoints.lg
  const isDesktop = windowSize.width >= breakpoints.lg

  return {
    windowSize,
    isMobile,
    isTablet,
    isDesktop,
    isSmall: windowSize.width < breakpoints.md,
    isMedium: windowSize.width >= breakpoints.md && windowSize.width < breakpoints.xl,
    isLarge: windowSize.width >= breakpoints.xl,
    breakpoint: {
      sm: windowSize.width >= breakpoints.sm,
      md: windowSize.width >= breakpoints.md,
      lg: windowSize.width >= breakpoints.lg,
      xl: windowSize.width >= breakpoints.xl,
      '2xl': windowSize.width >= breakpoints['2xl']
    }
  }
}

// Chart-specific responsive configurations
export function useChartResponsive() {
  const { isMobile, isTablet, windowSize } = useResponsive()

  return {
    isMobile,
    isTablet,
    windowSize,
    chartConfig: {
      margin: {
        top: 10,
        right: isMobile ? 5 : 10,
        left: isMobile ? 5 : 10,
        bottom: isMobile ? 50 : 40
      },
      fontSize: isMobile ? 9 : 10,
      iconSize: isMobile ? 6 : 8,
      legendFontSize: isMobile ? '10px' : '12px',
      xAxisAngle: isMobile ? -45 : -30,
      xAxisHeight: isMobile ? 70 : 60,
      yAxisWidth: isMobile ? 35 : 40,
      strokeWidth: isMobile ? 1.5 : 2,
      dotRadius: isMobile ? 2 : 3,
      activeDotRadius: isMobile ? 3 : 4,
      pieOuterRadius: isMobile ? 60 : 80,
      pieInnerRadius: isMobile ? 30 : 45,
      maxCategoryLength: isMobile ? 8 : 12,
      maxCategoriesShown: isMobile ? 6 : 8
    }
  }
}

// Touch-friendly configurations
export function useTouchConfig() {
  const { isMobile } = useResponsive()

  return {
    minTouchTarget: isMobile ? 44 : 32, // Minimum 44px for touch targets
    padding: isMobile ? 'p-4' : 'p-6',
    buttonSize: isMobile ? 'min-h-[44px]' : 'min-h-[36px]',
    iconSize: isMobile ? 'w-4 h-4' : 'w-3 h-3',
    fontSize: {
      xs: isMobile ? 'text-xs' : 'text-xs',
      sm: isMobile ? 'text-sm' : 'text-xs',
      base: isMobile ? 'text-base' : 'text-sm',
      lg: isMobile ? 'text-lg' : 'text-base',
      xl: isMobile ? 'text-xl' : 'text-lg'
    }
  }
}
