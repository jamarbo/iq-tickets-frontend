import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { LoginPage } from '@/pages/LoginPage'
import { AuthProvider } from '@/contexts/AuthContext'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('LoginPage', () => {
  it('renders login form correctly', () => {
    const Wrapper = createWrapper()
    render(<LoginPage />, { wrapper: Wrapper })
    
    // Verificar elementos principales del formulario
  expect(screen.getByLabelText(/correo/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
  expect(screen.getByText('Sistema de gestión de tickets')).toBeInTheDocument()
  })

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup()
    const Wrapper = createWrapper()
    render(<LoginPage />, { wrapper: Wrapper })
    
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/por favor ingresa un correo válido/i)).toBeInTheDocument()
      expect(screen.getByText(/la contraseña es requerida/i)).toBeInTheDocument()
    })
  })

  it('allows user to input credentials', async () => {
    const user = userEvent.setup()
    const Wrapper = createWrapper()
    render(<LoginPage />, { wrapper: Wrapper })
    
  const emailInput = screen.getByLabelText(/correo/i)
  const passwordInput = screen.getByLabelText(/contraseña/i)
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    
    expect(emailInput).toHaveValue('test@example.com')
    expect(passwordInput).toHaveValue('password123')
  })
})
