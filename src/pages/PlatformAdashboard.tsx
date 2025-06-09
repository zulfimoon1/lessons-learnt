
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePlatformAdminContext } from "@/contexts/PlatformAdminContext";
import { 
  SchoolIcon, 
  UsersIcon, 
  BookOpenIcon, 
  LogOutIcon
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DiscountCodeManagement from "@/components/DiscountCodeManagement";

interface SchoolStats {
  school: string;
  total_teachers: number;
  total_students: number;
  total_subscriptions: number;
}

const PlatformAdminDashboard = () => {
  const { platformAdmin, clearPlatformAuth } = usePlatformAdminContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [schoolStats, setSchoolStats] = useState<SchoolStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!platformAdmin) {
      navigate('/platform-admin-login');
      return;
    }
    loadSchoolStats();
  }, [platformAdmin, navigate]);

  const loadSchoolStats = async () => {
    try {
      // Get basic stats from existing tables
      const [teachersData, studentsData, subscriptionsData] = await Promise.all([
        supabase.from('teacher_profiles').select('school'),
        supabase.from('profiles').select('school').eq('role', 'student'),
        supabase.from('subscriptions').select('school_name, status')
      ]);

      // Aggregate stats by school
      const stats: { [key: string]: SchoolStats } = {};

      // Count teachers by school
      teachersData.data?.forEach(teacher => {
        if (teacher.school) {
          if (!stats[teacher.school]) {
            stats[teacher.school] = {
              school: teacher.school,
              total_teachers: 0,
              total_students: 0,
              total_subscriptions: 0
            };
          }
          stats[teacher.school].total_teachers++;
        }
      });

      // Count students by school
      studentsData.data?.forEach(student => {
        if (student.school) {
          if (!stats[student.school]) {
            stats[student.school] = {
              school: student.school,
              total_teachers: 0,
              total_students: 0,
              total_subscriptions: 0
            };
          }
          stats[student.school].total_students++;
        }
      });

      // Count active subscriptions by school
      subscriptionsData.data?.forEach(sub => {
        if (sub.school_name && sub.status === 'active') {
          if (!stats[sub.school_name]) {
            stats[sub.school_name] = {
              school: sub.school_name,
              total_teachers: 0,
              total_students: 0,
              total_subscriptions: 0
            };
          }
          stats[sub.school_name].total_subscriptions++;
        }
      });

      setSchoolStats(Object.values(stats));
    } catch (error) {
      console.error('Error loading school stats:', error);
      toast({
        title: "Error",
        description: "Failed to load school statistics",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    clearPlatformAuth();
    navigate('/platform-admin-login');
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

  const totalTeachers = schoolStats.reduce((sum, school) => sum + school.total_teachers, 0);
  const totalStudents = schoolStats.reduce((sum, school) => sum + school.total_students, 0);
  const totalSubscriptions = schoolStats.reduce((sum, school) => sum + school.total_subscriptions, 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card/80 backdrop-blur-sm border-b border-border p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <SchoolIcon className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">
              Platform Admin Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, {platformAdmin?.email}</span>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOutIcon className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
              <SchoolIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{schoolStats.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTeachers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSubscriptions}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="schools" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="schools">School Statistics</TabsTrigger>
            <TabsTrigger value="discounts">Discount Codes</TabsTrigger>
          </TabsList>

          <TabsContent value="schools" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>School Statistics</CardTitle>
                <CardDescription>
                  Overview of all schools using the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {schoolStats.map((school) => (
                    <div key={school.school} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{school.school}</h3>
                        <p className="text-sm text-muted-foreground">
                          {school.total_teachers} teachers, {school.total_students} students
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {school.total_subscriptions} active subscription{school.total_subscriptions !== 1 ? 's' : ''}
                      </div>
                    </div>
                  ))}
                  {schoolStats.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No schools found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="discounts" className="space-y-6">
            <DiscountCodeManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default PlatformAdminDashboard;
