import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { IQLogoCircle } from '@/components/ui/IQLogo'

export const Header: React.FC = () => {
  const { user, logout, isAdmin } = useAuth()

  const handleLogout = () => {
    logout()
  }

  // Función para obtener iniciales del usuario
  const getUserInitials = (name?: string, email?: string) => {
    if (name && name.trim()) {
      const names = name.trim().split(' ').filter(n => n.length > 0)
      if (names.length >= 2) {
        return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase()
      }
      if (names.length === 1) {
  // Si solo hay un nombre, usar primera y segunda letra
        const singleName = names[0]
        if (singleName.length >= 2) {
          return `${singleName.charAt(0)}${singleName.charAt(1)}`.toUpperCase()
        }
        return singleName.charAt(0).toUpperCase()
      }
    }
    if (email && email.trim()) {
      const emailName = email.split('@')[0]
      if (emailName.length >= 2) {
        return `${emailName.charAt(0)}${emailName.charAt(1)}`.toUpperCase()
      }
      return emailName.charAt(0).toUpperCase()
    }
  return 'US' // Usuario por defecto
  }

  const userInitials = getUserInitials(user?.name, user?.email)
  
  // Depuración: log para ver qué valores tenemos
  console.log('User data:', { name: user?.name, email: user?.email, initials: userInitials })

  return (
    <header className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
            {/* Logo oficial IQ Outsourcing */}
            <div className="relative flex-shrink-0">
              <IQLogoCircle size={48} />
              {/* Pequeño indicador de actividad */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-white"></div>
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-primary-600 truncate">
                iQ OUTSOURCING
              </h1>
              <p className="text-xs sm:text-sm text-secondary font-medium">Ticket Management</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 flex-shrink-0">
            {/* Información de usuario - solo desktop */}
            <div className="hidden sm:flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {user?.name || user?.email}
                </p>
                <p className="text-xs font-medium flex items-center gap-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    isAdmin 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user?.role}
                  </span>
                  {isAdmin && (
                    <span className="text-green-600 text-xs">🗑️ Puede eliminar</span>
                  )}
                </p>
              </div>
              {/* Avatar de usuario con fondo azul y letras blancas */}
              <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg border-2 border-blue-100">
                {userInitials}
              </div>
            </div>
            
            {/* Avatar solo móvil con fondo azul y letras blancas */}
            <div className="sm:hidden w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xs shadow-lg border-2 border-blue-100">
              {userInitials}
            </div>
            
            {/* Botón de salir - Diseño elegante y profesional */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200 px-3 py-2 rounded-lg flex items-center gap-2 ml-3 border border-gray-200 hover:border-red-200"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="text-sm font-medium">Salir</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
