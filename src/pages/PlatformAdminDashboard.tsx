
import { useEffect, useState } from "react";
import { usePlatformAdmin } from "@/contexts/PlatformAdminContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import DashboardHeader from "@/components/platform-admin/DashboardHeader";
import SystemInfoCard from "@/components/platform-admin/SystemInfoCard";
import OverviewCards from "@/components/platform-admin/OverviewCards";
import SubscriptionManagement from "@/components/platform-admin/SubscriptionManagement";
import StudentStatistics from "@/components/platform-admin/StudentStatistics";
import ResponseAnalytics from "@/components/platform-admin/ResponseAnalytics";
import FeedbackAnalytics from "@/components/platform-admin/FeedbackAnalytics";
import SchoolOverview from "@/components/platform-admin/SchoolOverview";

console.log("🔥 PLATFORM ADMIN DASHBOARD LOADED");

const PlatformAdminDashboard = () => {
  const { admin, isLoading, logout } = usePlatformAdmin();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);

  const fetchRealData = async () => {
    console.log("📊 Fetching real data from Supabase...");
    
    try {
      // Get actual counts from database
      const [
        { count: teachersCount },
        { count: studentsCount },
        { count: feedbackCount },
        { data: subscriptionsData, count: subscriptionsCount }
      ] = await Promise.all([
        supabase.from('teachers').select('*', { count: 'exact', head: true }),
        supabase.from('students').select('*', { count: 'exact', head: true }),
        supabase.from('feedback').select('*', { count: 'exact', head: true }),
        supabase.from('subscriptions').select('*', { count: 'exact' })
      ]);

      // Get unique schools
      const { data: teachersData } = await supabase
        .from('teachers')
        .select('school')
        .not('school', 'is', null);

      const uniqueSchools = [...new Set(teachersData?.map(t => t.school).filter(Boolean) || [])];
      const activeSubscriptions = subscriptionsData?.filter(s => s.status === 'active').length || 0;
      const monthlyRevenue = subscriptionsData?.reduce((sum, sub) => {
        if (sub.status === 'active') {
          return sum + (sub.amount / 100);
        }
        return sum;
      }, 0) || 0;

      console.log("📊 Real counts:", {
        teachers: teachersCount,
        students: studentsCount,
        feedback: feedbackCount,
        schools: uniqueSchools.length,
        subscriptions: subscriptionsCount
      });

      return {
        totalSchools: uniqueSchools.length,
        totalTeachers: teachersCount || 0,
        totalStudents: studentsCount || 0,
        totalResponses: feedbackCount || 0,
        subscriptions: subscriptionsData || [],
        activeSubscriptions,
        monthlyRevenue,
        studentStats: [],
        schoolStats: uniqueSchools.map(school => ({
          school,
          total_teachers: teachersData?.filter(t => t.school === school).length || 0
        })),
        feedbackStats: [],
        lastUpdated: new Date().toISOString()
      };

    } catch (error) {
      console.error("❌ Error fetching data:", error);
      throw error;
    }
  };

  const loadDashboardData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshCount(prev => prev + 1);
      toast.info("Refreshing dashboard data...");
    }
    
    setDataLoading(true);
    
    try {
      const data = await fetchRealData();
      setDashboardData(data);
      
      if (isRefresh) {
        toast.success("Dashboard data refreshed successfully!");
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Failed to load dashboard data");
      
      // Set fallback data with zero counts
      setDashboardData({
        totalSchools: 0,
        totalTeachers: 0,
        totalStudents: 0,
        totalResponses: 0,
        subscriptions: [],
        activeSubscriptions: 0,
        monthlyRevenue: 0,
        studentStats: [],
        schoolStats: [],
        feedbackStats: [],
        lastUpdated: new Date().toISOString(),
        error: true
      });
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (admin) {
      console.log('📊 Loading dashboard for admin:', admin.email);
      loadDashboardData(false);
    }
  }, [admin]);

  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    loadDashboardData(true);
  };

  const handleLogout = () => {
    console.log('🚪 Logout triggered');
    logout();
  };

  if (isLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">
          {isLoading ? 'Loading admin session...' : 'Loading dashboard data...'}
        </div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-red-600">Please log in to access the dashboard</div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">No dashboard data available</div>
      </div>
    );
  }

  const {
    totalSchools,
    totalTeachers,
    totalStudents,
    totalResponses,
    subscriptions,
    activeSubscriptions,
    monthlyRevenue,
    studentStats,
    schoolStats,
    feedbackStats,
    error
  } = dashboardData;

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
              {error ? '❌ DATA ERROR' : '✅ REAL DATA DASHBOARD'}
            </h1>
            <p className="text-sm mt-2">
              Refresh Count: {refreshCount} | Last Updated: {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Real Data Display */}
        <div className="bg-white border-2 border-gray-300 rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📊 REAL DATABASE COUNTS</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-600">Schools</p>
              <p className="text-3xl font-bold text-blue-600">{totalSchools}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-600">Teachers</p>
              <p className="text-3xl font-bold text-green-600">{totalTeachers}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-600">Students</p>
              <p className="text-3xl font-bold text-purple-600">{totalStudents}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-600">Responses</p>
              <p className="text-3xl font-bold text-orange-600">{totalResponses}</p>
            </div>
          </div>
        </div>
        
        <SystemInfoCard
          totalSchools={totalSchools}
          totalTeachers={totalTeachers}
          totalStudents={totalStudents}
          totalResponses={totalResponses}
          subscriptionsCount={subscriptions.length}
          activeSubscriptions={activeSubscriptions}
          monthlyRevenue={monthlyRevenue}
        />

        <OverviewCards
          totalSchools={totalSchools}
          totalTeachers={totalTeachers}
          totalStudents={totalStudents}
          totalResponses={totalResponses}
        />

        <SubscriptionManagement
          subscriptions={subscriptions}
        />

        <StudentStatistics
          studentStats={studentStats}
          schoolStats={schoolStats}
        />

        <ResponseAnalytics
          feedbackStats={feedbackStats}
        />

        <FeedbackAnalytics
          feedbackStats={feedbackStats}
        />

        <SchoolOverview
          schoolStats={schoolStats}
        />
      </div>
    </div>
  );
};

export default PlatformAdminDashboard;
