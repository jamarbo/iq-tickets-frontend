import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTickets, useTicketFilters, useDeleteTicket, useDebounce } from '@/hooks'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Card, Badge, Skeleton } from '@/components/ui/Common'
import { PRIORITIES, STATUSES, PRIORITY_COLORS, STATUS_COLORS, PRIORITY_LABELS, STATUS_LABELS } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { Ticket } from '@/types'

export const TicketsPage: React.FC = () => {
  const { user, isAdmin } = useAuth()
  const { filters, updateFilter, clearFilters } = useTicketFilters({
    limit: 12,
  })
  const [searchInput, setSearchInput] = useState(filters.q || '')
  const debouncedSearch = useDebounce(searchInput, 500)
  
  // Actualizar el filtro de búsqueda cuando cambia el valor (con debounce)
  React.useEffect(() => {
    updateFilter('q', debouncedSearch || undefined)
  }, [debouncedSearch]) // No incluir updateFilter en dependencias

  const { data, isLoading, error } = useTickets(filters)
  const deleteTicketMutation = useDeleteTicket()

  // Logs de depuración
  console.log('🔍 TicketsPage DEBUG:', {
    filters,
    data,
    isLoading,
    error,
    hasData: (data?.data?.length || 0) > 0,
    userRole: user?.role,
    isAdmin,
  })

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      deleteTicketMutation.mutate(id)
    }
  }

  const handleClearFilters = () => {
    clearFilters()
    setSearchInput('')
  }

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true })
  }

  const renderTicketRow = (ticket: Ticket) => (
    <tr key={ticket.id} className="hover:bg-gray-50 border-b border-gray-200">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
            {ticket.title}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-600 truncate max-w-xs">
          {ticket.description}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge variant={STATUS_COLORS[ticket.status]} size="sm">
          {STATUS_LABELS[ticket.status]}
        </Badge>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge variant={PRIORITY_COLORS[ticket.priority]} size="sm">
          {PRIORITY_LABELS[ticket.priority]}
        </Badge>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {ticket.assignee || '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(ticket.createdAt)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center space-x-2 justify-end">
          <Link
            to={`/tickets/${ticket.id}`}
            className="text-primary hover:text-primary-dark font-medium"
          >
            Ver
          </Link>
          {isAdmin && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDelete(ticket.id)}
              disabled={deleteTicketMutation.isLoading}
            >
              Eliminar
            </Button>
          )}
        </div>
      </td>
    </tr>
  )

  // Componente para cards móviles
  const renderTicketCard = (ticket: Ticket) => (
    <Card key={ticket.id} className="p-4 hover:shadow-md transition-shadow">
      <div className="space-y-3">
        {/* Header con título y badges */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <h3 className="font-medium text-gray-900 text-sm leading-tight">
            {ticket.title}
          </h3>
          <div className="flex gap-2 flex-shrink-0">
            <Badge variant={STATUS_COLORS[ticket.status]} size="sm">
              {STATUS_LABELS[ticket.status]}
            </Badge>
            <Badge variant={PRIORITY_COLORS[ticket.priority]} size="sm">
              {PRIORITY_LABELS[ticket.priority]}
            </Badge>
          </div>
        </div>
        
        {/* Descripción */}
        <p className="text-sm text-gray-600 line-clamp-2">
          {ticket.description}
        </p>
        
        {/* Metadata */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-500">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            {ticket.assignee && (
              <span className="flex items-center gap-1">
                👤 {ticket.assignee}
              </span>
            )}
            <span className="flex items-center gap-1">
              📅 {formatDate(ticket.createdAt)}
            </span>
          </div>
          
          {/* Acciones */}
          <div className="flex gap-2">
            <Link
              to={`/tickets/${ticket.id}`}
              className="text-primary hover:text-primary-dark font-medium text-xs"
            >
              Ver
            </Link>
            {isAdmin && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(ticket.id)}
                disabled={deleteTicketMutation.isLoading}
                className="text-xs px-2 py-1"
              >
                Eliminar
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  )

  return (
    <div className="space-y-8">
  {/* Encabezado mejorado */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Ticket Management</h1>
            <p className="text-primary-light opacity-90">
              Manage and track all your support tickets efficiently
            </p>
          </div>
          <Link to="/tickets/new">
            <Button 
              variant="secondary" 
              className="mt-4 md:mt-0 bg-white text-primary hover:bg-gray-50 shadow-md"
            >
              <svg
                className="h-4 w-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Create New Ticket
          </Button>
        </Link>
        </div>
      </div>

  {/* Filtros con mejor diseño */}
  <Card className="border-0 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search tickets..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="md:col-span-2"
          />
          <Select
            placeholder="All Statuses"
            value={filters.status || ''}
            onChange={(e) => updateFilter('status', e.target.value || undefined)}
            options={STATUSES.map(status => ({ value: status, label: STATUS_LABELS[status] }))}
          />
          <Select
            placeholder="All Priorities"
            value={filters.priority || ''}
            onChange={(e) => updateFilter('priority', e.target.value || undefined)}
            options={PRIORITIES.map(priority => ({ value: priority, label: PRIORITY_LABELS[priority] }))}
          />
        </div>
        
        {(filters.q || filters.status || filters.priority) && (
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Filtros aplicados
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
            >
              Limpiar filtros
            </Button>
          </div>
        )}
      </Card>

    {/* Contenido */}
      {isLoading ? (
        <>
      {/* Skeleton de escritorio */}
          <div className="hidden lg:block bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
            <div className="p-4 border-b bg-gradient-to-r from-gray-50 to-gray-100" />
            <div className="divide-y divide-gray-100">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="grid grid-cols-12 gap-4 px-6 py-4">
                  <Skeleton className="col-span-3 h-4" />
                  <Skeleton className="col-span-3 h-4" />
                  <Skeleton className="col-span-2 h-6 rounded-full" />
                  <Skeleton className="col-span-1 h-6 rounded-full" />
                  <Skeleton className="col-span-1 h-4" />
                  <Skeleton className="col-span-2 h-4" />
                </div>
              ))}
            </div>
          </div>

          {/* Skeleton móvil */}
          <div className="lg:hidden space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <Skeleton className="h-4 w-2/3" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                  </div>
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : error ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-red-600">Error cargando tickets</p>
          </div>
        </Card>
      ) : !data?.data?.length ? (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="mb-8">
              <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <svg
                  className="h-12 w-12 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {filters.q || filters.status || filters.priority
                  ? "No tickets found"
                  : "No tickets yet"}
              </h3>
              <p className="text-gray-600 mb-8">
                {filters.q || filters.status || filters.priority
                  ? "Try adjusting your search criteria or clear the filters."
                  : "Get started by creating your first support ticket."}
              </p>
            </div>
            
            <Link to="/tickets/new">
              <div className="w-full max-w-xs mx-auto p-6 border-2 border-dashed border-primary/30 rounded-xl hover:border-primary/50 transition-colors group cursor-pointer bg-primary/5 hover:bg-primary/10">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                  <p className="text-primary font-semibold text-sm">Create New Ticket</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Tabla de escritorio - Oculta en móvil */}
          <div className="hidden lg:block bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      📋 Title
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      📝 Description
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      🏷️ Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      ⚡ Priority
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      👤 Assignee
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      📅 Created
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                      ⚙️ Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {data.data.map(renderTicketRow)}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tarjetas móviles - Ocultas en escritorio */}
          <div className="lg:hidden space-y-4">
            {data.data.map(renderTicketCard)}
          </div>

          {/* Paginación mejorada - Responsiva */}
          {data.totalPages > 1 && (
            <Card className="border-0 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
                  Showing {((data.page - 1) * data.limit) + 1} to {Math.min(data.page * data.limit, data.total)} of {data.total} tickets
                </div>
                
                <div className="flex items-center justify-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateFilter('page', Math.max(1, data.page - 1))}
                    disabled={data.page === 1}
                    className="text-xs sm:text-sm px-2 sm:px-3"
                  >
                    <span className="hidden sm:inline">Previous</span>
                    <span className="sm:hidden">←</span>
                  </Button>
                  
                  <span className="text-xs sm:text-sm text-gray-500 px-2">
                    {data.page} / {data.totalPages}
                  </span>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateFilter('page', Math.min(data.totalPages, data.page + 1))}
                    disabled={data.page === data.totalPages}
                    className="text-xs sm:text-sm px-2 sm:px-3"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <span className="sm:hidden">→</span>
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
