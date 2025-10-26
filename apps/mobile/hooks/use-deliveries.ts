import { useState, useCallback } from 'react';
import {
  Delivery,
  DeliveryWithOrder,
  CreateDeliveryInput,
  UpdateDeliveryInput,
} from '@/types';
import { DeliveryService } from '@/services';

/**
 * Custom hook for delivery operations
 */

export const useDeliveries = () => {
  const [deliveries, setDeliveries] = useState<DeliveryWithOrder[]>([]);
  const [currentDelivery, setCurrentDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDelivery = useCallback(async (input: CreateDeliveryInput) => {
    setLoading(true);
    setError(null);

    const result = await DeliveryService.createDelivery(input);

    if (result.success && result.data) {
      setCurrentDelivery(result.data);
    } else {
      setError(result.error || 'Failed to create delivery');
    }

    setLoading(false);
    return result;
  }, []);

  const fetchDeliveryByOrder = useCallback(async (orderId: string) => {
    setLoading(true);
    setError(null);

    const result = await DeliveryService.getDeliveryByOrderId(orderId);

    if (result.success && result.data) {
      setCurrentDelivery(result.data);
    } else {
      setError(result.error || 'Failed to fetch delivery');
    }

    setLoading(false);
    return result;
  }, []);

  const fetchDeliveriesByRider = useCallback(async (riderId: string) => {
    setLoading(true);
    setError(null);

    const result = await DeliveryService.getDeliveriesByRider(riderId);

    if (result.success && result.data) {
      setDeliveries(result.data);
    } else {
      setError(result.error || 'Failed to fetch deliveries');
    }

    setLoading(false);
    return result;
  }, []);

  const updateDelivery = useCallback(
    async (deliveryId: string, updates: UpdateDeliveryInput) => {
      setLoading(true);
      setError(null);

      const result = await DeliveryService.updateDelivery(deliveryId, updates);

      if (result.success && result.data) {
        setCurrentDelivery(result.data);
        setDeliveries((prev) =>
          prev.map((delivery) =>
            delivery.id === deliveryId
              ? { ...delivery, ...result.data! }
              : delivery
          )
        );
      } else {
        setError(result.error || 'Failed to update delivery');
      }

      setLoading(false);
      return result;
    },
    []
  );

  const markAsPickedUp = useCallback(async (deliveryId: string) => {
    return updateDelivery(deliveryId, {
      is_picked_up: true,
      status: 'picked_up' as any,
    });
  }, [updateDelivery]);

  const markAsCompleted = useCallback(async (deliveryId: string) => {
    return updateDelivery(deliveryId, {
      is_completed: true,
      status: 'completed' as any,
    });
  }, [updateDelivery]);

  return {
    deliveries,
    currentDelivery,
    loading,
    error,
    createDelivery,
    fetchDeliveryByOrder,
    fetchDeliveriesByRider,
    updateDelivery,
    markAsPickedUp,
    markAsCompleted,
    setCurrentDelivery,
  };
};
