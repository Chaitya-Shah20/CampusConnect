import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api } from '../api'

const AuthContext = createContext(null)
const STORAGE_KEY = 'campusUser'

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })
  const [checkingSession, setCheckingSession] = useState(true)

  const setUser = useCallback((nextUser) => {
    setUserState(nextUser)
    if (nextUser) localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser))
    else localStorage.removeItem(STORAGE_KEY)
  }, [])

  // On first load, ask the backend who's logged in (session cookie based).
  const loadUser = useCallback(async () => {
    try {
      const data = await api('/users/me')
      setUser(data.user)
      return data.user
    } catch {
      setUser(null)
      return null
    }
  }, [setUser])

  useEffect(() => {
    loadUser().finally(() => setCheckingSession(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const logout = useCallback(async () => {
    try {
      await api('/auth/logout', { method: 'POST' })
    } catch {
      // ignore network errors on logout, still clear locally
    }
    setUser(null)
  }, [setUser])

  return (
    <AuthContext.Provider value={{ user, setUser, loadUser, logout, checkingSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
