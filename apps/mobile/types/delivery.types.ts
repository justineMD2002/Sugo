import { DELIVERY_STATUS } from '@/constants/enums';
import { Order } from './order.types';

/**
 * Delivery-related type definitions
 */

export interface Delivery {
  id: string;
  order_id: string;
  rider_id: string;
  status: DELIVERY_STATUS;
  is_assigned: boolean;
  is_accepted: boolean;
  is_picked_up: boolean;
  is_completed: boolean;
  earnings: number;
  created_at: string;
  updated_at: string;
}

export interface DeliveryWithOrder extends Delivery {
  order: Order;
}

export interface CreateDeliveryInput {
  order_id: string;
  rider_id: string;
  status: DELIVERY_STATUS;
  is_assigned: boolean;
  is_accepted: boolean;
  earnings: number;
}

export interface UpdateDeliveryInput {
  status?: DELIVERY_STATUS;
  is_picked_up?: boolean;
  is_completed?: boolean;
}
