
import { useState, useEffect, Suspense, lazy } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStorage } from "@/hooks/useAuthStorage";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  SchoolIcon, 
  CreditCardIcon
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

// Lazy load tab components
const ScheduleTab = lazy(() => import("@/components/dashboard/teacher/ScheduleTab"));
const BulkUploadTab = lazy(() => import("@/components/dashboard/teacher/BulkUploadTab"));
const WeeklySummariesTab = lazy(() => import("@/components/dashboard/teacher/WeeklySummariesTab"));
const MentalHealthTab = lazy(() => import("@/components/dashboard/teacher/MentalHealthTab"));
const ArticlesTab = lazy(() => import("@/components/dashboard/teacher/ArticlesTab"));
const FeedbackTab = lazy(() => import("@/components/dashboard/FeedbackTab"));

interface Subscription {
  id: string;
  school_name: string;
  status: string;
  plan_type: string;
  amount: number;
  current_period_end: string;
}

const TeacherDashboard = () => {
  const { teacher, clearAuth } = useAuthStorage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);

  useEffect(() => {
    if (!teacher) {
      navigate('/teacher-login');
      return;
    }
    loadSubscription();
  }, [teacher, navigate]);

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
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/teacher-login');
  };

  const handleCreateCheckout = async () => {
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
      console.log('Creating checkout session for teacher:', teacher.email);
      
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

      if (error) {
        console.error('Checkout error:', error);
        throw error;
      }

      if (data?.url) {
        console.log('Redirecting to Stripe checkout:', data.url);
        window.open(data.url, '_blank');
      } else {
        throw new Error('No checkout URL received');
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

  const handleScheduleUploadComplete = () => {
    toast({
      title: t('common.success'),
      description: t('upload.uploadComplete'),
    });
  };

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
        title={teacher?.role === 'doctor' ? t('dashboard.doctorOverview') : t('dashboard.teacherOverview')}
        userName={teacher?.name || ""}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Subscription Status */}
        {!subscription ? (
          <SubscriptionBanner 
            isDoctor={teacher?.role === 'doctor'} 
            onSubscribe={handleCreateCheckout}
            isCreatingCheckout={isCreatingCheckout}
          />
        ) : (
          <ActiveSubscriptionCard 
            plan={subscription.plan_type} 
            expiryDate={subscription.current_period_end} 
          />
        )}
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title={t('auth.school')}
            value={teacher?.school || ""}
            icon={SchoolIcon}
          />
          
          <StatsCard
            title={t('login.teacher.role')}
            value={teacher?.role === 'doctor' ? t('teacher.mentalHealthProfessional') : (teacher?.role || "")}
            icon={SchoolIcon}
          />

          <StatsCard
            title={teacher?.role === 'doctor' ? t('teacher.availability') : t('admin.subscription')}
            value={teacher?.role === 'doctor' 
              ? (teacher?.is_available ? t('teacher.available') : t('teacher.busy'))
              : (subscription ? t('teacher.active') : t('teacher.inactive'))}
            icon={CreditCardIcon}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue={teacher?.role === 'doctor' ? 'weekly-summaries' : 'schedule'} className="space-y-6">
          <TabsList>
            {teacher?.role === 'doctor' ? (
              <>
                <TabsTrigger value="weekly-summaries">{t('dashboard.weeklySummaries')}</TabsTrigger>
                <TabsTrigger value="mental-health">{t('dashboard.mentalHealthSupport')}</TabsTrigger>
              </>
            ) : (
              <>
                <TabsTrigger value="schedule">{t('class.schedule')}</TabsTrigger>
                <TabsTrigger value="feedback">{t('dashboard.feedback')}</TabsTrigger>
                <TabsTrigger value="bulk-upload">{t('upload.bulkUpload')}</TabsTrigger>
                {teacher?.role === 'admin' && (
                  <TabsTrigger value="articles">{t('articles.mentalHealth')}</TabsTrigger>
                )}
              </>
            )}
          </TabsList>

          {teacher?.role === 'doctor' ? (
            <>
              <TabsContent value="weekly-summaries" className="space-y-6">
                <Suspense fallback={<TabContentSkeleton />}>
                  <WeeklySummariesTab
                    school={teacher?.school}
                    subscription={subscription}
                    onCreateCheckout={handleCreateCheckout}
                    isCreatingCheckout={isCreatingCheckout}
                  />
                </Suspense>
              </TabsContent>
              
              <TabsContent value="mental-health" className="space-y-6">
                <Suspense fallback={<TabContentSkeleton />}>
                  <MentalHealthTab
                    teacher={teacher}
                    subscription={subscription}
                    onCreateCheckout={handleCreateCheckout}
                    isCreatingCheckout={isCreatingCheckout}
                  />
                </Suspense>
              </TabsContent>
            </>
          ) : (
            <>
              <TabsContent value="schedule" className="space-y-6">
                <Suspense fallback={<TabContentSkeleton />}>
                  <ScheduleTab teacher={teacher} />
                </Suspense>
              </TabsContent>

              <TabsContent value="feedback" className="space-y-6">
                <Suspense fallback={<TabContentSkeleton />}>
                  <FeedbackTab />
                </Suspense>
              </TabsContent>

              <TabsContent value="bulk-upload" className="space-y-6">
                <Suspense fallback={<TabContentSkeleton />}>
                  <BulkUploadTab 
                    teacher={teacher} 
                    onUploadComplete={handleScheduleUploadComplete}
                  />
                </Suspense>
              </TabsContent>

              {teacher?.role === 'admin' && (
                <TabsContent value="articles" className="space-y-6">
                  <Suspense fallback={<TabContentSkeleton />}>
                    <ArticlesTab
                      teacher={teacher}
                      subscription={subscription}
                      onCreateCheckout={handleCreateCheckout}
                      isCreatingCheckout={isCreatingCheckout}
                    />
                  </Suspense>
                </TabsContent>
              )}
            </>
          )}
        </Tabs>
      </main>
      <ComplianceFooter />
    </div>
  );
};

export default TeacherDashboard;
