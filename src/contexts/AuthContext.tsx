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
    isAdmin: !!state.user?.role && state.user.role.toString().toUpperCase().includes('ADMIN'),
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
