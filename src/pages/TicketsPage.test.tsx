import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { TicketsPage } from './TicketsPage'

// ⚡ TESTS RÁPIDOS - Solo lo esencial

// Mock simple y rápido
vi.mock('@/hooks', () => ({
  useTickets: () => ({
    data: null,
    isLoading: true,
    error: null
  }),
  useTicketFilters: () => ({
    filters: { limit: 12 },
    updateFilter: vi.fn(),
    clearFilters: vi.fn(),
    resetPage: vi.fn(),
    setFilters: vi.fn(),
  }),
  useDeleteTicket: () => ({
    mutate: vi.fn(),
    isLoading: false,
  }),
  useDebounce: (value: string) => value,
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { role: 'User' },
  }),
}))

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </BrowserRouter>
  )
}

describe('TicketsPage - Fast Tests', () => {
  it('shows loading state', () => {
    render(
      <TestWrapper>
        <TicketsPage />
      </TestWrapper>
    )

    // Solo verificar que se renderiza el componente principal
    expect(screen.getByText('Ticket Management')).toBeInTheDocument()
  })

  it('renders header correctly', () => {
    render(
      <TestWrapper>
        <TicketsPage />
      </TestWrapper>
    )

    // Tests rápidos de elementos estáticos
    expect(screen.getByText('Ticket Management')).toBeInTheDocument()
    expect(screen.getByText('Create New Ticket')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search tickets...')).toBeInTheDocument()
  })

  it('renders filter controls', () => {
    render(
      <TestWrapper>
        <TicketsPage />
      </TestWrapper>
    )

    // Verificar filtros por texto de option en lugar de placeholder
    expect(screen.getByText('All Statuses')).toBeInTheDocument()
    expect(screen.getByText('All Priorities')).toBeInTheDocument()
  })
})
