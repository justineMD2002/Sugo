/**
 * Order-related enumerations
 */

export enum ORDER_STATUS {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  PICKED = 'picked',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum PAYMENT_METHOD {
  CASH = 'cash',
  GCASH = 'gcash',
  PAYMAYA = 'paymaya',
  CREDIT_CARD = 'credit_card',
}
