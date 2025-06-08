import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStorage } from "@/hooks/useAuthStorage";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  SchoolIcon, 
  LogOutIcon,
  CreditCardIcon
} from "lucide-react";
import ClassScheduleForm from "@/components/ClassScheduleForm";
import { useNavigate } from "react-router-dom";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import BulkScheduleUpload from "@/components/BulkScheduleUpload";
import MentalHealthArticles from "@/components/MentalHealthArticles";
import ComplianceFooter from "@/components/ComplianceFooter";
import CookieConsent from "@/components/CookieConsent";

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
    // Removed unnecessary refresh trigger - components handle their own state
    toast({
      title: t('common.success'),
      description: t('upload.uploadComplete'),
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <CookieConsent />
      <header className="bg-white border-b border-green-200 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <SchoolIcon className="w-8 h-8 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              {teacher?.role === 'doctor' ? t('dashboard.doctorOverview') : t('dashboard.teacherOverview')}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <span className="text-sm text-gray-600">{t('admin.welcome')}, {teacher?.name}</span>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2 border-green-200 text-green-700 hover:bg-green-50"
            >
              <LogOutIcon className="w-4 h-4" />
              {t('auth.logout')}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {!subscription && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-800">
                <CreditCardIcon className="w-5 h-5" />
                {t('admin.subscription')}
              </CardTitle>
              <CardDescription className="text-yellow-700">
                {t('teacher.subscriptionDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleCreateCheckout}
                disabled={isCreatingCheckout}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isCreatingCheckout ? t('pricing.processing') : t('dashboard.subscribeNow')}
              </Button>
            </CardContent>
          </Card>
        )}

        {subscription && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">{t('admin.subscription')}</CardTitle>
              <CardDescription className="text-green-700">
                {`${t('teacher.activePlan')} ${subscription.plan_type} - ${t('teacher.renewsOn')} ${new Date(subscription.current_period_end).toLocaleDateString()}`}
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-green-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('auth.school')}</CardTitle>
              <SchoolIcon className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">{teacher?.school}</div>
            </CardContent>
          </Card>
          
          <Card className="border-green-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('teacher.role')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold capitalize">
                {teacher?.role === 'doctor' ? t('teacher.mentalHealthProfessional') : teacher?.role}
              </div>
              {teacher?.role === 'doctor' && teacher?.specialization && (
                <div className="text-sm text-gray-600 mt-1">{teacher.specialization}</div>
              )}
            </CardContent>
          </Card>

          <Card className="border-green-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {teacher?.role === 'doctor' ? t('teacher.availability') : t('admin.subscription')}
              </CardTitle>
              <CreditCardIcon className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">
                {teacher?.role === 'doctor' 
                  ? (teacher?.is_available ? t('teacher.available') : t('teacher.busy'))
                  : (subscription ? t('teacher.active') : t('teacher.inactive'))
                }
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue={teacher?.role === 'doctor' ? 'chat-sessions' : 'schedule'} className="space-y-6">
          <TabsList className="bg-green-50 border-green-200">
            {teacher?.role === 'doctor' ? (
              <>
                <TabsTrigger value="chat-sessions" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">{t('teacher.liveChatSessions')}</TabsTrigger>
                <TabsTrigger value="articles" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">{t('articles.mentalHealth')}</TabsTrigger>
              </>
            ) : (
              <>
                <TabsTrigger value="schedule" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">{t('teacher.classSchedule')}</TabsTrigger>
                <TabsTrigger value="bulk-upload" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">{t('teacher.bulkUpload')}</TabsTrigger>
                {teacher?.role === 'admin' && (
                  <TabsTrigger value="articles" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">{t('articles.mentalHealth')}</TabsTrigger>
                )}
              </>
            )}
          </TabsList>

          {teacher?.role === 'doctor' ? (
            <>
              <TabsContent value="chat-sessions" className="space-y-6">
                <Card className="border-green-100">
                  <CardHeader>
                    <CardTitle>{t('teacher.liveChatSessions')}</CardTitle>
                    <CardDescription>
                      {t('teacher.manageChatSessions')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-600 mb-4">{t('teacher.noActiveSessions')}</p>
                    <p className="text-sm text-gray-500">{t('teacher.studentsCanConnect')}</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="articles" className="space-y-6">
                {subscription ? (
                  <MentalHealthArticles teacher={teacher} />
                ) : (
                  <Card className="border-green-100">
                    <CardHeader>
                      <CardTitle>{t('articles.mentalHealth')}</CardTitle>
                      <CardDescription>
                        {t('articles.subscriptionRequired')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center py-8">
                      <p className="text-gray-600 mb-4">{t('articles.subscriptionRequired')}</p>
                      <Button 
                        onClick={handleCreateCheckout}
                        disabled={isCreatingCheckout}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {isCreatingCheckout ? t('pricing.processing') : t('teacher.subscribeToContinue')}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </>
          ) : (
            <>
              <TabsContent value="schedule" className="space-y-6">
                <ClassScheduleForm teacher={teacher} />
              </TabsContent>

              <TabsContent value="bulk-upload" className="space-y-6">
                <BulkScheduleUpload 
                  teacher={teacher} 
                  onUploadComplete={handleScheduleUploadComplete}
                />
              </TabsContent>

              {teacher?.role === 'admin' && (
                <TabsContent value="articles" className="space-y-6">
                  {subscription ? (
                    <MentalHealthArticles teacher={teacher} />
                  ) : (
                    <Card className="border-green-100">
                      <CardHeader>
                        <CardTitle>{t('articles.mentalHealth')}</CardTitle>
                        <CardDescription>
                          {t('articles.subscriptionRequired')}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="text-center py-8">
                        <p className="text-gray-600 mb-4">{t('articles.subscriptionRequired')}</p>
                        <Button 
                          onClick={handleCreateCheckout}
                          disabled={isCreatingCheckout}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {isCreatingCheckout ? t('pricing.processing') : t('teacher.subscribeToContinue')}
                        </Button>
                      </CardContent>
                    </Card>
                  )}
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
