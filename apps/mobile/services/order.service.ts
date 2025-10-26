import { supabase } from '@/lib/supabase';
import {
  Order,
  CreateOrderInput,
  UpdateOrderInput,
  OrderWithDetails
} from '@/types';
import { ApiResponse } from '@/types';
import { ORDER_STATUS } from '@/constants/enums';

/**
 * Order service for managing order operations
 */

export class OrderService {
  /**
   * Create a new order
   */
  static async createOrder(input: CreateOrderInput): Promise<ApiResponse<Order>> {
    try {
      const orderNumber = this.generateOrderNumber(input.customer_id);

      const { data, error } = await supabase
        .from('orders')
        .insert([{
          order_number: orderNumber,
          ...input,
          status: ORDER_STATUS.PENDING,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating order:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Unexpected error creating order:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create order',
      };
    }
  }

  /**
   * Get order by ID
   */
  static async getOrderById(orderId: string): Promise<ApiResponse<Order>> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch order',
      };
    }
  }

  /**
   * Get orders by customer ID
   */
  static async getOrdersByCustomer(customerId: string): Promise<ApiResponse<Order[]>> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch orders',
      };
    }
  }

  /**
   * Get pending orders by service type (for riders)
   */
  static async getPendingOrdersByService(serviceType: string): Promise<ApiResponse<Order[]>> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('status', ORDER_STATUS.PENDING)
        .eq('service_type', serviceType)
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch pending orders',
      };
    }
  }

  /**
   * Update order
   */
  static async updateOrder(
    orderId: string,
    updates: UpdateOrderInput
  ): Promise<ApiResponse<Order>> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update order',
      };
    }
  }

  /**
   * Cancel order
   */
  static async cancelOrder(orderId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel order',
      };
    }
  }

  /**
   * Generate unique order number
   */
  private static generateOrderNumber(customerId: string): string {
    const userIdShort = customerId.slice(-6);
    const timestamp = Date.now().toString().slice(-8);
    return `ORD-${userIdShort}-${timestamp}`;
  }
}
