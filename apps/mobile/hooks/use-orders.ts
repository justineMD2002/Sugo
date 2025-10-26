import { useState, useCallback } from 'react';
import { Order, CreateOrderInput, UpdateOrderInput } from '@/types';
import { OrderService } from '@/services';

/**
 * Custom hook for order operations
 */

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrder = useCallback(async (input: CreateOrderInput) => {
    setLoading(true);
    setError(null);

    const result = await OrderService.createOrder(input);

    if (result.success && result.data) {
      setCurrentOrder(result.data);
      setOrders((prev) => [result.data!, ...prev]);
    } else {
      setError(result.error || 'Failed to create order');
    }

    setLoading(false);
    return result;
  }, []);

  const fetchOrderById = useCallback(async (orderId: string) => {
    setLoading(true);
    setError(null);

    const result = await OrderService.getOrderById(orderId);

    if (result.success && result.data) {
      setCurrentOrder(result.data);
    } else {
      setError(result.error || 'Failed to fetch order');
    }

    setLoading(false);
    return result;
  }, []);

  const fetchOrdersByCustomer = useCallback(async (customerId: string) => {
    setLoading(true);
    setError(null);

    const result = await OrderService.getOrdersByCustomer(customerId);

    if (result.success && result.data) {
      setOrders(result.data);
    } else {
      setError(result.error || 'Failed to fetch orders');
    }

    setLoading(false);
    return result;
  }, []);

  const fetchPendingOrders = useCallback(async (serviceType: string) => {
    setLoading(true);
    setError(null);

    const result = await OrderService.getPendingOrdersByService(serviceType);

    if (result.success && result.data) {
      setOrders(result.data);
    } else {
      setError(result.error || 'Failed to fetch pending orders');
    }

    setLoading(false);
    return result;
  }, []);

  const updateOrder = useCallback(
    async (orderId: string, updates: UpdateOrderInput) => {
      setLoading(true);
      setError(null);

      const result = await OrderService.updateOrder(orderId, updates);

      if (result.success && result.data) {
        setCurrentOrder(result.data);
        setOrders((prev) =>
          prev.map((order) => (order.id === orderId ? result.data! : order))
        );
      } else {
        setError(result.error || 'Failed to update order');
      }

      setLoading(false);
      return result;
    },
    []
  );

  const cancelOrder = useCallback(async (orderId: string) => {
    setLoading(true);
    setError(null);

    const result = await OrderService.cancelOrder(orderId);

    if (result.success) {
      setCurrentOrder(null);
      setOrders((prev) => prev.filter((order) => order.id !== orderId));
    } else {
      setError(result.error || 'Failed to cancel order');
    }

    setLoading(false);
    return result;
  }, []);

  const clearCurrentOrder = useCallback(() => {
    setCurrentOrder(null);
  }, []);

  return {
    orders,
    currentOrder,
    loading,
    error,
    createOrder,
    fetchOrderById,
    fetchOrdersByCustomer,
    fetchPendingOrders,
    updateOrder,
    cancelOrder,
    clearCurrentOrder,
    setCurrentOrder,
  };
};
