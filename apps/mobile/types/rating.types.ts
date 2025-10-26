/**
 * Rating-related type definitions
 */

export interface Rating {
  id: string;
  order_id: string;
  rater_id: string;
  rated_user_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface CreateRatingInput {
  order_id: string;
  rater_id: string;
  rated_user_id: string;
  rating: number;
  comment?: string;
}
