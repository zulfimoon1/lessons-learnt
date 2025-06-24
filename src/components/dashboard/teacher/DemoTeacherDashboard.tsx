
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Calendar, MessageSquare, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";

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
      title: "Logout Successful",
      description: "You have been successfully logged out of the demo.",
    });
    
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
              Demo Teacher Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome, {teacher.name} - Demo Teacher at {teacher.school}
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

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="demo-info" className="flex items-center gap-2">
              <Info className="w-4 h-4" />
              Demo Information
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Demo Teacher Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">Available in Demo</h3>
                    <ul className="list-disc list-inside text-blue-700 space-y-1">
                      <li>View existing class schedules</li>
                      <li>Access teacher analytics</li>
                      <li>View demo feedback data</li>
                      <li>Explore the teacher interface</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <h3 className="font-semibold text-orange-800 mb-2">Limited in Demo</h3>
                    <ul className="list-disc list-inside text-orange-700 space-y-1">
                      <li>Cannot upload new class schedules</li>
                      <li>Cannot submit feedback forms</li>
                      <li>Cannot modify existing data</li>
                      <li>View-only access to most features</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sample Class Schedules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold">Mathematics - Algebra Basics</h4>
                    <p className="text-sm text-muted-foreground">Grade 10A | Demo High School</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                      <span>📅 July 1, 2024</span>
                      <span>🕘 09:00 (60 min)</span>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold">Physics - Newton's Laws</h4>
                    <p className="text-sm text-muted-foreground">Grade 10A | Demo High School</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                      <span>📅 July 2, 2024</span>
                      <span>🕘 10:00 (60 min)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="demo-info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>About This Demo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    This is a demonstration of the teacher dashboard interface. In the full version, teachers can:
                  </p>
                  
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Create and upload class schedules individually</li>
                    <li>Bulk upload schedules via CSV files</li>
                    <li>View real-time student feedback</li>
                    <li>Access detailed analytics and insights</li>
                    <li>Manage class materials and resources</li>
                  </ul>
                  
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2">Ready to Get Started?</h3>
                    <p className="text-green-700 mb-3">
                      Experience the full platform with all features enabled.
                    </p>
                    <Button 
                      onClick={() => window.location.href = '/teacher-login'}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Sign Up as Teacher
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
