import { useEffect, useLayoutEffect } from 'react'

/**
 * Hook that uses useLayoutEffect on the client and useEffect on the server
 * to prevent hydration mismatches
 */
export const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect
