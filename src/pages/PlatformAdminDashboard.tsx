
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

  const loadDashboardData = async (forceRefresh = false) => {
    console.log('🔄🔄🔄 LOAD DASHBOARD DATA CALLED! 🔄🔄🔄');
    console.log('🔄 loadDashboardData called with forceRefresh:', forceRefresh);
    setDataLoading(true);
    
    if (forceRefresh) {
      console.log('🔄 Force refreshing dashboard data...');
      toast.info("Refreshing dashboard data...");
    }
    
    try {
      console.log('📊 Loading real dashboard data from database...');
      
      // Test database connection first
      console.log('🔍 Testing database connection...');
      const { data: testConnection, error: connectionError } = await supabase
        .from('teachers')
        .select('count(*)', { count: 'exact', head: true })
        .limit(1);
      
      if (connectionError) {
        console.error('❌ Database connection failed:', connectionError);
        throw new Error(`Database connection failed: ${connectionError.message}`);
      }
      
      console.log('✅ Database connection successful');
      
      // Get total schools
      console.log('📊 Fetching schools data...');
      const { data: schoolsData, error: schoolsError } = await supabase
        .from('teachers')
        .select('school')
        .not('school', 'is', null);
      
      if (schoolsError) {
        console.error('❌ Schools query error:', schoolsError);
        throw schoolsError;
      }
      
      console.log('📊 Raw schools data:', schoolsData);
      const uniqueSchools = [...new Set(schoolsData?.map(t => t.school) || [])];
      console.log('📊 Unique schools:', uniqueSchools);
      const totalSchools = uniqueSchools.length;
      console.log('📊 Total schools count:', totalSchools);
      
      // Get total teachers
      console.log('📊 Fetching teachers count...');
      const { count: totalTeachers, error: teachersError } = await supabase
        .from('teachers')
        .select('*', { count: 'exact', head: true });
      
      if (teachersError) {
        console.error('❌ Teachers query error:', teachersError);
        throw teachersError;
      }
      console.log('📊 Total teachers count:', totalTeachers);
      
      // Get total students
      console.log('📊 Fetching students count...');
      const { count: totalStudents, error: studentsError } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });
      
      if (studentsError) {
        console.error('❌ Students query error:', studentsError);
        throw studentsError;
      }
      console.log('📊 Total students count:', totalStudents);
      
      // Get total responses
      console.log('📊 Fetching feedback count...');
      const { count: totalResponses, error: responsesError } = await supabase
        .from('feedback')
        .select('*', { count: 'exact', head: true });
      
      if (responsesError) {
        console.error('❌ Feedback query error:', responsesError);
        throw responsesError;
      }
      console.log('📊 Total responses count:', totalResponses);
      
      // Get subscriptions
      console.log('📊 Fetching subscriptions...');
      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from('subscriptions')
        .select('*');
      
      if (subscriptionsError) {
        console.error('❌ Subscriptions query error:', subscriptionsError);
        throw subscriptionsError;
      }
      console.log('📊 Subscriptions data:', subscriptionsData);
      
      const activeSubscriptions = subscriptionsData?.filter(s => s.status === 'active').length || 0;
      const monthlyRevenue = subscriptionsData?.reduce((sum, sub) => {
        if (sub.status === 'active') {
          return sum + (sub.amount / 100); // Convert from cents
        }
        return sum;
      }, 0) || 0;
      
      console.log('📊 Active subscriptions:', activeSubscriptions);
      console.log('📊 Monthly revenue:', monthlyRevenue);
      
      // Get student statistics by school
      const { data: studentStats, error: studentStatsError } = await supabase
        .from('students')
        .select('school')
        .not('school', 'is', null);
      
      if (studentStatsError) throw studentStatsError;
      
      const studentStatsBySchool = studentStats?.reduce((acc, student) => {
        acc[student.school] = (acc[student.school] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};
      
      const processedStudentStats = Object.entries(studentStatsBySchool).map(([school, count]) => ({
        school,
        total_students: count,
        student_response_rate: 0 // Would need more complex calculation
      }));
      
      // Get feedback analytics
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedback_analytics')
        .select('*');
      
      if (feedbackError) throw feedbackError;

      console.log('✅ Final dashboard data computed:', {
        totalSchools,
        totalTeachers: totalTeachers || 0,
        totalStudents: totalStudents || 0,
        totalResponses: totalResponses || 0,
        activeSubscriptions,
        monthlyRevenue
      });

      const realData = {
        totalSchools,
        totalTeachers: totalTeachers || 0,
        totalStudents: totalStudents || 0,
        totalResponses: totalResponses || 0,
        subscriptions: subscriptionsData || [],
        activeSubscriptions,
        monthlyRevenue,
        studentStats: processedStudentStats,
        schoolStats: uniqueSchools.map(school => ({
          school,
          total_teachers: schoolsData?.filter(t => t.school === school).length || 0
        })),
        feedbackStats: feedbackData || [],
        recentSignups: totalTeachers || 0, // Could be refined with date filtering
        topSchools: uniqueSchools.slice(0, 5),
        topTeachers: [],
        recentResponses: [],
        mentalHealthAlerts: [],
        recentFeedback: []
      };
      
      console.log('🎯 Setting dashboard data to state...');
      setDashboardData(realData);
      
      if (forceRefresh) {
        console.log('✅ Refresh completed successfully!');
        toast.success("Dashboard refreshed successfully!");
      }
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      toast.error("Error loading data", {
        description: error instanceof Error ? error.message : "Failed to load dashboard data from database",
      });
      
      // Fallback to empty data instead of mock data
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
      console.log('🏁 Data loading complete, setting dataLoading to false');
      setDataLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 useEffect triggered - admin:', !!admin, 'refreshKey:', refreshKey);
    if (admin) {
      loadDashboardData();
    }
  }, [admin, refreshKey]);

  const handleRefresh = () => {
    console.log('🔄🔄🔄 HANDLE REFRESH CALLED! 🔄🔄🔄');
    console.log('🔄🔄🔄 REFRESH BUTTON CLICKED! 🔄🔄🔄');
    console.log('Current refreshKey before increment:', refreshKey);
    console.log('loadDashboardData function type:', typeof loadDashboardData);
    
    // Force a manual refresh
    loadDashboardData(true);
    
    // Also increment refresh key to trigger useEffect
    setRefreshKey(prev => {
      const newKey = prev + 1;
      console.log('Setting new refreshKey to:', newKey);
      return newKey;
    });
  };

  const handleLogout = () => {
    console.log('🚪 Logout initiated');
    logout();
  };

  console.log('📱 Dashboard render - isLoading:', isLoading, 'dataLoading:', dataLoading, 'admin:', !!admin, 'dashboardData:', !!dashboardData);
  console.log('📱 Dashboard render - handleRefresh function:', typeof handleRefresh);

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
        {/* System Information */}
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
