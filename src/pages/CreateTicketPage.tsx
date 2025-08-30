import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateTicket } from '@/hooks'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Card } from '@/components/ui/Common'
import { PRIORITIES, PRIORITY_LABELS, CreateTicketData } from '@/types'

const createTicketSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  description: z.string().min(1, 'La descripción es requerida'),
  priority: z.enum(['LOW', 'MED', 'HIGH']),
  assignee: z.string().optional(),
  tags: z.string(),
})

type CreateTicketFormData = z.infer<typeof createTicketSchema>

export const CreateTicketPage: React.FC = () => {
  const navigate = useNavigate()
  const createTicketMutation = useCreateTicket()
  const [showSuccess, setShowSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateTicketFormData>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      priority: 'MED',
      tags: '',
      assignee: '',
    },
  })

  const onSubmit = async (data: CreateTicketFormData) => {
  // Enviar solo los campos básicos que sabemos que funcionan
    const createData: CreateTicketData = {
      title: data.title,
      description: data.description,
      priority: data.priority,
    }

    console.log('📝 CreateTicketPage: Submitting data:', createData)

    try {
      await createTicketMutation.mutateAsync(createData)
      console.log('✅ Ticket created successfully!')
      
  // Mostrar mensaje de éxito
      setShowSuccess(true)
      
  // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate('/tickets')
      }, 2000)
    } catch (error) {
      console.error('❌ Error creating ticket:', error)
  // El error es manejado por la mutación
    }
  }

  return (
    <div className="space-y-6">
  {/* Mensaje de éxito */}
      {showSuccess && (
        <Card className="border-green-200 bg-green-50">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-green-800">
                ¡Ticket creado exitosamente!
              </h3>
              <p className="text-sm text-green-700">
                Serás redirigido a la lista de tickets en unos segundos...
              </p>
            </div>
          </div>
        </Card>
      )}

  {/* Encabezado */}
      <div>
        <Link
          to="/tickets"
          className="inline-flex items-center text-gray-600 hover:text-primary font-medium text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition-all duration-200 border border-gray-200 hover:border-primary/20 mb-4"
        >
          ← Volver a Tickets
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Crear nuevo ticket</h1>
        <p className="text-gray-600 mt-1">
          Completa el formulario para crear un nuevo ticket de soporte.
        </p>
      </div>

  {/* Formulario */}
      <div className="max-w-2xl">
        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              {...register('title')}
              label="Título"
              placeholder="Ingresa un título descriptivo"
              error={errors.title?.message}
              autoFocus
            />

            <Textarea
              {...register('description')}
              label="Descripción"
              placeholder="Proporciona una descripción detallada del problema o solicitud"
              error={errors.description?.message}
              rows={6}
              helperText="Incluye la mayor cantidad de detalles posible para resolver más rápido"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                {...register('priority')}
                label="Prioridad"
                options={PRIORITIES.map(priority => ({ value: priority, label: PRIORITY_LABELS[priority] }))}
                error={errors.priority?.message}
                helperText="Selecciona el nivel de urgencia"
              />

              <Input
                {...register('assignee')}
                label="Asignado a (Opcional)"
                placeholder="Asignar a un miembro del equipo"
                error={errors.assignee?.message}
                helperText="Deja en blanco para asignar después"
              />
            </div>

            <Input
              {...register('tags')}
              label="Etiquetas (Opcional)"
              placeholder="bug, feature, enhancement"
              error={errors.tags?.message}
              helperText="Separa múltiples etiquetas con comas"
            />

            <div className="flex space-x-4 pt-6 border-t">
              <Button
                type="submit"
                variant="primary"
                loading={isSubmitting || createTicketMutation.isLoading}
                disabled={isSubmitting || createTicketMutation.isLoading}
              >
                Crear ticket
              </Button>
              <Link to="/tickets">
                <Button
                  type="button"
                  variant="ghost"
                >
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </Card>

  {/* Texto de ayuda */}
        <div className="mt-6">
          <Card className="bg-blue-50 border-blue-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Consejos para crear tickets efectivos
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Usa un título claro y descriptivo</li>
                    <li>Incluye pasos para reproducir problemas</li>
                    <li>Agrega etiquetas relevantes para mejor organización</li>
                    <li>Establece la prioridad según el impacto</li>
                    <li>Asigna a miembros específicos cuando sea posible</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
