
import { useEffect, useState } from "react";
import { usePlatformAdmin } from "@/contexts/PlatformAdminContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SchoolIcon, LogOutIcon, RefreshCwIcon, UsersIcon, MessageSquareIcon, Settings, Users, School, Shield } from "lucide-react";
import { toast } from "sonner";
import StatsCard from "@/components/dashboard/StatsCard";
import SchoolOverview from "@/components/platform-admin/SchoolOverview";
import FeedbackAnalytics from "@/components/platform-admin/FeedbackAnalytics";
import DiscountCodeManagement from "@/components/DiscountCodeManagement";
import SubscriptionManagement from "@/components/platform-admin/SubscriptionManagement";
import ResponsesManagement from "@/components/platform-admin/ResponsesManagement";
import TransactionManagement from "@/components/platform-admin/TransactionManagement";
import SchoolManagement from "@/components/platform-admin/SchoolManagement";
import TeacherManagement from "@/components/platform-admin/TeacherManagement";
import StudentManagement from "@/components/platform-admin/StudentManagement";
import DoctorManagement from "@/components/platform-admin/DoctorManagement";
import SecurityMonitoring from "@/components/platform-admin/SecurityMonitoring";

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalSchools: number;
  totalResponses: number;
  totalSubscriptions: number;
  monthlyRevenue: number;
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
    monthlyRevenue: 0,
  });
  const [schoolStats, setSchoolStats] = useState<SchoolStats[]>([]);
  const [feedbackStats, setFeedbackStats] = useState<FeedbackStats[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [refreshKey, setRefreshKey] = useState(0);

  console.log('📊 DASHBOARD: Platform admin state', { 
    admin: !!admin, 
    isAuthenticated, 
    adminLoading,
    adminEmail: admin?.email 
  });

  const setAdminContext = async () => {
    if (admin?.email) {
      try {
        console.log('📊 DASHBOARD: Setting admin context for', admin.email);
        await supabase.rpc('set_platform_admin_context', { admin_email: admin.email });
      } catch (error) {
        console.error('Error setting admin context:', error);
      }
    }
  };

  const fetchStats = async () => {
    console.log('📊 DASHBOARD: Starting fetchStats...');
    setIsRefreshing(true);
    
    try {
      await setAdminContext();

      // Force refresh with no-cache headers
      const { count: studentsCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });

      const { count: teachersCount } = await supabase
        .from('teachers')
        .select('*', { count: 'exact', head: true });

      const { count: responsesCount } = await supabase
        .from('feedback')
        .select('*', { count: 'exact', head: true });

      const { count: subscriptionsCount } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true });

      console.log('📊 DASHBOARD: Fresh counts:', {
        students: studentsCount,
        teachers: teachersCount,
        responses: responsesCount,
        subscriptions: subscriptionsCount
      });

      // Calculate monthly revenue from active subscriptions
      const { data: subscriptionData } = await supabase
        .from('subscriptions')
        .select('amount, plan_type, status')
        .eq('status', 'active');

      let monthlyRevenue = 0;
      if (subscriptionData) {
        monthlyRevenue = subscriptionData.reduce((total, sub) => {
          const monthlyAmount = sub.plan_type === 'yearly' ? sub.amount / 12 : sub.amount;
          return total + (monthlyAmount / 100);
        }, 0);
      }

      // Get unique schools - EXCLUDE platform administration entries
      const { data: allStudents } = await supabase
        .from('students')
        .select('school')
        .not('school', 'is', null);

      const { data: allTeachers } = await supabase
        .from('teachers')
        .select('school')
        .not('school', 'is', null);

      const allSchoolNames = new Set<string>();
      
      // Filter out platform administration entries
      const excludedSchools = ['Platform Administration', 'platform administration', 'admin'];
      
      if (allStudents) {
        allStudents.forEach(item => {
          if (item?.school && !excludedSchools.some(excluded => 
            item.school.toLowerCase().includes(excluded.toLowerCase())
          )) {
            allSchoolNames.add(item.school);
          }
        });
      }
      
      if (allTeachers) {
        allTeachers.forEach(item => {
          if (item?.school && !excludedSchools.some(excluded => 
            item.school.toLowerCase().includes(excluded.toLowerCase())
          )) {
            allSchoolNames.add(item.school);
          }
        });
      }

      console.log('📊 DASHBOARD: Filtered schools:', Array.from(allSchoolNames));

      // School stats - also filter out platform administration
      const { data: schoolStatsData } = await supabase
        .from('teachers')
        .select('school')
        .not('school', 'is', null);

      let schoolStatsProcessed: SchoolStats[] = [];
      if (schoolStatsData) {
        const filteredSchoolStats = schoolStatsData.filter(teacher => 
          teacher.school && !excludedSchools.some(excluded => 
            teacher.school.toLowerCase().includes(excluded.toLowerCase())
          )
        );
        
        schoolStatsProcessed = Object.entries(
          filteredSchoolStats.reduce((acc, teacher) => {
            acc[teacher.school] = (acc[teacher.school] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        ).map(([school, total_teachers]) => ({ school, total_teachers }));
      }

      // Feedback analytics - force refresh
      let feedbackAnalyticsData: FeedbackStats[] = [];
      try {
        const { data } = await supabase
          .from('feedback_analytics')
          .select('*');

        if (data) {
          feedbackAnalyticsData = data;
        }
      } catch (error) {
        console.warn('Could not fetch feedback analytics:', error);
      }
      
      const newStats = {
        totalStudents: studentsCount || 0,
        totalTeachers: teachersCount || 0,
        totalSchools: allSchoolNames.size,
        totalResponses: responsesCount || 0,
        totalSubscriptions: subscriptionsCount || 0,
        monthlyRevenue: monthlyRevenue,
      };

      console.log('📊 DASHBOARD: Setting new stats:', newStats);
      
      setStats(newStats);
      setSchoolStats(schoolStatsProcessed);
      setFeedbackStats(feedbackAnalyticsData);
      setLastUpdated(new Date().toLocaleString());
      setRefreshKey(Date.now());
      
      toast.success('Data refreshed successfully');
      
    } catch (error) {
      console.error('❌ DASHBOARD: Failed to fetch stats:', error);
      toast.error('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchStats();
  };

  const handleDataChange = () => {
    console.log('📊 DASHBOARD: Data changed, refreshing...');
    // Immediate refresh for better user experience
    setTimeout(() => {
      fetchStats();
    }, 500);
  };

  const handleLogout = () => {
    logout();
    toast.info('Logged out successfully');
  };

  useEffect(() => {
    console.log('📊 DASHBOARD: useEffect triggered', { isAuthenticated, admin: !!admin });
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
    console.log('📊 DASHBOARD: Access denied', { isAuthenticated, admin: !!admin });
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">Admin Access Denied</div>
          <p className="text-gray-600">Please log in as an administrator</p>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 font-mono">Debug Info:</p>
            <p className="text-sm text-gray-500">Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
            <p className="text-sm text-gray-500">Admin object: {admin ? 'Present' : 'Missing'}</p>
          </div>
          <a href="/console" className="text-blue-500 hover:text-blue-700 underline mt-4 inline-block">
            Go to Admin Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" key={`dashboard-${refreshKey}`}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <SchoolIcon className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Platform Admin Dashboard</h1>
            <Button
              onClick={handleRefresh}
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
                <span className="ml-2 text-blue-600">${stats.monthlyRevenue.toFixed(2)}/month</span>
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

        {/* Main Content Tabs */}
        <Tabs defaultValue="management" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="management" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <MessageSquareIcon className="w-4 h-4" />
              Analytics & Reports
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="management" className="space-y-6">
            {/* User Management Section */}
            <Tabs defaultValue="schools" className="space-y-4">
              <TabsList>
                <TabsTrigger value="schools">Schools</TabsTrigger>
                <TabsTrigger value="teachers">Teachers</TabsTrigger>
                <TabsTrigger value="students">Students</TabsTrigger>
                <TabsTrigger value="doctors">Doctors</TabsTrigger>
              </TabsList>

              <TabsContent value="schools">
                <SchoolManagement onDataChange={handleDataChange} />
              </TabsContent>

              <TabsContent value="teachers">
                <TeacherManagement />
              </TabsContent>

              <TabsContent value="students">
                <StudentManagement />
              </TabsContent>

              <TabsContent value="doctors">
                <DoctorManagement />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Enhanced Subscription Management */}
            <SubscriptionManagement />

            {/* Transaction Management */}
            <TransactionManagement />

            {/* Discount Code Management */}
            <DiscountCodeManagement />

            {/* Responses & Schedule Management */}
            <ResponsesManagement />

            {/* School Overview */}
            <SchoolOverview schoolStats={schoolStats} />

            {/* Response Analytics */}
            <FeedbackAnalytics feedbackStats={feedbackStats} />
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <SecurityMonitoring />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PlatformAdminDashboard;
