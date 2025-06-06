
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePlatformAdmin } from "@/contexts/PlatformAdminContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  SchoolIcon, 
  UsersIcon, 
  MessageSquareIcon, 
  CreditCardIcon, 
  LogOutIcon,
  BarChart3Icon,
  TrendingUpIcon
} from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

interface SchoolStats {
  school: string;
  total_grades: number;
  total_subjects: number;
  total_classes: number;
  total_teachers: number;
}

interface FeedbackStats {
  school: string;
  grade: string;
  subject: string;
  lesson_topic: string;
  class_date: string;
  total_responses: number;
  avg_understanding: number;
  avg_interest: number;
  avg_growth: number;
  anonymous_responses: number;
  named_responses: number;
}

interface Subscription {
  id: string;
  school_name: string;
  status: string;
  plan_type: string;
  amount: number;
  currency: string;
  current_period_end: string;
  created_at: string;
}

const PlatformAdminDashboard = () => {
  const { admin, logout } = usePlatformAdmin();
  const { toast } = useToast();
  const [schoolStats, setSchoolStats] = useState<SchoolStats[]>([]);
  const [feedbackStats, setFeedbackStats] = useState<FeedbackStats[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load school statistics
      const { data: schoolData, error: schoolError } = await supabase
        .from('school_statistics')
        .select('*');

      if (schoolError) throw schoolError;
      setSchoolStats(schoolData || []);

      // Load feedback analytics
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedback_analytics')
        .select('*')
        .order('total_responses', { ascending: false });

      if (feedbackError) throw feedbackError;
      setFeedbackStats(feedbackData || []);

      // Load subscriptions
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (subscriptionError) throw subscriptionError;
      setSubscriptions(subscriptionData || []);

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

  const chartConfig = {
    responses: {
      label: "Total Responses",
      color: "#8b5cf6",
    },
  };

  const chartData = feedbackStats.slice(0, 10).map(stat => ({
    name: `${stat.school} - ${stat.subject}`,
    responses: stat.total_responses
  }));

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
            <div className="flex items-center gap-2">
              <SchoolIcon className="w-8 h-8 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-900">Platform Admin Dashboard</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {admin?.name}</span>
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
        {/* Overview Cards */}
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
              <div className="text-2xl font-bold">
                {schoolStats.reduce((acc, curr) => acc + curr.total_teachers, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
              <MessageSquareIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {feedbackStats.reduce((acc, curr) => acc + curr.total_responses, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {subscriptions.filter(s => s.status === 'active').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="schools">Schools</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3Icon className="w-5 h-5" />
                  Response Analytics
                </CardTitle>
                <CardDescription>Student feedback responses by school and subject</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 10 }}
                        angle={-45}
                        textAnchor="end"
                        height={100}
                      />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="responses" fill="var(--color-responses)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detailed Feedback Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>School</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Responses</TableHead>
                      <TableHead>Avg Understanding</TableHead>
                      <TableHead>Avg Interest</TableHead>
                      <TableHead>Avg Growth</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feedbackStats.slice(0, 20).map((stat, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{stat.school}</TableCell>
                        <TableCell>{stat.subject}</TableCell>
                        <TableCell>{stat.grade}</TableCell>
                        <TableCell>{stat.total_responses}</TableCell>
                        <TableCell>{stat.avg_understanding?.toFixed(1) || 'N/A'}</TableCell>
                        <TableCell>{stat.avg_interest?.toFixed(1) || 'N/A'}</TableCell>
                        <TableCell>{stat.avg_growth?.toFixed(1) || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schools" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>School Overview</CardTitle>
                <CardDescription>Statistics for all registered schools</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>School Name</TableHead>
                      <TableHead>Teachers</TableHead>
                      <TableHead>Grades</TableHead>
                      <TableHead>Subjects</TableHead>
                      <TableHead>Total Classes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schoolStats.map((school, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{school.school}</TableCell>
                        <TableCell>{school.total_teachers}</TableCell>
                        <TableCell>{school.total_grades}</TableCell>
                        <TableCell>{school.total_subjects}</TableCell>
                        <TableCell>{school.total_classes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUpIcon className="w-5 h-5" />
                  Subscription Management
                </CardTitle>
                <CardDescription>Monitor and manage school subscriptions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>School</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Period End</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map((subscription) => (
                      <TableRow key={subscription.id}>
                        <TableCell className="font-medium">{subscription.school_name}</TableCell>
                        <TableCell>{subscription.plan_type}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={subscription.status === 'active' ? 'default' : 'destructive'}
                          >
                            {subscription.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          ${(subscription.amount / 100).toFixed(2)} {subscription.currency.toUpperCase()}
                        </TableCell>
                        <TableCell>
                          {subscription.current_period_end ? 
                            new Date(subscription.current_period_end).toLocaleDateString() : 
                            'N/A'
                          }
                        </TableCell>
                        <TableCell>
                          {new Date(subscription.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default PlatformAdminDashboard;
