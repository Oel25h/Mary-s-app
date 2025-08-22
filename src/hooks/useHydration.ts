'use client'

import { useEffect, useState } from 'react'

/**
 * Hook to safely handle hydration
 * Returns true only after the component has mounted on the client
 */
export function useHydration() {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  return isHydrated
}

/**
 * Hook to get current timestamp that's safe for SSR
 * Returns a stable value during SSR and the actual timestamp after hydration
 */
export function useSSRSafeTimestamp() {
  const [timestamp, setTimestamp] = useState(() => {
    // Return a stable timestamp for SSR
    if (typeof window === 'undefined') {
      return new Date('2024-01-01T00:00:00.000Z').getTime()
    }
    return Date.now()
  })

  useEffect(() => {
    // Update with actual timestamp after hydration
    setTimestamp(Date.now())
  }, [])

  return timestamp
}

/**
 * Hook to get a stable ID that's safe for SSR
 */
export function useSSRSafeId(prefix = 'id') {
  const [id, setId] = useState(() => {
    // Return a stable ID for SSR
    if (typeof window === 'undefined') {
      return `${prefix}-ssr`
    }
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
  })

  useEffect(() => {
    // Update with actual random ID after hydration
    setId(`${prefix}-${Math.random().toString(36).substr(2, 9)}`)
  }, [prefix])

  return id
}
