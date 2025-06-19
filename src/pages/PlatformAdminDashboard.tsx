
import { useEffect, useState } from "react";
import { usePlatformAdmin } from "@/contexts/PlatformAdminContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SchoolIcon, LogOutIcon, RefreshCwIcon, UsersIcon, MessageSquareIcon, Settings, Users, School, Shield, TrashIcon } from "lucide-react";
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
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [hasDataLoaded, setHasDataLoaded] = useState(false);
  const [fetchError, setFetchError] = useState<string>("");

  console.log('📊 DASHBOARD: State check', { 
    admin: !!admin, 
    isAuthenticated, 
    adminLoading,
    adminEmail: admin?.email 
  });

  const fetchStats = async () => {
    console.log('📊 DASHBOARD: Fetching stats via edge function...');
    if (!admin?.email) {
      console.warn('No admin email available for stats fetch');
      return;
    }

    setIsRefreshing(true);
    setFetchError("");
    
    try {
      console.log('📊 Getting platform stats for admin:', admin.email);
      
      const [platformStats, schoolData, transactions] = await Promise.all([
        securePlatformAdminService.getPlatformStats(admin.email).catch(error => {
          console.error('Failed to get platform stats:', error);
          return { studentsCount: 0, teachersCount: 0, responsesCount: 0, subscriptionsCount: 0 };
        }),
        securePlatformAdminService.getSchoolData(admin.email).catch(error => {
          console.error('Failed to get school data:', error);
          return [];
        }),
        securePlatformAdminService.getTransactions(admin.email).catch(error => {
          console.error('Failed to get transactions:', error);
          return [];
        })
      ]);

      console.log('📊 Platform stats received:', platformStats);
      console.log('📊 School data received:', schoolData);
      console.log('📊 Transactions received:', transactions);

      // Filter out administrative/non-school entries
      const realSchools = schoolData.filter((school: any) => 
        school.name && 
        school.name !== 'Platform Administration' &&
        !school.name.toLowerCase().includes('admin')
      );

      const schoolStatsProcessed = realSchools.map((school: any) => ({
        school: school.name,
        total_teachers: school.teacher_count
      }));

      // Calculate monthly revenue from transactions
      const monthlyRevenue = securePlatformAdminService.calculateMonthlyRevenue(transactions);

      const newStats = {
        totalStudents: platformStats.studentsCount,
        totalTeachers: platformStats.teachersCount,
        totalSchools: realSchools.length,
        totalResponses: platformStats.responsesCount,
        totalSubscriptions: platformStats.subscriptionsCount,
        monthlyRevenue: monthlyRevenue,
      };

      console.log('📊 Final stats assembled:', newStats);
      
      setStats(newStats);
      setSchoolStats(schoolStatsProcessed);
      setFeedbackStats([]);
      setLastUpdated(new Date().toLocaleString());
      setRefreshKey(Date.now());
      setHasDataLoaded(true);
      
      toast.success('Dashboard data loaded successfully');
      
    } catch (error) {
      console.error('❌ Failed to fetch dashboard stats:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setFetchError(errorMessage);
      toast.error(`Failed to load data: ${errorMessage}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCleanupDemoData = async () => {
    if (!admin?.email) return;
    
    setIsCleaningUp(true);
    try {
      await securePlatformAdminService.cleanupDemoData(admin.email);
      toast.success('Demo data cleaned up successfully');
      
      // Refresh the dashboard data
      setTimeout(() => {
        fetchStats();
      }, 1000);
    } catch (error) {
      console.error('Failed to cleanup demo data:', error);
      toast.error('Failed to cleanup demo data');
    } finally {
      setIsCleaningUp(false);
    }
  };

  const handleRefresh = () => {
    setHasDataLoaded(false);
    fetchStats();
  };

  const handleDataChange = () => {
    console.log('📊 Data changed, refreshing dashboard...');
    setTimeout(() => {
      fetchStats();
    }, 1000);
  };

  const handleLogout = () => {
    logout();
    toast.info('Logged out successfully');
  };

  useEffect(() => {
    console.log('📊 Dashboard useEffect triggered', { isAuthenticated, admin: !!admin });
    if (isAuthenticated && admin?.email && !hasDataLoaded) {
      console.log('Loading dashboard data for admin:', admin.email);
      fetchStats();
    }
  }, [isAuthenticated, admin, hasDataLoaded]);

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
    console.log('📊 Access denied', { isAuthenticated, admin: !!admin });
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
              {isRefreshing ? 'Loading...' : 'Refresh'}
            </Button>
            <Button
              onClick={handleCleanupDemoData}
              disabled={isCleaningUp}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <TrashIcon className="w-4 h-4" />
              {isCleaningUp ? 'Cleaning...' : 'Cleanup Demo Data'}
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {admin?.email}</span>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOutIcon className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Error Display */}
        {fetchError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-red-800 font-medium">Error loading data:</div>
            <div className="text-red-600 text-sm mt-1">{fetchError}</div>
          </div>
        )}

        {/* Loading State */}
        {isRefreshing && !hasDataLoaded && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        )}

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
            <DiscountNotifications adminEmail={admin?.email} />
            <SubscriptionManagement />
            <TransactionManagement />
            <DiscountCodeManagement />
            <ResponsesManagement />
            <SchoolOverview schoolStats={schoolStats} />
            <FeedbackAnalytics feedbackStats={feedbackStats} />
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <SecurityMonitoring />
          </TabsContent>
        </Tabs>

        {/* Dashboard Footer with Status */}
        <div className="mt-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">
                Last updated: {lastUpdated || 'Never'} 
                <span className={`ml-2 ${hasDataLoaded ? 'text-green-600' : 'text-yellow-600'}`}>
                  {hasDataLoaded ? '✓ Data loaded' : '⏳ Loading...'}
                </span>
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4">
                <div>
                  <span className="font-medium text-gray-700">Monthly Revenue:</span>
                  <span className="ml-2 text-green-600">€{stats.monthlyRevenue.toFixed(2)}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Active Subscriptions:</span>
                  <span className="ml-2 text-blue-600">{stats.totalSubscriptions}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Total Users:</span>
                  <span className="ml-2 text-purple-600">{stats.totalStudents + stats.totalTeachers}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">System Status:</span>
                  <span className="ml-2 text-green-600">✅ Online</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PlatformAdminDashboard;
