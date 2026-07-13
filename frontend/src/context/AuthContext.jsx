import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [upstoxSession, setUpstoxSession] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('upstox_session') || 'null')
    } catch {
      return null
    }
  })

  useEffect(() => {
    // Only init supabase auth if client is available
    if (!supabase) return
    supabase.auth.getSession().catch(() => {})
  }, [])

  const saveUpstoxSession = (data) => {
    localStorage.setItem('upstox_session', JSON.stringify(data))
    setUpstoxSession(data)
  }

  const clearUpstoxSession = () => {
    localStorage.removeItem('upstox_session')
    setUpstoxSession(null)
  }

  return (
    <AuthContext.Provider value={{ upstoxSession, saveUpstoxSession, clearUpstoxSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
