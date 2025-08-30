import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import {
  CreateTicketData,
  UpdateTicketData,
  TicketFilters,
} from '@/types'
import { ticketsApi, handleApiError } from '@/services/api'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

// Hook para obtener tickets con filtros y paginación
export const useTickets = (filters: TicketFilters = {}) => {
  const { isAuthenticated } = useAuth()
  
  return useQuery(
    ['tickets', filters],
    () => ticketsApi.getTickets(filters),
    {
      enabled: isAuthenticated, // Solo hacer la petición si está autenticado
      keepPreviousData: true,
      staleTime: 30000, // 30 segundos
      onError: (error: any) => {
        const apiError = handleApiError(error, 'general')
        toast.error(apiError.message)
      },
    }
  )
}

// Hook para obtener un ticket por id
export const useTicket = (id: string) => {
  const { isAuthenticated } = useAuth()
  
  return useQuery(
    ['ticket', id],
    () => ticketsApi.getTicket(id),
    {
      enabled: !!id && isAuthenticated, // Solo hacer la petición si está autenticado y hay ID
      onError: (error: any) => {
        const apiError = handleApiError(error, 'general')
        toast.error(apiError.message)
      },
    }
  )
}

// Hook para crear un ticket
export const useCreateTicket = () => {
  const queryClient = useQueryClient()

  return useMutation(
    (data: CreateTicketData) => ticketsApi.createTicket(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['tickets'])
        toast.success('Ticket created successfully!')
      },
      onError: (error: any) => {
        const apiError = handleApiError(error, 'general')
        toast.error(apiError.message)
      },
    }
  )
}

// Hook para actualizar un ticket
export const useUpdateTicket = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, data }: { id: string; data: UpdateTicketData }) =>
      ticketsApi.updateTicket(id, data),
    {
      onSuccess: (updatedTicket) => {
        queryClient.invalidateQueries(['tickets'])
        queryClient.invalidateQueries(['ticket', updatedTicket.id])
        toast.success('Ticket updated successfully!')
      },
      onError: (error: any) => {
        const apiError = handleApiError(error, 'general')
        toast.error(apiError.message)
      },
    }
  )
}

// Hook para eliminar un ticket
export const useDeleteTicket = () => {
  const queryClient = useQueryClient()

  return useMutation(
    (id: string) => ticketsApi.deleteTicket(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['tickets'])
        toast.success('Ticket deleted successfully!')
      },
      onError: (error: any) => {
        const apiError = handleApiError(error, 'general')
        toast.error(apiError.message)
      },
    }
  )
}

// Hook para manejar el estado de filtros
export const useTicketFilters = (initialFilters: TicketFilters = {}) => {
  const [filters, setFilters] = useState<TicketFilters>({
    page: 1,
    limit: 10,
    ...initialFilters,
  })

  const updateFilter = useCallback((key: keyof TicketFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
  page: key !== 'page' ? 1 : value, // Reiniciar página cuando otros filtros cambien
    }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({
      page: 1,
      limit: filters.limit || 10,
    })
  }, [filters.limit])

  const resetPage = useCallback(() => {
    setFilters((prev) => ({ ...prev, page: 1 }))
  }, [])

  return {
    filters,
    updateFilter,
    clearFilters,
    resetPage,
    setFilters,
  }
}

// Hook para manejar estado local con localStorage
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue] as const
}

// Hook para aplicar debounce a valores (útil para búsqueda)
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
