
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStorage } from "@/hooks/useAuthStorage";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  SchoolIcon, 
  UsersIcon, 
  MessageSquareIcon, 
  LogOutIcon,
  CalendarIcon,
  UserPlusIcon
} from "lucide-react";
import ClassScheduleForm from "@/components/ClassScheduleForm";
import InviteTeacherForm from "@/components/InviteTeacherForm";
import SchoolPsychologistForm from "@/components/SchoolPsychologistForm";
import { useNavigate } from "react-router-dom";

interface Teacher {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

interface Subscription {
  id: string;
  school_name: string;
  status: string;
  plan_type: string;
  amount: number;
  current_period_end: string;
}

const AdminDashboard = () => {
  const { teacher, clearAuth } = useAuthStorage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!teacher || teacher.role !== 'admin') {
      navigate('/teacher-login');
      return;
    }
    loadTeachers();
    loadSubscription();
  }, [teacher, navigate]);

  const loadTeachers = async () => {
    if (!teacher?.school) return;
    
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('school', teacher.school)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeachers(data || []);
    } catch (error) {
      console.error('Error loading teachers:', error);
      toast({
        title: "Error",
        description: "Failed to load teachers",
        variant: "destructive",
      });
    }
  };

  const loadSubscription = async () => {
    if (!teacher?.school) return;
    
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('school_name', teacher.school)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading subscription:', error);
      } else {
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/teacher-login');
  };

  const handleSubscribe = () => {
    navigate('/pricing');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <SchoolIcon className="w-8 h-8 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              {teacher?.school} - Admin Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {teacher?.name}</span>
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
        {!subscription && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-800">Subscription Required</CardTitle>
              <CardDescription className="text-yellow-700">
                You need an active subscription to access all admin features and invite teachers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleSubscribe}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Subscribe Now
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teachers.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Teachers</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teachers.filter(t => t.role === 'teacher').length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subscription Status</CardTitle>
              <MessageSquareIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {subscription ? 'Active' : 'Inactive'}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="schedule" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="schedule">Class Schedule</TabsTrigger>
            <TabsTrigger value="teachers">Teachers</TabsTrigger>
            <TabsTrigger value="psychologists">Psychologists</TabsTrigger>
            <TabsTrigger value="invite">Invite Teacher</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-6">
            <ClassScheduleForm teacher={teacher} />
          </TabsContent>

          <TabsContent value="teachers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Teacher Management</CardTitle>
                <CardDescription>
                  Manage teachers in your school
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teachers.map((teacherItem) => (
                    <div key={teacherItem.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{teacherItem.name}</h3>
                        <p className="text-sm text-gray-600">{teacherItem.email}</p>
                        <p className="text-xs text-gray-500 capitalize">{teacherItem.role}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        Joined: {new Date(teacherItem.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                  {teachers.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No teachers found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="psychologists" className="space-y-6">
            <SchoolPsychologistForm school={teacher?.school || ''} />
          </TabsContent>

          <TabsContent value="invite" className="space-y-6">
            <InviteTeacherForm 
              school={teacher?.school || ''}
              subscriptionId={subscription?.id}
              hasActiveSubscription={!!subscription}
              onInviteSent={loadTeachers}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
