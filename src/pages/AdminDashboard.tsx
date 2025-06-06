import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  SchoolIcon, 
  UsersIcon, 
  MessageSquareIcon, 
  BarChart3Icon, 
  LogOutIcon,
  CreditCardIcon
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import LanguageSwitcher from "@/components/LanguageSwitcher";

interface Teacher {
  id: string;
  name: string;
  email: string;
  school: string;
  role: string;
  created_at: string;
}

interface FeedbackSummary {
  teacher: string;
  subject: string;
  class_date: string;
  total_responses: number;
  avg_understanding: number;
  avg_interest: number;
  avg_growth: number;
}

interface Subscription {
  id: string;
  school_name: string;
  status: string;
  amount: number;
  current_period_end: string;
}

const AdminDashboard = () => {
  const { teacher, logout } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [feedbackSummary, setFeedbackSummary] = useState<FeedbackSummary[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!teacher || teacher.role !== 'admin') {
      navigate('/teacher-login');
      return;
    }
    loadDashboardData();
  }, [teacher, navigate]);

  const loadDashboardData = async () => {
    try {
      // Load teachers from the same school
      const { data: teachersData, error: teachersError } = await supabase
        .from('teachers')
        .select('*')
        .eq('school', teacher?.school);

      if (teachersError) throw teachersError;
      setTeachers(teachersData || []);

      // Load feedback summary - transform the data to match our interface
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedback_analytics')
        .select('*')
        .eq('school', teacher?.school)
        .order('class_date', { ascending: false })
        .limit(10);

      if (feedbackError) throw feedbackError;
      
      // Transform the data to match FeedbackSummary interface
      const transformedFeedback: FeedbackSummary[] = (feedbackData || []).map(item => ({
        teacher: item.lesson_topic || 'Unknown Teacher', // Using lesson_topic as teacher name fallback
        subject: item.subject,
        class_date: item.class_date,
        total_responses: item.total_responses,
        avg_understanding: item.avg_understanding,
        avg_interest: item.avg_interest,
        avg_growth: item.avg_growth
      }));
      
      setFeedbackSummary(transformedFeedback);

      // Load subscription info
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('school_name', teacher?.school)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!subscriptionError && subscriptionData) {
        setSubscription(subscriptionData);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: t('admin.error.title'),
        description: t('admin.error.description'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error("Error opening customer portal:", error);
      toast({
        title: "Error",
        description: "Failed to open subscription management. Please try again.",
        variant: "destructive",
      });
    }
  };

  const totalFeedback = feedbackSummary.reduce((sum, item) => sum + item.total_responses, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>{t('admin.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <SchoolIcon className="w-8 h-8 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-900">{t('admin.title')}</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{t('admin.welcome')}, {teacher?.name}</span>
            <LanguageSwitcher />
            <Button
              onClick={logout}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOutIcon className="w-4 h-4" />
              {t('admin.logout')}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Subscription Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCardIcon className="w-5 h-5" />
              {t('admin.subscription')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subscription ? (
              <div className="flex justify-between items-center">
                <div>
                  <Badge variant={subscription.status === 'active' ? 'default' : 'destructive'}>
                    {subscription.status}
                  </Badge>
                  <p className="text-sm text-gray-600 mt-1">
                    ${(subscription.amount / 100).toFixed(2)}/month
                  </p>
                  {subscription.current_period_end && (
                    <p className="text-xs text-gray-500">
                      Next billing: {new Date(subscription.current_period_end).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <Button onClick={handleManageSubscription} variant="outline">
                  {t('dashboard.manageSubscription')}
                </Button>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <p className="text-gray-600">No active subscription</p>
                <Button 
                  onClick={() => navigate('/pricing')}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {t('admin.subscribe')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('admin.stats.teachers')}</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teachers.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('admin.stats.feedback')}</CardTitle>
              <MessageSquareIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalFeedback}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">School</CardTitle>
              <SchoolIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{teacher?.school}</div>
            </CardContent>
          </Card>
        </div>

        {/* Teachers Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="w-5 h-5" />
              {t('admin.teachers.title')}
            </CardTitle>
            <CardDescription>{t('admin.teachers.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            {teachers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell className="font-medium">{teacher.name}</TableCell>
                      <TableCell>{teacher.email}</TableCell>
                      <TableCell>
                        <Badge variant={teacher.role === 'admin' ? 'default' : 'secondary'}>
                          {teacher.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(teacher.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-gray-500 py-8">{t('admin.teachers.empty')}</p>
            )}
          </CardContent>
        </Card>

        {/* Feedback Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3Icon className="w-5 h-5" />
              {t('admin.feedback.title')}
            </CardTitle>
            <CardDescription>{t('admin.feedback.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            {feedbackSummary.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('admin.feedback.teacher')}</TableHead>
                    <TableHead>{t('admin.feedback.subject')}</TableHead>
                    <TableHead>{t('admin.feedback.date')}</TableHead>
                    <TableHead className="text-center">{t('admin.feedback.scores')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedbackSummary.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.teacher}</TableCell>
                      <TableCell>{item.subject}</TableCell>
                      <TableCell>{new Date(item.class_date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-center">
                        <div className="text-xs space-y-1">
                          <div>{t('admin.feedback.understanding')}: {item.avg_understanding?.toFixed(1) || 'N/A'}</div>
                          <div>{t('admin.feedback.interest')}: {item.avg_interest?.toFixed(1) || 'N/A'}</div>
                          <div>{t('admin.feedback.growth')}: {item.avg_growth?.toFixed(1) || 'N/A'}</div>
                          <div className="text-gray-500">({item.total_responses} {t('admin.feedback.responses')})</div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-gray-500 py-8">{t('admin.feedback.empty')}</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
