import { supabase } from '@/lib/supabase';
import { ApiResponse } from '@/types';

export interface EarningsSummary {
  totalEarningsToday: number;
  totalEarningsYesterday: number;
  totalEarningsThisWeek: number;
  totalEarningsThisMonth: number;
  totalDeliveriesToday: number;
  totalDeliveriesYesterday: number;
}

export interface DailyEarnings {
  date: string;
  displayDate: string;
  deliveries: number;
  amount: number;
}

export interface RiderStats {
  totalDeliveries: number;
  completedDeliveries: number;
  cancelledDeliveries: number;
  successRate: number;
  averageRating: number;
  totalEarnings: number;
}

/**
 * Earnings service for managing rider earnings operations
 */
export class EarningsService {
  /**
   * Get earnings summary for a rider
   */
  static async getEarningsSummary(riderId: string): Promise<ApiResponse<EarningsSummary>> {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - 7);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // Get today's earnings
      const { data: todayData, error: todayError } = await supabase
        .from('deliveries')
        .select('earnings')
        .eq('rider_id', riderId)
        .gte('created_at', today.toISOString())
        .in('status', ['completed']);

      if (todayError) throw todayError;

      // Get yesterday's earnings
      const { data: yesterdayData, error: yesterdayError } = await supabase
        .from('deliveries')
        .select('earnings')
        .eq('rider_id', riderId)
        .gte('created_at', yesterday.toISOString())
        .lt('created_at', today.toISOString())
        .in('status', ['completed']);

      if (yesterdayError) throw yesterdayError;

      // Get this week's earnings
      const { data: weekData, error: weekError } = await supabase
        .from('deliveries')
        .select('earnings')
        .eq('rider_id', riderId)
        .gte('created_at', weekStart.toISOString())
        .in('status', ['completed']);

      if (weekError) throw weekError;

      // Get this month's earnings
      const { data: monthData, error: monthError } = await supabase
        .from('deliveries')
        .select('earnings')
        .eq('rider_id', riderId)
        .gte('created_at', monthStart.toISOString())
        .in('status', ['completed']);

      if (monthError) throw monthError;

      const summary: EarningsSummary = {
        totalEarningsToday: todayData?.reduce((sum, d) => sum + (d.earnings || 0), 0) || 0,
        totalEarningsYesterday: yesterdayData?.reduce((sum, d) => sum + (d.earnings || 0), 0) || 0,
        totalEarningsThisWeek: weekData?.reduce((sum, d) => sum + (d.earnings || 0), 0) || 0,
        totalEarningsThisMonth: monthData?.reduce((sum, d) => sum + (d.earnings || 0), 0) || 0,
        totalDeliveriesToday: todayData?.length || 0,
        totalDeliveriesYesterday: yesterdayData?.length || 0,
      };

      return { success: true, data: summary };
    } catch (error) {
      console.error('Error fetching earnings summary:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch earnings summary',
      };
    }
  }

  /**
   * Get daily earnings breakdown for a rider
   */
  static async getDailyEarnings(riderId: string, days: number = 7): Promise<ApiResponse<DailyEarnings[]>> {
    try {
      const now = new Date();
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);

      // Fetch all completed deliveries for the period
      const { data, error } = await supabase
        .from('deliveries')
        .select('earnings, created_at')
        .eq('rider_id', riderId)
        .gte('created_at', startDate.toISOString())
        .in('status', ['completed'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by date
      const dailyMap = new Map<string, { deliveries: number; amount: number }>();

      data?.forEach(delivery => {
        const date = new Date(delivery.created_at);
        const dateKey = date.toISOString().split('T')[0];
        
        if (!dailyMap.has(dateKey)) {
          dailyMap.set(dateKey, { deliveries: 0, amount: 0 });
        }
        
        const entry = dailyMap.get(dateKey)!;
        entry.deliveries += 1;
        entry.amount += delivery.earnings || 0;
      });

      // Convert to array and format
      const dailyEarnings: DailyEarnings[] = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        
        const entry = dailyMap.get(dateKey) || { deliveries: 0, amount: 0 };
        
        let displayDate: string;
        if (i === 0) {
          displayDate = 'Today';
        } else if (i === 1) {
          displayDate = 'Yesterday';
        } else {
          displayDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }

        dailyEarnings.push({
          date: dateKey,
          displayDate,
          deliveries: entry.deliveries,
          amount: entry.amount,
        });
      }

      return { success: true, data: dailyEarnings };
    } catch (error) {
      console.error('Error fetching daily earnings:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch daily earnings',
      };
    }
  }

  /**
   * Get total lifetime earnings for a rider
   */
  static async getTotalEarnings(riderId: string): Promise<ApiResponse<number>> {
    try {
      const { data, error } = await supabase
        .from('deliveries')
        .select('earnings')
        .eq('rider_id', riderId)
        .in('status', ['completed']);

      if (error) throw error;

      const total = data?.reduce((sum, d) => sum + (d.earnings || 0), 0) || 0;

      return { success: true, data: total };
    } catch (error) {
      console.error('Error fetching total earnings:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch total earnings',
      };
    }
  }

  /**
   * Get comprehensive rider statistics
   */
  static async getRiderStats(riderId: string): Promise<ApiResponse<RiderStats>> {
    try {
      // Get all deliveries for the rider
      const { data: deliveries, error: deliveriesError } = await supabase
        .from('deliveries')
        .select('status, earnings')
        .eq('rider_id', riderId);

      if (deliveriesError) throw deliveriesError;

      // Get rider rating from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('rating, total_orders')
        .eq('id', riderId)
        .single();

      if (userError) throw userError;

      // Calculate statistics
      const totalDeliveries = deliveries?.length || 0;
      const completedDeliveries = deliveries?.filter(d => d.status === 'completed').length || 0;
      const cancelledDeliveries = deliveries?.filter(d => d.status === 'cancelled').length || 0;
      const successRate = totalDeliveries > 0 ? (completedDeliveries / totalDeliveries) * 100 : 0;
      const totalEarnings = deliveries?.filter(d => d.status === 'completed')
        .reduce((sum, d) => sum + (d.earnings || 0), 0) || 0;

      const stats: RiderStats = {
        totalDeliveries: userData?.total_orders || totalDeliveries,
        completedDeliveries,
        cancelledDeliveries,
        successRate,
        averageRating: userData?.rating || 0,
        totalEarnings,
      };

      return { success: true, data: stats };
    } catch (error) {
      console.error('Error fetching rider stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch rider stats',
      };
    }
  }
}
