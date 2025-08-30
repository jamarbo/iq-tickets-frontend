export interface User {
  id: string
  email: string
  role: 'Admin' | 'User'
  name?: string
}

export interface Ticket {
  id: string
  title: string
  description: string
  priority: 'LOW' | 'MED' | 'HIGH'
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED'
  assignee?: string
  createdAt: string
  updatedAt: string
  tags: string[]
}

export interface CreateTicketData {
  title: string
  description: string
  priority: 'LOW' | 'MED' | 'HIGH'
  // Solo campos básicos por ahora
}

export interface UpdateTicketData extends Partial<CreateTicketData> {
  status?: 'OPEN' | 'IN_PROGRESS' | 'CLOSED'
  assignee?: string
  tags?: string[]
}

export interface TicketFilters {
  status?: string
  priority?: string
  q?: string
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
  statusCode?: number
}

export type Priority = 'LOW' | 'MED' | 'HIGH'
export type Status = 'OPEN' | 'IN_PROGRESS' | 'CLOSED'
export type Role = 'Admin' | 'User'

export const PRIORITIES: Priority[] = ['LOW', 'MED', 'HIGH']
export const STATUSES: Status[] = ['OPEN', 'IN_PROGRESS', 'CLOSED']

// Labels para mostrar en la UI
export const PRIORITY_LABELS = {
  LOW: 'Low',
  MED: 'Medium', 
  HIGH: 'High',
} as const

export const STATUS_LABELS = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  CLOSED: 'Closed',
} as const

export const PRIORITY_COLORS = {
  LOW: 'success',      // Verde (baja prioridad = bueno)
  MED: 'warning',      // Amarillo/naranja (media)
  HIGH: 'error',       // Rojo (alta prioridad = urgente)
} as const

export const STATUS_COLORS = {
  OPEN: 'info',           // Azul secundario (nuevo)
  IN_PROGRESS: 'warning', // Amarillo/naranja (en progreso)
  CLOSED: 'success',      // Verde (completado)
} as const
