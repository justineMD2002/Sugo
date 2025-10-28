// Database types matching Supabase schema

export interface User {
  id: string
  phone_number: string
  email?: string
  full_name: string
  user_type: "customer" | "rider"
  avatar_url?: string
  rating: number
  total_ratings: number
  total_orders: number
  join_date: string
  created_at: string
  updated_at: string
}

export interface RiderProfile {
  id: string
  user_id: string
  service_type: "delivery" | "plumbing" | "aircon" | "electrician"
  vehicle_brand?: string
  vehicle_model?: string
  vehicle_color?: string
  plate_number?: string
  is_available: boolean
  is_verified: boolean
  is_online: boolean
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  order_number: string
  customer_id: string
  service_type: "delivery" | "plumbing" | "aircon" | "electrician"
  status: "pending" | "confirmed" | "preparing" | "picked" | "in_transit" | "delivered" | "completed" | "cancelled"
  pickup_address?: string
  delivery_address?: string
  item_description?: string
  receiver_name?: string
  receiver_phone?: string
  service_fee: number
  total_amount: number
  created_at: string
  updated_at: string
}

export interface Delivery {
  id: string
  order_id: string
  rider_id?: string
  status: "assigned" | "accepted" | "picked_up" | "in_transit" | "completed" | "cancelled"
  is_assigned: boolean
  is_accepted: boolean
  is_picked_up: boolean
  is_completed: boolean
  earnings: number
  created_at: string
  updated_at: string
}

export interface Ticket {
  id: string
  ticket_number: string
  customer_id: string
  service_type: "PLUMBING" | "ELECTRICAL" | "AIRCON" | "CARPENTRY" | "DELIVERY" | "OTHER"
  status: "open" | "in_progress" | "resolved" | "closed"
  created_at: string
  updated_at: string
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

export interface Message {
  id: string
  order_id?: string
  sender_id: string
  receiver_id: string
  message_text: string
  message_type: "text" | "image" | "document" | "location"
  attachment_url?: string
  is_read: boolean
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  related_order_id?: string
  is_read: boolean
  created_at: string
}

export interface Rating {
  id: string
  order_id: string
  rater_id: string
  rated_user_id: string
  rating: number
  created_at: string
}

// Combined types for API responses
export type UserWithRiderProfile = User & { rider_profile?: RiderProfile }
export type OrderWithDelivery = Order & { delivery?: Delivery }
export type TicketWithMessages = Ticket & { messages?: TicketMessage[] }
