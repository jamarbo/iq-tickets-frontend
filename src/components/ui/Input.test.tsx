import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '@/components/ui/Input'

describe('Input Component', () => {
  it('renders correctly with label', () => {
    render(<Input label="Email" placeholder="Enter email" />)
    
    const label = screen.getByText(/email/i)
    const input = screen.getByPlaceholderText(/enter email/i)
    
    expect(label).toBeInTheDocument()
    expect(input).toBeInTheDocument()
  })

  it('shows error message when error prop is provided', () => {
    render(<Input label="Email" error="Email is required" />)
    
    const errorMessage = screen.getByRole('alert')
    expect(errorMessage).toBeInTheDocument()
    expect(errorMessage).toHaveTextContent('Email is required')
  })

  it('shows helper text when no error', () => {
    render(<Input label="Email" helperText="We'll never share your email" />)
    
    const helperText = screen.getByText(/we'll never share your email/i)
    expect(helperText).toBeInTheDocument()
  })

  it('accepts user input', async () => {
    const user = userEvent.setup()
    render(<Input label="Email" />)
    
    const input = screen.getByRole('textbox')
    await user.type(input, 'test@example.com')
    
    expect(input).toHaveValue('test@example.com')
  })
})
