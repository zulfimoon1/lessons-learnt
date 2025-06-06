
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GraduationCapIcon, UsersIcon, MessageSquareIcon, CreditCardIcon, LogOutIcon } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";

interface Teacher {
  id: string;
  name: string;
  email: string;
  school: string;
  role: string;
}

interface FeedbackSummary {
  teacher_name: string;
  subject: string;
  total_feedback: number;
  avg_understanding: number;
  avg_interest: number;
  avg_growth: number;
}

const AdminDashboard = () => {
  const { teacher, logout } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [feedbackSummary, setFeedbackSummary] = useState<FeedbackSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (teacher && teacher.role === 'admin') {
      loadDashboardData();
    }
  }, [teacher]);

  const loadDashboardData = async () => {
    try {
      // Load teachers from the same school
      const { data: teachersData, error: teachersError } = await supabase
        .from('teachers')
        .select('*')
        .eq('school', teacher?.school);

      if (teachersError) throw teachersError;
      setTeachers(teachersData || []);

      // This would need to be implemented with proper joins when feedback system is complete
      setFeedbackSummary([]);
    } catch (error) {
      toast({
        title: "Error loading data",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "Failed to create subscription. Please try again.",
        variant: "destructive",
      });
    }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <GraduationCapIcon className="w-8 h-8 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              {teacher?.school}
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {teacher?.name}</span>
            <LanguageSwitcher />
            <Button
              onClick={logout}
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
              <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
              <MessageSquareIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {feedbackSummary.reduce((acc, curr) => acc + curr.total_feedback, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subscription</CardTitle>
              <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleCreateSubscription}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Subscribe Now
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Teachers at {teacher?.school}</CardTitle>
              <CardDescription>Manage teachers at your school</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teachers.map((teacherItem) => (
                  <div key={teacherItem.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{teacherItem.name}</p>
                      <p className="text-sm text-gray-500">{teacherItem.email}</p>
                    </div>
                    <Badge variant={teacherItem.role === 'admin' ? 'default' : 'secondary'}>
                      {teacherItem.role}
                    </Badge>
                  </div>
                ))}
                {teachers.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No teachers found</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feedback Summary</CardTitle>
              <CardDescription>Overview of student feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedbackSummary.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No feedback data available yet</p>
                ) : (
                  feedbackSummary.map((summary, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <p className="font-medium">{summary.teacher_name}</p>
                      <p className="text-sm text-gray-500">{summary.subject}</p>
                      <div className="flex gap-4 mt-2 text-xs">
                        <span>Understanding: {summary.avg_understanding.toFixed(1)}/5</span>
                        <span>Interest: {summary.avg_interest.toFixed(1)}/5</span>
                        <span>Growth: {summary.avg_growth.toFixed(1)}/5</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
