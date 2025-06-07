
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStorage } from "@/hooks/useAuthStorage";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import LessonFeedbackForm from "@/components/LessonFeedbackForm";
import WeeklySummary from "@/components/WeeklySummary";
import ComplianceFooter from "@/components/ComplianceFooter";
import CookieConsent from "@/components/CookieConsent";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardStats from "@/components/dashboard/DashboardStats";
import ClassesTab from "@/components/dashboard/ClassesTab";
import SupportTab from "@/components/dashboard/SupportTab";

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
    console.log('StudentDashboard: useEffect triggered, student:', student);
    if (!student) {
      console.log('StudentDashboard: No student found, redirecting to login');
      navigate('/student-login');
      return;
    }
    loadData();
  }, [student, navigate]);

  const loadData = async () => {
    console.log('StudentDashboard: Loading data for student:', student);
    try {
      await Promise.all([loadUpcomingClasses(), loadPsychologists()]);
    } catch (error) {
      console.error('StudentDashboard: Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUpcomingClasses = async () => {
    if (!student?.school || !student?.grade) {
      console.log('StudentDashboard: Missing school or grade data');
      return;
    }
    
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
      console.log('StudentDashboard: Loaded upcoming classes:', data?.length || 0);
    } catch (error) {
      console.error('Error loading classes:', error);
      toast({
        title: "Error",
        description: "Failed to load upcoming classes",
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
      const { data, error } = await supabase
        .from('school_psychologists')
        .select('*')
        .eq('school', student.school)
        .order('name', { ascending: true });

      if (error) throw error;
      setPsychologists(data || []);
      console.log('StudentDashboard: Loaded psychologists:', data?.length || 0);
    } catch (error) {
      console.error('Error loading psychologists:', error);
      toast({
        title: "Error",
        description: "Failed to load school psychologists",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    console.log('StudentDashboard: Logout initiated');
    clearAuth();
    navigate('/student-login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You need to be logged in to access this page.</p>
          <button 
            onClick={() => navigate('/student-login')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <CookieConsent />
      
      <DashboardHeader 
        studentName={student?.full_name}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <DashboardStats 
          student={student}
          upcomingClassesCount={upcomingClasses.length}
        />

        <Tabs defaultValue="feedback" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="classes">Upcoming Classes</TabsTrigger>
            <TabsTrigger value="weekly">Weekly Summary</TabsTrigger>
            <TabsTrigger value="support">Mental Health Support</TabsTrigger>
          </TabsList>

          <TabsContent value="feedback" className="space-y-6">
            <LessonFeedbackForm />
          </TabsContent>

          <TabsContent value="classes" className="space-y-6">
            <ClassesTab 
              upcomingClasses={upcomingClasses}
              student={student}
            />
          </TabsContent>

          <TabsContent value="weekly" className="space-y-6">
            <WeeklySummary student={student} />
          </TabsContent>

          <TabsContent value="support" className="space-y-6">
            <SupportTab 
              psychologists={psychologists}
              student={student}
            />
          </TabsContent>
        </Tabs>
      </main>
      
      <ComplianceFooter />
    </div>
  );
};

export default StudentDashboard;
