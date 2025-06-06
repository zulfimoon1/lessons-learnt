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
  MessageSquareIcon, 
  LogOutIcon,
  BookOpenIcon,
  HeartHandshakeIcon
} from "lucide-react";
import LessonFeedbackForm from "@/components/LessonFeedbackForm";
import WeeklySummary from "@/components/WeeklySummary";
import PsychologistInfo from "@/components/PsychologistInfo";
import { useNavigate } from "react-router-dom";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";

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
    if (!student) {
      navigate('/student-login');
      return;
    }
    loadUpcomingClasses();
    loadPsychologists();
  }, [student, navigate]);

  const loadUpcomingClasses = async () => {
    if (!student?.school || !student?.grade) return;
    
    try {
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
      setUpcomingClasses(data || []);
    } catch (error) {
      console.error('Error loading classes:', error);
      toast({
        title: t('common.error'),
        description: "Failed to load upcoming classes",
        variant: "destructive",
      });
    }
  };

  const loadPsychologists = async () => {
    if (!student?.school) return;
    
    try {
      const { data, error } = await supabase
        .from('school_psychologists')
        .select('*')
        .eq('school', student.school)
        .order('name', { ascending: true });

      if (error) throw error;
      setPsychologists(data || []);
    } catch (error) {
      console.error('Error loading psychologists:', error);
      toast({
        title: t('common.error'),
        description: "Failed to load school psychologists",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
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
    <div className="min-h-screen bg-background">
      <header className="bg-card/80 backdrop-blur-sm border-b border-border p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <SchoolIcon className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Student Dashboard</h1>
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
              <CardTitle className="text-sm font-medium">Grade</CardTitle>
              <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">{student?.grade}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Classes</CardTitle>
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
            <TabsTrigger value="classes">Upcoming Classes</TabsTrigger>
            <TabsTrigger value="weekly">Weekly Summary</TabsTrigger>
            <TabsTrigger value="support">Mental Health Support</TabsTrigger>
          </TabsList>

          <TabsContent value="feedback" className="space-y-6">
            <LessonFeedbackForm student={student} />
          </TabsContent>

          <TabsContent value="classes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Classes</CardTitle>
                <CardDescription>
                  Your scheduled classes for {student?.grade} at {student?.school}
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
                          <Badge variant="outline">{classItem.duration_minutes} min</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{new Date(classItem.class_date).toLocaleDateString()}</p>
                        <p className="text-sm text-muted-foreground">{classItem.class_time}</p>
                      </div>
                    </div>
                  ))}
                  {upcomingClasses.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No upcoming classes scheduled</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weekly" className="space-y-6">
            <WeeklySummary student={student} />
          </TabsContent>

          <TabsContent value="support" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HeartHandshakeIcon className="w-5 h-5" />
                  Mental Health Support
                </CardTitle>
                <CardDescription>
                  Access mental health resources and support at {student?.school}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {psychologists.length > 0 ? (
                  <div className="space-y-4">
                    {psychologists.map((psychologist) => (
                      <PsychologistInfo key={psychologist.id} psychologist={psychologist} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <HeartHandshakeIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No school psychologists are currently available.</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      If you need support, please contact your school administration.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default StudentDashboard;
