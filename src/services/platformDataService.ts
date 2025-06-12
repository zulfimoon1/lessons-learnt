
import { supabase } from '@/integrations/supabase/client';

export interface PlatformStats {
  totalStudents: number;
  totalTeachers: number;
  totalSchools: number;
  totalResponses: number;
  subscriptions: any[];
  activeSubscriptions: number;
  monthlyRevenue: number;
}

class PlatformDataService {
  async fetchRealPlatformData(): Promise<PlatformStats> {
    console.log('📊 PlatformDataService: Fetching real data from database...');
    
    try {
      // Get counts directly from tables
      const [studentsCount, teachersCount, feedbackCount, subscriptionsData] = await Promise.all([
        supabase.from('students').select('*', { count: 'exact', head: true }),
        supabase.from('teachers').select('*', { count: 'exact', head: true }),
        supabase.from('feedback').select('*', { count: 'exact', head: true }),
        supabase.from('subscriptions').select('*')
      ]);

      console.log('Raw database counts:', {
        students: studentsCount,
        teachers: teachersCount,
        feedback: feedbackCount,
        subscriptions: subscriptionsData
      });

      if (studentsCount.error) throw studentsCount.error;
      if (teachersCount.error) throw teachersCount.error;
      if (feedbackCount.error) throw feedbackCount.error;
      if (subscriptionsData.error) throw subscriptionsData.error;

      // Get unique schools count
      const { data: teachersData, error: teachersError } = await supabase
        .from('teachers')
        .select('school');

      if (teachersError) throw teachersError;

      const uniqueSchools = new Set(teachersData?.map(t => t.school).filter(Boolean));
      const totalSchools = uniqueSchools.size || 0;

      // Process subscriptions
      const subscriptions = subscriptionsData.data || [];
      const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
      const monthlyRevenue = subscriptions
        .filter(s => s.status === 'active')
        .reduce((sum, sub) => sum + (sub.amount / 100), 0);

      const stats: PlatformStats = {
        totalStudents: studentsCount.count || 0,
        totalTeachers: teachersCount.count || 0,
        totalSchools,
        totalResponses: feedbackCount.count || 0,
        subscriptions,
        activeSubscriptions,
        monthlyRevenue
      };

      console.log('✅ Real platform data fetched:', stats);
      return stats;

    } catch (error) {
      console.error('❌ Failed to fetch platform data:', error);
      throw error;
    }
  }
}

export const platformDataService = new PlatformDataService();
