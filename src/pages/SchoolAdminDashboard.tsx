
import { useState, useEffect, Suspense, lazy } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStorage } from "@/hooks/useAuthStorage";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  UsersIcon, 
  BookOpenIcon, 
  AlertTriangleIcon,
  CalendarIcon,
  MessageSquareIcon,
  BarChartIcon,
  SettingsIcon,
  UserPlusIcon
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import ComplianceFooter from "@/components/ComplianceFooter";
import CookieConsent from "@/components/CookieConsent";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsCard from "@/components/dashboard/StatsCard";
import SubscriptionBanner from "@/components/dashboard/SubscriptionBanner";
import ActiveSubscriptionCard from "@/components/dashboard/ActiveSubscriptionCard";
import { DashboardSkeleton, TabContentSkeleton } from "@/components/ui/loading-skeleton";
import { isUniversalDemoAccount, getDemoSubscription } from "@/services/demoAccountManager";

// Lazy load tab components
const MentalHealthTab = lazy(() => import("@/components/dashboard/teacher/MentalHealthTab"));
const WeeklySummariesTab = lazy(() => import("@/components/dashboard/teacher/WeeklySummariesTab"));
const ArticlesTab = lazy(() => import("@/components/dashboard/teacher/ArticlesTab"));

interface Subscription {
  id: string;
  school_name: string;
  status: string;
  plan_type: string;
  amount: number;
  current_period_end: string;
}

interface SchoolStats {
  totalTeachers: number;
  totalStudents: number;
  totalMentalHealthStaff: number;
  pendingAlerts: number;
  weeklyFeedback: number;
  upcomingClasses: number;
}

const SchoolAdminDashboard = () => {
  const { teacher, clearAuth } = useAuthStorage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  const [stats, setStats] = useState<SchoolStats>({
    totalTeachers: 0,
    totalStudents: 0,
    totalMentalHealthStaff: 0,
    pendingAlerts: 0,
    weeklyFeedback: 1,
    upcomingClasses: 0
  });

  // 🎯 DEMO ACCOUNT CHECK - This is the master check
  const isDemoAccount = isUniversalDemoAccount(teacher);

  useEffect(() => {
    if (!teacher) {
      navigate('/teacher-login');
      return;
    }
    
    if (teacher.role !== 'admin') {
      navigate('/teacher-dashboard');
      return;
    }
    
    loadData();
  }, [teacher, navigate]);

  const loadData = async () => {
    try {
      // 🎯 DEMO ACCOUNTS GET INSTANT ACCESS AND MOCK DATA
      if (isDemoAccount) {
        console.log('🎯 DEMO ACCOUNT DETECTED - PROVIDING MOCK ADMIN DATA');
        const demoSub = getDemoSubscription(teacher?.school);
        setSubscription(demoSub);
        setStats({
          totalTeachers: 5,
          totalStudents: 120,
          totalMentalHealthStaff: 2,
          pendingAlerts: 3,
          weeklyFeedback: 15,
          upcomingClasses: 8
        });
        setIsLoading(false);
        return;
      }

      await Promise.all([loadSubscription(), loadStats()]);
    } catch (error) {
      console.error('Error loading admin dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSubscription = async () => {
    if (!teacher?.school) return;
    
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('school_name', teacher.school)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading subscription:', error);
      } else {
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    }
  };

  const loadStats = async () => {
    if (!teacher?.school) return;

    try {
      const [teachersResult, studentsResult, psychResult] = await Promise.all([
        supabase.from('teachers').select('id', { count: 'exact' }).eq('school', teacher.school),
        supabase.from('students').select('id', { count: 'exact' }).eq('school', teacher.school),
        supabase.from('school_psychologists').select('id', { count: 'exact' }).eq('school', teacher.school)
      ]);

      setStats({
        totalTeachers: teachersResult.count || 0,
        totalStudents: studentsResult.count || 0,
        totalMentalHealthStaff: psychResult.count || 0,
        pendingAlerts: 0,
        weeklyFeedback: 1,
        upcomingClasses: 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/teacher-login');
  };

  const handleCreateCheckout = async () => {
    // 🎯 DEMO ACCOUNTS DON'T NEED SUBSCRIPTIONS - THEY HAVE EVERYTHING
    if (isDemoAccount) {
      toast({
        title: "Demo Account",
        description: "Demo accounts have unlimited access to all features!",
      });
      return;
    }

    if (!teacher?.email || !teacher?.school) {
      toast({
        title: t('common.error'),
        description: t('teacher.missingInfo'),
        variant: "destructive",
      });
      return;
    }

    setIsCreatingCheckout(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          teacherCount: 1,
          discountCode: null,
          discountPercent: 0,
          teacherEmail: teacher.email,
          teacherName: teacher.name,
          schoolName: teacher.school
        }
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: t('common.error'),
        description: `${t('teacher.checkoutFailed')}: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsCreatingCheckout(false);
    }
  };

  const handleInviteTeacher = () => {
    // 🎯 DEMO ACCOUNTS CAN ACCESS ALL FEATURES
    if (isDemoAccount) {
      toast({
        title: "Demo Feature",
        description: "In a real environment, this would open the teacher invitation form.",
      });
      return;
    }

    toast({
      title: "Feature Coming Soon",
      description: "Teacher invitation feature will be available soon",
      variant: "destructive",
    });
  };

  // 🎯 FOR DEMO ACCOUNTS: ALWAYS SHOW AS HAVING ACTIVE SUBSCRIPTION
  const hasActiveSubscription = subscription || isDemoAccount;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <CookieConsent />
        <DashboardHeader 
          title=""
          userName=""
          onLogout={handleLogout}
        />
        <main className="max-w-7xl mx-auto p-6">
          <DashboardSkeleton />
        </main>
        <ComplianceFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <CookieConsent />
      <DashboardHeader 
        title={t('dashboard.adminOverview')}
        userName={teacher?.name || ""}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* 🎯 DEMO ACCOUNTS ALWAYS SHOW ACTIVE SUBSCRIPTION - NO PAYWALL */}
        {!hasActiveSubscription ? (
          <SubscriptionBanner 
            onSubscribe={handleCreateCheckout}
            isCreatingCheckout={isCreatingCheckout}
          />
        ) : (
          <ActiveSubscriptionCard 
            plan={subscription?.plan_type || 'premium'} 
            expiryDate={subscription?.current_period_end || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()} 
          />
        )}
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatsCard
            title={t('dashboard.teachers')}
            value={stats.totalTeachers}
            icon={UsersIcon}
          />
          
          <StatsCard
            title={t('dashboard.students')}
            value={stats.totalStudents}
            icon={BookOpenIcon}
          />

          <StatsCard
            title={t('dashboard.mentalHealthStaff')}
            value={stats.totalMentalHealthStaff}
            icon={UsersIcon}
          />

          <StatsCard
            title={t('dashboard.pendingAlerts')}
            value={stats.pendingAlerts}
            icon={AlertTriangleIcon}
          />

          <StatsCard
            title={t('dashboard.weeklyFeedback')}
            value={stats.weeklyFeedback}
            icon={MessageSquareIcon}
          />

          <StatsCard
            title={t('dashboard.upcomingClasses')}
            value={stats.upcomingClasses}
            icon={CalendarIcon}
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">{t('dashboard.overview')}</TabsTrigger>
            <TabsTrigger value="staff">{t('dashboard.staffManagement')}</TabsTrigger>
            <TabsTrigger value="alerts">{t('dashboard.mentalHealthAlerts')}</TabsTrigger>
            <TabsTrigger value="analytics">{t('dashboard.analytics')}</TabsTrigger>
            <TabsTrigger value="articles">{t('articles.mentalHealth')}</TabsTrigger>
            <TabsTrigger value="settings">{t('dashboard.settings')}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangleIcon className="w-5 h-5" />
                    {t('dashboard.recentAlerts')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isDemoAccount ? (
                    <div className="space-y-2">
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-sm font-medium">Student: John Doe (Grade 8)</p>
                        <p className="text-xs text-gray-600">Concerning language detected in feedback</p>
                      </div>
                      <div className="p-3 bg-red-50 border border-red-200 rounded">
                        <p className="text-sm font-medium">Student: Jane Smith (Grade 7)</p>
                        <p className="text-xs text-gray-600">High-severity mental health alert</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No recent alerts</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChartIcon className="w-5 h-5" />
                    {t('dashboard.quickStats')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Active Teachers</span>
                      <span className="font-medium">{stats.totalTeachers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Total Students</span>
                      <span className="font-medium">{stats.totalStudents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">This Week's Feedback</span>
                      <span className="font-medium">{stats.weeklyFeedback}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="staff" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UsersIcon className="w-5 h-5" />
                  {t('dashboard.staffManagement')}
                </CardTitle>
                <CardDescription>
                  Manage teachers and staff at your school
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleInviteTeacher}
                  className="w-full"
                >
                  <UserPlusIcon className="w-4 h-4 mr-2" />
                  {t('dashboard.inviteNewTeacher')}
                </Button>
                
                {!isDemoAccount && (
                  <div className="mt-6 text-center">
                    <p className="text-muted-foreground">
                      Staff management features will be available soon
                    </p>
                  </div>
                )}

                {isDemoAccount && (
                  <div className="mt-6 space-y-4">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">Current Staff</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium">Demo Teacher</p>
                            <p className="text-sm text-gray-600">demoteacher@demo.com</p>
                          </div>
                          <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium">Demo Doctor</p>
                            <p className="text-sm text-gray-600">demodoc@demo.com</p>
                          </div>
                          <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <Suspense fallback={<TabContentSkeleton />}>
              <MentalHealthTab
                teacher={teacher}
                subscription={hasActiveSubscription ? (subscription || getDemoSubscription(teacher?.school)) : null}
                onCreateCheckout={handleCreateCheckout}
                isCreatingCheckout={isCreatingCheckout}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChartIcon className="w-5 h-5" />
                  {t('dashboard.analytics')}
                </CardTitle>
                <CardDescription>
                  School performance and feedback analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isDemoAccount ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Average Feedback Score</h4>
                        <p className="text-2xl font-bold text-green-600">4.2/5</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Student Engagement</h4>
                        <p className="text-2xl font-bold text-blue-600">87%</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Teacher Satisfaction</h4>
                        <p className="text-2xl font-bold text-purple-600">92%</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Analytics features will be available soon</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="articles" className="space-y-6">
            <Suspense fallback={<TabContentSkeleton />}>
              <ArticlesTab
                teacher={teacher}
                subscription={hasActiveSubscription ? (subscription || getDemoSubscription(teacher?.school)) : null}
                onCreateCheckout={handleCreateCheckout}
                isCreatingCheckout={isCreatingCheckout}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="w-5 h-5" />
                  {t('dashboard.settings')}
                </CardTitle>
                <CardDescription>
                  School and account settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isDemoAccount ? (
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">School Information</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">School Name:</span>
                          <span className="font-medium">{teacher?.school}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Administrator:</span>
                          <span className="font-medium">{teacher?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Subscription:</span>
                          <span className="font-medium text-green-600">Premium</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Settings features will be available soon</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <ComplianceFooter />
    </div>
  );
};

export default SchoolAdminDashboard;
