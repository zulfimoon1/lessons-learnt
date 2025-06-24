
import { useState, useEffect, Suspense, lazy } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStorage } from "@/hooks/useAuthStorage";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  SchoolIcon, 
  CalendarIcon,
  BookOpenIcon
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import ComplianceFooter from "@/components/ComplianceFooter";
import CookieConsent from "@/components/CookieConsent";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsCard from "@/components/dashboard/StatsCard";
import UpcomingClassesTab from "@/components/dashboard/UpcomingClassesTab";
import MentalHealthSupportTab from "@/components/dashboard/MentalHealthSupportTab";
import { DashboardSkeleton, TabContentSkeleton } from "@/components/ui/loading-skeleton";

// Lazy load tab components
const FeedbackTab = lazy(() => import("@/components/dashboard/FeedbackTab"));
const WeeklySummaryTab = lazy(() => import("@/components/dashboard/WeeklySummaryTab"));

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
      navigate('/student-login', { replace: true });
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

      if (error) {
        console.log('StudentDashboard: No psychologists found or error loading:', error);
        setPsychologists([]);
        return;
      }
      
      console.log('StudentDashboard: Loaded psychologists successfully', data);
      setPsychologists(data || []);
    } catch (error) {
      console.log('StudentDashboard: Error loading psychologists (non-critical):', error);
      setPsychologists([]);
    }
  };

  const handleLogout = () => {
    console.log('StudentDashboard: Logging out student');
    clearAuth();
    navigate('/student-login', { replace: true });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-gradient-soft">
        <CookieConsent />
        <DashboardHeader 
          title={t('dashboard.title')}
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
    <div className="min-h-screen bg-brand-gradient-soft">
      <CookieConsent />
      <DashboardHeader 
        title={t('dashboard.title')}
        userName={student?.full_name || ""}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard 
            title={t('auth.school')}
            value={student?.school || ""}
            icon={SchoolIcon}
          />
          
          <StatsCard 
            title={t('dashboard.grade')}
            value={student?.grade || ""}
            icon={BookOpenIcon}
          />

          <StatsCard 
            title={t('dashboard.upcomingClasses')}
            value={upcomingClasses.length}
            icon={CalendarIcon}
          />
        </div>

        <Tabs defaultValue="feedback" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/90">
            <TabsTrigger value="feedback" className="data-[state=active]:bg-brand-teal data-[state=active]:text-white text-brand-dark">{t('dashboard.feedback')}</TabsTrigger>
            <TabsTrigger value="classes" className="data-[state=active]:bg-brand-teal data-[state=active]:text-white text-brand-dark">{t('class.upcomingClasses')}</TabsTrigger>
            <TabsTrigger value="weekly" className="data-[state=active]:bg-brand-teal data-[state=active]:text-white text-brand-dark">{t('dashboard.weeklySummary')}</TabsTrigger>
            <TabsTrigger value="support" className="data-[state=active]:bg-brand-teal data-[state=active]:text-white text-brand-dark">{t('dashboard.mentalHealthSupport')}</TabsTrigger>
          </TabsList>

          <TabsContent value="feedback" className="space-y-6">
            <Suspense fallback={<TabContentSkeleton />}>
              <FeedbackTab />
            </Suspense>
          </TabsContent>

          <TabsContent value="classes" className="space-y-6">
            <UpcomingClassesTab 
              classes={upcomingClasses}
              studentGrade={student?.grade}
              studentSchool={student?.school}
            />
          </TabsContent>

          <TabsContent value="weekly" className="space-y-6">
            <Suspense fallback={<TabContentSkeleton />}>
              <WeeklySummaryTab student={student} />
            </Suspense>
          </TabsContent>

          <TabsContent value="support" className="space-y-6">
            <MentalHealthSupportTab 
              psychologists={psychologists}
              studentId={student?.id}
              studentName={student?.full_name}
              studentSchool={student?.school}
              studentGrade={student?.grade}
            />
          </TabsContent>
        </Tabs>
      </main>
      <ComplianceFooter />
    </div>
  );
};

export default StudentDashboard;
