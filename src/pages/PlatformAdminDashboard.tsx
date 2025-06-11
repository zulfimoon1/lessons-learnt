
import { useEffect, useState } from "react";
import { usePlatformAdmin } from "@/contexts/PlatformAdminContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import DashboardHeader from "@/components/platform-admin/DashboardHeader";
import SystemInfoCard from "@/components/platform-admin/SystemInfoCard";
import OverviewCards from "@/components/platform-admin/OverviewCards";
import SubscriptionManagement from "@/components/platform-admin/SubscriptionManagement";

console.log("🔥 PLATFORM ADMIN DASHBOARD LOADED");

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
  const { admin, isLoading, logout } = usePlatformAdmin();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);

  const fetchDashboardData = async (): Promise<DashboardData> => {
    console.log("📊 Fetching dashboard data from Supabase...");
    
    try {
      // Fetch all data in parallel
      const [teachersResult, studentsResult, feedbackResult, subscriptionsResult] = await Promise.all([
        supabase.from('teachers').select('*', { count: 'exact' }),
        supabase.from('students').select('*', { count: 'exact' }),
        supabase.from('feedback').select('*', { count: 'exact' }),
        supabase.from('subscriptions').select('*')
      ]);

      // Extract counts
      const totalTeachers = teachersResult.count || 0;
      const totalStudents = studentsResult.count || 0;
      const totalResponses = feedbackResult.count || 0;
      
      // Process subscriptions
      const subscriptions = subscriptionsResult.data || [];
      const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
      const monthlyRevenue = subscriptions
        .filter(s => s.status === 'active')
        .reduce((sum, sub) => sum + (sub.amount / 100), 0);

      // Calculate unique schools from teachers
      const uniqueSchools = new Set(
        teachersResult.data?.map(t => t.school).filter(Boolean) || []
      );
      const totalSchools = uniqueSchools.size;

      console.log("📊 Dashboard data loaded:", {
        totalSchools,
        totalTeachers,
        totalStudents,
        totalResponses,
        activeSubscriptions
      });

      return {
        totalSchools,
        totalTeachers,
        totalStudents,
        totalResponses,
        subscriptions,
        activeSubscriptions,
        monthlyRevenue,
        lastUpdated: new Date().toISOString()
      };

    } catch (error) {
      console.error("❌ Error fetching dashboard data:", error);
      throw error;
    }
  };

  const loadData = async (isRefresh = false) => {
    console.log(`📊 Loading dashboard data (refresh: ${isRefresh})`);
    setDataLoading(true);
    
    if (isRefresh) {
      setRefreshCount(prev => prev + 1);
      toast.info("Refreshing dashboard data...");
    }
    
    try {
      const data = await fetchDashboardData();
      setDashboardData(data);
      
      if (isRefresh) {
        toast.success("Dashboard data refreshed successfully!");
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Failed to load dashboard data");
      
      // Set fallback data
      setDashboardData({
        totalSchools: 0,
        totalTeachers: 0,
        totalStudents: 0,
        totalResponses: 0,
        subscriptions: [],
        activeSubscriptions: 0,
        monthlyRevenue: 0,
        lastUpdated: new Date().toISOString()
      });
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (admin) {
      console.log('📊 Admin authenticated, loading dashboard data');
      loadData(false);
    }
  }, [admin]);

  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    loadData(true);
  };

  const handleLogout = () => {
    console.log('🚪 Logout triggered');
    logout();
  };

  if (isLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-lg">
            {isLoading ? 'Loading admin session...' : 'Loading dashboard data...'}
          </div>
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
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">Dashboard Error</div>
          <p className="text-gray-600">Unable to load dashboard data</p>
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
        <div className="bg-green-100 border-2 border-green-500 rounded-xl p-6">
          <div className="text-center">
            <h1 className="text-xl font-bold text-green-800">✅ LIVE DATABASE DASHBOARD</h1>
            <p className="text-sm mt-2 text-green-700">
              Refresh Count: {refreshCount} | Last Updated: {new Date(dashboardData.lastUpdated).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Real Data Display */}
        <div className="bg-white border-2 border-gray-300 rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📊 REAL DATABASE COUNTS</h2>
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
