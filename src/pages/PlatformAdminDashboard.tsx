
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
    console.log("🔄 Starting real data fetch...");
    setIsLoading(true);
    setError(null);
    
    try {
      // Simple direct queries without complex auth
      console.log("📊 Fetching students...");
      const { data: studentsData, error: studentsError, count: studentsCount } = await supabase
        .from('students')
        .select('school', { count: 'exact' });

      console.log("📊 Fetching teachers...");  
      const { data: teachersData, error: teachersError, count: teachersCount } = await supabase
        .from('teachers')
        .select('*', { count: 'exact' });

      console.log("📊 Fetching feedback...");
      const { data: feedbackData, error: feedbackError, count: feedbackCount } = await supabase
        .from('feedback')
        .select('*', { count: 'exact' });

      console.log("📊 Fetching subscriptions...");
      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from('subscriptions')
        .select('*');

      // Log all results
      console.log("📊 Query results:", {
        students: { data: studentsData, error: studentsError, count: studentsCount },
        teachers: { data: teachersData, error: teachersError, count: teachersCount },
        feedback: { data: feedbackData, error: feedbackError, count: feedbackCount },
        subscriptions: { data: subscriptionsData, error: subscriptionsError }
      });

      // Handle errors
      if (studentsError) {
        console.error("❌ Students query error:", studentsError);
        throw new Error(`Students query failed: ${studentsError.message}`);
      }
      if (teachersError) {
        console.error("❌ Teachers query error:", teachersError);
        throw new Error(`Teachers query failed: ${teachersError.message}`);
      }
      if (feedbackError) {
        console.error("❌ Feedback query error:", feedbackError);
        throw new Error(`Feedback query failed: ${feedbackError.message}`);
      }
      if (subscriptionsError) {
        console.error("❌ Subscriptions query error:", subscriptionsError);
        throw new Error(`Subscriptions query failed: ${subscriptionsError.message}`);
      }

      // Calculate real data
      const totalStudents = studentsCount || 0;
      const totalTeachers = teachersCount || 0;
      const totalResponses = feedbackCount || 0;
      
      // Calculate unique schools from students data
      const uniqueSchools = new Set();
      if (studentsData) {
        studentsData.forEach(student => {
          if (student.school) {
            uniqueSchools.add(student.school);
          }
        });
      }
      const totalSchools = uniqueSchools.size;

      const subscriptions = subscriptionsData || [];
      const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
      const monthlyRevenue = subscriptions
        .filter(s => s.status === 'active')
        .reduce((sum, sub) => sum + (sub.amount / 100), 0);

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

      console.log("✅ Real data compiled:", result);
      setDashboardData(result);
      
      toast.success(`Data refreshed: ${totalStudents} students, ${totalTeachers} teachers, ${totalSchools} schools`);
      
      return result;

    } catch (error: any) {
      console.error("❌ Data fetch failed:", error);
      const errorMessage = error.message || "Failed to fetch dashboard data";
      setError(errorMessage);
      toast.error(`Data fetch failed: ${errorMessage}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    console.log('🔄 Manual refresh triggered');
    
    try {
      await fetchRealData();
    } catch (error: any) {
      console.error("❌ Manual refresh failed:", error);
    }
  };

  const handleLogout = () => {
    console.log('🚪 Logout triggered');
    logout();
  };

  // Load data when admin is available
  useEffect(() => {
    if (!adminLoading && admin) {
      console.log('📊 Admin authenticated, loading dashboard data...');
      fetchRealData().catch((error: any) => {
        console.error("❌ Initial data load failed:", error);
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
