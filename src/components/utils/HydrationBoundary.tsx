'use client'

import { useEffect, useState } from 'react'

interface HydrationBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Component that prevents hydration mismatches by only rendering children after hydration
 * This is useful for components that have dynamic content that differs between server and client
 */
export default function HydrationBoundary({ children, fallback = null }: HydrationBoundaryProps) {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // During SSR and before hydration, show fallback
  if (!isHydrated) {
    return <>{fallback}</>
  }

  // After hydration, show actual content
  return <>{children}</>
}
