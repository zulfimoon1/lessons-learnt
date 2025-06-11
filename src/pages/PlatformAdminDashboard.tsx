
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
  const { admin, isLoading: adminLoading, logout } = usePlatformAdmin();
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

  const fetchRealData = async () => {
    console.log("🔄 Fetching REAL data from database...");
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch real data with simplified queries
      const [studentsResult, teachersResult, feedbackResult, subscriptionsResult] = await Promise.allSettled([
        supabase.from('students').select('school', { count: 'exact' }),
        supabase.from('teachers').select('*', { count: 'exact' }),
        supabase.from('feedback').select('*', { count: 'exact' }),
        supabase.from('subscriptions').select('*')
      ]);

      console.log('📊 Database query results:', {
        students: studentsResult,
        teachers: teachersResult,
        feedback: feedbackResult,
        subscriptions: subscriptionsResult
      });

      let totalStudents = 0;
      let totalTeachers = 0;
      let totalResponses = 0;
      let totalSchools = 0;
      let subscriptions: any[] = [];
      let activeSubscriptions = 0;
      let monthlyRevenue = 0;

      // Process results
      if (studentsResult.status === 'fulfilled' && !studentsResult.value.error) {
        const { data: studentsData, count } = studentsResult.value;
        totalStudents = count || 0;
        if (studentsData) {
          const uniqueSchools = new Set(studentsData.map(s => s.school).filter(Boolean));
          totalSchools = uniqueSchools.size;
        }
      }

      if (teachersResult.status === 'fulfilled' && !teachersResult.value.error) {
        totalTeachers = teachersResult.value.count || 0;
      }

      if (feedbackResult.status === 'fulfilled' && !feedbackResult.value.error) {
        totalResponses = feedbackResult.value.count || 0;
      }

      if (subscriptionsResult.status === 'fulfilled' && !subscriptionsResult.value.error) {
        subscriptions = subscriptionsResult.value.data || [];
        activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
        monthlyRevenue = subscriptions
          .filter(s => s.status === 'active')
          .reduce((sum, sub) => sum + (sub.amount / 100), 0);
      }

      const result = {
        totalSchools,
        totalTeachers,
        totalStudents,
        totalResponses,
        subscriptions,
        activeSubscriptions,
        monthlyRevenue,
        lastUpdated: new Date().toISOString()
      };

      console.log("✅ Real data fetched successfully:", result);
      setDashboardData(result);
      return result;

    } catch (error: any) {
      console.error("❌ Error fetching real data:", error);
      setError(error.message || "Failed to fetch data");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    console.log('🔄 Manual refresh triggered');
    toast.info("Refreshing dashboard data...");
    
    try {
      await fetchRealData();
      toast.success("Dashboard data refreshed successfully!");
    } catch (error: any) {
      console.error("❌ Refresh failed:", error);
      toast.error(`Refresh failed: ${error.message || "Unknown error"}`);
    }
  };

  const handleLogout = () => {
    console.log('🚪 Logout triggered');
    logout();
  };

  // Load data when admin is available
  useEffect(() => {
    if (!adminLoading && admin) {
      console.log('📊 Admin authenticated, loading real data...');
      fetchRealData().catch((error: any) => {
        console.error("❌ Initial load failed:", error);
        toast.error(`Failed to load data: ${error.message || "Unknown error"}`);
      });
    }
  }, [admin, adminLoading]);

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

  if (!admin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">Access Denied</div>
          <p className="text-gray-600">Please log in as a platform administrator</p>
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
              {error ? '❌ ERROR' : '✅ LIVE DASHBOARD'} {isLoading ? '(Loading...)' : ''}
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

        {/* Real Data Display */}
        <div className="bg-white border-2 border-gray-300 rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📊 REAL DATABASE COUNTS</h2>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading real data...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-600">Schools</p>
                <p className="text-3xl font-bold text-blue-600">{dashboardData.totalSchools}</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-600">Teachers</p>
                <p className="text-3xl font-bold text-green-600">{dashboardData.totalTeachers}</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-600">Students</p>
                <p className="text-3xl font-bold text-purple-600">{dashboardData.totalStudents}</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-600">Responses</p>
                <p className="text-3xl font-bold text-orange-600">{dashboardData.totalResponses}</p>
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
