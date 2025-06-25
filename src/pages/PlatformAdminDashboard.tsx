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
import LanguageSwitcher from "@/components/LanguageSwitcher";
import GDPRAdminDashboard from "@/components/platform-admin/GDPRAdminDashboard";
import { securePlatformAdminService } from "@/services/securePlatformAdminService";
import { useLanguage } from "@/contexts/LanguageContext";

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

const PlatformAdminDashboard = () => {
  const { admin, isLoading: adminLoading, logout, isAuthenticated } = usePlatformAdmin();
  const { t } = useLanguage();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalSchools: 0,
    totalResponses: 0,
    totalSubscriptions: 0,
    monthlyRevenue: 0,
  });
  const [schoolStats, setSchoolStats] = useState<SchoolStats[]>([]);
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
      <div className="min-h-screen bg-gradient-to-br from-brand-teal/10 via-white to-brand-orange/10 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal"></div>
        <span className="ml-3 text-brand-dark">{t('platformAdmin.loadingAdminSession')}</span>
      </div>
    );
  }

  if (!isAuthenticated || !admin) {
    console.log('📊 Access denied', { isAuthenticated, admin: !!admin });
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-teal/10 via-white to-brand-orange/10 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">{t('platformAdmin.adminAccessDenied')}</div>
          <p className="text-gray-600">{t('platformAdmin.pleaseLoginAdmin')}</p>
          <a href="/console" className="text-blue-500 hover:text-blue-700 underline mt-4 inline-block">
            {t('platformAdmin.goToAdminLogin')}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-teal/10 via-white to-brand-orange/10" key={`dashboard-${refreshKey}`}>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header - matching teacher dashboard style */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 mb-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-brand-dark mb-2">
                {t('platformAdmin.title')}
              </h1>
              <p className="text-brand-dark/70 text-lg">
                {t('platformAdmin.welcome')}, {admin?.email} - {t('platformAdmin.platformAdministrator')}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                variant="outline"
                size="sm"
                className="border-brand-orange/30 hover:bg-brand-orange/10 flex items-center gap-2"
              >
                <RefreshCwIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? t('platformAdmin.loading') : t('platformAdmin.refresh')}
              </Button>
              <Button
                onClick={handleCleanupDemoData}
                disabled={isCleaningUp}
                variant="outline"
                size="sm"
                className="border-red-300 hover:bg-red-50 text-red-600 hover:text-red-700 flex items-center gap-2"
              >
                <TrashIcon className="w-4 h-4" />
                {isCleaningUp ? t('platformAdmin.cleaning') : t('platformAdmin.cleanupDemoData')}
              </Button>
              <LanguageSwitcher />
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="border-brand-orange/30 hover:bg-brand-orange/10"
              >
                <LogOutIcon className="w-4 h-4 mr-2" />
                {t('platformAdmin.logout')}
              </Button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {fetchError && (
          <div className="bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-xl p-4 mb-6">
            <div className="text-red-800 font-medium">{t('platformAdmin.errorLoadingData')}</div>
            <div className="text-red-600 text-sm mt-1">{fetchError}</div>
          </div>
        )}

        {/* Loading State */}
        {isRefreshing && !hasDataLoaded && (
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-8 mb-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal mx-auto mb-4"></div>
              <p className="text-brand-dark/70">{t('platformAdmin.loadingDashboardData')}</p>
            </div>
          </div>
        )}

        {/* Stats Cards - matching student dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-teal/10 rounded-lg flex items-center justify-center">
                  <UsersIcon className="w-6 h-6 text-brand-teal" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('platformAdmin.totalStudents')}</p>
                  <p className="text-lg font-semibold text-brand-dark">{stats.totalStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-orange/10 rounded-lg flex items-center justify-center">
                  <SchoolIcon className="w-6 h-6 text-brand-orange" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('platformAdmin.totalSchools')}</p>
                  <p className="text-lg font-semibold text-brand-dark">{stats.totalSchools}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-teal/10 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-brand-teal" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('admin.totalTeachers')}</p>
                  <p className="text-lg font-semibold text-brand-dark">{stats.totalTeachers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-orange/10 rounded-lg flex items-center justify-center">
                  <MessageSquareIcon className="w-6 h-6 text-brand-orange" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('platformAdmin.totalResponses')}</p>
                  <p className="text-lg font-semibold text-brand-dark">{stats.totalResponses}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content with Tabs - matching student dashboard style */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 overflow-hidden">
          <Tabs defaultValue="management" className="w-full">
            {/* Tab Navigation - updated to include GDPR tab */}
            <div className="bg-white border-b border-gray-200">
              <TabsList className="h-auto p-0 bg-transparent rounded-none w-full justify-start overflow-x-auto">
                <TabsTrigger 
                  value="management" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-orange data-[state=active]:to-brand-teal data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-brand-dark border-b-2 border-transparent data-[state=active]:border-brand-teal rounded-none px-6 py-4 font-medium transition-all duration-200 whitespace-nowrap"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  {t('platformAdmin.userManagement')}
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-orange data-[state=active]:to-brand-teal data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-brand-dark border-b-2 border-transparent data-[state=active]:border-brand-teal rounded-none px-6 py-4 font-medium transition-all duration-200 whitespace-nowrap"
                >
                  <MessageSquareIcon className="w-4 h-4 mr-2" />
                  {t('platformAdmin.analyticsReports')}
                </TabsTrigger>
                <TabsTrigger 
                  value="gdpr" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-orange data-[state=active]:to-brand-teal data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-brand-dark border-b-2 border-transparent data-[state=active]:border-brand-teal rounded-none px-6 py-4 font-medium transition-all duration-200 whitespace-nowrap"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {t('platformAdmin.gdprPrivacy')}
                </TabsTrigger>
                <TabsTrigger 
                  value="security" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-orange data-[state=active]:to-brand-teal data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-brand-dark border-b-2 border-transparent data-[state=active]:border-brand-teal rounded-none px-6 py-4 font-medium transition-all duration-200 whitespace-nowrap"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {t('platformAdmin.security')}
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Existing tabs - keep existing code */}
              <TabsContent value="management" className="mt-0">
                <Tabs defaultValue="schools" className="space-y-4">
                  <TabsList className="bg-gray-100/50">
                    <TabsTrigger value="schools">{t('platformAdmin.schools')}</TabsTrigger>
                    <TabsTrigger value="teachers">{t('admin.totalTeachers')}</TabsTrigger>
                    <TabsTrigger value="students">{t('platformAdmin.students')}</TabsTrigger>
                    <TabsTrigger value="doctors">{t('platformAdmin.doctors')}</TabsTrigger>
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

              <TabsContent value="analytics" className="mt-0">
                <div className="space-y-6">
                  <DiscountNotifications adminEmail={admin?.email} />
                  <SubscriptionManagement />
                  <TransactionManagement />
                  <DiscountCodeManagement />
                  <ResponsesManagement />
                  <SchoolOverview schoolStats={schoolStats} />
                  <FeedbackAnalytics />
                </div>
              </TabsContent>

              {/* New GDPR Tab */}
              <TabsContent value="gdpr" className="mt-0">
                <GDPRAdminDashboard />
              </TabsContent>

              <TabsContent value="security" className="mt-0">
                <SecurityMonitoring />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Dashboard Footer with Status - matching style */}
        <div className="mt-8">
          <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
            <CardContent className="pt-6">
              <p className="text-sm text-brand-dark/70 mb-4">
                {t('platformAdmin.lastUpdated')} {lastUpdated || t('platformAdmin.never')} 
                <span className={`ml-2 ${hasDataLoaded ? 'text-green-600' : 'text-yellow-600'}`}>
                  {hasDataLoaded ? t('platformAdmin.dataLoaded') : t('platformAdmin.loadingStatus')}
                </span>
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-brand-dark">{t('platformAdmin.monthlyRevenue')}</span>
                  <span className="ml-2 text-green-600">€{stats.monthlyRevenue.toFixed(2)}</span>
                </div>
                <div>
                  <span className="font-medium text-brand-dark">{t('platformAdmin.activeSubscriptions')}</span>
                  <span className="ml-2 text-brand-teal">{stats.totalSubscriptions}</span>
                </div>
                <div>
                  <span className="font-medium text-brand-dark">{t('platformAdmin.totalUsers')}</span>
                  <span className="ml-2 text-brand-orange">{stats.totalStudents + stats.totalTeachers}</span>
                </div>
                <div>
                  <span className="font-medium text-brand-dark">{t('platformAdmin.systemStatus')}</span>
                  <span className="ml-2 text-green-600">{t('platformAdmin.online')}</span>
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
