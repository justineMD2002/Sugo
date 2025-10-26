import { ORDER_STATUS, SERVICE_TYPE, PAYMENT_METHOD } from '@/constants/enums';

/**
 * Order-related type definitions
 */

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  service_type: SERVICE_TYPE;
  status: ORDER_STATUS;
  pickup_address?: string;
  delivery_address?: string;
  item_description?: string;
  receiver_name?: string;
  receiver_phone?: string;
  service_fee: number;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderInput {
  customer_id: string;
  service_type: SERVICE_TYPE;
  pickup_address?: string;
  delivery_address?: string;
  item_description?: string;
  receiver_name?: string;
  receiver_phone?: string;
  service_fee: number;
  total_amount: number;
}

export interface UpdateOrderInput {
  status?: ORDER_STATUS;
  pickup_address?: string;
  delivery_address?: string;
  item_description?: string;
  receiver_name?: string;
  receiver_phone?: string;
}

export interface OrderWithDetails extends Order {
  customer?: {
    id: string;
    full_name: string;
    phone_number: string;
    avatar_url?: string;
  };
  rider?: {
    id: string;
    full_name: string;
    phone_number: string;
    avatar_url?: string;
  };
}
