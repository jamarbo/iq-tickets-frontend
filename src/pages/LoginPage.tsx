import React, { useState, useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Common'
import { LoginCredentials } from '@/types'
import { IQLogo } from '@/components/ui/IQLogo'

const loginSchema = z.object({
  email: z.string().email('Por favor ingresa un correo válido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

type LoginFormData = z.infer<typeof loginSchema>

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth()
  const location = useLocation()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  // Limpiar error cuando el componente monta
  useEffect(() => {
    clearError()
  }, [clearError])

  // Redirigir si ya está autenticado
  if (isAuthenticated) {
    const from = (location.state as any)?.from?.pathname || '/tickets'
    return <Navigate to={from} replace />
  }

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsSubmitting(true)
      await login(data as LoginCredentials)
    } catch (err) {
  console.error('❌ Error de login:', err)
  // El error es manejado por el AuthContext
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bg-secondary via-white to-bg-accent py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6 sm:mb-8">
            {/* Logo oficial de IQ Outsourcing */}
            <div className="relative">
              <IQLogo size={100} className="sm:!w-[120px] sm:!h-[120px] transform hover:scale-105 transition-transform duration-300" />
              
              {/* Elementos decorativos corporativos - Más pequeño en móvil */}
              <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-4 h-4 sm:w-6 sm:h-6 bg-gradient-to-br from-accent to-amber-400 rounded-full animate-pulse shadow-lg"></div>
              <div className="absolute -bottom-1 -left-1 sm:-bottom-2 sm:-left-2 w-3 h-3 sm:w-5 sm:h-5 bg-gradient-to-br from-success to-green-400 rounded-full shadow-lg"></div>
              <div className="absolute top-1/2 -left-3 sm:-left-4 w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-br from-secondary to-cyan-300 rounded-full"></div>
              <div className="absolute top-1/4 -right-3 sm:-right-5 w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-br from-primary to-blue-400 rounded-full"></div>
              
              {/* Círculo de fondo sutil */}
              <div className="absolute inset-0 -m-3 sm:-m-4 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 -z-10"></div>
            </div>
          </div>
          <p className="mt-4 sm:mt-6 text-sm sm:text-base text-secondary font-medium">
            Sistema de gestión de tickets
          </p>
          <p className="mt-1 text-xs sm:text-sm text-gray-600">
            Inicia sesión para acceder a tu espacio de trabajo
          </p>
        </div>

        <Card>
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <Input
                {...register('email')}
                type="email"
                label="Correo"
                placeholder="Ingresa tu correo"
                error={errors.email?.message}
                autoComplete="email"
                autoFocus
              />
            </div>

            <div>
              <Input
                {...register('password')}
                type="password"
                label="Contraseña"
                placeholder="Ingresa tu contraseña"
                error={errors.password?.message}
                autoComplete="current-password"
              />
            </div>

            <div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                Iniciar sesión
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Credenciales de demo:</p>
            <p className="text-green-600 font-medium">Admin: admin@demo.com / password (puede eliminar tickets)</p>
            <p className="text-blue-600 font-medium">Usuario: user@demo.com / password (solo ver tickets)</p>
          </div>
        </Card>
      </div>
    </div>
  )
}
