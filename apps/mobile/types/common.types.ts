/**
 * Common type definitions used across the application
 */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  message: string;
  type: ToastType;
  duration?: number;
}
