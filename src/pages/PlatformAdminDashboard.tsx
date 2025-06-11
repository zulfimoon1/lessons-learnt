
import { useEffect, useState } from "react";
import { usePlatformAdmin } from "@/contexts/PlatformAdminContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import DashboardHeader from "@/components/platform-admin/DashboardHeader";
import SystemInfoCard from "@/components/platform-admin/SystemInfoCard";
import OverviewCards from "@/components/platform-admin/OverviewCards";
import SubscriptionManagement from "@/components/platform-admin/SubscriptionManagement";

interface DashboardData {
  totalSchools: number;
  totalTeachers: number;
  totalStudents: number;
  totalResponses: number;
  subscriptions: any[];
  activeSubscriptions: number;
  monthlyRevenue: number;
  lastUpdated: string;
}

const PlatformAdminDashboard = () => {
  const { admin, isLoading: adminLoading, logout, isAuthenticated } = usePlatformAdmin();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalSchools: 0,
    totalTeachers: 0,
    totalStudents: 0,
    totalResponses: 0,
    subscriptions: [],
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    lastUpdated: new Date().toISOString()
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    if (!admin) {
      console.log('❌ No admin session for data fetch');
      return;
    }

    console.log('📊 Fetching dashboard data for platform admin...');
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔗 Making platform admin database queries...');
      
      // Use service role key queries for platform admin
      const supabaseAdmin = supabase;
      
      // Fetch all data in parallel using raw SQL queries to bypass RLS
      const [studentsResult, teachersResult, feedbackResult, subscriptionsResult] = await Promise.all([
        supabaseAdmin.rpc('get_platform_stats', { stat_type: 'students' }).then(result => result).catch(() => 
          supabaseAdmin.from('students').select('school', { count: 'exact', head: true })
        ),
        supabaseAdmin.rpc('get_platform_stats', { stat_type: 'teachers' }).then(result => result).catch(() => 
          supabaseAdmin.from('teachers').select('*', { count: 'exact', head: true })
        ),
        supabaseAdmin.rpc('get_platform_stats', { stat_type: 'feedback' }).then(result => result).catch(() => 
          supabaseAdmin.from('feedback').select('*', { count: 'exact', head: true })
        ),
        supabaseAdmin.from('subscriptions').select('*')
      ]);

      console.log('📊 Platform admin query results:', {
        students: { count: studentsResult.count, error: studentsResult.error },
        teachers: { count: teachersResult.count, error: teachersResult.error },
        feedback: { count: feedbackResult.count, error: feedbackResult.error },
        subscriptions: { length: subscriptionsResult.data?.length, error: subscriptionsResult.error }
      });

      // Handle errors gracefully
      const totalStudents = studentsResult.count || 0;
      const totalTeachers = teachersResult.count || 0;
      const totalResponses = feedbackResult.count || 0;

      // For schools, we need to query the actual data to get unique schools
      let totalSchools = 0;
      try {
        const [studentsData, teachersData] = await Promise.all([
          supabaseAdmin.from('students').select('school'),
          supabaseAdmin.from('teachers').select('school')
        ]);

        const uniqueSchools = new Set<string>();
        studentsData.data?.forEach(student => {
          if (student.school) uniqueSchools.add(student.school);
        });
        teachersData.data?.forEach(teacher => {
          if (teacher.school) uniqueSchools.add(teacher.school);
        });
        totalSchools = uniqueSchools.size;
      } catch (schoolError) {
        console.warn('⚠️ Could not fetch school data:', schoolError);
        totalSchools = 0;
      }

      // Process subscriptions
      const subscriptions = subscriptionsResult.data || [];
      const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
      const monthlyRevenue = subscriptions
        .filter(s => s.status === 'active')
        .reduce((sum, sub) => sum + (sub.amount / 100), 0);

      const newData: DashboardData = {
        totalSchools,
        totalTeachers,
        totalStudents,
        totalResponses,
        subscriptions,
        activeSubscriptions,
        monthlyRevenue,
        lastUpdated: new Date().toISOString()
      };

      console.log('✅ Platform admin dashboard data processed:', newData);
      setDashboardData(newData);
      
      toast.success(`Platform data updated: ${totalStudents} students, ${totalTeachers} teachers, ${totalSchools} schools`);
      
    } catch (error: any) {
      console.error('❌ Platform admin data fetch failed:', error);
      const errorMessage = error.message || "Failed to fetch platform dashboard data";
      setError(errorMessage);
      toast.error(`Platform admin error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    console.log('🔄 Platform admin manual refresh triggered');
    await fetchDashboardData();
  };

  const handleLogout = () => {
    console.log('🚪 Platform admin logout triggered');
    logout();
  };

  // Initial data fetch when authenticated
  useEffect(() => {
    if (isAuthenticated && admin) {
      console.log('🚀 Platform admin authenticated, fetching data for:', admin.email);
      fetchDashboardData();
    }
  }, [isAuthenticated, admin]);

  // Loading state
  if (adminLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-lg">Loading platform admin session...</div>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated || !admin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">Platform Admin Access Denied</div>
          <p className="text-gray-600">Please log in as a platform administrator</p>
          <a href="/console" className="text-blue-500 hover:text-blue-700 underline mt-4 inline-block">
            Go to Platform Admin Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        adminName={admin.email}
        onRefresh={handleRefresh}
        onLogout={handleLogout}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Status Banner */}
        <div className={`${error ? 'bg-red-100 border-red-500' : 'bg-green-100 border-green-500'} border-2 rounded-xl p-6`}>
          <div className="text-center">
            <h1 className={`text-xl font-bold ${error ? 'text-red-800' : 'text-green-800'}`}>
              {error ? '❌ PLATFORM ADMIN ERROR' : '🔴 LIVE PLATFORM DASHBOARD'} {isLoading ? '(Loading...)' : ''}
            </h1>
            {error ? (
              <div>
                <p className="text-sm mt-2 text-red-700">{error}</p>
                <button 
                  onClick={handleRefresh}
                  className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Retrying...' : 'Retry Platform Data Fetch'}
                </button>
              </div>
            ) : (
              <p className="text-sm mt-2 text-green-700">
                Platform Admin - Last Updated: {new Date(dashboardData.lastUpdated).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Live Counts */}
        <div className="bg-white border-4 border-blue-500 rounded-xl p-6">
          <h2 className="text-xl font-bold text-blue-800 mb-4">🔴 LIVE PLATFORM DATABASE COUNTS</h2>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading fresh platform data...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center bg-blue-50 p-4 rounded">
                <p className="text-sm font-semibold text-gray-600">Schools</p>
                <p className="text-4xl font-bold text-blue-600">{dashboardData.totalSchools}</p>
              </div>
              <div className="text-center bg-green-50 p-4 rounded">
                <p className="text-sm font-semibold text-gray-600">Teachers</p>
                <p className="text-4xl font-bold text-green-600">{dashboardData.totalTeachers}</p>
              </div>
              <div className="text-center bg-purple-50 p-4 rounded">
                <p className="text-sm font-semibold text-gray-600">Students</p>
                <p className="text-4xl font-bold text-purple-600">{dashboardData.totalStudents}</p>
              </div>
              <div className="text-center bg-orange-50 p-4 rounded">
                <p className="text-sm font-semibold text-gray-600">Responses</p>
                <p className="text-4xl font-bold text-orange-600">{dashboardData.totalResponses}</p>
              </div>
            </div>
          )}
        </div>
        
        <SystemInfoCard
          totalSchools={dashboardData.totalSchools}
          totalTeachers={dashboardData.totalTeachers}
          totalStudents={dashboardData.totalStudents}
          totalResponses={dashboardData.totalResponses}
          subscriptionsCount={dashboardData.subscriptions.length}
          activeSubscriptions={dashboardData.activeSubscriptions}
          monthlyRevenue={dashboardData.monthlyRevenue}
        />

        <OverviewCards
          totalSchools={dashboardData.totalSchools}
          totalTeachers={dashboardData.totalTeachers}
          totalStudents={dashboardData.totalStudents}
          totalResponses={dashboardData.totalResponses}
        />

        <SubscriptionManagement
          subscriptions={dashboardData.subscriptions}
        />
      </div>
    </div>
  );
};

export default PlatformAdminDashboard;
