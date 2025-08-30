import React from 'react'
import { clsx } from 'clsx'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  disabled,
  children,
  ...props
}) => {
  const baseClasses = [
    'inline-flex',
    'items-center',
    'justify-center',
    'font-semibold',
    'rounded',
    'border',
    'transition-all',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
  ]

  const variants = {
    primary: [
      'bg-primary',
      'text-white',
      'border-primary',
      'hover:bg-primary-dark',
      'focus:ring-primary',
    ],
    secondary: [
      'bg-white',
      'text-primary',
      'border-primary',
      'hover:bg-gray-50',
      'focus:ring-primary',
    ],
    danger: [
      'bg-error',
      'text-white',
      'border-error',
      'hover:bg-red-700',
      'focus:ring-error',
    ],
    ghost: [
      'bg-transparent',
      'text-gray-700',
      'border-transparent',
      'hover:bg-gray-100',
      'focus:ring-gray-500',
    ],
  }

  const sizes = {
    sm: ['px-3', 'py-1.5', 'text-sm'],
    md: ['px-4', 'py-2', 'text-base'],
    lg: ['px-6', 'py-3', 'text-lg'],
  }

  const classes = clsx(
    baseClasses,
    variants[variant],
    sizes[size],
    {
      'cursor-not-allowed opacity-50': loading || disabled,
    },
    className
  )

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  )
}
