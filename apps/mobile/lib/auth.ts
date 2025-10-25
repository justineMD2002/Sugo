import { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

export interface SignUpData {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  userType: 'customer' | 'rider';
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export async function signUpUser(signUpData: SignUpData): Promise<AuthResponse> {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: signUpData.email,
      password: signUpData.password,
      phone: signUpData.phoneNumber,
      options: {
        data: {
          full_name: signUpData.fullName,
          phone_number: signUpData.phoneNumber,
          user_type: signUpData.userType,
        }
      }
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: 'Failed to create user account' };
    }

    return { success: true, user: authData.user };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred during signup'
    };
  }
}

export async function signInUser(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const errorMsg = error.message.toLowerCase();
      if (errorMsg.includes('invalid') || errorMsg.includes('credentials') || errorMsg.includes('password')) {
        return { success: false, error: 'Invalid credentials' };
      }
      if (errorMsg.includes('email not confirmed')) {
        return { success: false, error: error.message };
      }
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred during sign in'
    };
  }
}

export async function signInUserWithPhone(phoneNumber: string, password: string): Promise<AuthResponse> {
  try {
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('email')
      .eq('phone_number', phoneNumber)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116' || profileError.message?.includes('0 rows')) {
        return { success: false, error: 'Invalid credentials' };
      }
      return { success: false, error: 'Invalid credentials' };
    }

    if (!userProfile) {
      return { success: false, error: 'Invalid credentials' };
    }

    return await signInUser(userProfile.email, password);
  } catch (error) {
    return {
      success: false,
      error: 'Invalid credentials'
    };
  }
}

export async function signOutUser(): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred during sign out' 
    };
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  user_type: 'customer' | 'rider';
  created_at: string;
  updated_at: string;
}

export interface ProfileResponse {
  success: boolean;
  profile?: UserProfile;
  error?: string;
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

export interface AddressesResponse {
  success: boolean;
  addresses?: Address[];
  error?: string;
}

export async function getUserProfile(userId: string): Promise<ProfileResponse> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: false, error: 'Profile not found' };
      }
      return { success: false, error: error.message };
    }

    return { success: true, profile: data as UserProfile };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred while fetching profile'
    };
  }
}

export async function getUserAddresses(userId: string): Promise<AddressesResponse> {
  try {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, addresses: data as Address[] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred while fetching addresses'
    };
  }
}

export interface CreateAddressData {
  user_id: string;
  address_name: string;
  full_address: string;
  is_default?: boolean;
}

export interface AddressResponse {
  success: boolean;
  address?: Address;
  error?: string;
}

export async function createAddress(addressData: CreateAddressData): Promise<AddressResponse> {
  try {
    const { data, error } = await supabase
      .from('addresses')
      .insert([{
        ...addressData,
        is_default: addressData.is_default || false
      }])
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, address: data as Address };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred while creating address'
    };
  }
}

export interface UpdateAddressData {
  address_name?: string;
  full_address?: string;
  is_default?: boolean;
}

export async function updateAddress(addressId: string, updateData: UpdateAddressData): Promise<AddressResponse> {
  try {
    const { data, error } = await supabase
      .from('addresses')
      .update(updateData)
      .eq('id', addressId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, address: data as Address };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred while updating address'
    };
  }
}

export async function deleteAddress(addressId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', addressId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred while deleting address'
    };
  }
}

export async function setDefaultAddress(userId: string, addressId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error: unsetError } = await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', userId);

    if (unsetError) {
      return { success: false, error: unsetError.message };
    }

    const { error: setError } = await supabase
      .from('addresses')
      .update({ is_default: true })
      .eq('id', addressId);

    if (setError) {
      return { success: false, error: setError.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred while setting default address'
    };
  }
}

export interface UpdateProfileData {
  full_name?: string;
  phone_number?: string;
  email?: string;
}

export async function updateUserProfile(userId: string, updateData: UpdateProfileData): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred while updating profile'
    };
  }
}

export async function changeUserPassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred while changing password'
    };
  }
}