import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { TicketDetailPage } from './TicketDetailPage'

// Mock de AuthContext para evitar necesidad de provider real
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: null, isAdmin: false, isAuthenticated: true, isLoading: false, error: null, login: vi.fn(), logout: vi.fn(), clearError: vi.fn() }),
}))

// Mock de hooks/ticketsApi
vi.mock('@/hooks', async () => {
  const actual = await vi.importActual<any>('@/hooks')
  return {
    ...actual,
    useTicket: () => ({ data: { id: '1', title: 'T', description: 'D', priority: 'MED', status: 'OPEN', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), tags: [] }, isLoading: false, error: null }),
  }
})

const mockGetTicketPermissions = vi.fn()
const mockDeleteTicket = vi.fn()

vi.mock('@/services/api', () => ({
  ticketsApi: {
    getTicketPermissions: (...args: any[]) => mockGetTicketPermissions(...args),
    deleteTicket: (...args: any[]) => mockDeleteTicket(...args),
  },
  handleApiError: (_e: any) => ({ message: 'No autorizado', statusCode: 403 }),
}))

vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
  __esModule: true,
}))

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/tickets/:id" element={children} />
          <Route path="/tickets" element={<div>Tickets List</div>} />
        </Routes>
      </QueryClientProvider>
    </BrowserRouter>
  )
}

describe('TicketDetailPage permissions', () => {
  it('oculta Eliminar cuando permissions falla (fail-closed)', async () => {
    mockGetTicketPermissions.mockRejectedValueOnce(new Error('boom'))
    // Simula ruta /tickets/1
  window.history.pushState({}, '', '/tickets/1')
  render(<TicketDetailPage />, { wrapper: ({ children }) => <Wrapper>{children}</Wrapper> })
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /eliminar/i })).not.toBeInTheDocument()
    })
  })

  it('muestra Eliminar cuando canDelete=true', async () => {
    mockGetTicketPermissions.mockResolvedValueOnce({ canDelete: true })
    window.history.pushState({}, '', '/tickets/1')
  render(<TicketDetailPage />, { wrapper: ({ children }) => <Wrapper>{children}</Wrapper> })
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /eliminar/i })).toBeInTheDocument()
    })
  })
})
