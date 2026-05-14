import { helpdeskApi } from '../api';
import type { Ticket, TicketCollaborateur, StatutTicket, PrioriteTicket, FacturationResponse } from '../../types/helpdesk'

export const ticketService = {

  getAll: (): Promise<Ticket[]> =>
    helpdeskApi.get('/tickets').then(r => r.data),

  getById: (id: number): Promise<Ticket> =>
    helpdeskApi.get(`/tickets/${id}`).then(r => r.data),

  getByClient: (clientId: number): Promise<Ticket[]> =>
    helpdeskApi.get(`/tickets/client/${clientId}`).then(r => r.data),

  getByAgent: (agentId: number): Promise<Ticket[]> =>
    helpdeskApi.get(`/tickets/agent/${agentId}`).then(r => r.data),

  getByStatus: (status: StatutTicket): Promise<Ticket[]> =>
    helpdeskApi.get(`/tickets/filter/status/${status}`).then(r => r.data),

  getByPriority: (priority: PrioriteTicket): Promise<Ticket[]> =>
    helpdeskApi.get(`/tickets/filter/priority/${priority}`).then(r => r.data),

  create: (ticket: Omit<Ticket, 'id' | 'messages' | 'collaborateurs'>): Promise<Ticket> =>
    helpdeskApi.post('/tickets', ticket).then(r => r.data),

  update: (id: number, ticket: Ticket): Promise<void> =>
    helpdeskApi.put(`/tickets/${id}`, ticket).then(r => r.data),

  changeStatus: (id: number, newStatus: StatutTicket): Promise<void> =>
    helpdeskApi.patch(`/tickets/${id}/status`, newStatus),

  delete: (id: number): Promise<void> =>
    helpdeskApi.delete(`/tickets/${id}`).then(r => r.data),

  transfer: (id: number, newAgentId: number): Promise<{ message: string }> =>
    helpdeskApi.put(`/tickets/${id}/transfer`, newAgentId).then(r => r.data),

  getFacturation: (clientId: number, start: Date, end: Date): Promise<FacturationResponse> =>
    helpdeskApi.get('/tickets/facturation', {
      params: {
        clientId,
        start: start.toISOString(),
        end: end.toISOString(),
      }
    }).then(r => r.data),
}

export const collaborateurService = {

  getByTicket: (ticketId: number): Promise<TicketCollaborateur[]> =>
    helpdeskApi.get(`/tickets/${ticketId}/collaborateurs`).then(r => r.data),

  addBulk: (ticketId: number, agentIds: number[]): Promise<{ message: string }> =>
    helpdeskApi.post(`/tickets/${ticketId}/collaborateurs/bulk`, agentIds).then(r => r.data),

  sync: (ticketId: number, agentIds: number[]): Promise<{ message: string }> =>
    helpdeskApi.put(`/tickets/${ticketId}/collaborateurs/sync`, agentIds).then(r => r.data),
}