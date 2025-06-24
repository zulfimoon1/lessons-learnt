
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStorage } from "@/hooks/useAuthStorage";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsCard from "@/components/dashboard/StatsCard";
import UpcomingClassesTab from "@/components/dashboard/UpcomingClassesTab";
import WeeklySummaryTab from "@/components/dashboard/WeeklySummaryTab";
import MentalHealthSupportTab from "@/components/dashboard/MentalHealthSupportTab";
import ComplianceFooter from "@/components/ComplianceFooter";
import CookieConsent from "@/components/CookieConsent";
import { CalendarIcon, UserIcon, SchoolIcon } from "lucide-react";

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
  const [psychologists, setPsychologists] = useState<SchoolPsychologist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!student) {
      navigate('/student-login');
      return;
    }
    loadPsychologists();
  }, [student, navigate]);

  const loadPsychologists = async () => {
    if (!student?.school) return;
    
    try {
      console.log('Loading psychologists for school:', student.school);
      
      // First try school_psychologists table
      const { data: schoolPsychologists, error: schoolError } = await supabase
        .from('school_psychologists')
        .select('*')
        .eq('school', student.school);

      if (schoolError) {
        console.error('Error loading school psychologists:', schoolError);
      }

      // Also try teachers with doctor role
      const { data: doctorTeachers, error: doctorError } = await supabase
        .from('teachers')
        .select('id, name, email, specialization as phone, role')
        .eq('school', student.school)
        .eq('role', 'doctor');

      if (doctorError) {
        console.error('Error loading doctor teachers:', doctorError);
      }

      // Combine both sources
      const allPsychologists = [
        ...(schoolPsychologists || []),
        ...(doctorTeachers || []).map(doc => ({
          id: doc.id,
          name: doc.name,
          email: doc.email,
          phone: doc.phone,
          office_location: 'School Medical Office',
          availability_hours: 'Available during school hours'
        }))
      ];

      console.log('Found psychologists:', allPsychologists);
      setPsychologists(allPsychologists);
    } catch (error) {
      console.error('Error loading psychologists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/', { replace: true });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal mx-auto"></div>
          <p className="mt-2 text-brand-dark">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <CookieConsent />
      <DashboardHeader 
        title="Student Dashboard"
        userName={student?.full_name || "Student"}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="School"
            value={student?.school || ""}
            icon={SchoolIcon}
          />
          
          <StatsCard
            title="Grade"
            value={student?.grade || ""}
            icon={UserIcon}
          />

          <StatsCard
            title="Upcoming Classes"
            value="0"
            icon={CalendarIcon}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="upcoming-classes" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upcoming-classes">Upcoming Classes</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="weekly-summary">Weekly Summary</TabsTrigger>
            <TabsTrigger value="mental-health">Mental Health Support</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming-classes">
            <UpcomingClassesTab 
              school={student?.school} 
              grade={student?.grade}
            />
          </TabsContent>

          <TabsContent value="feedback">
            <Card>
              <CardHeader>
                <CardTitle>Lesson Feedback</CardTitle>
                <CardDescription>
                  Share your thoughts about lessons to help improve the learning experience.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Feedback form will appear here when you have attended classes.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weekly-summary">
            <WeeklySummaryTab 
              studentId={student?.id}
              studentName={student?.full_name}
              school={student?.school}
              grade={student?.grade}
            />
          </TabsContent>

          <TabsContent value="mental-health">
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
