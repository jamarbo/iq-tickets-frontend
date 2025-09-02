import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { User, LoginCredentials } from '@/types'
import { authApi, handleApiError } from '@/services/api'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean }

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  clearError: () => void
  // Indicador útil para gating
  isAdmin?: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      }
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }
    case 'LOGIN_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
        isAuthenticated: false,
        user: null,
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      }
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      }
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      }
    default:
      return state
  }
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Verificar autenticación almacenada al montar
  useEffect(() => {
    const checkStoredAuth = () => {
      const storedUser = authApi.getStoredUser()
      const storedToken = authApi.getStoredToken()

      if (storedUser && storedToken) {
        dispatch({ type: 'LOGIN_SUCCESS', payload: storedUser })
      } else {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    checkStoredAuth()
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'LOGIN_START' })
      
      const authData = await authApi.login(credentials)
      authApi.storeAuth(authData)
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: authData.user })
    } catch (error) {
      const apiError = handleApiError(error, 'login')
      dispatch({ type: 'LOGIN_ERROR', payload: apiError.message })
      throw error
    }
  }, [])

  const logout = useCallback(() => {
    authApi.logout()
    dispatch({ type: 'LOGOUT' })
  }, [])

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' })
  }, [])

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    clearError,
    isAdmin: (() => {
      // 1) Señal directa en user.role
      if (state.user?.role && state.user.role.toString().toUpperCase().includes('ADMIN')) return true
      // 2) Inferir desde el token (claims: role/roles/authorities/scope/permissions)
      try {
        const token = authApi.getStoredToken()
        if (!token) return false
        const base64 = token.split('.')[1]
        if (!base64) return false
        const json = JSON.parse(decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')))
        const toList = (x: any): string[] => Array.isArray(x) ? x.map(String) : typeof x === 'string' ? x.split(/[ ,]+/) : x ? [String(x)] : []
        const values = [
          ...toList(json.role),
          ...toList(json.roles),
          ...toList(json.authorities),
          ...toList(json.scope),
          ...toList(json.scopes),
          ...toList(json.permissions),
        ].map(s => s.toUpperCase())
        if (values.some(v => v.includes('ADMIN') || v === 'ROLE_ADMIN')) return true
        if (Array.isArray(json.authorities)) {
          for (const a of json.authorities) {
            const v = String((a as any)?.authority || '').toUpperCase()
            if (v.includes('ADMIN') || v === 'ROLE_ADMIN') return true
          }
        }
      } catch {}
      return false
    })(),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
