import { Ticket, UpdateTicketData, Priority, Status } from '@/types'

export type UpdateFormInput = {
  title: string
  description: string
  status: Status
  priority?: Priority
  assignee?: string
  tags: string // comma separated
}

// Construir payload PATCH mínimo que contenga solo los campos cambiados
export function buildUpdatePayload(ticket: Ticket, data: UpdateFormInput): UpdateTicketData {
  const payload: UpdateTicketData = {}

  if (data.title !== ticket.title) payload.title = data.title
  if (data.description !== ticket.description) payload.description = data.description
  if (data.status !== ticket.status) payload.status = data.status
  if (data.priority && data.priority !== ticket.priority) payload.priority = data.priority

  const currentAssignee = ticket.assignee || ''
  if ((data.assignee || '') !== currentAssignee) {
    payload.assignee = data.assignee?.trim() || undefined
  }

  const incomingTags = data.tags
    ? data.tags.split(',').map(t => t.trim()).filter(Boolean)
    : []
  const currentTags = Array.isArray(ticket.tags) ? ticket.tags : []

  if (incomingTags.join(',') !== currentTags.join(',')) {
    payload.tags = incomingTags
  }

  return payload
}
