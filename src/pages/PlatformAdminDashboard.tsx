
import { useEffect, useState } from "react";
import { usePlatformAdmin } from "@/contexts/PlatformAdminContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SchoolIcon, LogOutIcon, RefreshCwIcon, UsersIcon, MessageSquareIcon, TrendingUpIcon } from "lucide-react";
import { toast } from "sonner";
import StatsCard from "@/components/dashboard/StatsCard";
import SchoolOverview from "@/components/platform-admin/SchoolOverview";
import FeedbackAnalytics from "@/components/platform-admin/FeedbackAnalytics";
import DiscountCodeManagement from "@/components/DiscountCodeManagement";
import SubscriptionManagement from "@/components/platform-admin/SubscriptionManagement";
import ResponsesManagement from "@/components/platform-admin/ResponsesManagement";

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalSchools: number;
  totalResponses: number;
  totalSubscriptions: number;
}

interface SchoolStats {
  school: string;
  total_teachers: number;
}

interface FeedbackStats {
  school: string;
  grade: string;
  subject: string;
  lesson_topic: string;
  class_date: string;
  total_responses: number;
  avg_understanding: number;
  avg_interest: number;
  avg_growth: number;
  anonymous_responses: number;
  named_responses: number;
}

const PlatformAdminDashboard = () => {
  const { admin, isLoading: adminLoading, logout, isAuthenticated } = usePlatformAdmin();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalSchools: 0,
    totalResponses: 0,
    totalSubscriptions: 0,
  });
  const [schoolStats, setSchoolStats] = useState<SchoolStats[]>([]);
  const [feedbackStats, setFeedbackStats] = useState<FeedbackStats[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const fetchStats = async () => {
    console.log('🔄 Fetching platform statistics...');
    setIsRefreshing(true);
    
    try {
      // Fetch students count
      const { count: studentsCount, error: studentsError } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });

      // Fetch teachers count
      const { count: teachersCount, error: teachersError } = await supabase
        .from('teachers')
        .select('*', { count: 'exact', head: true });

      // Fetch unique schools
      const { data: schoolsData, error: schoolsError } = await supabase
        .from('class_schedules')
        .select('school')
        .not('school', 'is', null);

      // Fetch responses count
      const { count: responsesCount, error: responsesError } = await supabase
        .from('feedback')
        .select('*', { count: 'exact', head: true });

      // Fetch subscriptions count
      const { count: subscriptionsCount, error: subscriptionsError } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true });

      // Fetch school stats
      const { data: schoolStatsData, error: schoolStatsError } = await supabase
        .from('teachers')
        .select('school')
        .not('school', 'is', null);

      // Fetch feedback analytics
      const { data: feedbackAnalyticsData, error: feedbackAnalyticsError } = await supabase
        .from('feedback_analytics')
        .select('*');

      if (studentsError) console.error('Students error:', studentsError);
      if (teachersError) console.error('Teachers error:', teachersError);
      if (schoolsError) console.error('Schools error:', schoolsError);
      if (responsesError) console.error('Responses error:', responsesError);
      if (subscriptionsError) console.error('Subscriptions error:', subscriptionsError);
      if (schoolStatsError) console.error('School stats error:', schoolStatsError);
      if (feedbackAnalyticsError) console.error('Feedback analytics error:', feedbackAnalyticsError);

      const uniqueSchools = schoolsData ? [...new Set(schoolsData.map(item => item.school))] : [];
      
      // Process school stats
      const schoolStatsProcessed = schoolStatsData ? 
        Object.entries(
          schoolStatsData.reduce((acc, teacher) => {
            acc[teacher.school] = (acc[teacher.school] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        ).map(([school, total_teachers]) => ({ school, total_teachers })) : [];

      setStats({
        totalStudents: studentsCount || 0,
        totalTeachers: teachersCount || 0,
        totalSchools: uniqueSchools.length,
        totalResponses: responsesCount || 0,
        totalSubscriptions: subscriptionsCount || 0,
      });

      setSchoolStats(schoolStatsProcessed);
      setFeedbackStats(feedbackAnalyticsData || []);
      setLastUpdated(new Date().toLocaleString());
      
      console.log('✅ Stats loaded successfully');
      toast.success('Data refreshed successfully');
      
    } catch (error) {
      console.error('❌ Failed to fetch stats:', error);
      toast.error('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    fetchStats();
  };

  const handleLogout = () => {
    logout();
    toast.info('Logged out successfully');
  };

  useEffect(() => {
    if (isAuthenticated && admin) {
      console.log('Admin authenticated, loading dashboard data...');
      fetchStats();
    }
  }, [isAuthenticated, admin]);

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
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <SchoolIcon className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Platform Admin Dashboard</h1>
            <Button
              onClick={() => fetchStats()}
              disabled={isRefreshing}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCwIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {admin?.email}</span>
            <Button onClick={logout} variant="outline" size="sm">
              <LogOutIcon className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* System Information Header */}
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-700">Schools:</span>
                <span className="ml-2 text-blue-600">{stats.totalSchools}</span>
              </div>
              <div>
                <span className="font-medium text-blue-700">Students:</span>
                <span className="ml-2 text-blue-600">{stats.totalStudents}</span>
              </div>
              <div>
                <span className="font-medium text-blue-700">Teachers:</span>
                <span className="ml-2 text-blue-600">{stats.totalTeachers}</span>
              </div>
              <div>
                <span className="font-medium text-blue-700">Responses:</span>
                <span className="ml-2 text-blue-600">{stats.totalResponses}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mt-4">
              <div>
                <span className="font-medium text-blue-700">Subscriptions:</span>
                <span className="ml-2 text-blue-600">{stats.totalSubscriptions}</span>
              </div>
              <div>
                <span className="font-medium text-blue-700">Active:</span>
                <span className="ml-2 text-blue-600">{stats.totalSubscriptions}</span>
              </div>
              <div>
                <span className="font-medium text-blue-700">Revenue:</span>
                <span className="ml-2 text-blue-600">$89.97/month</span>
              </div>
            </div>
            {lastUpdated && (
              <p className="text-xs text-blue-600 mt-4">Last updated: {lastUpdated}</p>
            )}
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard 
            title="Total Students" 
            value={stats.totalStudents} 
            icon={UsersIcon} 
          />
          <StatsCard 
            title="Total Schools" 
            value={stats.totalSchools} 
            icon={SchoolIcon} 
          />
          <StatsCard 
            title="Total Teachers" 
            value={stats.totalTeachers} 
            icon={UsersIcon} 
          />
          <StatsCard 
            title="Total Responses" 
            value={stats.totalResponses} 
            icon={MessageSquareIcon} 
          />
        </div>

        {/* Enhanced Subscription Management */}
        <div className="mb-8">
          <SubscriptionManagement />
        </div>

        {/* Discount Code Management */}
        <div className="mb-8">
          <DiscountCodeManagement />
        </div>

        {/* Responses & Schedule Management */}
        <div className="mb-8">
          <ResponsesManagement />
        </div>

        {/* School Overview */}
        <div className="mb-8">
          <SchoolOverview schoolStats={schoolStats} />
        </div>

        {/* Response Analytics */}
        <div className="mb-8">
          <FeedbackAnalytics feedbackStats={feedbackStats} />
        </div>
      </div>
    </div>
  );
};

export default PlatformAdminDashboard;
