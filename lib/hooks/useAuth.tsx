'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const supabase = createClient()

      // Check active sessions and sets the user
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null)
        setLoading(false)
      })

      // Listen for changes on auth state (signed in, signed out, etc.)
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      })

      return () => subscription.unsubscribe()
    } catch (err) {
      console.error('Supabase initialization error:', err)
      setLoading(false)
    }
  }, [])

  const signInWithGoogle = async () => {
    try {
      setError(null)
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) {
        setError(error.message)
        console.error('Error signing in with Google:', error.message)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred during sign in'
      setError(message)
      console.error('Error signing in with Google:', err)
    }
  }

  const signOut = async () => {
    try {
      setError(null)
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()
      if (error) {
        setError(error.message)
        console.error('Error signing out:', error.message)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred during sign out'
      setError(message)
      console.error('Error signing out:', err)
    }
  }

  const value = {
    user,
    loading,
    error,
    signInWithGoogle,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
