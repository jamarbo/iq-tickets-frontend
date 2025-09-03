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
const ENV_API_BASE = (import.meta as any)?.env?.VITE_API_BASE
  || (import.meta as any)?.env?.VITE_API_URL
  || '/api'

const isAbsoluteUrl = (val: any) => /^https?:\/\//i.test(String(val))

// Fallback seguro en producción: si no hay una URL absoluta configurada, usar el backend de Render
const DEFAULT_PROD_API_BASE = 'https://ticket-system-spring-boot.onrender.com/api'

// Resolución en build-time y refuerzo en runtime por hostname
const IS_PROD = !!((import.meta as any)?.env?.PROD)
let RESOLVED_API_BASE = (IS_PROD && !isAbsoluteUrl(ENV_API_BASE))
  ? DEFAULT_PROD_API_BASE
  : ENV_API_BASE

// Si sigue siendo relativo en runtime y estamos en Render (dominio onrender.com), forzamos backend absoluto
try {
  const host = (typeof window !== 'undefined' && (window as any)?.location?.hostname) || ''
  if (!isAbsoluteUrl(RESOLVED_API_BASE) && /onrender\.com$/i.test(String(host))) {
    RESOLVED_API_BASE = DEFAULT_PROD_API_BASE
  }
} catch {}

const API_BASE_IS_ABSOLUTE = isAbsoluteUrl(RESOLVED_API_BASE)

console.info(`[API] baseURL: ${RESOLVED_API_BASE} (absolute=${API_BASE_IS_ABSOLUTE})`)

const apiClient = axios.create({
  baseURL: RESOLVED_API_BASE,
  // Importante: no fijar Content-Type global para evitar preflight innecesario en GET.
  // Estableceremos Content-Type por petición cuando haga falta.
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

// Ya no se decodifica JWT en cliente para inferir roles; el backend define el rol.

// Normalización simple del rol devuelto por backend
const normalizeRole = (role: any): 'Admin' | 'User' => {
  const r = String(role || '').toUpperCase()
  return r.includes('ADMIN') ? 'Admin' : 'User'
}

// API de Autenticación
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    console.log('📤 Sending login request:', credentials)
    
    try {
      // Petición real: JSON {token}
      const response: AxiosResponse<{ token: string }> = await apiClient.post('/auth/login', credentials, {
        headers: { 'Content-Type': 'application/json' },
      })

      const token = response.data.token

      // Con el token, consultar el perfil al backend
      const me = await authApi.fetchMe(token)
      const authResponse: AuthResponse = {
        token,
        user: me,
      }
      console.log('✅ Auth response created (role from backend):', authResponse.user.role)
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

  // Obtener el usuario actual desde backend
  fetchMe: async (tokenOverride?: string) => {
    // Si se pasa un token explícito (caso login), usarlo en un cliente temporal
    const client = tokenOverride
      ? axios.create({ baseURL: RESOLVED_API_BASE, headers: { Authorization: `Bearer ${tokenOverride}` } })
      : apiClient
    const resp: AxiosResponse<{ email: string; name?: string; role?: string | null; id?: string }>
      = await client.get('/users/me')
    const data = resp.data || ({} as any)
    return {
      id: data.id || data.email || 'me',
      email: data.email,
      name: data.name || (data.email ? String(data.email).split('@')[0] : 'User'),
      role: normalizeRole(data.role),
    }
  },
}

// ===== Modo DEMO: helpers y almacenamiento local de tickets =====
const isDemoMode = (): boolean => {
  // Solo habilitado explícitamente por variable de entorno
  const envFlag = (import.meta as any)?.env?.VITE_DEMO
  return String(envFlag).toLowerCase() === 'true'
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

  // Consulta de permisos específica por ticket
  getTicketPermissions: async (id: string): Promise<{ canDelete: boolean }> => {
    if (isDemoMode()) {
      const stored = authApi.getStoredUser()
      const canDelete = stored?.role === 'Admin'
      return { canDelete }
    }
    const resp: AxiosResponse<{ canDelete: boolean }> = await apiClient.get(`/tickets/${id}/permissions`)
    return resp.data
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
  message = 'No autorizado'
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
