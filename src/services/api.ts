import axios, { AxiosResponse } from 'axios'
import {
  Ticket,
  CreateTicketData,
  UpdateTicketData,
  TicketFilters,
  PaginatedResponse,
  LoginCredentials,
  AuthResponse,
  ApiError,
} from '@/types'

// Crear instancia de axios
const API_BASE = (import.meta as any)?.env?.VITE_API_BASE
  || (import.meta as any)?.env?.VITE_API_URL
  || '/api'

const API_BASE_IS_ABSOLUTE = /^https?:\/\//i.test(String(API_BASE))

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  // Si apuntamos a un dominio externo (Render), no enviamos cookies por defecto.
  withCredentials: !API_BASE_IS_ABSOLUTE,
})

// Interceptor de petición para añadir token de autenticación
apiClient.interceptors.request.use(
  (config) => {
    const token = authApi.getStoredToken()
    const headers = (config.headers ?? {}) as Record<string, string>
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    // Token CSRF desde cookies para Spring Security
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop()!.split(';').shift()
      return undefined
    }
    const xsrf = getCookie('XSRF-TOKEN') || getCookie('CSRF-TOKEN')
    if (xsrf) {
      headers['X-XSRF-TOKEN'] = xsrf
      headers['X-CSRF-TOKEN'] = xsrf
    }
    config.headers = headers as any
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor de respuesta para manejar errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login')
    
    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Decodificar el JWT de forma segura
const parseJwt = (token: string): any => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

// API de Autenticación
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    console.log('📤 Sending login request:', credentials)
    
    try {
      // Simulación local de credenciales de demo (sin llamar al backend)
      const email = (credentials.email || '').trim().toLowerCase()
      const password = (credentials.password || '').trim()
      if (email === 'admin@demo.com' && password === 'password') {
        const demoAdminResponse: AuthResponse = {
          token: 'demo-admin-token-12345',
          user: {
            id: 'admin-1',
            email: 'admin@demo.com',
            name: 'Admin Demo',
            role: 'Admin',
          },
        }
        console.log('✅ Demo Admin login successful:', demoAdminResponse)
        return demoAdminResponse
      }
      
      if (email === 'user@demo.com' && password === 'password') {
        const demoUserResponse: AuthResponse = {
          token: 'demo-user-token-67890',
          user: {
            id: 'user-1',
            email: 'user@demo.com',
            name: 'User Demo',
            role: 'User',
          },
        }
        console.log('✅ Demo User login successful:', demoUserResponse)
        return demoUserResponse
      }

      // Petición real al backend
      const response = await apiClient.post<{ token: string; user?: any }>('/auth/login', credentials)
      
      console.log('📥 Login response received:', response.data)
      
      const token = response.data.token
      const claims = parseJwt(token)
      const backendUser = (response.data as any).user

      // Normalización de rol
      const resolvedRole: 'Admin' | 'User' = (() => {
        if (backendUser?.role === 'Admin' || backendUser?.role === 'ADMIN') return 'Admin'
        if (backendUser?.role === 'User' || backendUser?.role === 'USER') return 'User'
        
        if (claims) {
          const checkClaim = (val: any): boolean => {
            if (!val) return false
            const str = String(val).toUpperCase()
            return str.includes('ADMIN') || str === 'ROLE_ADMIN'
          }
          
          if (checkClaim(claims.role)) return 'Admin'
          if (Array.isArray(claims.roles) && claims.roles.some(checkClaim)) return 'Admin'
          if (Array.isArray(claims.authorities)) {
            for (const auth of claims.authorities) {
              if (checkClaim(auth) || checkClaim(auth?.authority)) return 'Admin'
            }
          }
        }
        
        return 'User'
      })()

      const emailFromClaims = claims?.sub || claims?.email || credentials.email
      const authResponse: AuthResponse = {
        token,
        user: {
          id: backendUser?.id || claims?.id || '1',
          email: backendUser?.email || emailFromClaims,
          name: backendUser?.name || (emailFromClaims ? String(emailFromClaims).split('@')[0] : 'User'),
          role: resolvedRole,
        },
      }
      
      console.log('✅ Auth response created:', authResponse)
      return authResponse
    } catch (error) {
      console.error('❌ Login request failed:', error)
      throw error
    }
  },

  logout: () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
  },

  getStoredUser: () => {
    try {
      const userJson = localStorage.getItem('user')
      if (!userJson || userJson === 'undefined') {
        return null
      }
      const parsed = JSON.parse(userJson)
      if (parsed && typeof parsed.role === 'string') {
        const r = String(parsed.role).toUpperCase()
        if (r.includes('ADMIN') || r === 'ROLE_ADMIN') {
          parsed.role = 'Admin'
        } else {
          parsed.role = 'User'
        }
      }
      return parsed
    } catch (error) {
      console.warn('Failed to parse stored user data:', error)
      localStorage.removeItem('user')
      return null
    }
  },

  storeAuth: (authData: AuthResponse) => {
    localStorage.setItem('auth_token', authData.token)
    localStorage.setItem('user', JSON.stringify(authData.user))
    console.log('✅ Auth data stored successfully.')
  },

  getStoredToken: () => {
    return localStorage.getItem('auth_token')
  },
}

// ===== Modo DEMO: helpers y almacenamiento local de tickets =====
const isDemoMode = (): boolean => {
  // Permitir forzar demo vía variable de entorno (Vite)
  // VITE_DEMO=true activa el modo demo sin depender del token
  const envFlag = (import.meta as any)?.env?.VITE_DEMO
  if (String(envFlag).toLowerCase() === 'true') return true

  // Fallback: detectar por prefijo de token demo-
  const token = authApi.getStoredToken()
  return !!token && token.startsWith('demo-')
}

type TicketShape = Partial<Ticket> & {
  id: string
  title?: string
  description?: string
  status?: any
  priority?: any
  createdAt?: string
}

const DEMO_TICKETS_KEY = 'demo_tickets'

const demoTicketsStore = {
  get(): TicketShape[] {
    try {
      const raw = localStorage.getItem(DEMO_TICKETS_KEY)
      return raw ? (JSON.parse(raw) as TicketShape[]) : []
    } catch {
      return []
    }
  },
  set(list: TicketShape[]) {
    localStorage.setItem(DEMO_TICKETS_KEY, JSON.stringify(list))
  },
  ensureSeed(): TicketShape[] {
    let list = this.get()
    if (!list.length) {
      const now = new Date().toISOString()
      list = [
        { id: '1', title: 'Demo: Reset password', description: 'User cannot reset password', status: 'OPEN', priority: 'HIGH', createdAt: now, updatedAt: now },
        { id: '2', title: 'Demo: API 500 error', description: 'Intermittent 500 on /orders', status: 'OPEN', priority: 'MED', createdAt: now, updatedAt: now },
        { id: '3', title: 'Demo: UI alignment', description: 'Navbar misaligned on mobile', status: 'CLOSED', priority: 'LOW', createdAt: now, updatedAt: now },
      ]
      this.set(list)
    }
    return list
  },
}

// API de Tickets
export const ticketsApi = {
  getTickets: async (filters: TicketFilters = {}): Promise<PaginatedResponse<Ticket>> => {
    try {
      // DEMO: servir datos locales cuando el token es de demo
      if (isDemoMode()) {
        const list = demoTicketsStore.ensureSeed()
        // filtros básicos
        let filtered = [...list]
        if (filters.status) filtered = filtered.filter(t => String(t.status || '').toUpperCase() === String(filters.status).toUpperCase())
        if (filters.priority) filtered = filtered.filter(t => String(t.priority || '').toUpperCase() === String(filters.priority).toUpperCase())
        if (filters.q) {
          const q = filters.q.toLowerCase()
          filtered = filtered.filter(t => (t.title || '').toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q))
        }
        // ordenar por createdAt desc
        filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        const page = filters.page || 1
        const limit = filters.limit || 12
        const start = (page - 1) * limit
        const data = filtered.slice(start, start + limit) as unknown as Ticket[]
        return {
          data,
          total: filtered.length,
          page,
          limit,
          totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
        }
      }
      const params = new URLSearchParams()
      
      if (filters.status) params.append('status', filters.status)
      if (filters.priority) params.append('priority', filters.priority)
      if (filters.q) params.append('q', filters.q)
      if (filters.page) params.append('page', (filters.page - 1).toString())
      if (filters.limit) params.append('size', filters.limit.toString())
      params.append('sort', 'createdAt,desc')

      const url = `/tickets?${params.toString()}`
      console.log('🎫 Fetching tickets with URL:', url)

      const response: AxiosResponse<any> = await apiClient.get(url)
      
      console.log('✅ Raw API response:', response.data)
      
      const backendData = response.data
      
      const adaptedResponse: PaginatedResponse<Ticket> = {
        data: backendData.content || backendData.data || backendData.tickets || (Array.isArray(backendData) ? backendData : []),
        total: backendData.totalElements || backendData.total || (Array.isArray(backendData) ? backendData.length : 0),
        page: backendData.number ? backendData.number + 1 : backendData.page || 1,
        limit: backendData.size || backendData.limit || 12,
        totalPages: backendData.totalPages || Math.ceil((backendData.totalElements || 0) / (backendData.size || 12))
      }
      
      console.log('✅ Adapted response:', adaptedResponse)
      
      return adaptedResponse
    } catch (error: any) {
      console.error('❌ Error fetching tickets:', error)
      throw error
    }
  },

  getTicket: async (id: string): Promise<Ticket> => {
    if (isDemoMode()) {
      const t = demoTicketsStore.ensureSeed().find(t => t.id === id)
      if (!t) throw new Error('Ticket not found')
      return t as unknown as Ticket
    }
    const response: AxiosResponse<Ticket> = await apiClient.get(`/tickets/${id}`)
    return response.data
  },

  createTicket: async (data: CreateTicketData): Promise<Ticket> => {
    try {
      if (isDemoMode()) {
        const list = demoTicketsStore.ensureSeed()
        const id = String(Math.max(0, ...list.map(t => Number(t.id) || 0)) + 1)
  const now = new Date().toISOString()
  const newT: TicketShape = { id, createdAt: now, updatedAt: now, status: (data as any).status || 'OPEN', priority: (data as any).priority || 'MED', title: (data as any).title, description: (data as any).description }
        demoTicketsStore.set([newT, ...list])
        return newT as unknown as Ticket
      }
      console.log('🎫 Creating ticket with data:', data)
      const response: AxiosResponse<Ticket> = await apiClient.post('/tickets', data)
      console.log('✅ Ticket created successfully:', response.data)
      return response.data
    } catch (error: any) {
      console.error('❌ Error creating ticket:', error)
      throw error
    }
  },

  updateTicket: async (id: string, data: UpdateTicketData): Promise<Ticket> => {
    if (isDemoMode()) {
      const list = demoTicketsStore.ensureSeed()
      const idx = list.findIndex(t => t.id === id)
      if (idx === -1) throw new Error('Ticket not found')
  const updated = { ...list[idx], ...data, updatedAt: new Date().toISOString() }
      list[idx] = updated
      demoTicketsStore.set(list)
      return updated as unknown as Ticket
    }
    const response: AxiosResponse<Ticket> = await apiClient.patch(`/tickets/${id}`, data)
    return response.data
  },

  deleteTicket: async (id: string): Promise<void> => {
    if (isDemoMode()) {
      const list = demoTicketsStore.ensureSeed().filter(t => t.id !== id)
      demoTicketsStore.set(list)
      return
    }
    await apiClient.delete(`/tickets/${id}`)
  },
}

// Utilidad para manejo de errores
export const handleApiError = (error: any, context?: 'login' | 'general'): ApiError => {
  if (error.response) {
    const status = error.response.status
    const serverMessage = error.response.data?.message
    
    let message = serverMessage || 'An error occurred'
    
    switch (status) {
      case 401:
        if (context === 'login') {
          message = 'Email o contraseña incorrectos. Verifica tus credenciales e intenta nuevamente.'
        } else {
          message = 'Tu sesión ha expirado o no tienes permisos. Por favor inicia sesión nuevamente.'
        }
        break
      case 403:
        message = 'No tienes permisos para realizar esta acción.'
        break
      case 404:
        message = 'El recurso solicitado no existe o no está disponible.'
        break
      case 422:
        message = serverMessage || 'Los datos enviados no son válidos. Verifica la información e intenta nuevamente.'
        break
      case 429:
        message = 'Demasiadas solicitudes. Espera unos minutos antes de intentar nuevamente.'
        break
      case 500:
        message = 'Error interno del servidor. Intenta nuevamente en unos momentos.'
        break
      default:
        message = serverMessage || `Error del servidor (${status}). Intenta nuevamente.`
    }
    
    return {
      message,
      errors: error.response.data?.errors,
      statusCode: status,
    }
  }
  
  if (error.request) {
    return {
      message: 'Error de conexión. Verifica tu conexión a internet y que el servidor esté funcionando.',
      statusCode: 0,
    }
  }
  
  return {
    message: error.message || 'Ocurrió un error inesperado',
  }
}
