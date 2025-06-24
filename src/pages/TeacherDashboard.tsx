
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import ScheduleTab from "@/components/dashboard/teacher/ScheduleTab";
import FeedbackDashboard from "@/components/dashboard/teacher/FeedbackDashboard";
import DoctorDashboard from "@/components/dashboard/doctor/DoctorDashboard";
import WeeklySummariesTab from "@/components/dashboard/teacher/WeeklySummariesTab";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { LogOut, Calendar, MessageSquare, FileText, Heart } from "lucide-react";
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
      <div className="min-h-screen bg-gradient-to-br from-brand-teal/10 via-white to-brand-orange/10 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal"></div>
        <span className="ml-3 text-brand-dark">{t('common.loading')}</span>
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

  if (isDoctor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-teal/10 via-white to-brand-orange/10">
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-brand-dark">
                {t('dashboard.doctorOverview')}
              </h1>
              <p className="text-brand-dark/70">
                {t('teacher.dashboard.welcome')}, {teacher.name} - {t('teacher.dashboard.teacherAt', { 
                  role: teacher.role.charAt(0).toUpperCase() + teacher.role.slice(1),
                  school: teacher.school
                })}
              </p>
            </div>
            <div className="flex gap-2">
              <LanguageSwitcher />
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                {t('logout')}
              </Button>
            </div>
          </div>
          <DoctorDashboard teacher={teacher} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-teal/10 via-white to-brand-orange/10">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-brand-dark mb-2">
              {isAdmin ? t('dashboard.schoolAdmin') : t('teacher.dashboard.title')}
            </h1>
            <p className="text-brand-dark/70 text-lg">
              {t('teacher.dashboard.welcome')}, {teacher.name} - {t('teacher.dashboard.teacherAt', { 
                role: teacher.role.charAt(0).toUpperCase() + teacher.role.slice(1),
                school: teacher.school
              })}
            </p>
          </div>
          <div className="flex gap-3">
            <LanguageSwitcher />
            {isAdmin && (
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/admin-dashboard'}
                className="border-brand-teal/30 hover:bg-brand-teal/10"
              >
                {t('dashboard.adminPanel')}
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="border-brand-orange/30 hover:bg-brand-orange/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t('logout')}
            </Button>
          </div>
        </div>

        {/* Main Content with Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-brand-teal/20 overflow-hidden">
          <Tabs defaultValue="classes" className="w-full">
            <div className="bg-gradient-to-r from-brand-teal to-brand-orange/20 px-6 py-4">
              <TabsList className="bg-white/20 backdrop-blur-sm border-0 h-12 p-1 rounded-xl">
                <TabsTrigger 
                  value="classes" 
                  className="data-[state=active]:bg-white data-[state=active]:text-brand-dark data-[state=active]:shadow-lg text-white/90 hover:text-white transition-all duration-200 px-6 py-2 rounded-lg flex items-center gap-2 font-medium"
                >
                  <Calendar className="w-4 h-4" />
                  {t('dashboard.upcomingClasses')}
                </TabsTrigger>
                <TabsTrigger 
                  value="feedback" 
                  className="data-[state=active]:bg-white data-[state=active]:text-brand-dark data-[state=active]:shadow-lg text-white/90 hover:text-white transition-all duration-200 px-6 py-2 rounded-lg flex items-center gap-2 font-medium"
                >
                  <MessageSquare className="w-4 h-4" />
                  {t('dashboard.feedback')}
                </TabsTrigger>
                <TabsTrigger 
                  value="weekly-summaries" 
                  className="data-[state=active]:bg-white data-[state=active]:text-brand-dark data-[state=active]:shadow-lg text-white/90 hover:text-white transition-all duration-200 px-6 py-2 rounded-lg flex items-center gap-2 font-medium"
                >
                  <FileText className="w-4 h-4" />
                  {t('dashboard.weeklySummaries')}
                </TabsTrigger>
                {isAdmin && (
                  <TabsTrigger 
                    value="analytics" 
                    className="data-[state=active]:bg-white data-[state=active]:text-brand-dark data-[state=active]:shadow-lg text-white/90 hover:text-white transition-all duration-200 px-6 py-2 rounded-lg flex items-center gap-2 font-medium"
                  >
                    <Heart className="w-4 h-4" />
                    {t('dashboard.analytics')}
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="classes" className="mt-0">
                <ScheduleTab teacher={teacher} />
              </TabsContent>

              <TabsContent value="feedback" className="mt-0">
                <FeedbackDashboard teacher={teacher} />
              </TabsContent>

              <TabsContent value="weekly-summaries" className="mt-0">
                <WeeklySummariesTab 
                  school={teacher.school}
                  subscription={null}
                  onCreateCheckout={() => {}}
                  isCreatingCheckout={false}
                />
              </TabsContent>

              {isAdmin && (
                <TabsContent value="analytics" className="mt-0">
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-brand-teal/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Heart className="w-10 h-10 text-brand-teal" />
                    </div>
                    <p className="text-brand-dark/60 mb-4">
                      {t('dashboard.accessAnalytics')}
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => window.location.href = '/admin-dashboard'}
                      className="border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white"
                    >
                      {t('dashboard.adminPanel')}
                    </Button>
                  </div>
                </TabsContent>
              )}
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
