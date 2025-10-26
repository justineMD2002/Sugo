import { USER_TYPE } from '@/constants/enums';

/**
 * User-related type definitions
 */

export interface User {
  id: string;
  phone_number: string;
  email: string;
  full_name: string;
  user_type: USER_TYPE;
  avatar_url?: string;
  rating?: number;
  total_ratings?: number;
  total_orders?: number;
  join_date?: string;
  created_at: string;
  updated_at: string;
}

export interface RiderProfile {
  id: string;
  user_id: string;
  service_type: string;
  vehicle_brand?: string;
  vehicle_model?: string;
  vehicle_color?: string;
  plate_number?: string;
  is_available: boolean;
  is_verified: boolean;
  is_online: boolean;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  address_name: string;
  full_address: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface VehicleInfo {
  brand: string;
  model: string;
  color: string;
  plateNumber: string;
}
