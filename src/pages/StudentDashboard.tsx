
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
    if (!student) {
      navigate('/student-login');
      return;
    }
    loadData();
  }, [student, navigate]);

  const loadData = async () => {
    await Promise.all([loadUpcomingClasses(), loadPsychologists()]);
    setIsLoading(false);
  };

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
            <TabsTrigger value="feedback">{t('dashboard.feedback')}</TabsTrigger>
            <TabsTrigger value="classes">{t('class.upcomingClasses')}</TabsTrigger>
            <TabsTrigger value="weekly">{t('dashboard.weeklySummary')}</TabsTrigger>
            <TabsTrigger value="support">{t('dashboard.mentalHealthSupport')}</TabsTrigger>
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
