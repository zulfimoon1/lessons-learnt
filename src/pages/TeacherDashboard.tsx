
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import ScheduleTab from "@/components/dashboard/teacher/ScheduleTab";
import DoctorDashboard from "@/components/dashboard/doctor/DoctorDashboard";
import DemoTeacherDashboard from "@/components/dashboard/teacher/DemoTeacherDashboard";
import { LogOut, Calendar, Heart } from "lucide-react";

const TeacherDashboard = () => {
  const { teacher, logout, isLoading } = useAuth();

  // Check for demo teacher in localStorage
  const demoTeacher = localStorage.getItem('demoTeacher');
  const parsedDemoTeacher = demoTeacher ? JSON.parse(demoTeacher) : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Use demo teacher if available, otherwise require authenticated teacher
  const currentTeacher = parsedDemoTeacher || teacher;
  
  if (!currentTeacher) {
    return <Navigate to="/teacher-login" replace />;
  }

  const handleLogout = () => {
    logout();
  };

  // Check if this is a demo teacher - render demo dashboard
  if (parsedDemoTeacher) {
    return <DemoTeacherDashboard teacher={parsedDemoTeacher} />;
  }

  // Check for special roles
  const isDoctor = currentTeacher.role === 'doctor';
  const isAdmin = currentTeacher.role === 'admin';

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              {isDoctor ? 'Doctor Dashboard' : isAdmin ? 'School Admin Dashboard' : 'Teacher Dashboard'}
            </h1>
            <p className="text-muted-foreground">
              Welcome, {currentTeacher.name} - {currentTeacher.role.charAt(0).toUpperCase() + currentTeacher.role.slice(1)} at {currentTeacher.school}
            </p>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <Button variant="outline" onClick={() => window.location.href = '/admin-dashboard'}>
                Admin Panel
              </Button>
            )}
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {isDoctor ? (
          <DoctorDashboard teacher={currentTeacher} />
        ) : (
          <Tabs defaultValue="schedules" className="space-y-4">
            <TabsList>
              <TabsTrigger value="schedules" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Class Schedules
              </TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  School Analytics
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="schedules" className="space-y-4">
              <ScheduleTab teacher={currentTeacher} />
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
