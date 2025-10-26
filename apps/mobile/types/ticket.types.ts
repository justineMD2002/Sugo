import { TICKET_STATUS, TICKET_PRIORITY, TICKET_SERVICE_TYPE } from '@/constants/enums';

/**
 * Ticket-related type definitions
 */

export interface Ticket {
  id: string;
  ticket_number: string;
  customer_id: string;
  service_type: TICKET_SERVICE_TYPE;
  status: TICKET_STATUS;
  created_at: string;
  updated_at: string;
}

export interface ServiceTicket {
  id: string;
  serviceType: string;
  title: string;
  description: string;
  status: TICKET_STATUS;
  priority: TICKET_PRIORITY;
  createdAt: string;
  assignedToName?: string;
  location: string;
  unreadCount: number;
}

export interface CreateTicketInput {
  customer_id: string;
  service_type: TICKET_SERVICE_TYPE;
  title: string;
  description: string;
  priority?: TICKET_PRIORITY;
  location: string;
}

export interface UpdateTicketInput {
  status?: TICKET_STATUS;
  priority?: TICKET_PRIORITY;
  assigned_to?: string;
}
