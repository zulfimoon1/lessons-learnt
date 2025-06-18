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
import DiscountNotifications from "@/components/platform-admin/DiscountNotifications";
import { securePlatformAdminService } from "@/services/securePlatformAdminService";

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

  const fetchStatsWithRetry = async (retries = 3): Promise<any> => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        if (admin?.email) {
          await securePlatformAdminService.setAdminContext(admin.email);
        }

        // Try multiple query strategies with better error handling
        const queries = [
          async () => {
            try {
              const { count, error } = await supabase.from('students').select('*', { count: 'exact', head: true });
              if (error) throw error;
              return count || 0;
            } catch (error) {
              console.warn('Students count failed:', error);
              return 0;
            }
          },
          async () => {
            try {
              const { count, error } = await supabase.from('teachers').select('*', { count: 'exact', head: true });
              if (error) throw error;
              return count || 0;
            } catch (error) {
              console.warn('Teachers count failed:', error);
              return 0;
            }
          },
          async () => {
            try {
              const { count, error } = await supabase.from('feedback').select('*', { count: 'exact', head: true });
              if (error) throw error;
              return count || 0;
            } catch (error) {
              console.warn('Feedback count failed:', error);
              return 0;
            }
          },
          async () => {
            try {
              const { count, error } = await supabase.from('subscriptions').select('*', { count: 'exact', head: true });
              if (error) throw error;
              return count || 0;
            } catch (error) {
              console.warn('Subscriptions count failed:', error);
              return 0;
            }
          }
        ];

        const results = await Promise.allSettled(queries.map(q => q()));
        
        const studentsCount = results[0].status === 'fulfilled' ? results[0].value : 0;
        const teachersCount = results[1].status === 'fulfilled' ? results[1].value : 0;
        const responsesCount = results[2].status === 'fulfilled' ? results[2].value : 0;
        const subscriptionsCount = results[3].status === 'fulfilled' ? results[3].value : 0;

        console.log('📊 DASHBOARD: Query results:', {
          students: studentsCount,
          teachers: teachersCount,
          responses: responsesCount,
          subscriptions: subscriptionsCount,
          attempt
        });

        return {
          studentsCount,
          teachersCount,
          responsesCount,
          subscriptionsCount
        };

      } catch (error) {
        console.warn(`📊 DASHBOARD: Attempt ${attempt} failed:`, error);
        if (attempt === retries) {
          throw error;
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  };

  const fetchStats = async () => {
    console.log('📊 DASHBOARD: Starting fetchStats...');
    setIsRefreshing(true);
    
    try {
      const queryResults = await fetchStatsWithRetry();
      const { studentsCount, teachersCount, responsesCount, subscriptionsCount } = queryResults;

      // Calculate monthly revenue with error handling
      let monthlyRevenue = 0;
      try {
        const { data: subscriptionData, error } = await supabase
          .from('subscriptions')
          .select('amount, plan_type, status')
          .eq('status', 'active');

        if (!error && subscriptionData) {
          monthlyRevenue = subscriptionData.reduce((total, sub) => {
            const monthlyAmount = sub.plan_type === 'yearly' ? sub.amount / 12 : sub.amount;
            return total + (monthlyAmount / 100);
          }, 0);
        }
      } catch (error) {
        console.warn('Could not calculate revenue:', error);
      }

      // Get schools data with error handling
      let schoolStatsProcessed: SchoolStats[] = [];
      let totalSchools = 0;
      
      try {
        const [studentsResult, teachersResult] = await Promise.allSettled([
          supabase.from('students').select('school').not('school', 'is', null),
          supabase.from('teachers').select('school').not('school', 'is', null)
        ]);

        const allSchools = new Set<string>();
        const excludedSchools = ['Platform Administration', 'platform administration', 'admin'];
        
        // Process students
        if (studentsResult.status === 'fulfilled' && studentsResult.value.data) {
          studentsResult.value.data.forEach(item => {
            if (item?.school && !excludedSchools.some(excluded => 
              item.school.toLowerCase().includes(excluded.toLowerCase())
            )) {
              allSchools.add(item.school);
            }
          });
        }
        
        // Process teachers
        if (teachersResult.status === 'fulfilled' && teachersResult.value.data) {
          teachersResult.value.data.forEach(item => {
            if (item?.school && !excludedSchools.some(excluded => 
              item.school.toLowerCase().includes(excluded.toLowerCase())
            )) {
              allSchools.add(item.school);
            }
          });
          
          // Calculate teacher counts per school
          const teacherCounts = teachersResult.value.data
            .filter(teacher => teacher.school && !excludedSchools.some(excluded => 
              teacher.school.toLowerCase().includes(excluded.toLowerCase())
            ))
            .reduce((acc, teacher) => {
              acc[teacher.school] = (acc[teacher.school] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);
          
          schoolStatsProcessed = Object.entries(teacherCounts)
            .map(([school, total_teachers]) => ({ school, total_teachers }));
        }
        
        totalSchools = allSchools.size;
      } catch (error) {
        console.warn('Could not fetch school data:', error);
      }

      // Feedback analytics with error handling
      let feedbackAnalyticsData: FeedbackStats[] = [];
      try {
        const { data, error } = await supabase.from('feedback_analytics').select('*');
        if (!error && data) {
          feedbackAnalyticsData = data;
        }
      } catch (error) {
        console.warn('Could not fetch feedback analytics:', error);
      }
      
      const newStats = {
        totalStudents: studentsCount,
        totalTeachers: teachersCount,
        totalSchools: totalSchools,
        totalResponses: responsesCount,
        totalSubscriptions: subscriptionsCount,
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
      toast.error('Failed to refresh data - some permissions may be limited');
      
      // Set default stats to prevent UI issues
      setStats({
        totalStudents: 0,
        totalTeachers: 0,
        totalSchools: 0,
        totalResponses: 0,
        totalSubscriptions: 0,
        monthlyRevenue: 0,
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchStats();
  };

  const handleDataChange = () => {
    console.log('📊 DASHBOARD: Data changed, refreshing...');
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
            {/* Payment Notifications */}
            <DiscountNotifications adminEmail={admin?.email} />

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
