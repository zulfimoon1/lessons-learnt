
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

    console.log('📊 Fetching platform data...');
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch real data from database using RPC functions
      const [studentsRpc, teachersRpc, feedbackRpc, subscriptionsQuery] = await Promise.all([
        supabase.rpc('get_platform_stats', { stat_type: 'students' }),
        supabase.rpc('get_platform_stats', { stat_type: 'teachers' }),
        supabase.rpc('get_platform_stats', { stat_type: 'feedback' }),
        supabase.from('subscriptions').select('*')
      ]);

      console.log('📊 Data received:', {
        students: studentsRpc.data,
        teachers: teachersRpc.data,
        feedback: feedbackRpc.data,
        subscriptions: subscriptionsQuery.data?.length
      });

      // Handle any errors
      if (studentsRpc.error) {
        console.error('Students query error:', studentsRpc.error);
        throw new Error(`Students data error: ${studentsRpc.error.message}`);
      }
      if (teachersRpc.error) {
        console.error('Teachers query error:', teachersRpc.error);
        throw new Error(`Teachers data error: ${teachersRpc.error.message}`);
      }
      if (feedbackRpc.error) {
        console.error('Feedback query error:', feedbackRpc.error);
        throw new Error(`Feedback data error: ${feedbackRpc.error.message}`);
      }
      if (subscriptionsQuery.error) {
        console.error('Subscriptions query error:', subscriptionsQuery.error);
        throw new Error(`Subscriptions data error: ${subscriptionsQuery.error.message}`);
      }

      // Extract actual counts from RPC responses
      const totalStudents = studentsRpc.data?.[0]?.count || 0;
      const totalTeachers = teachersRpc.data?.[0]?.count || 0;
      const totalResponses = feedbackRpc.data?.[0]?.count || 0;
      const subscriptions = subscriptionsQuery.data || [];

      // Calculate unique schools from teachers
      let totalSchools = 0;
      try {
        const { data: schoolData, error: schoolError } = await supabase
          .from('teachers')
          .select('school')
          .not('school', 'is', null);
        
        if (schoolError) {
          console.warn('Could not fetch schools:', schoolError);
          totalSchools = Math.max(1, Math.ceil(Number(totalTeachers) / 5));
        } else if (schoolData) {
          const uniqueSchools = new Set(schoolData.map(t => t.school));
          totalSchools = uniqueSchools.size;
        }
      } catch (error) {
        console.warn('School fetch error:', error);
        totalSchools = Math.max(1, Math.ceil(Number(totalTeachers) / 5));
      }

      const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
      const monthlyRevenue = subscriptions
        .filter(s => s.status === 'active')
        .reduce((sum, sub) => sum + (sub.amount / 100), 0);

      const newData: DashboardData = {
        totalSchools,
        totalTeachers: Number(totalTeachers),
        totalStudents: Number(totalStudents),
        totalResponses: Number(totalResponses),
        subscriptions,
        activeSubscriptions,
        monthlyRevenue,
        lastUpdated: new Date().toISOString()
      };

      console.log('✅ Dashboard data updated:', newData);
      setDashboardData(newData);
      
      toast.success(`Data refreshed! Found ${totalStudents} students, ${totalTeachers} teachers across ${totalSchools} schools`);
      
    } catch (error: any) {
      console.error('❌ Data fetch failed:', error);
      const errorMessage = error.message || "Failed to fetch dashboard data";
      setError(errorMessage);
      toast.error(`Refresh failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    console.log('🔄 Manual refresh button clicked');
    await fetchDashboardData();
  };

  const handleLogout = () => {
    console.log('🚪 Logout triggered');
    logout();
  };

  // Initial data fetch when authenticated
  useEffect(() => {
    if (isAuthenticated && admin) {
      console.log('🚀 Admin authenticated, fetching initial data for:', admin.email);
      fetchDashboardData();
    }
  }, [isAuthenticated, admin]);

  // Loading state
  if (adminLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-lg">Loading admin session...</div>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated || !admin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">Admin Access Denied</div>
          <p className="text-gray-600">Please log in as an administrator</p>
          <a href="/console" className="text-blue-500 hover:text-blue-700 underline mt-4 inline-block">
            Go to Admin Login
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
              {error ? '❌ DASHBOARD ERROR' : '🟢 PLATFORM ADMIN CONSOLE'} {isLoading ? '(Refreshing...)' : ''}
            </h1>
            {error ? (
              <div>
                <p className="text-sm mt-2 text-red-700">{error}</p>
                <button 
                  onClick={handleRefresh}
                  className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Retrying...' : 'Retry'}
                </button>
              </div>
            ) : (
              <p className="text-sm mt-2 text-green-700">
                Last Updated: {new Date(dashboardData.lastUpdated).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Live Stats */}
        <div className="bg-white border-4 border-blue-500 rounded-xl p-6">
          <h2 className="text-xl font-bold text-blue-800 mb-4">📊 LIVE PLATFORM STATISTICS</h2>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Refreshing data...</p>
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
