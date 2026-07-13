import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [upstoxSession, setUpstoxSession] = useState(
    JSON.parse(localStorage.getItem('upstox_session') || 'null')
  )

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null))
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
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
    <AuthContext.Provider value={{ user, upstoxSession, saveUpstoxSession, clearUpstoxSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
