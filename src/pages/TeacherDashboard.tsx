
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import ScheduleTab from "@/components/dashboard/teacher/ScheduleTab";
import FeedbackDashboard from "@/components/dashboard/teacher/FeedbackDashboard";
import DoctorDashboard from "@/components/dashboard/doctor/DoctorDashboard";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { LogOut, Calendar, Heart, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const TeacherDashboard = () => {
  const { teacher, logout, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Require authenticated teacher - no demo bypasses
  if (!teacher) {
    return <Navigate to="/teacher-login" replace />;
  }

  const handleLogout = () => {
    logout();
    toast({
      title: t('teacher.logout.success'),
      description: t('teacher.logout.description'),
    });
    // Navigate to homepage after a short delay to show the toast
    setTimeout(() => {
      navigate('/');
    }, 1500);
  };

  // Check for special roles
  const isDoctor = teacher.role === 'doctor';
  const isAdmin = teacher.role === 'admin';

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              {isDoctor ? t('dashboard.doctorOverview') : isAdmin ? 'School Admin Dashboard' : t('teacher.dashboard.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('admin.welcome')}, {teacher.name} - {teacher.role.charAt(0).toUpperCase() + teacher.role.slice(1)} at {teacher.school}
            </p>
          </div>
          <div className="flex gap-2">
            <LanguageSwitcher />
            {isAdmin && (
              <Button variant="outline" onClick={() => window.location.href = '/admin-dashboard'}>
                Admin Panel
              </Button>
            )}
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              {t('auth.logout')}
            </Button>
          </div>
        </div>

        {isDoctor ? (
          <DoctorDashboard teacher={teacher} />
        ) : (
          <Tabs defaultValue="schedules" className="space-y-4">
            <TabsList>
              <TabsTrigger value="schedules" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {t('class.schedule')}
              </TabsTrigger>
              <TabsTrigger value="feedback" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                {t('dashboard.feedback')}
              </TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  School Analytics
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="schedules" className="space-y-4">
              <ScheduleTab teacher={teacher} />
            </TabsContent>

            <TabsContent value="feedback" className="space-y-4">
              <FeedbackDashboard teacher={teacher} />
            </TabsContent>

            {isAdmin && (
              <TabsContent value="analytics" className="space-y-4">
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Access detailed school analytics in the <Button variant="link" onClick={() => window.location.href = '/admin-dashboard'}>Admin Dashboard</Button>
                  </p>
                </div>
              </TabsContent>
            )}
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
