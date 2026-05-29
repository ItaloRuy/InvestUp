import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import api from '../api/client'
import type { User, AuthResponse } from '../types'

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateUser: (data: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // ── Restaurar sessão do localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('investup_token')
    const savedUser  = localStorage.getItem('investup_user')

    if (savedToken && savedUser) {
      setToken(savedToken)
      try { setUser(JSON.parse(savedUser)) } catch {}
    }
    setIsLoading(false)
  }, [])

  const saveSession = (data: AuthResponse) => {
    localStorage.setItem('investup_token', data.token)
    localStorage.setItem('investup_user', JSON.stringify(data.user))
    setToken(data.token)
    setUser(data.user)
  }

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<AuthResponse>('/auth/login', { email, password })
    saveSession(res.data)
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await api.post<AuthResponse>('/auth/register', { name, email, password })
    saveSession(res.data)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('investup_token')
    localStorage.removeItem('investup_user')
    setUser(null)
    setToken(null)
  }, [])

  const updateUser = useCallback((data: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev
      const updated = { ...prev, ...data }
      localStorage.setItem('investup_user', JSON.stringify(updated))
      return updated
    })
  }, [])

  return (
    <AuthContext.Provider value={{
      user, token, isLoading,
      isAuthenticated: !!user && !!token,
      login, register, logout, updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  return ctx
}
