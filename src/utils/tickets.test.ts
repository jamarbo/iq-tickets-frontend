import { describe, it, expect } from 'vitest'
import { buildUpdatePayload, type UpdateFormInput } from './tickets'
import type { Ticket } from '@/types'

function makeTicket(overrides: Partial<Ticket> = {}): Ticket {
  return {
    id: 't1',
    title: 'Original Title',
    description: 'Original Description',
    priority: 'MED',
    status: 'OPEN',
    assignee: 'john.doe',
    createdAt: '2025-08-01T00:00:00.000Z',
    updatedAt: '2025-08-01T00:00:00.000Z',
    tags: ['bug', 'ui'],
    ...overrides,
  }
}

describe('buildUpdatePayload', () => {
  it('returns only changed fields (title, description)', () => {
    const ticket = makeTicket()
    const data: UpdateFormInput = {
      title: 'New Title',
      description: 'New Description',
      status: ticket.status,
      priority: ticket.priority,
      assignee: ticket.assignee,
      tags: ticket.tags.join(','),
    }

    const payload = buildUpdatePayload(ticket, data)
    expect(payload).toEqual({ title: 'New Title', description: 'New Description' })
  })

  it('returns empty object when nothing changed', () => {
    const ticket = makeTicket()
    const data: UpdateFormInput = {
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
  // priority es opcional en el formulario; omitir para simular sin cambios
      assignee: ticket.assignee,
      tags: ticket.tags.join(','),
    }

    const payload = buildUpdatePayload(ticket, data)
    expect(payload).toEqual({})
  })

  it('includes status when changed', () => {
    const ticket = makeTicket({ status: 'OPEN' })
    const data: UpdateFormInput = {
      title: ticket.title,
      description: ticket.description,
      status: 'IN_PROGRESS',
      priority: ticket.priority,
      assignee: ticket.assignee,
      tags: ticket.tags.join(','),
    }

    const payload = buildUpdatePayload(ticket, data)
    expect(payload).toEqual({ status: 'IN_PROGRESS' })
  })

  it('includes priority only if provided and changed', () => {
    const ticket = makeTicket({ priority: 'LOW' })
    const unchangedData: UpdateFormInput = {
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
  // prioridad omitida -> no debe incluirse
      assignee: ticket.assignee,
      tags: ticket.tags.join(','),
    }
    expect(buildUpdatePayload(ticket, unchangedData)).toEqual({})

    const changedData: UpdateFormInput = {
      ...unchangedData,
      priority: 'HIGH',
    }
    expect(buildUpdatePayload(ticket, changedData)).toEqual({ priority: 'HIGH' })
  })

  it('handles assignee changes and trims whitespace; empty clears to undefined', () => {
    const ticket = makeTicket({ assignee: 'john' })
    const changeAssignee: UpdateFormInput = {
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      assignee: '  jane  ',
      tags: ticket.tags.join(','),
    }
    const payload1 = buildUpdatePayload(ticket, changeAssignee)
    expect(payload1).toEqual({ assignee: 'jane' })

    const clearAssignee: UpdateFormInput = {
      ...changeAssignee,
      assignee: '   ',
    }
  const payload2 = buildUpdatePayload(ticket, clearAssignee)
  // la propiedad existe pero el valor es undefined (se eliminará al serializar JSON)
  expect(Object.prototype.hasOwnProperty.call(payload2, 'assignee')).toBe(true)
  expect((payload2 as any).assignee).toBeUndefined()
  })

  it('normalizes tags from comma string and includes only when changed', () => {
    const ticket = makeTicket({ tags: ['bug', 'ui'] })

    const unchanged: UpdateFormInput = {
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
  tags: 'bug, ui', // mismo conjunto con espacios
    }
    expect(buildUpdatePayload(ticket, unchanged)).toEqual({})

    const changedOrderSameValues: UpdateFormInput = {
      ...unchanged,
      tags: 'ui, bug',
    }
  // La diferencia de orden se considera un cambio en la implementación actual
    expect(buildUpdatePayload(ticket, changedOrderSameValues)).toEqual({ tags: ['ui', 'bug'] })

    const clearTags: UpdateFormInput = {
      ...unchanged,
      tags: '',
    }
    expect(buildUpdatePayload(ticket, clearTags)).toEqual({ tags: [] })
  })
})
