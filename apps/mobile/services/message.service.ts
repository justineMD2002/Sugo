import { supabase } from '@/lib/supabase';
import { Message, CreateMessageInput, ApiResponse } from '@/types';
import { MESSAGE_TYPE } from '@/constants/enums';

/**
 * Message service for managing chat messages
 */

export class MessageService {
  /**
   * Send a message
   */
  static async sendMessage(input: CreateMessageInput): Promise<ApiResponse<Message>> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          ...input,
          message_type: input.message_type || MESSAGE_TYPE.TEXT,
          is_read: false,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Unexpected error sending message:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send message',
      };
    }
  }

  /**
   * Get messages for an order
   */
  static async getMessagesByOrder(orderId: string): Promise<ApiResponse<Message[]>> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch messages',
      };
    }
  }

  /**
   * Mark messages as read
   */
  static async markAsRead(messageIds: string[]): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .in('id', messageIds);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to mark messages as read',
      };
    }
  }

  /**
   * Get unread message count
   */
  static async getUnreadCount(userId: string): Promise<ApiResponse<number>> {
    try {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', userId)
        .eq('is_read', false);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: count || 0 };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get unread count',
      };
    }
  }
}
