/**
 * Notification-related type definitions
 */

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  related_order_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface CreateNotificationInput {
  user_id: string;
  title: string;
  message: string;
  related_order_id?: string;
}
