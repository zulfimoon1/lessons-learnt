
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

  const loadDashboardData = async (forceRefresh = false) => {
    console.log('📊 LOADING DASHBOARD DATA - START', { forceRefresh });
    
    if (forceRefresh) {
      console.log('🔄 Force refresh requested - showing toast');
      toast.info("Refreshing dashboard data...");
    }
    
    setDataLoading(true);
    
    try {
      console.log('📊 Fetching data from database...');
      
      // Get total schools
      const { data: schoolsData, error: schoolsError } = await supabase
        .from('teachers')
        .select('school')
        .not('school', 'is', null);
      
      if (schoolsError) {
        console.error('❌ Schools error:', schoolsError);
        throw schoolsError;
      }
      
      const uniqueSchools = [...new Set(schoolsData?.map(t => t.school) || [])];
      const totalSchools = uniqueSchools.length;
      console.log('📊 Schools loaded:', totalSchools);
      
      // Get total teachers
      const { count: totalTeachers, error: teachersError } = await supabase
        .from('teachers')
        .select('*', { count: 'exact', head: true });
      
      if (teachersError) {
        console.error('❌ Teachers error:', teachersError);
        throw teachersError;
      }
      console.log('📊 Teachers loaded:', totalTeachers);
      
      // Get total students
      const { count: totalStudents, error: studentsError } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });
      
      if (studentsError) {
        console.error('❌ Students error:', studentsError);
        throw studentsError;
      }
      console.log('📊 Students loaded:', totalStudents);
      
      // Get total responses
      const { count: totalResponses, error: responsesError } = await supabase
        .from('feedback')
        .select('*', { count: 'exact', head: true });
      
      if (responsesError) {
        console.error('❌ Responses error:', responsesError);
        throw responsesError;
      }
      console.log('📊 Responses loaded:', totalResponses);
      
      // Get subscriptions
      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from('subscriptions')
        .select('*');
      
      if (subscriptionsError) {
        console.error('❌ Subscriptions error:', subscriptionsError);
        throw subscriptionsError;
      }
      console.log('📊 Subscriptions loaded:', subscriptionsData?.length || 0);
      
      const activeSubscriptions = subscriptionsData?.filter(s => s.status === 'active').length || 0;
      const monthlyRevenue = subscriptionsData?.reduce((sum, sub) => {
        if (sub.status === 'active') {
          return sum + (sub.amount / 100);
        }
        return sum;
      }, 0) || 0;
      
      const finalData = {
        totalSchools,
        totalTeachers: totalTeachers || 0,
        totalStudents: totalStudents || 0,
        totalResponses: totalResponses || 0,
        subscriptions: subscriptionsData || [],
        activeSubscriptions,
        monthlyRevenue,
        studentStats: [],
        schoolStats: uniqueSchools.map(school => ({
          school,
          total_teachers: schoolsData?.filter(t => t.school === school).length || 0
        })),
        feedbackStats: [],
        recentSignups: totalTeachers || 0,
        topSchools: uniqueSchools.slice(0, 5),
        topTeachers: [],
        recentResponses: [],
        mentalHealthAlerts: [],
        recentFeedback: []
      };
      
      console.log('📊 Dashboard data prepared successfully');
      setDashboardData(finalData);
      
      if (forceRefresh) {
        console.log('✅ Refresh completed successfully!');
        toast.success("Dashboard refreshed successfully!");
      }
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      toast.error("Error loading data", {
        description: error instanceof Error ? error.message : "Failed to load dashboard data",
      });
      
      // Set empty data structure on error
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
        recentSignups: 0,
        topSchools: [],
        topTeachers: [],
        recentResponses: [],
        mentalHealthAlerts: [],
        recentFeedback: []
      });
    } finally {
      setDataLoading(false);
      console.log('📊 LOADING DASHBOARD DATA - END');
    }
  };

  useEffect(() => {
    if (admin) {
      console.log('📊 Initial data load triggered for admin:', admin.email);
      loadDashboardData();
    }
  }, [admin]);

  const handleRefresh = () => {
    console.log('🔄 HANDLE REFRESH CALLED FROM DASHBOARD');
    console.log('🔄 About to call loadDashboardData with forceRefresh=true');
    loadDashboardData(true);
  };

  const handleLogout = () => {
    console.log('🚪 Logout initiated');
    logout();
  };

  console.log('📱 Dashboard render - admin exists:', !!admin, 'dataLoading:', dataLoading);

  if (isLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading dashboard...</div>
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
    <div className="min-h-screen bg-gray-50">
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
