import { supabase } from '@/lib/supabase';
import { Rating, CreateRatingInput, ApiResponse } from '@/types';

/**
 * Rating service for managing user ratings
 */

export class RatingService {
  /**
   * Create a new rating
   */
  static async createRating(input: CreateRatingInput): Promise<ApiResponse<Rating>> {
    try {
      const { data, error } = await supabase
        .from('ratings')
        .insert([input])
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Update user's average rating
      await this.updateUserRating(input.rated_user_id);

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create rating',
      };
    }
  }

  /**
   * Get ratings for a user
   */
  static async getRatingsByUser(userId: string): Promise<ApiResponse<Rating[]>> {
    try {
      const { data, error } = await supabase
        .from('ratings')
        .select('*')
        .eq('rated_user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch ratings',
      };
    }
  }

  /**
   * Get rating for a specific order
   */
  static async getRatingByOrder(orderId: string): Promise<ApiResponse<Rating>> {
    try {
      const { data, error } = await supabase
        .from('ratings')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { success: true, data: null as any };
        }
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch rating',
      };
    }
  }

  /**
   * Update user's average rating
   */
  private static async updateUserRating(userId: string): Promise<void> {
    try {
      // Get all ratings for this user
      const { data: ratings } = await supabase
        .from('ratings')
        .select('rating')
        .eq('rated_user_id', userId);

      if (!ratings || ratings.length === 0) return;

      // Calculate average
      const totalRating = ratings.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = totalRating / ratings.length;

      // Update user profile
      await supabase
        .from('users')
        .update({
          rating: averageRating,
          total_ratings: ratings.length,
        })
        .eq('id', userId);
    } catch (error) {
      console.error('Error updating user rating:', error);
    }
  }
}
