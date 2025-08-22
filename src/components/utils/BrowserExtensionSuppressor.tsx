'use client'

import { useEffect } from 'react'

/**
 * Component that suppresses hydration warnings caused by browser extensions
 * This component should be included once in the app to handle browser extension attributes
 */
export default function BrowserExtensionSuppressor() {
  useEffect(() => {
    // Suppress hydration warnings for known browser extension attributes
    const originalConsoleError = console.error
    
    console.error = (...args) => {
      const message = args[0]
      
      // Check if this is a hydration error caused by browser extensions
      if (
        typeof message === 'string' && 
        message.includes('A tree hydrated but some attributes of the server rendered HTML didn\'t match the client properties') &&
        (
          message.includes('data-atm-ext-installed') ||
          message.includes('data-new-gr-c-s-check-loaded') ||
          message.includes('data-gr-ext-installed') ||
          message.includes('rtrvr-listeners') ||
          message.includes('data-lastpass-') ||
          message.includes('data-1p-') ||
          message.includes('data-bitwarden-') ||
          message.includes('data-dashlane-') ||
          message.includes('data-keeper-') ||
          message.includes('data-nordpass-')
        )
      ) {
        // Suppress this specific hydration error as it's caused by browser extensions
        return
      }
      
      // Allow all other console errors to pass through
      originalConsoleError.apply(console, args)
    }
    
    // Cleanup function to restore original console.error
    return () => {
      console.error = originalConsoleError
    }
  }, [])

  // This component doesn't render anything
  return null
}
