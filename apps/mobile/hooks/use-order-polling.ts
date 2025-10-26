import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Custom hook for polling delivery updates (alternative to real-time subscriptions)
 * Checks database every few seconds for changes when real-time is not available
 */

interface UseOrderPollingProps {
  orderId: string | null;
  userId: string | null;
  userType: 'customer' | 'rider';
  onRiderAccepted: (riderDetails: RiderDetails) => void;
  onDeliveryUpdate: (delivery: any) => void;
  enabled?: boolean;
  pollInterval?: number; // milliseconds, default 3000 (3 seconds)
}

interface RiderDetails {
  id: string;
  full_name: string;
  phone_number: string;
  avatar_url?: string;
  rating?: number;
  vehicle_info?: string;
}

export const useOrderPolling = ({
  orderId,
  userId,
  userType,
  onRiderAccepted,
  onDeliveryUpdate,
  enabled = true,
  pollInterval = 3000, // Poll every 3 seconds
}: UseOrderPollingProps) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastDeliveryStateRef = useRef<any>(null);
  const riderFoundRef = useRef(false);

  // Fetch rider details when a rider accepts
  const fetchRiderDetails = useCallback(async (riderId: string): Promise<RiderDetails | null> => {
    try {
      console.log('🔍 [POLLING] Fetching rider details for:', riderId);

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
        console.error('❌ [POLLING] Error fetching rider details:', error);
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
      console.error('❌ [POLLING] Unexpected error fetching rider details:', error);
      return null;
    }
  }, []);

  // Check for delivery updates
  const checkForUpdates = useCallback(async () => {
    if (!orderId || !enabled) return;

    try {
      console.log('🔄 [POLLING] Checking for delivery updates...', orderId);

      const { data: delivery, error } = await supabase
        .from('deliveries')
        .select('*')
        .eq('order_id', orderId)
        .maybeSingle();

      if (error) {
        console.error('❌ [POLLING] Error checking delivery:', error);
        return;
      }

      // No delivery yet
      if (!delivery) {
        console.log('⏳ [POLLING] No delivery record yet');
        return;
      }

      console.log('📦 [POLLING] Delivery found:', {
        id: delivery.id,
        is_accepted: delivery.is_accepted,
        rider_id: delivery.rider_id,
      });

      // Check if this is a new update (compare with last state)
      const isNewUpdate =
        !lastDeliveryStateRef.current ||
        lastDeliveryStateRef.current.id !== delivery.id ||
        lastDeliveryStateRef.current.is_accepted !== delivery.is_accepted;

      // Update last state
      lastDeliveryStateRef.current = delivery;

      // Always call onDeliveryUpdate
      onDeliveryUpdate(delivery);

      // If rider accepted and we haven't processed this yet
      if (delivery.is_accepted && delivery.rider_id && !riderFoundRef.current) {
        console.log('✅✅✅ [POLLING] RIDER ACCEPTED! ✅✅✅');
        riderFoundRef.current = true; // Prevent duplicate calls

        const riderDetails = await fetchRiderDetails(delivery.rider_id);

        if (riderDetails) {
          console.log('🎉🎉🎉 [POLLING] RIDER DETAILS FETCHED 🎉🎉🎉');
          console.log('Rider Name:', riderDetails.full_name);
          onRiderAccepted(riderDetails);

          // Stop polling once rider is found
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            console.log('⏹️ [POLLING] Stopped polling - rider found');
          }
        }
      }
    } catch (error) {
      console.error('❌ [POLLING] Unexpected error:', error);
    }
  }, [orderId, enabled, onRiderAccepted, onDeliveryUpdate, fetchRiderDetails]);

  useEffect(() => {
    console.log('🔍 [POLLING] Hook initialized:', { enabled, orderId, userId, userType });

    if (!enabled || !orderId || !userId) {
      console.warn('⚠️ [POLLING] Polling disabled or missing params');
      return;
    }

    // Only poll for customers
    if (userType !== 'customer') {
      console.log('🏍️ [POLLING] Not customer, skipping polling');
      return;
    }

    console.log('🚀🚀🚀 [POLLING] STARTING POLLING SYSTEM 🚀🚀🚀');
    console.log(`Polling every ${pollInterval}ms for order:`, orderId);

    // Reset state when order changes
    lastDeliveryStateRef.current = null;
    riderFoundRef.current = false;

    // Initial check
    checkForUpdates();

    // Set up polling interval
    intervalRef.current = setInterval(() => {
      checkForUpdates();
    }, pollInterval);

    // Cleanup
    return () => {
      console.log('🧹 [POLLING] Cleaning up polling interval');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [orderId, userId, userType, enabled, pollInterval, checkForUpdates]);

  // Manual trigger function (for testing)
  const triggerCheck = useCallback(() => {
    console.log('🔄 [POLLING] Manual trigger requested');
    checkForUpdates();
  }, [checkForUpdates]);

  return {
    triggerCheck,
    isPolling: intervalRef.current !== null,
  };
};
