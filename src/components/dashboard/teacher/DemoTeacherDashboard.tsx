
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Calendar, MessageSquare, Info, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import ScheduleTab from "@/components/dashboard/teacher/ScheduleTab";
import FeedbackTab from "@/components/dashboard/FeedbackTab";

interface DemoTeacherDashboardProps {
  teacher: {
    id: string;
    name: string;
    school: string;
    role: string;
  };
}

const DemoTeacherDashboard: React.FC<DemoTeacherDashboardProps> = ({ teacher }) => {
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleLogout = () => {
    // Show success toast
    toast({
      title: t('auth.logoutSuccessful') || "Logout Successful",
      description: t('auth.logoutSuccessDescription') || "You have been successfully logged out of the demo.",
    });
    
    // Clear demo teacher from localStorage
    localStorage.removeItem('demoTeacher');
    
    // Redirect to homepage after a short delay
    setTimeout(() => {
      window.location.href = '/';
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              {t('demo.teacherDashboard.title') || 'Demo Teacher Dashboard'}
            </h1>
            <p className="text-muted-foreground">
              {t('demo.teacherDashboard.welcome') || 'Welcome'}, {teacher.name} - {t('demo.teacherDashboard.demoTeacher') || 'Demo Teacher'} at {teacher.school}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              {t('auth.logout') || 'Logout'}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="schedules" className="space-y-4">
          <TabsList>
            <TabsTrigger value="schedules" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {t('dashboard.schedules') || 'Class Schedules'}
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              {t('dashboard.feedback') || 'Feedback'}
            </TabsTrigger>
            <TabsTrigger value="demo-info" className="flex items-center gap-2">
              <Info className="w-4 h-4" />
              {t('demo.information') || 'Demo Information'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schedules" className="space-y-4">
            <ScheduleTab teacher={teacher} />
          </TabsContent>

          <TabsContent value="feedback" className="space-y-4">
            <FeedbackTab />
          </TabsContent>

          <TabsContent value="demo-info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('demo.aboutDemo') || 'About This Demo'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    {t('demo.description') || 'This is a demonstration of the teacher dashboard interface. In the full version, teachers can:'}
                  </p>
                  
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>{t('demo.features.createSchedules') || 'Create and upload class schedules individually'}</li>
                    <li>{t('demo.features.bulkUpload') || 'Bulk upload schedules via CSV files'}</li>
                    <li>{t('demo.features.realtimeFeedback') || 'View real-time student feedback'}</li>
                    <li>{t('demo.features.analytics') || 'Access detailed analytics and insights'}</li>
                    <li>{t('demo.features.materials') || 'Manage class materials and resources'}</li>
                  </ul>
                  
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2">
                      {t('demo.getStarted') || 'Ready to Get Started?'}
                    </h3>
                    <p className="text-green-700 mb-3">
                      {t('demo.experienceFullPlatform') || 'Experience the full platform with all features enabled.'}
                    </p>
                    <Button 
                      onClick={() => window.location.href = '/teacher-login'}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {t('demo.signUpTeacher') || 'Sign Up as Teacher'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DemoTeacherDashboard;
