'use client'

import { useEffect } from 'react'

/**
 * In development, unregister any existing Service Workers to avoid stale caches
 * interfering with Next.js dev chunks (react-refresh/HMR).
 */
export default function DevServiceWorkerGuard() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => {
          if (regs.length > 0) {
            console.warn('[DevServiceWorkerGuard] Unregistering', regs.length, 'service worker(s)')
          }
          return Promise.all(regs.map((r) => r.unregister().catch(() => false)))
        })
        .catch(() => {})
    }
  }, [])
  return null
}

