
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ScheduleTab from "@/components/dashboard/teacher/ScheduleTab";
import FeedbackDashboard from "@/components/dashboard/teacher/FeedbackDashboard";
import DoctorDashboard from "@/components/dashboard/doctor/DoctorDashboard";
import WeeklySummariesTab from "@/components/dashboard/teacher/WeeklySummariesTab";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { LogOut, Calendar, MessageSquare, FileText, Heart, School, GraduationCap } from "lucide-react";
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
        {/* Header - matching student dashboard style */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 mb-6 p-6">
          <div className="flex items-center justify-between">
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
        </div>

        {/* Stats Cards - matching student dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-teal/10 rounded-lg flex items-center justify-center">
                  <School className="w-6 h-6 text-brand-teal" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">School</p>
                  <p className="text-lg font-semibold text-brand-dark">{teacher.school}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-orange/10 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-brand-orange" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Role</p>
                  <p className="text-lg font-semibold text-brand-dark">
                    {teacher.role.charAt(0).toUpperCase() + teacher.role.slice(1)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-teal/10 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-brand-teal" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('dashboard.upcomingClasses')}</p>
                  <p className="text-lg font-semibold text-brand-dark">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content with Tabs - matching student dashboard style */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 overflow-hidden">
          <Tabs defaultValue="classes" className="w-full">
            {/* Tab Navigation - clean white background */}
            <div className="bg-white border-b border-gray-200">
              <TabsList className="h-auto p-0 bg-transparent rounded-none w-full justify-start">
                <TabsTrigger 
                  value="classes" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-orange data-[state=active]:to-brand-teal data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-brand-dark border-b-2 border-transparent data-[state=active]:border-brand-teal rounded-none px-6 py-4 font-medium transition-all duration-200"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  {t('dashboard.upcomingClasses')}
                </TabsTrigger>
                <TabsTrigger 
                  value="feedback" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-orange data-[state=active]:to-brand-teal data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-brand-dark border-b-2 border-transparent data-[state=active]:border-brand-teal rounded-none px-6 py-4 font-medium transition-all duration-200"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {t('dashboard.feedback')}
                </TabsTrigger>
                <TabsTrigger 
                  value="weekly-summaries" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-orange data-[state=active]:to-brand-teal data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-brand-dark border-b-2 border-transparent data-[state=active]:border-brand-teal rounded-none px-6 py-4 font-medium transition-all duration-200"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {t('dashboard.weeklySummaries')}
                </TabsTrigger>
                {isAdmin && (
                  <TabsTrigger 
                    value="analytics" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-orange data-[state=active]:to-brand-teal data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-brand-dark border-b-2 border-transparent data-[state=active]:border-brand-teal rounded-none px-6 py-4 font-medium transition-all duration-200"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    {t('dashboard.analytics')}
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            {/* Tab Content */}
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
