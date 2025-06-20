import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStorage } from "@/hooks/useAuthStorage";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  SchoolIcon, 
  UsersIcon, 
  MessageSquareIcon, 
  HeartHandshakeIcon
} from "lucide-react";
import ClassScheduleForm from "@/components/ClassScheduleForm";
import InviteTeacherForm from "@/components/InviteTeacherForm";
import SchoolPsychologistForm from "@/components/SchoolPsychologistForm";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import ComplianceFooter from "@/components/ComplianceFooter";
import CookieConsent from "@/components/CookieConsent";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsCard from "@/components/dashboard/StatsCard";

interface Teacher {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

interface Feedback {
  id: string;
  student_name: string;
  what_went_well: string;
  suggestions: string;
  emotional_state: string;
  understanding: number;
  interest: number;
  educational_growth: number;
  submitted_at: string;
  class_schedule_id: string;
}

interface Subscription {
  id: string;
  school_name: string;
  status: string;
  plan_type: string;
  amount: number;
  current_period_end: string;
}

const AdminDashboard = () => {
  const { teacher, clearAuth } = useAuthStorage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!teacher || teacher.role !== 'admin') {
      navigate('/teacher-login');
      return;
    }
    loadData();
  }, [teacher, navigate]);

  const loadData = async () => {
    await Promise.all([loadTeachers(), loadFeedback(), loadSubscription()]);
    setIsLoading(false);
  };

  const loadTeachers = async () => {
    if (!teacher?.school) return;
    
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('school', teacher.school)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeachers(data || []);
      console.log('Loaded teachers:', data);
    } catch (error) {
      console.error('Error loading teachers:', error);
      toast({
        title: t('admin.error.title') || 'Error',
        description: t('admin.error.description') || 'Failed to load teachers',
        variant: "destructive",
      });
    }
  };

  const loadFeedback = async () => {
    if (!teacher?.school) return;
    
    try {
      // Get feedback from class schedules for this school
      const { data, error } = await supabase
        .from('feedback')
        .select(`
          *,
          class_schedules!inner(school)
        `)
        .eq('class_schedules.school', teacher.school)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setFeedback(data || []);
      console.log('Loaded feedback:', data);
    } catch (error) {
      console.error('Error loading feedback:', error);
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

  const handleLogout = () => {
    clearAuth();
    navigate('/teacher-login');
  };

  const handleSubscribe = () => {
    navigate('/pricing');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>{t('admin.loading') || 'Loading...'}</p>
        </div>
      </div>
    );
  }

  const regularTeachers = teachers.filter(t => t.role === 'teacher');
  const doctors = teachers.filter(t => t.role === 'doctor');

  return (
    <div className="min-h-screen bg-background">
      <CookieConsent />
      <DashboardHeader 
        title={`${teacher?.school} - ${t('admin.title') || 'Admin Dashboard'}`}
        userName={teacher?.name || ""}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {!subscription && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-800">{t('admin.subscription') || 'Subscription Required'}</CardTitle>
              <CardDescription className="text-yellow-700">
                You need an active subscription to access all admin features and invite teachers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleSubscribe}
                className="bg-primary hover:bg-primary/90"
              >
                {t('admin.subscribe') || 'Subscribe Now'}
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Teachers"
            value={regularTeachers.length}
            icon={UsersIcon}
          />
          
          <StatsCard
            title="Mental Health Professionals"
            value={doctors.length}
            icon={HeartHandshakeIcon}
          />

          <StatsCard
            title="Student Feedback"
            value={feedback.length}
            icon={MessageSquareIcon}
          />

          <StatsCard
            title={t('admin.subscription') || 'Subscription'}
            value={subscription ? 'Active' : 'Inactive'}
            icon={SchoolIcon}
          />
        </div>

        <Tabs defaultValue="schedule" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="schedule">{t('class.schedule') || 'Schedule'}</TabsTrigger>
            <TabsTrigger value="teachers">Teachers</TabsTrigger>
            <TabsTrigger value="feedback">Student Feedback</TabsTrigger>
            <TabsTrigger value="psychologists">Psychologists</TabsTrigger>
            <TabsTrigger value="invite">Invite Teacher</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-6">
            <ClassScheduleForm teacher={teacher} />
          </TabsContent>

          <TabsContent value="teachers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Staff Members ({teachers.length})</CardTitle>
                <CardDescription>
                  View all teachers and mental health professionals in your school
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teachers.map((teacherItem) => (
                    <div key={teacherItem.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{teacherItem.name}</h3>
                        <p className="text-sm text-muted-foreground">{teacherItem.email}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {teacherItem.role === 'doctor' ? 'Mental Health Professional' : teacherItem.role}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Joined: {new Date(teacherItem.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                  {teachers.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No staff members found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Feedback ({feedback.length})</CardTitle>
                <CardDescription>
                  All feedback submitted by students in your school
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {feedback.map((item) => (
                    <div key={item.id} className="p-4 border rounded-lg space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{item.student_name || 'Anonymous'}</h4>
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.submitted_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>Understanding: {item.understanding}/5</div>
                        <div>Interest: {item.interest}/5</div>
                        <div>Growth: {item.educational_growth}/5</div>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Emotional State:</span> {item.emotional_state}
                      </div>
                      {item.what_went_well && (
                        <div className="text-sm">
                          <span className="font-medium">What went well:</span> {item.what_went_well}
                        </div>
                      )}
                      {item.suggestions && (
                        <div className="text-sm">
                          <span className="font-medium">Suggestions:</span> {item.suggestions}
                        </div>
                      )}
                    </div>
                  ))}
                  {feedback.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No feedback submitted yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="psychologists" className="space-y-6">
            <SchoolPsychologistForm school={teacher?.school || ''} />
          </TabsContent>

          <TabsContent value="invite" className="space-y-6">
            <InviteTeacherForm 
              school={teacher?.school || ''}
              subscriptionId={subscription?.id}
              hasActiveSubscription={!!subscription}
              onInviteSent={loadTeachers}
            />
          </TabsContent>
        </Tabs>
      </main>
      <ComplianceFooter />
    </div>
  );
};

export default AdminDashboard;
