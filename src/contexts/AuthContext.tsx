'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Use the auth-helpers client for compatibility with API routes
  const supabase = createClientComponentClient()

  useEffect(() => {
    console.log('AuthContext: Component mounted, initializing auth...')

    // Set a maximum auth loading time of 10 seconds
    const maxAuthTimeout = setTimeout(() => {
      console.warn('AuthContext: Maximum auth loading time exceeded, forcing completion')
      setLoading(false)
      setSession(null)
      setUser(null)
    }, 10000)

    // Get initial session with timeout and error handling
    const getInitialSession = async () => {
      try {
        console.log('AuthContext: Testing connection and getting session...')

        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Auth timeout after 5 seconds')), 5000)
        })

        const sessionPromise = supabase.auth.getSession()

        const { data: { session } } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any

        console.log('AuthContext: Session retrieved:', !!session)
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          await fetchProfile(session.user.id)
        }
      } catch (error) {
        console.error('AuthContext: Failed to get initial session:', error)
        // Set loading to false even on error to prevent infinite loading
        setSession(null)
        setUser(null)
      } finally {
        clearTimeout(maxAuthTimeout)
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes with error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          console.log('AuthContext: Auth state changed:', event, !!session)
          setSession(session)
          setUser(session?.user ?? null)

          if (session?.user) {
            await fetchProfile(session.user.id)
          } else {
            setProfile(null)
          }
        } catch (error) {
          console.error('AuthContext: Error in auth state change:', error)
        } finally {
          setLoading(false)
        }
      }
    )

    return () => {
      console.log('AuthContext: Cleaning up auth subscription')
      clearTimeout(maxAuthTimeout)
      subscription.unsubscribe()
    }
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      console.log('AuthContext: Fetching profile for user:', userId)

      // Add timeout for profile fetch
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout after 3 seconds')), 3000)
      })

      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      const { data, error } = await Promise.race([
        profilePromise,
        timeoutPromise
      ]) as any

      if (error) {
        console.warn('AuthContext: Profile fetch error (non-critical):', error)
        return
      }

      console.log('AuthContext: Profile fetched successfully')
      setProfile(data)
    } catch (error) {
      console.warn('AuthContext: Profile fetch failed (non-critical):', error)
      // Profile fetch failed - this is non-critical, don't block loading
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw error
      }
    } catch (error) {
      throw error
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in')

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      setProfile(data)
    } catch (error) {
      throw error
    }
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signOut,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Loading component for auth states
export function AuthLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}
