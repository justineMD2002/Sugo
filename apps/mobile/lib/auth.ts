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

/**
 * Signs up a new user with email and creates a corresponding profile in the users table
 * @param signUpData User registration data
 * @returns Promise with authentication result
 */
export async function signUpUser(signUpData: SignUpData): Promise<AuthResponse> {
  try {
    // Create user in auth.users with email and password
    // The database trigger will automatically create the user profile
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

    // User profile is created automatically by the database trigger
    return { success: true, user: authData.user };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred during signup'
    };
  }
}

/**
 * Signs in a user with email and password
 * @param email User email
 * @param password User password
 * @returns Promise with authentication result
 */
export async function signInUser(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Check for common authentication error messages and return a user-friendly message
      const errorMsg = error.message.toLowerCase();
      if (errorMsg.includes('invalid') || errorMsg.includes('credentials') || errorMsg.includes('password')) {
        return { success: false, error: 'Invalid credentials' };
      }
      // Keep email confirmation error as-is for specific handling
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

/**
 * Signs in a user with phone number and password
 * @param phoneNumber User phone number
 * @param password User password
 * @returns Promise with authentication result
 */
export async function signInUserWithPhone(phoneNumber: string, password: string): Promise<AuthResponse> {
  try {
    // First, find the user by phone number
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('email')
      .eq('phone_number', phoneNumber)
      .single();

    // Check for specific Supabase error codes
    if (profileError) {
      // PGRST116 means 0 rows returned (user not found)
      if (profileError.code === 'PGRST116' || profileError.message?.includes('0 rows')) {
        return { success: false, error: 'Invalid credentials' };
      }
      // Any other database error
      return { success: false, error: 'Invalid credentials' };
    }

    if (!userProfile) {
      return { success: false, error: 'Invalid credentials' };
    }

    // Now sign in with the email and password
    return await signInUser(userProfile.email, password);
  } catch (error) {
    return {
      success: false,
      error: 'Invalid credentials'
    };
  }
}

/**
 * Signs out the current user
 * @returns Promise with sign out result
 */
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

/**
 * Gets the current authenticated user
 * @returns Promise with current user or null
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}