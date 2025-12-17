import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { tokenStore } from '@/libs/auth/tokenStore'

interface AuthTokenContextValue {
  token: string | null
  setToken: (token: string | null) => void
  logout: () => void
}

const AuthTokenContext = createContext<AuthTokenContextValue | undefined>(undefined)

export const AuthTokenProvider = ({ children }: { children: ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(() => tokenStore.get())

  useEffect(() => {
    const unsubscribe = tokenStore.subscribe(setTokenState)
    return () => {
      unsubscribe()
    }
  }, [])

  const value = useMemo<AuthTokenContextValue>(() => {
    const setToken = (nextToken: string | null) => tokenStore.set(nextToken)
    const logout = () => {
      tokenStore.clear()
      if (typeof window !== 'undefined') {
        window.location.assign('/')
      }
    }
    return { token, setToken, logout }
  }, [token])

  return <AuthTokenContext.Provider value={value}>{children}</AuthTokenContext.Provider>
}

export const useAuthTokenContext = () => {
  const context = useContext(AuthTokenContext)
  if (!context) {
    throw new Error('useAuthTokenContext must be used within AuthTokenProvider')
  }
  return context
}
