import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/contexts/AuthContext'
import { App } from './App'
import '@/styles/globals.css'

// Permitir activar overrides vía parámetros de URL (útil en móviles sin consola)
(() => {
  try {
    const params = new URLSearchParams(window.location.search)
    const adminEmails = params.get('adminEmails') // ej: ?adminEmails=admin@demo.com ó ?adminEmails=
    const forceAdmin = params.get('forceAdmin')   // ej: ?forceAdmin=1|true|0|false
    // adminEmails: si param existe y es vacío => limpiar; si trae valor => set
    if (params.has('adminEmails')) {
      if (adminEmails && adminEmails.trim().length > 0) {
        localStorage.setItem('ADMIN_EMAILS_OVERRIDE', adminEmails)
        console.info('[Auth] ADMIN_EMAILS_OVERRIDE set from URL param')
      } else {
        localStorage.removeItem('ADMIN_EMAILS_OVERRIDE')
        console.info('[Auth] ADMIN_EMAILS_OVERRIDE removed via URL param')
      }
    }
    // forceAdmin: si param existe y es truthy (1/true/yes) => set; si 0/false/no => remove
    if (params.has('forceAdmin')) {
      if (forceAdmin && /^(1|true|yes)$/i.test(forceAdmin)) {
        localStorage.setItem('FORCE_ADMIN_OVERRIDE', 'true')
        console.info('[Auth] FORCE_ADMIN_OVERRIDE set from URL param')
      } else {
        localStorage.removeItem('FORCE_ADMIN_OVERRIDE')
        console.info('[Auth] FORCE_ADMIN_OVERRIDE removed via URL param')
      }
    }
    if (params.has('adminEmails') || params.has('forceAdmin')) {
      const url = new URL(window.location.href)
      url.searchParams.delete('adminEmails')
      url.searchParams.delete('forceAdmin')
      window.history.replaceState({}, '', url.toString())
    }
  } catch {}
})()

// Crear un cliente de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60000, // 1 minute
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#059669',
                },
              },
              error: {
                style: {
                  background: '#dc2626',
                },
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)
