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

  // Verificar autenticación: si hay token, consultar /users/me y cachear rol del backend
  useEffect(() => {
    const bootstrap = async () => {
      const storedToken = authApi.getStoredToken()
      if (!storedToken) {
        dispatch({ type: 'SET_LOADING', payload: false })
        return
      }
      try {
        const me = await authApi.fetchMe()
        // Actualizar el cache local
        try { localStorage.setItem('user', JSON.stringify(me)) } catch {}
        dispatch({ type: 'LOGIN_SUCCESS', payload: me })
      } catch (err) {
        // Si falla (401, etc.), limpiar sesión
        authApi.logout()
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }
    bootstrap()
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
  // No inferir en cliente; usar el rol cacheado del backend
  isAdmin: state.user?.role === 'Admin',
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
