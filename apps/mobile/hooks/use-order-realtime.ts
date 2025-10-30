import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Custom hook for handling real-time order and delivery updates
 * Specifically handles the flow when a rider accepts an order
 */

interface UseOrderRealtimeProps {
  orderId: string | null;
  userId: string | null;
  userType: 'customer' | 'rider';
  onRiderAccepted: (riderDetails: RiderDetails) => void;
  onDeliveryUpdate: (delivery: any) => void;
  onOrderUpdate: (order: any) => void;
  onOrderCompleted?: (order: any) => void;
  enabled?: boolean;
}

interface RiderDetails {
  id: string;
  full_name: string;
  phone_number: string;
  avatar_url?: string;
  rating?: number;
  vehicle_info?: string;
}

export const useOrderRealtime = ({
  orderId,
  userId,
  userType,
  onRiderAccepted,
  onDeliveryUpdate,
  onOrderUpdate,
  onOrderCompleted,
  enabled = true,
}: UseOrderRealtimeProps) => {
  const channelsRef = useRef<RealtimeChannel[]>([]);

  // Fetch rider details when a rider accepts
  const fetchRiderDetails = useCallback(async (riderId: string): Promise<RiderDetails | null> => {
    try {
      console.log('🔍 Fetching rider details for:', riderId);

      const { data: riderData, error } = await supabase
        .from('users')
        .select(`
          id,
          full_name,
          phone_number,
          avatar_url,
          rating,
          rider_profiles (
            vehicle_brand,
            vehicle_model,
            vehicle_color,
            plate_number
          )
        `)
        .eq('id', riderId)
        .single();

      if (error || !riderData) {
        console.error('❌ Error fetching rider details:', error);
        return null;
      }

      const riderProfile = riderData.rider_profiles?.[0];
      const vehicleInfo = riderProfile
        ? `${riderProfile.vehicle_brand} ${riderProfile.vehicle_model} - ${riderProfile.plate_number}`
        : 'N/A';

      return {
        id: riderData.id,
        full_name: riderData.full_name,
        phone_number: riderData.phone_number,
        avatar_url: riderData.avatar_url,
        rating: riderData.rating,
        vehicle_info: vehicleInfo,
      };
    } catch (error) {
      console.error('❌ Unexpected error fetching rider details:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    console.log('🔍 useOrderRealtime - Checking params:', { enabled, orderId, userId, userType });

    if (!enabled || !orderId || !userId) {
      console.warn('⚠️ Real-time subscription skipped:', { enabled, orderId, userId });
      return;
    }

    console.log('🚀🚀🚀 SETTING UP REAL-TIME SUBSCRIPTIONS 🚀🚀🚀');
    console.log('Order ID:', orderId);
    console.log('User ID:', userId);
    console.log('User Type:', userType);

    // Cleanup function
    const cleanup = () => {
      channelsRef.current.forEach((channel) => {
        supabase.removeChannel(channel);
      });
      channelsRef.current = [];
    };

    // Clean up existing channels
    cleanup();

    // 1. Subscribe to delivery updates (most important for customer)
    if (userType === 'customer') {
      console.log('💼 CUSTOMER MODE - Setting up delivery subscription');

      const deliveryChannel = supabase
        .channel(`deliveries-${orderId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'deliveries',
            filter: `order_id=eq.${orderId}`,
          },
          async (payload) => {
            console.log('🔥🔥🔥 DELIVERY EVENT RECEIVED 🔥🔥🔥');
            console.log('Event Type:', payload.eventType);
            console.log('Payload:', JSON.stringify(payload, null, 2));

            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              const delivery = payload.new as any;

              console.log('📦 Delivery data:', delivery);
              console.log('Is Accepted:', delivery.is_accepted);
              console.log('Rider ID:', delivery.rider_id);

              // Update delivery state
              onDeliveryUpdate(delivery);

              // If rider just accepted (is_accepted changed to true)
              if (delivery.is_accepted && delivery.rider_id) {
                console.log('✅✅✅ RIDER ACCEPTED! ✅✅✅');
                console.log('Fetching rider details for:', delivery.rider_id);

                const riderDetails = await fetchRiderDetails(delivery.rider_id);

                if (riderDetails) {
                  console.log('🎉🎉🎉 RIDER DETAILS FETCHED 🎉🎉🎉');
                  console.log('Rider Name:', riderDetails.full_name);
                  console.log('Calling onRiderAccepted callback...');
                  onRiderAccepted(riderDetails);
                } else {
                  console.error('❌ Failed to fetch rider details');
                }
              } else {
                console.log('⏳ Delivery not yet accepted or no rider assigned');
              }
            }
          }
        )
        .subscribe((status) => {
          console.log('📡📡📡 DELIVERY CHANNEL STATUS:', status);
          if (status === 'SUBSCRIBED') {
            console.log('✅✅✅ DELIVERY CHANNEL SUCCESSFULLY SUBSCRIBED ✅✅✅');
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌❌❌ DELIVERY CHANNEL ERROR ❌❌❌');
          }
        });

      channelsRef.current.push(deliveryChannel);
    }

    // 2. Subscribe to order updates
    const orderChannel = supabase
      .channel(`orders-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          console.log('📦 Order updated:', payload.new);
          const order = payload.new as any;
          onOrderUpdate(order);

          // If order is marked as completed, trigger the completion callback
          if (order.status === 'completed' && onOrderCompleted) {
            console.log('✅✅✅ ORDER COMPLETED! ✅✅✅');
            console.log('Triggering onOrderCompleted callback...');
            onOrderCompleted(order);
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Order channel status:', status);
      });

    channelsRef.current.push(orderChannel);

    // Cleanup on unmount
    return cleanup;
  }, [
    orderId,
    userId,
    userType,
    enabled,
    fetchRiderDetails,
    onRiderAccepted,
    onDeliveryUpdate,
    onOrderUpdate,
    onOrderCompleted,
  ]);

  return {
    cleanup: () => {
      channelsRef.current.forEach((channel) => {
        supabase.removeChannel(channel);
      });
      channelsRef.current = [];
    },
  };
};
