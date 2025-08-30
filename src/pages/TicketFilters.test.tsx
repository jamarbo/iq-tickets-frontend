import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { TicketsPage } from './TicketsPage'

// Test wrapper con providers necesarios
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('Ticket Filters Integration', () => {
  it('should allow user to select status filter', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <TicketsPage />
      </TestWrapper>
    )

    // Encontrar el select de status
    const statusSelect = screen.getByDisplayValue('All Statuses')
    expect(statusSelect).toBeInTheDocument()

    // Cambiar el valor
    await user.selectOptions(statusSelect, 'OPEN')
    expect(statusSelect).toHaveValue('OPEN')
  })

  it('should allow user to select priority filter', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <TicketsPage />
      </TestWrapper>
    )

    // Encontrar el select de priority
    const prioritySelect = screen.getByDisplayValue('All Priorities')
    expect(prioritySelect).toBeInTheDocument()

    // Cambiar el valor
    await user.selectOptions(prioritySelect, 'HIGH')
    expect(prioritySelect).toHaveValue('HIGH')
  })

  it('should show clear filters button when filters are applied', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <TicketsPage />
      </TestWrapper>
    )

    // Aplicar un filtro
    const statusSelect = screen.getByDisplayValue('All Statuses')
    await user.selectOptions(statusSelect, 'CLOSED')

    // Verificar que aparece el botón de limpiar filtros
    await waitFor(() => {
      expect(screen.getByText('Limpiar filtros')).toBeInTheDocument()
    })
  })

  it('should allow user to search tickets', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <TicketsPage />
      </TestWrapper>
    )

    // Encontrar el input de búsqueda
    const searchInput = screen.getByPlaceholderText('Search tickets...')
    expect(searchInput).toBeInTheDocument()

    // Escribir en el input
    await user.type(searchInput, 'test search')
    expect(searchInput).toHaveValue('test search')
  })
})
