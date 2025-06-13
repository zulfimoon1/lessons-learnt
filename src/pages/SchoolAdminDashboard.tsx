
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  BookOpen, 
  AlertTriangle, 
  Calendar,
  BarChart3,
  Settings,
  CreditCard,
  UserCheck,
  GraduationCap,
  Stethoscope,
  MessageSquare
} from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsCard from "@/components/dashboard/StatsCard";
import ActiveSubscriptionCard from "@/components/dashboard/ActiveSubscriptionCard";

const SchoolAdminDashboard = () => {
  const { teacher, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalTeachers: 0,
    totalStudents: 0,
    totalDoctors: 0,
    pendingAlerts: 0,
    thisWeekFeedback: 0,
    upcomingClasses: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!teacher || teacher.role !== 'admin') {
      navigate('/teacher-login');
      return;
    }
    loadDashboardData();
  }, [teacher, navigate]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load stats for the school
      const [teachersResult, studentsResult, doctorsResult, alertsResult, feedbackResult, classesResult] = await Promise.all([
        supabase.from('teachers').select('id').eq('school', teacher.school).neq('role', 'admin'),
        supabase.from('students').select('id').eq('school', teacher.school),
        supabase.from('teachers').select('id').eq('school', teacher.school).eq('role', 'doctor'),
        supabase.from('mental_health_alerts').select('id').eq('school', teacher.school).eq('is_reviewed', false),
        supabase.from('feedback').select('id').gte('submitted_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('class_schedules').select('id').eq('school', teacher.school).gte('class_date', new Date().toISOString().split('T')[0])
      ]);

      setStats({
        totalTeachers: teachersResult.data?.length || 0,
        totalStudents: studentsResult.data?.length || 0,
        totalDoctors: doctorsResult.data?.length || 0,
        pendingAlerts: alertsResult.data?.length || 0,
        thisWeekFeedback: feedbackResult.data?.length || 0,
        upcomingClasses: classesResult.data?.length || 0
      });

      // Load subscription info
      const { data: subscriptionData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('school_name', teacher.school)
        .single();
      
      setSubscription(subscriptionData);

      // Load recent activity (recent feedback and alerts)
      const { data: recentFeedback } = await supabase
        .from('feedback')
        .select(`
          id, 
          student_name,
          submitted_at,
          emotional_state,
          class_schedules(lesson_topic, subject)
        `)
        .eq('class_schedules.school', teacher.school)
        .order('submitted_at', { ascending: false })
        .limit(5);

      const { data: recentAlerts } = await supabase
        .from('mental_health_alerts')
        .select('id, student_name, created_at, alert_type, severity_level')
        .eq('school', teacher.school)
        .order('created_at', { ascending: false })
        .limit(5);

      const combinedActivity = [
        ...(recentFeedback || []).map(item => ({
          type: 'feedback',
          ...item
        })),
        ...(recentAlerts || []).map(item => ({
          type: 'alert',
          ...item
        }))
      ].sort((a, b) => new Date(b.submitted_at || b.created_at) - new Date(a.submitted_at || a.created_at));

      setRecentActivity(combinedActivity.slice(0, 8));

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteTeacher = () => {
    // Navigate to invite teacher functionality
    toast({
      title: "Feature Coming Soon",
      description: "Teacher invitation feature will be available soon",
    });
  };

  const handleManageSubscription = () => {
    // Navigate to subscription management
    toast({
      title: "Feature Coming Soon", 
      description: "Subscription management feature will be available soon",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        user={teacher} 
        onLogout={logout}
        title="School Admin Dashboard"
        subtitle={`Managing ${teacher.school}`}
      />
      
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatsCard
            title="Teachers"
            value={stats.totalTeachers}
            description="Active in your school"
            icon={<UserCheck className="w-4 h-4" />}
          />
          <StatsCard
            title="Students"
            value={stats.totalStudents}
            description="Enrolled students"
            icon={<GraduationCap className="w-4 h-4" />}
          />
          <StatsCard
            title="Mental Health Staff"
            value={stats.totalDoctors}
            description="Available doctors"
            icon={<Stethoscope className="w-4 h-4" />}
          />
          <StatsCard
            title="Pending Alerts"
            value={stats.pendingAlerts}
            description="Requiring attention"
            icon={<AlertTriangle className="w-4 h-4" />}
            variant={stats.pendingAlerts > 0 ? "destructive" : "default"}
          />
          <StatsCard
            title="This Week's Feedback"
            value={stats.thisWeekFeedback}
            description="Student responses"
            icon={<MessageSquare className="w-4 h-4" />}
          />
          <StatsCard
            title="Upcoming Classes"
            value={stats.upcomingClasses}
            description="Scheduled ahead"
            icon={<Calendar className="w-4 h-4" />}
          />
        </div>

        {/* Subscription Status */}
        {subscription && (
          <ActiveSubscriptionCard 
            subscription={subscription}
            onManage={handleManageSubscription}
          />
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="staff">Staff Management</TabsTrigger>
            <TabsTrigger value="alerts">Mental Health Alerts</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest feedback and alerts from your school</CardDescription>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No recent activity</p>
                ) : (
                  <div className="space-y-3">
                    {recentActivity.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {item.type === 'feedback' ? (
                            <MessageSquare className="w-4 h-4 text-blue-500" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                          )}
                          <div>
                            <p className="font-medium">{item.student_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.type === 'feedback' 
                                ? `Feedback on ${item.class_schedules?.lesson_topic || 'lesson'}`
                                : `Mental health alert (${item.alert_type})`
                              }
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={item.type === 'feedback' ? 'default' : 'destructive'}>
                            {item.type === 'feedback' ? 'Feedback' : 'Alert'}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(item.submitted_at || item.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="staff" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Staff Management
                </CardTitle>
                <CardDescription>Manage teachers and staff at your school</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button onClick={handleInviteTeacher} className="w-full">
                    <Users className="w-4 h-4 mr-2" />
                    Invite New Teacher
                  </Button>
                  <p className="text-muted-foreground text-sm text-center">
                    Staff management features will be available soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Mental Health Alerts
                </CardTitle>
                <CardDescription>Review and manage student mental health concerns</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-4">
                  Mental health alert management features will be available soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  School Analytics
                </CardTitle>
                <CardDescription>Detailed insights about your school's performance</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-4">
                  Analytics features will be available soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  School Settings
                </CardTitle>
                <CardDescription>Configure settings for your school</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button variant="outline" onClick={handleManageSubscription} className="w-full">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Manage Subscription
                  </Button>
                  <p className="text-muted-foreground text-sm text-center">
                    Additional settings will be available soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SchoolAdminDashboard;
