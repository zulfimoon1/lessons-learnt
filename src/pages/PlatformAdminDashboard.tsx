
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
    setDataLoading(true);
    
    if (forceRefresh) {
      console.log('Force refreshing dashboard data...');
      toast.info("Refreshing dashboard data...");
    }
    
    try {
      console.log('Loading real dashboard data from database...');
      
      // Get total schools
      const { data: schoolsData, error: schoolsError } = await supabase
        .from('teachers')
        .select('school')
        .not('school', 'is', null);
      
      if (schoolsError) throw schoolsError;
      
      const uniqueSchools = [...new Set(schoolsData?.map(t => t.school) || [])];
      const totalSchools = uniqueSchools.length;
      
      // Get total teachers
      const { count: totalTeachers, error: teachersError } = await supabase
        .from('teachers')
        .select('*', { count: 'exact', head: true });
      
      if (teachersError) throw teachersError;
      
      // Get total students
      const { count: totalStudents, error: studentsError } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });
      
      if (studentsError) throw studentsError;
      
      // Get total responses
      const { count: totalResponses, error: responsesError } = await supabase
        .from('feedback')
        .select('*', { count: 'exact', head: true });
      
      if (responsesError) throw responsesError;
      
      // Get subscriptions
      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from('subscriptions')
        .select('*');
      
      if (subscriptionsError) throw subscriptionsError;
      
      const activeSubscriptions = subscriptionsData?.filter(s => s.status === 'active').length || 0;
      const monthlyRevenue = subscriptionsData?.reduce((sum, sub) => {
        if (sub.status === 'active') {
          return sum + (sub.amount / 100); // Convert from cents
        }
        return sum;
      }, 0) || 0;
      
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

      console.log('Real data loaded:', {
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
      
      setDashboardData(realData);
      
      if (forceRefresh) {
        toast.success("Dashboard refreshed successfully!");
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error("Error loading data", {
        description: "Failed to load dashboard data from database",
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
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (admin) {
      loadDashboardData();
    }
  }, [admin, refreshKey]);

  const handleRefresh = () => {
    console.log('Refresh button clicked - forcing data reload');
    setRefreshKey(prev => prev + 1);
    loadDashboardData(true);
  };

  const handleLogout = () => {
    logout();
  };

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

        {/* Overview Cards */}
        <OverviewCards
          totalSchools={totalSchools}
          totalTeachers={totalTeachers}
          totalStudents={totalStudents}
          totalResponses={totalResponses}
        />

        {/* Subscription Management */}
        <SubscriptionManagement
          subscriptions={subscriptions}
        />

        {/* Student Statistics */}
        <StudentStatistics
          studentStats={studentStats}
          schoolStats={schoolStats}
        />

        {/* Response Analytics */}
        <ResponseAnalytics
          feedbackStats={feedbackStats}
        />

        {/* Feedback Analytics */}
        <FeedbackAnalytics
          feedbackStats={feedbackStats}
        />

        {/* School Overview */}
        <SchoolOverview
          schoolStats={schoolStats}
        />
      </div>
    </div>
  );
};

export default PlatformAdminDashboard;
