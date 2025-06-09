
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuthStorage } from "@/hooks/useAuthStorage";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  SchoolIcon, 
  CalendarIcon, 
  LogOutIcon,
  BookOpenIcon,
  HeartHandshakeIcon
} from "lucide-react";
import LessonFeedbackForm from "@/components/LessonFeedbackForm";
import WeeklySummary from "@/components/WeeklySummary";
import CompiledWeeklySummary from "@/components/CompiledWeeklySummary";
import PsychologistInfo from "@/components/PsychologistInfo";
import LiveChatWidget from "@/components/LiveChatWidget";
import { useNavigate } from "react-router-dom";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import ComplianceFooter from "@/components/ComplianceFooter";
import CookieConsent from "@/components/CookieConsent";

interface ClassSchedule {
  id: string;
  subject: string;
  grade: string;
  lesson_topic: string;
  class_date: string;
  class_time: string;
  duration_minutes: number;
  teacher_id: string;
  school: string;
}

interface SchoolPsychologist {
  id: string;
  name: string;
  email: string;
  phone?: string;
  office_location?: string;
  availability_hours?: string;
}

const StudentDashboard = () => {
  const { student, clearAuth } = useAuthStorage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [upcomingClasses, setUpcomingClasses] = useState<ClassSchedule[]>([]);
  const [psychologists, setPsychologists] = useState<SchoolPsychologist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('StudentDashboard: Component mounted, checking auth state', { student });
    if (!student) {
      console.log('StudentDashboard: No student found, redirecting to login');
      navigate('/student-login');
      return;
    }
    console.log('StudentDashboard: Student authenticated, loading data');
    loadData();
  }, [student, navigate]);

  const loadData = async () => {
    console.log('StudentDashboard: Starting to load data');
    await Promise.all([loadUpcomingClasses(), loadPsychologists()]);
    setIsLoading(false);
    console.log('StudentDashboard: Data loading complete');
  };

  const loadUpcomingClasses = async () => {
    if (!student?.school || !student?.grade) {
      console.log('StudentDashboard: Missing school or grade data', { school: student?.school, grade: student?.grade });
      return;
    }
    
    try {
      console.log('StudentDashboard: Loading upcoming classes for', { school: student.school, grade: student.grade });
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('class_schedules')
        .select('*')
        .eq('school', student.school)
        .eq('grade', student.grade)
        .gte('class_date', today)
        .order('class_date', { ascending: true })
        .order('class_time', { ascending: true })
        .limit(5);

      if (error) throw error;
      console.log('StudentDashboard: Loaded classes successfully', data);
      setUpcomingClasses(data || []);
    } catch (error) {
      console.error('StudentDashboard: Error loading classes:', error);
      toast({
        title: t('common.error'),
        description: t('student.failedToLoadClasses'),
        variant: "destructive",
      });
    }
  };

  const loadPsychologists = async () => {
    if (!student?.school) {
      console.log('StudentDashboard: Missing school data for psychologists');
      return;
    }
    
    try {
      console.log('StudentDashboard: Loading psychologists for school:', student.school);
      const { data, error } = await supabase
        .from('school_psychologists')
        .select('*')
        .eq('school', student.school)
        .order('name', { ascending: true });

      if (error) throw error;
      console.log('StudentDashboard: Loaded psychologists successfully', data);
      setPsychologists(data || []);
    } catch (error) {
      console.error('StudentDashboard: Error loading psychologists:', error);
      toast({
        title: t('common.error'),
        description: t('student.failedToLoadPsychologists'),
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    console.log('StudentDashboard: Logging out student');
    clearAuth();
    navigate('/student-login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <CookieConsent />
      <header className="bg-card/80 backdrop-blur-sm border-b border-border p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <SchoolIcon className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">{t('dashboard.title')}</h1>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <span className="text-sm text-muted-foreground">{t('admin.welcome')}, {student?.full_name}</span>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOutIcon className="w-4 h-4" />
              {t('auth.logout')}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('auth.school')}</CardTitle>
              <SchoolIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">{student?.school}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.grade')}</CardTitle>
              <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">{student?.grade}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.upcomingClasses')}</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">{upcomingClasses.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="feedback" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="feedback">{t('dashboard.feedback')}</TabsTrigger>
            <TabsTrigger value="classes">{t('class.upcomingClasses')}</TabsTrigger>
            <TabsTrigger value="weekly">{t('dashboard.weeklySummary')}</TabsTrigger>
            <TabsTrigger value="support">{t('dashboard.mentalHealthSupport')}</TabsTrigger>
          </TabsList>

          <TabsContent value="feedback" className="space-y-6">
            <LessonFeedbackForm />
          </TabsContent>

          <TabsContent value="classes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('class.upcomingClasses')}</CardTitle>
                <CardDescription>
                  {t('dashboard.scheduledClasses')} {student?.grade} {t('auth.school').toLowerCase()} {student?.school}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingClasses.map((classItem) => (
                    <div key={classItem.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{classItem.subject}</h3>
                        <p className="text-sm text-muted-foreground">{classItem.lesson_topic}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">{classItem.grade}</Badge>
                          <Badge variant="outline">{classItem.duration_minutes} {t('class.duration')}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{new Date(classItem.class_date).toLocaleDateString()}</p>
                        <p className="text-sm text-muted-foreground">{classItem.class_time}</p>
                      </div>
                    </div>
                  ))}
                  {upcomingClasses.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">{t('dashboard.noClasses')}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weekly" className="space-y-6">
            <div className="space-y-6">
              <CompiledWeeklySummary student={student} />
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Manual Weekly Check-In</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You can also manually add additional thoughts or concerns below:
                </p>
                <WeeklySummary student={student} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="support" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HeartHandshakeIcon className="w-5 h-5" />
                  {t('dashboard.mentalHealthSupport')}
                </CardTitle>
                <CardDescription>
                  {t('student.accessMentalHealthResources', { school: student?.school })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {psychologists.length > 0 ? (
                  <div className="space-y-6">
                    <div className="flex justify-end">
                      <LiveChatWidget
                        studentId={student?.id}
                        studentName={student?.full_name || t('student.defaultName')}
                        school={student?.school || ""}
                        grade={student?.grade || ""}
                      />
                    </div>
                    <div className="space-y-4">
                      {psychologists.map((psychologist) => (
                        <PsychologistInfo key={psychologist.id} psychologist={psychologist} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <HeartHandshakeIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">{t('dashboard.noPsychologists')}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {t('dashboard.contactAdmin')}
                    </p>
                    <div className="mt-4">
                      <LiveChatWidget
                        studentId={student?.id}
                        studentName={student?.full_name || t('student.defaultName')}
                        school={student?.school || ""}
                        grade={student?.grade || ""}
                      />
                    </div>
                  </div>
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

export default StudentDashboard;
