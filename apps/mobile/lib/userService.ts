import { supabase } from './supabase';

export interface UserProfile {
  id: string;
  phone_number: string;
  email: string;
  full_name: string;
  user_type: 'customer' | 'rider';
  avatar_url?: string;
  rating?: number;
  total_ratings?: number;
  total_orders?: number;
  join_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Fetches a user profile by ID
 * @param userId The user ID to fetch
 * @returns Promise with user profile or error
 */
export async function getUserProfile(userId: string): Promise<ServiceResponse<UserProfile>> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch user profile' 
    };
  }
}

/**
 * Updates a user profile
 * @param userId The user ID to update
 * @param updates The fields to update
 * @returns Promise with updated profile or error
 */
export async function updateUserProfile(
  userId: string, 
  updates: Partial<UserProfile>
): Promise<ServiceResponse<UserProfile>> {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update user profile' 
    };
  }
}

/**
 * Updates user avatar URL
 * @param userId The user ID to update
 * @param avatarUrl The new avatar URL
 * @returns Promise with updated profile or error
 */
export async function updateUserAvatar(
  userId: string, 
  avatarUrl: string
): Promise<ServiceResponse<UserProfile>> {
  return updateUserProfile(userId, { avatar_url: avatarUrl });
}

/**
 * Updates user rating
 * @param userId The user ID to update
 * @param newRating The new rating value
 * @param incrementTotal Whether to increment total_ratings count
 * @returns Promise with updated profile or error
 */
export async function updateUserRating(
  userId: string, 
  newRating: number, 
  incrementTotal: boolean = true
): Promise<ServiceResponse<UserProfile>> {
  try {
    // First get current user data
    const { data: currentUser, error: fetchError } = await getUserProfile(userId);
    
    if (fetchError || !currentUser) {
      return { success: false, error: fetchError || 'User not found' };
    }

    // Calculate new average rating
    const totalRatings = incrementTotal 
      ? (currentUser.total_ratings || 0) + 1 
      : (currentUser.total_ratings || 0);
    
    const currentRatingTotal = (currentUser.rating || 0) * (currentUser.total_ratings || 0);
    const newAverageRating = (currentRatingTotal + newRating) / totalRatings;

    // Update with new rating
    return updateUserProfile(userId, {
      rating: newAverageRating,
      total_ratings: totalRatings,
    });
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update user rating' 
    };
  }
}

/**
 * Increments user's total orders count
 * @param userId The user ID to update
 * @returns Promise with updated profile or error
 */
export async function incrementUserOrders(userId: string): Promise<ServiceResponse<UserProfile>> {
  try {
    // First get current user data
    const { data: currentUser, error: fetchError } = await getUserProfile(userId);
    
    if (fetchError || !currentUser) {
      return { success: false, error: fetchError || 'User not found' };
    }

    // Update with incremented orders
    return updateUserProfile(userId, {
      total_orders: (currentUser.total_orders || 0) + 1,
    });
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to increment user orders' 
    };
  }
}

/**
 * Searches for users by phone number or email
 * @param query The search query (phone or email)
 * @returns Promise with matching users or error
 */
export async function searchUsers(query: string): Promise<ServiceResponse<UserProfile[]>> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`phone_number.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(10);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to search users' 
    };
  }
}

/**
 * Deletes a user profile (for admin use)
 * @param userId The user ID to delete
 * @returns Promise with deletion result or error
 */
export async function deleteUserProfile(userId: string): Promise<ServiceResponse<void>> {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete user profile' 
    };
  }
}