import { supabase } from './supabase';

export type NotificationType =
  | 'rider_accepted'
  | 'new_message'
  | 'order_status_changed'
  | 'order_completed'
  | 'order_cancelled';

interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  orderId?: string;
  type?: NotificationType;
}

/**
 * Create a notification in the database
 */
export const createNotification = async ({
  userId,
  title,
  message,
  orderId,
  type,
}: CreateNotificationParams) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([
        {
          user_id: userId,
          title,
          message,
          related_order_id: orderId || null,
          is_read: false,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating notification:', error);
      return null;
    }

    console.log('✅ Notification created:', title);
    return data;
  } catch (error) {
    console.error('❌ Unexpected error creating notification:', error);
    return null;
  }
};

/**
 * Notification: Rider accepted order
 */
export const notifyRiderAccepted = async (
  customerId: string,
  riderName: string,
  orderId: string
) => {
  return createNotification({
    userId: customerId,
    title: 'Rider Accepted!',
    message: `${riderName} has accepted your order and is on the way!`,
    orderId,
    type: 'rider_accepted',
  });
};

/**
 * Notification: New message received
 */
export const notifyNewMessage = async (
  receiverId: string,
  senderName: string,
  messagePreview: string,
  orderId: string
) => {
  // Truncate message if too long
  const preview = messagePreview.length > 50
    ? messagePreview.substring(0, 50) + '...'
    : messagePreview;

  return createNotification({
    userId: receiverId,
    title: `New message from ${senderName}`,
    message: preview,
    orderId,
    type: 'new_message',
  });
};

/**
 * Notification: Order status changed
 */
export const notifyOrderStatusChanged = async (
  userId: string,
  orderId: string,
  oldStatus: string,
  newStatus: string
) => {
  const statusMessages: Record<string, string> = {
    pending: 'Your order is pending',
    confirmed: 'Your order has been confirmed',
    preparing: 'Your order is being prepared',
    picked: 'Your order has been picked up',
    in_transit: 'Your order is in transit',
    delivered: 'Your order has been delivered',
    completed: 'Your order is complete',
    cancelled: 'Your order has been cancelled',
  };

  return createNotification({
    userId,
    title: 'Order Status Updated',
    message: statusMessages[newStatus] || `Order status changed to ${newStatus}`,
    orderId,
    type: 'order_status_changed',
  });
};

/**
 * Notification: Order completed
 */
export const notifyOrderCompleted = async (
  customerId: string,
  orderId: string
) => {
  return createNotification({
    userId: customerId,
    title: 'Order Completed!',
    message: 'Your order has been completed. Thank you for using Sugo!',
    orderId,
    type: 'order_completed',
  });
};

/**
 * Notification: Order cancelled
 */
export const notifyOrderCancelled = async (
  userId: string,
  orderId: string,
  cancelledBy: 'customer' | 'rider'
) => {
  const message = cancelledBy === 'customer'
    ? 'You have cancelled your order'
    : 'Your order has been cancelled by the rider';

  return createNotification({
    userId,
    title: 'Order Cancelled',
    message,
    orderId,
    type: 'order_cancelled',
  });
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('❌ Error marking notification as read:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Unexpected error marking notification as read:', error);
    return false;
  }
};

/**
 * Mark all notifications as read for a user
 */
export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('❌ Error marking all notifications as read:', error);
      return false;
    }

    console.log('✅ All notifications marked as read');
    return true;
  } catch (error) {
    console.error('❌ Unexpected error marking all notifications as read:', error);
    return false;
  }
};

/**
 * Get all notifications for a user
 */
export const getUserNotifications = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50); // Get latest 50 notifications

    if (error) {
      console.error('❌ Error fetching notifications:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('❌ Unexpected error fetching notifications:', error);
    return [];
  }
};

/**
 * Get unread notification count
 */
export const getUnreadNotificationCount = async (userId: string) => {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('❌ Error fetching unread count:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('❌ Unexpected error fetching unread count:', error);
    return 0;
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (notificationId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      console.error('❌ Error deleting notification:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Unexpected error deleting notification:', error);
    return false;
  }
};
