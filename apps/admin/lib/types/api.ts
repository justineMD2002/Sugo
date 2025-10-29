// API response types and filters

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  limit: number
  totalPages: number
}

// Orders API types
export interface OrdersFilters {
  status?: string
  service_type?: string
  customer_id?: string
  search?: string
  date_from?: string
  date_to?: string
  sortBy?: "created_at" | "total_amount" | "status" | "order_number"
  sortOrder?: "asc" | "desc"
}

export type OrdersResponse = PaginatedResponse<import("./database").Order>

// Applications API types (Riders)
export interface ApplicationsFilters {
  user_type?: string
  service_type?: string
  is_verified?: boolean
  search?: string
  sortBy?: "created_at" | "full_name" | "join_date"
  sortOrder?: "asc" | "desc"
}

export type ApplicationsResponse = PaginatedResponse<import("./database").UserWithRiderProfile>

// Riders API types
export interface RidersFilters {
  service_type?: string
  is_online?: boolean
  is_verified?: boolean
  is_available?: boolean
  search?: string
  sortBy?: "created_at" | "full_name" | "rating" | "total_orders"
  sortOrder?: "asc" | "desc"
}

export type RidersResponse = PaginatedResponse<import("./database").UserWithRiderProfile>

// Customers API types
export interface CustomersFilters {
  search?: string
  has_orders?: boolean
  sortBy?: "created_at" | "full_name" | "total_orders" | "rating"
  sortOrder?: "asc" | "desc"
}

export type CustomersResponse = PaginatedResponse<import("./database").User>

// Tickets API types
export interface TicketsFilters {
  status?: string
  service_type?: string
  customer_id?: string
  search?: string
  date_from?: string
  date_to?: string
  sortBy?: "created_at" | "status" | "ticket_number"
  sortOrder?: "asc" | "desc"
}

export type TicketsResponse = PaginatedResponse<import("./database").Ticket>

// Stats types
export interface OrderStats {
  total: number
  pending: number
  in_progress: number
  delivered: number
  cancelled: number
  total_revenue: number
  average_order_value: number
}

export interface RiderStats {
  total: number
  verified: number
  online: number
  offline: number
  available: number
  average_rating: number
}

export interface CustomerStats {
  total: number
  with_orders: number
  without_orders: number
  average_rating: number
}

export interface TicketStats {
  total: number
  open: number
  in_progress: number
  resolved: number
  closed: number
}

// Ticket Messages API types
export interface TicketMessageWithSender {
  id: string
  ticket_id: string
  sender_id: string
  message_text: string
  message_type: "text" | "image" | "document"
  attachment_url?: string
  is_read: boolean
  created_at: string
  sender?: {
    id: string
    full_name: string
    user_type: "customer" | "rider" | "admin"
    avatar_url?: string
  }
}

export interface RealtimeMessagePayload {
  eventType: "INSERT" | "UPDATE" | "DELETE"
  new?: TicketMessageWithSender
  old?: TicketMessageWithSender
}