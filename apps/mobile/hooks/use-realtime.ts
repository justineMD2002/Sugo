import { useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Custom hook for Supabase real-time subscriptions
 */

export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

export interface RealtimeSubscription {
  table: string;
  event: RealtimeEvent;
  filter?: string;
  callback: (payload: any) => void;
}

export const useRealtime = (subscriptions: RealtimeSubscription[]) => {
  useEffect(() => {
    const channels: RealtimeChannel[] = [];

    subscriptions.forEach((sub) => {
      const channel = supabase
        .channel(`${sub.table}-${Date.now()}`)
        .on(
          'postgres_changes',
          {
            event: sub.event,
            schema: 'public',
            table: sub.table,
            filter: sub.filter,
          },
          (payload) => {
            console.log(`Real-time event on ${sub.table}:`, payload);
            sub.callback(payload);
          }
        )
        .subscribe();

      channels.push(channel);
    });

    return () => {
      channels.forEach((channel) => {
        supabase.removeChannel(channel);
      });
    };
  }, [subscriptions]);
};

/**
 * Hook for subscribing to order updates
 */
export const useOrderRealtime = (
  orderId: string,
  onUpdate: (order: any) => void
) => {
  useEffect(() => {
    if (!orderId) return;

    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          console.log('Order updated:', payload);
          onUpdate(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, onUpdate]);
};

/**
 * Hook for subscribing to delivery updates
 */
export const useDeliveryRealtime = (
  orderId: string,
  onUpdate: (delivery: any) => void
) => {
  useEffect(() => {
    if (!orderId) return;

    const channel = supabase
      .channel(`delivery-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'deliveries',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          console.log('Delivery event:', payload);
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            onUpdate(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, onUpdate]);
};

/**
 * Hook for subscribing to new messages
 */
export const useMessageRealtime = (
  orderId: string,
  onNewMessage: (message: any) => void
) => {
  useEffect(() => {
    if (!orderId) return;

    const channel = supabase
      .channel(`messages-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          console.log('New message:', payload);
          onNewMessage(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, onNewMessage]);
};

/**
 * Hook for subscribing to notifications
 */
export const useNotificationRealtime = (
  userId: string,
  onNewNotification: (notification: any) => void
) => {
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('New notification:', payload);
          onNewNotification(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, onNewNotification]);
};
