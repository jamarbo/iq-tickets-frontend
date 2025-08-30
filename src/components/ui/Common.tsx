import React from 'react'
import { clsx } from 'clsx'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md'
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
}) => {
  const baseClasses = [
    'inline-flex',
    'items-center',
    'font-semibold',
    'rounded-full',
    'text-center',
    'whitespace-nowrap',
  ]

  const variants = {
    default: ['bg-gray-100', 'text-gray-700'],
    success: ['bg-green-50', 'text-green-700', 'border', 'border-green-200'], // Verde más suave inspirado en el logo
    warning: ['bg-amber-50', 'text-amber-700', 'border', 'border-amber-200'], // Amarillo/naranja del logo
    error: ['bg-red-50', 'text-red-700', 'border', 'border-red-200'],
    info: ['bg-cyan-50', 'text-cyan-700', 'border', 'border-cyan-200'], // Azul claro del "OUTSOURCING"
  }

  const sizes = {
    sm: ['px-2', 'py-0.5', 'text-xs'],
    md: ['px-3', 'py-1', 'text-sm'],
  }

  const classes = clsx(
    baseClasses,
    variants[variant],
    sizes[size],
    className
  )

  return (
    <span className={classes}>
      {children}
    </span>
  )
}

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: boolean
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = true,
}) => {
  return (
    <div
      className={clsx(
        'bg-white border border-gray-200 rounded-lg shadow-sm',
        {
          'p-6': padding,
        },
        className
      )}
    >
      {children}
    </div>
  )
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
}) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  return (
    <div className={clsx('animate-spin', sizes[size], className)} role="status" aria-label="Loading">
      <svg
        className="w-full h-full text-primary"
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
    </div>
  )
}

interface SkeletonProps {
  className?: string
}

// Bloque de skeleton simple con animación de pulso
export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div className={clsx('animate-pulse bg-gray-200 rounded', className)} />
  )
}

interface EmptyStateProps {
  title: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className,
}) => {
  return (
    <div className={clsx('text-center py-12', className)}>
      {icon && (
        <div className="flex justify-center mb-4 text-gray-400">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          {description}
        </p>
      )}
      {action && action}
    </div>
  )
}
