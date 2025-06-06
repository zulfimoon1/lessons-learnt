
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  SchoolIcon, 
  UsersIcon, 
  MessageSquareIcon, 
  BarChart3Icon, 
  LogOutIcon,
  CreditCardIcon,
  RefreshCwIcon,
  MailIcon
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import InviteTeacherForm from "@/components/InviteTeacherForm";

interface Teacher {
  id: string;
  name: string;
  email: string;
  school: string;
  role: string;
  created_at: string;
}

interface FeedbackSummary {
  teacher: string;
  subject: string;
  class_date: string;
  total_responses: number;
  avg_understanding: number;
  avg_interest: number;
  avg_growth: number;
}

interface Subscription {
  id: string;
  school_name: string;
  status: string;
  amount: number;
  current_period_end: string;
  plan_type: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
}

interface Invitation {
  id: string;
  email: string;
  school: string;
  role: string;
  status: string;
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
}

const AdminDashboard = () => {
  const { teacher, logout } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [feedbackSummary, setFeedbackSummary] = useState<FeedbackSummary[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);

  useEffect(() => {
    if (!teacher || teacher.role !== 'admin') {
      console.log('Not an admin user, redirecting to teacher login');
      navigate('/teacher-login');
      return;
    }
    loadDashboardData();
  }, [teacher, navigate]);

  const loadDashboardData = async () => {
    try {
      console.log('=== ADMIN DASHBOARD LOADING ===');
      console.log('Current admin teacher:', teacher);
      console.log('Admin school:', teacher?.school);
      
      setSubscriptionError(null);
      
      // Load teachers from the same school
      const { data: teachersData, error: teachersError } = await supabase
        .from('teachers')
        .select('*')
        .eq('school', teacher?.school)
        .order('created_at', { ascending: false });

      if (teachersError) {
        console.error('Teachers error:', teachersError);
        throw teachersError;
      }
      
      console.log('Teachers loaded:', teachersData?.length || 0);
      setTeachers(teachersData || []);

      // Load invitations for this school
      const { data: invitationsData, error: invitationsError } = await supabase
        .from('invitations')
        .select('*')
        .eq('school', teacher?.school)
        .order('created_at', { ascending: false });

      if (invitationsError) {
        console.error('Invitations error:', invitationsError);
      } else {
        console.log('Invitations loaded:', invitationsData?.length || 0);
        setInvitations(invitationsData || []);
      }

      // Load feedback summary for this school
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedback_analytics')
        .select('*')
        .eq('school', teacher?.school)
        .order('class_date', { ascending: false })
        .limit(10);

      if (feedbackError) {
        console.error('Feedback error:', feedbackError);
        throw feedbackError;
      }
      
      const transformedFeedback: FeedbackSummary[] = (feedbackData || []).map(item => ({
        teacher: item.lesson_topic || 'Unknown Teacher',
        subject: item.subject,
        class_date: item.class_date,
        total_responses: item.total_responses,
        avg_understanding: item.avg_understanding,
        avg_interest: item.avg_interest,
        avg_growth: item.avg_growth
      }));
      
      console.log('Feedback loaded:', transformedFeedback.length);
      setFeedbackSummary(transformedFeedback);

      // Load subscription for this school
      await loadSubscription();

      console.log('=== ADMIN DASHBOARD COMPLETE ===');

    } catch (error) {
      console.error('Error loading admin dashboard data:', error);
      toast({
        title: "Error loading admin data",
        description: `Failed to load admin dashboard: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSubscription = async () => {
    try {
      console.log('=== LOADING SUBSCRIPTION ===');
      console.log('Looking for subscription for school:', teacher?.school);
      
      // Get all subscriptions to see what's available
      const { data: allSubs, error: allSubsError } = await supabase
        .from('subscriptions')
        .select('*');

      if (allSubsError) {
        console.error('Error fetching all subscriptions:', allSubsError);
        setSubscriptionError(`Error fetching subscriptions: ${allSubsError.message}`);
        return;
      }

      console.log('All subscriptions in database:', allSubs);

      if (!allSubs || allSubs.length === 0) {
        console.log('No subscriptions found in database');
        setSubscriptionError('No subscriptions found in the database');
        setSubscription(null);
        return;
      }

      // Try exact match first
      let foundSub = allSubs.find(sub => sub.school_name === teacher?.school);
      
      if (!foundSub) {
        // Try case-insensitive match
        foundSub = allSubs.find(sub => 
          sub.school_name?.toLowerCase() === teacher?.school?.toLowerCase()
        );
      }

      if (!foundSub) {
        // Try partial match
        foundSub = allSubs.find(sub => 
          sub.school_name?.includes(teacher?.school || '') || 
          (teacher?.school || '').includes(sub.school_name || '')
        );
      }

      if (foundSub) {
        console.log('Found subscription:', foundSub);
        setSubscription(foundSub);
        setSubscriptionError(null);
      } else {
        console.log('No matching subscription found for school:', teacher?.school);
        console.log('Available school names:', allSubs.map(s => s.school_name));
        setSubscriptionError(`No subscription found for school "${teacher?.school}". Available schools: ${allSubs.map(s => s.school_name).join(', ')}`);
        setSubscription(null);
      }

    } catch (error) {
      console.error('Error loading subscription:', error);
      setSubscriptionError(`Error loading subscription: ${error.message}`);
      setSubscription(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      console.log('Opening customer portal...');
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) {
        console.error('Customer portal error:', error);
        throw error;
      }
      
      if (data?.url) {
        console.log('Redirecting to portal:', data.url);
        window.open(data.url, '_blank');
      } else {
        throw new Error('No portal URL returned');
      }
    } catch (error) {
      console.error("Error opening customer portal:", error);
      toast({
        title: "Error",
        description: `Failed to open subscription management: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const refreshData = () => {
    console.log('Refreshing admin dashboard data...');
    setIsLoading(true);
    loadDashboardData();
  };

  const handleInviteSent = () => {
    // Refresh invitations data
    loadDashboardData();
  };

  const totalFeedback = feedbackSummary.reduce((sum, item) => sum + item.total_responses, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <SchoolIcon className="w-8 h-8 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-900">School Admin Dashboard</h1>
            </div>
            <Button onClick={refreshData} variant="outline" size="sm" className="flex items-center gap-2">
              <RefreshCwIcon className="w-4 h-4" />
              Refresh
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Admin: {teacher?.name}</span>
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
        {/* Subscription Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCardIcon className="w-5 h-5" />
              School Subscription Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subscription ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <Badge variant={subscription.status === 'active' ? 'default' : 'destructive'}>
                      {subscription.status}
                    </Badge>
                    <p className="text-sm text-gray-600 mt-1">
                      ${(subscription.amount / 100).toFixed(2)}/month ({subscription.plan_type})
                    </p>
                    <p className="text-xs text-gray-500">
                      School: {subscription.school_name}
                    </p>
                    {subscription.current_period_end && (
                      <p className="text-xs text-gray-500">
                        Next billing: {new Date(subscription.current_period_end).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Button onClick={handleManageSubscription} variant="outline">
                    Manage Subscription
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-600">No subscription found for this school</p>
                    <p className="text-xs text-gray-500">School: {teacher?.school}</p>
                    {subscriptionError && (
                      <p className="text-xs text-red-500 mt-1">{subscriptionError}</p>
                    )}
                  </div>
                  <Button 
                    onClick={() => navigate('/pricing')}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    Subscribe Now
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invite Teacher Section */}
        <InviteTeacherForm 
          school={teacher?.school || ''} 
          subscriptionId={subscription?.id}
          onInviteSent={handleInviteSent}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">School Teachers</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teachers.length}</div>
              <p className="text-xs text-muted-foreground">
                At {teacher?.school}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Invitations</CardTitle>
              <MailIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {invitations.filter(inv => inv.status === 'pending').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting response
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
              <MessageSquareIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalFeedback}</div>
              <p className="text-xs text-muted-foreground">
                From all teachers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">School</CardTitle>
              <SchoolIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{teacher?.school}</div>
              <p className="text-xs text-muted-foreground">
                Admin access
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Teachers and Invitations Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Teachers Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UsersIcon className="w-5 h-5" />
                School Teachers
              </CardTitle>
              <CardDescription>Active teachers in your school</CardDescription>
            </CardHeader>
            <CardContent>
              {teachers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teachers.map((teacher) => (
                      <TableRow key={teacher.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{teacher.name}</div>
                            <div className="text-sm text-gray-500">{teacher.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={teacher.role === 'admin' ? 'default' : 'secondary'}>
                            {teacher.role}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-gray-500 py-8">No teachers found</p>
              )}
            </CardContent>
          </Card>

          {/* Invitations Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MailIcon className="w-5 h-5" />
                Teacher Invitations
              </CardTitle>
              <CardDescription>Pending and accepted invitations</CardDescription>
            </CardHeader>
            <CardContent>
              {invitations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invitations.map((invitation) => (
                      <TableRow key={invitation.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{invitation.email}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(invitation.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              invitation.status === 'accepted' ? 'default' : 
                              invitation.status === 'pending' ? 'secondary' : 
                              'destructive'
                            }
                          >
                            {invitation.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-gray-500 py-8">No invitations sent yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Feedback Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3Icon className="w-5 h-5" />
              School Feedback Analytics
            </CardTitle>
            <CardDescription>Recent feedback from your school</CardDescription>
          </CardHeader>
          <CardContent>
            {feedbackSummary.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher/Topic</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-center">Avg Scores</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedbackSummary.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.teacher}</TableCell>
                      <TableCell>{item.subject}</TableCell>
                      <TableCell>{new Date(item.class_date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-center">
                        <div className="text-xs space-y-1">
                          <div>Understanding: {item.avg_understanding?.toFixed(1) || 'N/A'}</div>
                          <div>Interest: {item.avg_interest?.toFixed(1) || 'N/A'}</div>
                          <div>Growth: {item.avg_growth?.toFixed(1) || 'N/A'}</div>
                          <div className="text-gray-500">({item.total_responses} responses)</div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-gray-500 py-8">No feedback data available yet</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
