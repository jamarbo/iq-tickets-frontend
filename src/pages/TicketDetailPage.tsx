import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTicket, useUpdateTicket, useDeleteTicket } from '@/hooks'
import { ticketsApi, handleApiError } from '@/services/api'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Card, Badge, LoadingSpinner } from '@/components/ui/Common'
import { PRIORITIES, STATUSES, PRIORITY_COLORS, STATUS_COLORS, PRIORITY_LABELS, STATUS_LABELS, UpdateTicketData } from '@/types'
import { buildUpdatePayload } from '@/utils/tickets'
import { formatDistanceToNow, format } from 'date-fns'

const updateTicketSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  priority: z.enum(['LOW', 'MED', 'HIGH']).optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'CLOSED']),
  assignee: z.string().optional(),
  tags: z.string(),
})

type UpdateTicketFormData = z.infer<typeof updateTicketSchema>

export const TicketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)

  const { data: ticketData, isLoading, error } = useTicket(id!)
  const updateTicketMutation = useUpdateTicket()
  const deleteTicketMutation = useDeleteTicket()
  const [canDelete, setCanDelete] = useState<boolean>(false)

  // Consultar permisos al montar/cambiar id. Fail-closed: si falla, ocultar botón
  useEffect(() => {
    let active = true
    const run = async () => {
      if (!id) return
      try {
        const p = await ticketsApi.getTicketPermissions(id)
        if (active) setCanDelete(!!p?.canDelete)
      } catch {
        if (active) setCanDelete(false)
      }
    }
    run()
    return () => { active = false }
  }, [id])

  // Normalizar el ticket para evitar errores con propiedades null/undefined
  const ticket = ticketData ? {
    ...ticketData,
    tags: Array.isArray(ticketData.tags) ? ticketData.tags : [],
    title: ticketData.title || '',
    description: ticketData.description || '',
    assignee: ticketData.assignee || null,
  } : null

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<UpdateTicketFormData>({
    resolver: zodResolver(updateTicketSchema),
    values: ticket ? {
      title: ticket.title || '',
      description: ticket.description || '',
      priority: ticket.priority,
      status: ticket.status,
      assignee: ticket.assignee || '',
      tags: (ticket.tags && Array.isArray(ticket.tags)) ? ticket.tags.join(', ') : '',
    } : undefined,
  })

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      try {
        await deleteTicketMutation.mutateAsync(id!)
        navigate('/tickets')
      } catch (error) {
        const apiError = handleApiError(error as any, 'general')
        if ((apiError.statusCode || 0) === 403) {
          toast.error('No autorizado')
        }
      }
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    reset()
  }

  const onSubmit = async (data: UpdateTicketFormData) => {
  // Construir un payload PATCH mínimo solo con campos cambiados
    const payload: UpdateTicketData = ticket
      ? buildUpdatePayload({ ...ticket, assignee: ticket.assignee || undefined } as any, data)
      : {}

  // Si nada cambió, salir del modo edición
    if (Object.keys(payload).length === 0) {
      setIsEditing(false)
      return
    }

    try {
      await updateTicketMutation.mutateAsync({ id: id!, data: payload })
      setIsEditing(false)
    } catch (error) {
  // El error es manejado por la mutación
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <Card>
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Ticket Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The ticket you're looking for doesn't exist or has been deleted.
          </p>
          <Link to="/tickets">
            <Button variant="primary">Back to Tickets</Button>
          </Link>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6 px-4 sm:px-0">
  {/* Encabezado - Responsivo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Link
            to="/tickets"
            className="inline-flex items-center text-gray-600 hover:text-primary font-medium text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition-all duration-200 border border-gray-200 hover:border-primary/20"
          >
            ← Volver a Tickets
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate mt-2">
            Ticket #{ticket.id.slice(-6).toUpperCase()}
          </h1>
        </div>
        
  {/* Botones de acción - Apilar en móvil */}
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:space-x-2">
          {!isEditing && (
            <Button
              variant="secondary"
              onClick={handleEdit}
              className="w-full sm:w-auto"
            >
              Editar
            </Button>
          )}
          {canDelete && (
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={deleteTicketMutation.isLoading}
              className="w-full sm:w-auto"
            >
              Eliminar
            </Button>
          )}
        </div>
      </div>

  {/* Contenido del Ticket - Mejor disposición en móvil */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
  {/* Contenido principal */}
        <div className="xl:col-span-2 order-2 xl:order-1">
          <Card>
            {isEditing ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  {...register('title')}
                  label="Title"
                  error={errors.title?.message}
                />
                
                <Textarea
                  {...register('description')}
                  label="Description"
                  error={errors.description?.message}
                  rows={6}
                />
                
                <Input
                  {...register('assignee')}
                  label="Assignee"
                  placeholder="Enter assignee name"
                  error={errors.assignee?.message}
                />
                
                <Input
                  {...register('tags')}
                  label="Tags"
                  placeholder="Enter tags separated by commas"
                  error={errors.tags?.message}
                  helperText="Separate multiple tags with commas"
                />
                
                <div className="flex space-x-4 pt-4 border-t">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={updateTicketMutation.isLoading}
                    disabled={!isDirty}
                  >
                    Guardar cambios
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleCancel}
                  >
                  Cancelar
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {ticket.title}
                  </h2>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {ticket.description}
                  </p>
                </div>
                
                {ticket.assignee && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">
                      Asignado a
                    </h3>
                    <p className="text-gray-600">{ticket.assignee}</p>
                  </div>
                )}
                
                {ticket.tags && ticket.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      Etiquetas
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {ticket.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-sm bg-gray-100 text-gray-700 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Barra lateral - Mostrar primero en móvil */}
        <div className="space-y-4 sm:space-y-6 order-1 xl:order-2">
          {/* Status & Priority */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Status & Priority
            </h3>
            
            {isEditing ? (
              <div className="space-y-4">
                <Select
                  {...register('status')}
                  label="Status"
                  options={STATUSES.map(status => ({ value: status, label: STATUS_LABELS[status] }))}
                  error={errors.status?.message}
                />
                
                <Select
                  {...register('priority')}
                  label="Priority"
                  options={PRIORITIES.map(priority => ({ value: priority, label: PRIORITY_LABELS[priority] }))}
                  error={errors.priority?.message}
                  disabled={user?.role !== 'Admin'}
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-700">Status</span>
                  <div className="mt-1">
                    <Badge variant={STATUS_COLORS[ticket.status]}>
                      {STATUS_LABELS[ticket.status]}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-700">Priority</span>
                  <div className="mt-1">
                    <Badge variant={PRIORITY_COLORS[ticket.priority]}>
                      {PRIORITY_LABELS[ticket.priority]}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Tiempos */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Línea de tiempo
            </h3>
            
            <div className="space-y-3 text-sm">
              {(() => {
                const safeDate = (val?: any) => {
                  const d = val ? new Date(val) : null
                  return d && !isNaN(d.getTime()) ? d : null
                }
                const created = safeDate((ticket as any).createdAt)
                const updated = safeDate((ticket as any).updatedAt || (ticket as any).createdAt)
                return (
                  <>
                    <div>
                      <span className="font-medium text-gray-700">Creado</span>
                      <div className="text-gray-600">
                        {created ? format(created, 'PPP') : '—'}
                        <div className="text-xs text-gray-500">
                          {created ? formatDistanceToNow(created, { addSuffix: true }) : '—'}
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Última actualización</span>
                      <div className="text-gray-600">
                        {updated ? format(updated, 'PPP') : '—'}
                        <div className="text-xs text-gray-500">
                          {updated ? formatDistanceToNow(updated, { addSuffix: true }) : '—'}
                        </div>
                      </div>
                    </div>
                  </>
                )
              })()}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
