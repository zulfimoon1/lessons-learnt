
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    if (!admin) {
      console.log('❌ No admin session found');
      setError("No admin session found");
      return;
    }

    console.log("📊 Fetching dashboard data for admin:", admin.email);
    setError(null);
    
    try {
      // Use Promise.allSettled to handle partial failures gracefully
      const [studentsResult, teachersResult, feedbackResult, subscriptionsResult] = await Promise.allSettled([
        supabase.from('students').select('school', { count: 'exact' }),
        supabase.from('teachers').select('*', { count: 'exact' }),
        supabase.from('feedback').select('*', { count: 'exact' }),
        supabase.from('subscriptions').select('*')
      ]);

      console.log('📊 Query results:', {
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

      // Handle students
      if (studentsResult.status === 'fulfilled' && !studentsResult.value.error) {
        const { data: studentsData, count } = studentsResult.value;
        totalStudents = count || 0;
        if (studentsData) {
          const uniqueSchools = new Set(studentsData.map(s => s.school).filter(Boolean));
          totalSchools = uniqueSchools.size;
        }
        console.log('✅ Students processed:', totalStudents, 'Schools:', totalSchools);
      } else {
        console.warn('⚠️ Students query failed:', studentsResult);
      }

      // Handle teachers
      if (teachersResult.status === 'fulfilled' && !teachersResult.value.error) {
        totalTeachers = teachersResult.value.count || 0;
        console.log('✅ Teachers processed:', totalTeachers);
      } else {
        console.warn('⚠️ Teachers query failed:', teachersResult);
      }

      // Handle feedback
      if (feedbackResult.status === 'fulfilled' && !feedbackResult.value.error) {
        totalResponses = feedbackResult.value.count || 0;
        console.log('✅ Feedback processed:', totalResponses);
      } else {
        console.warn('⚠️ Feedback query failed:', feedbackResult);
      }

      // Handle subscriptions
      if (subscriptionsResult.status === 'fulfilled' && !subscriptionsResult.value.error) {
        subscriptions = subscriptionsResult.value.data || [];
        activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
        monthlyRevenue = subscriptions
          .filter(s => s.status === 'active')
          .reduce((sum, sub) => sum + (sub.amount / 100), 0);
        console.log('✅ Subscriptions processed:', subscriptions.length, 'active:', activeSubscriptions);
      } else {
        console.warn('⚠️ Subscriptions query failed:', subscriptionsResult);
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

      console.log("✅ Final dashboard data:", result);
      setDashboardData(result);
      return result;

    } catch (error: any) {
      console.error("❌ Error fetching dashboard data:", error);
      const errorMessage = error.message || "Failed to fetch data";
      setError(errorMessage);
      throw error;
    }
  };

  const handleRefresh = async () => {
    console.log('🔄 Manual refresh triggered');
    setIsLoading(true);
    setError(null);
    toast.info("Refreshing dashboard data...");
    
    try {
      await fetchDashboardData();
      console.log('✅ Refresh completed successfully');
      toast.success("Dashboard data refreshed!");
    } catch (error: any) {
      console.error("❌ Refresh failed:", error);
      const errorMessage = error.message || "Failed to refresh data";
      setError(errorMessage);
      toast.error(`Refresh failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    console.log('🚪 Logout triggered');
    logout();
  };

  // Load data when admin is available
  useEffect(() => {
    if (!adminLoading && admin) {
      console.log('📊 Admin authenticated, loading data for:', admin.email);
      setIsLoading(true);
      setError(null);
      
      fetchDashboardData()
        .then(() => {
          console.log('✅ Initial data load complete');
        })
        .catch((error: any) => {
          console.error("❌ Initial load failed:", error);
          const errorMessage = error.message || "Failed to load data";
          setError(errorMessage);
          toast.error(`Failed to load data: ${errorMessage}`);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else if (!adminLoading && !admin) {
      console.log('❌ No admin found');
      setIsLoading(false);
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
          <h2 className="text-xl font-bold text-gray-800 mb-4">📊 DATABASE COUNTS</h2>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading data...</p>
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
