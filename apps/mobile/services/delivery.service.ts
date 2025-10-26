import { supabase } from '@/lib/supabase';
import {
  Delivery,
  CreateDeliveryInput,
  UpdateDeliveryInput,
  DeliveryWithOrder,
  ApiResponse
} from '@/types';

/**
 * Delivery service for managing delivery operations
 */

export class DeliveryService {
  /**
   * Create a new delivery
   */
  static async createDelivery(input: CreateDeliveryInput): Promise<ApiResponse<Delivery>> {
    try {
      const { data, error } = await supabase
        .from('deliveries')
        .insert([{
          ...input,
          is_picked_up: false,
          is_completed: false,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating delivery:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Unexpected error creating delivery:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create delivery',
      };
    }
  }

  /**
   * Get delivery by order ID
   */
  static async getDeliveryByOrderId(orderId: string): Promise<ApiResponse<Delivery>> {
    try {
      const { data, error } = await supabase
        .from('deliveries')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (error) {
        // No delivery assigned yet
        if (error.code === 'PGRST116') {
          return { success: true, data: null as any };
        }
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch delivery',
      };
    }
  }

  /**
   * Get deliveries by rider ID
   */
  static async getDeliveriesByRider(riderId: string): Promise<ApiResponse<DeliveryWithOrder[]>> {
    try {
      const { data, error } = await supabase
        .from('deliveries')
        .select(`
          *,
          order:orders(*)
        `)
        .eq('rider_id', riderId)
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch deliveries',
      };
    }
  }

  /**
   * Update delivery
   */
  static async updateDelivery(
    deliveryId: string,
    updates: UpdateDeliveryInput
  ): Promise<ApiResponse<Delivery>> {
    try {
      const { data, error } = await supabase
        .from('deliveries')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', deliveryId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update delivery',
      };
    }
  }

  /**
   * Mark delivery as picked up
   */
  static async markAsPickedUp(deliveryId: string): Promise<ApiResponse<Delivery>> {
    return this.updateDelivery(deliveryId, {
      is_picked_up: true,
      status: 'picked_up' as any,
    });
  }

  /**
   * Mark delivery as completed
   */
  static async markAsCompleted(deliveryId: string): Promise<ApiResponse<Delivery>> {
    return this.updateDelivery(deliveryId, {
      is_completed: true,
      status: 'completed' as any,
    });
  }
}
