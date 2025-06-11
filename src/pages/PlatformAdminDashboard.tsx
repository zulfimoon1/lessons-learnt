
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

const PlatformAdminDashboard = () => {
  const { admin, isLoading, logout } = usePlatformAdmin();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadDashboardData = async (isRefresh = false) => {
    console.log('📊 LOAD DASHBOARD DATA - START', { isRefresh, refreshKey });
    
    if (isRefresh) {
      console.log('✨ REFRESH MODE - Showing toast and clearing cache');
      toast.info("Refreshing dashboard data...", { duration: 2000 });
    }
    
    setDataLoading(true);
    
    try {
      console.log('📊 Fetching fresh data from Supabase...');
      
      // Force fresh data by using current timestamp
      const timestamp = Date.now();
      console.log('📊 Query timestamp:', timestamp);
      
      // Get schools data
      const { data: schoolsData, error: schoolsError } = await supabase
        .from('teachers')
        .select('school')
        .not('school', 'is', null);
      
      if (schoolsError) {
        console.error('❌ Schools query error:', schoolsError);
        throw schoolsError;
      }
      
      const uniqueSchools = [...new Set(schoolsData?.map(t => t.school) || [])];
      console.log('📊 Schools found:', uniqueSchools.length);
      
      // Get teachers count
      const { count: teachersCount, error: teachersError } = await supabase
        .from('teachers')
        .select('*', { count: 'exact', head: true });
      
      if (teachersError) {
        console.error('❌ Teachers query error:', teachersError);
        throw teachersError;
      }
      console.log('📊 Teachers count:', teachersCount);
      
      // Get students count
      const { count: studentsCount, error: studentsError } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });
      
      if (studentsError) {
        console.error('❌ Students query error:', studentsError);
        throw studentsError;
      }
      console.log('📊 Students count:', studentsCount);
      
      // Get feedback count
      const { count: feedbackCount, error: feedbackError } = await supabase
        .from('feedback')
        .select('*', { count: 'exact', head: true });
      
      if (feedbackError) {
        console.error('❌ Feedback query error:', feedbackError);
        throw feedbackError;
      }
      console.log('📊 Feedback count:', feedbackCount);
      
      // Get subscriptions
      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from('subscriptions')
        .select('*');
      
      if (subscriptionsError) {
        console.error('❌ Subscriptions query error:', subscriptionsError);
        throw subscriptionsError;
      }
      console.log('📊 Subscriptions found:', subscriptionsData?.length || 0);
      
      const activeSubscriptions = subscriptionsData?.filter(s => s.status === 'active').length || 0;
      const monthlyRevenue = subscriptionsData?.reduce((sum, sub) => {
        if (sub.status === 'active') {
          return sum + (sub.amount / 100);
        }
        return sum;
      }, 0) || 0;
      
      const newData = {
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
          total_teachers: schoolsData?.filter(t => t.school === school).length || 0
        })),
        feedbackStats: [],
        recentSignups: teachersCount || 0,
        topSchools: uniqueSchools.slice(0, 5),
        topTeachers: [],
        recentResponses: [],
        mentalHealthAlerts: [],
        recentFeedback: []
      };
      
      console.log('📊 Data preparation complete:', {
        schools: newData.totalSchools,
        teachers: newData.totalTeachers,
        students: newData.totalStudents,
        responses: newData.totalResponses
      });
      
      setDashboardData(newData);
      
      if (isRefresh) {
        console.log('✅ REFRESH COMPLETED SUCCESSFULLY!');
        toast.success("Dashboard refreshed successfully!", { duration: 3000 });
      }
      
    } catch (error) {
      console.error('❌ DASHBOARD DATA ERROR:', error);
      toast.error("Failed to load dashboard data", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
        duration: 5000
      });
      
      // Set fallback data
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
        feedbackStats: []
      });
    } finally {
      setDataLoading(false);
      console.log('📊 LOAD DASHBOARD DATA - COMPLETE');
    }
  };

  useEffect(() => {
    if (admin) {
      console.log('📊 Initial load triggered for admin:', admin.email);
      loadDashboardData(false);
    }
  }, [admin]);

  const handleRefresh = () => {
    console.log('🔄 HANDLE REFRESH - Called from dashboard header');
    const newRefreshKey = refreshKey + 1;
    setRefreshKey(newRefreshKey);
    console.log('🔄 New refresh key:', newRefreshKey);
    loadDashboardData(true);
  };

  const handleLogout = () => {
    console.log('🚪 Logout initiated from dashboard');
    logout();
  };

  console.log('📱 Dashboard render state:', { 
    adminExists: !!admin, 
    dataLoading, 
    hasData: !!dashboardData,
    refreshKey 
  });

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
        <div className="text-lg">No data available</div>
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
    feedbackStats
  } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50" key={refreshKey}>
      <DashboardHeader 
        adminName={admin.email}
        onRefresh={handleRefresh}
        onLogout={handleLogout}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
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
