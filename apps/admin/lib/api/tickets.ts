import { createClient } from "@/lib/supabase/client"

export interface Ticket {
  id: string
  ticket_number: string
  customer_id: string
  service_type: "PLUMBING" | "ELECTRICAL" | "AIRCON" | "CARPENTRY" | "DELIVERY" | "OTHER"
  status: "open" | "in_progress" | "resolved" | "closed"
  created_at: string
  updated_at: string
  customer?: Array<{
    full_name: string
    phone_number: string
    email: string
  }>
}

export interface TicketsFilters {
  search?: string
  status?: "open" | "in_progress" | "resolved" | "closed"
  service_type?: "PLUMBING" | "ELECTRICAL" | "AIRCON" | "CARPENTRY" | "DELIVERY" | "OTHER"
  customer_id?: string
  date_from?: string
  date_to?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface TicketsResponse {
  data: Ticket[]
  count: number
  page: number
  limit: number
  totalPages: number
}

export interface TicketStats {
  total: number
  open: number
  in_progress: number
  resolved: number
  closed: number
}

export interface TicketMessage {
  id: string
  ticket_id: string
  sender_id: string
  message_text: string
  message_type: "text" | "image" | "document"
  attachment_url?: string
  is_read: boolean
  created_at: string
}

export interface TicketMessageWithSender extends TicketMessage {
  sender: {
    id: string
    full_name: string
    email: string
  }
}

export interface RealtimeMessagePayload {
  eventType: "INSERT" | "UPDATE" | "DELETE"
  newRecord: any
  oldRecord: any
}

export async function getTickets(
  page: number = 1,
  limit: number = 10,
  filters: TicketsFilters = {}
): Promise<TicketsResponse> {
  const supabase = createClient()
  const offset = (page - 1) * limit

  let query = supabase
    .from("tickets")
    .select(`
      *,
      customer:users!tickets_customer_id_fkey(full_name, phone_number, email)
    `, { count: "exact" })

  // Apply filters
  if (filters.status) {
    query = query.eq("status", filters.status)
  }

  if (filters.service_type) {
    query = query.eq("service_type", filters.service_type)
  }

  if (filters.customer_id) {
    query = query.eq("customer_id", filters.customer_id)
  }

  if (filters.search) {
    query = query.or(`ticket_number.ilike.%${filters.search}%`)
  }

  if (filters.date_from) {
    query = query.gte("created_at", filters.date_from)
  }

  if (filters.date_to) {
    query = query.lte("created_at", filters.date_to)
  }

  // Apply sorting
  const sortBy = filters.sortBy || "created_at"
  const sortOrder = filters.sortOrder || "desc"
  query = query.order(sortBy, { ascending: sortOrder === "asc" })

  // Apply pagination
  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Failed to fetch tickets: ${error.message}`)
  }

  const totalPages = Math.ceil((count || 0) / limit)

  return {
    data: data || [],
    count: count || 0,
    page,
    limit,
    totalPages
  }
}

export async function getTicketById(id: string): Promise<Ticket | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return null
    }
    throw new Error(`Failed to fetch ticket: ${error.message}`)
  }

  return data
}

export async function updateTicketStatus(
  id: string, 
  status: Ticket["status"]
): Promise<Ticket> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from("tickets")
    .update({ 
      status,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update ticket: ${error.message}`)
  }

  return data
}

export async function createTicket(ticket: Omit<Ticket, "id" | "created_at" | "updated_at">): Promise<Ticket> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from("tickets")
    .insert(ticket)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create ticket: ${error.message}`)
  }

  return data
}

export async function getTicketMessages(ticket_id: string): Promise<TicketMessage[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from("ticket_messages")
    .select("*")
    .eq("ticket_id", ticket_id)
    .order("created_at", { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch ticket messages: ${error.message}`)
  }

  return data || []
}

export async function getTicketMessagesWithSender(ticket_id: string): Promise<TicketMessageWithSender[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from("ticket_messages")
    .select(`
      *,
      sender:users!ticket_messages_sender_id_fkey(
        id,
        full_name,
        user_type,
        avatar_url
      )
    `)
    .eq("ticket_id", ticket_id)
    .order("created_at", { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch ticket messages with sender: ${error.message}`)
  }

  return data || []
}

export async function addTicketMessage(
  ticket_id: string,
  sender_id: string,
  message_text: string,
  message_type: TicketMessage["message_type"] = "text",
  attachment_url?: string
): Promise<TicketMessage> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from("ticket_messages")
    .insert({
      ticket_id,
      sender_id,
      message_text,
      message_type,
      attachment_url
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to add ticket message: ${error.message}`)
  }

  return data
}

export async function markTicketMessagesAsRead(ticket_id: string, sender_id: string): Promise<void> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from("ticket_messages")
    .update({ is_read: true })
    .eq("ticket_id", ticket_id)
    .neq("sender_id", sender_id) // Don't mark own messages as read

  if (error) {
    throw new Error(`Failed to mark messages as read: ${error.message}`)
  }
}

export async function getTicketStats(): Promise<TicketStats> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from("tickets")
    .select("status")

  if (error) {
    throw new Error(`Failed to fetch ticket stats: ${error.message}`)
  }

  const stats = {
    total: data.length,
    open: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0
  }

  data.forEach(ticket => {
    switch (ticket.status) {
      case "open":
        stats.open++
        break
      case "in_progress":
        stats.in_progress++
        break
      case "resolved":
        stats.resolved++
        break
      case "closed":
        stats.closed++
        break
    }
  })

  return stats
}
