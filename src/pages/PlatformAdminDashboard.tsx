
import { useState, useEffect } from "react";
import { usePlatformAdmin } from "@/contexts/PlatformAdminContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getStudentStatistics, StudentStatistics } from "@/services/platformAdminService";
import MentalHealthAlerts from "@/components/MentalHealthAlerts";
import PerformanceFilters from "@/components/PerformanceFilters";
import DiscountCodeManagement from "@/components/DiscountCodeManagement";
import DashboardHeader from "@/components/platform-admin/DashboardHeader";
import SystemInfoCard from "@/components/platform-admin/SystemInfoCard";
import OverviewCards from "@/components/platform-admin/OverviewCards";
import SubscriptionManagement from "@/components/platform-admin/SubscriptionManagement";
import StudentStatistics from "@/components/platform-admin/StudentStatistics";
import ResponseAnalytics from "@/components/platform-admin/ResponseAnalytics";
import FeedbackAnalytics from "@/components/platform-admin/FeedbackAnalytics";
import SchoolOverview from "@/components/platform-admin/SchoolOverview";

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
  stripe_customer_id: string;
  stripe_subscription_id: string;
}

const PlatformAdminDashboard = () => {
  const { admin, logout } = usePlatformAdmin();
  const { toast } = useToast();
  const [schoolStats, setSchoolStats] = useState<SchoolStats[]>([]);
  const [feedbackStats, setFeedbackStats] = useState<FeedbackStats[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [studentStats, setStudentStats] = useState<StudentStatistics[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      console.log('=== PLATFORM ADMIN DASHBOARD DEBUG START ===');
      
      // Load school statistics from class_schedules and aggregate manually
      const { data: classSchedules, error: classError } = await supabase
        .from('class_schedules')
        .select('school, grade, subject, teacher_id');

      if (classError) {
        console.error('Class schedules error:', classError);
      } else {
        // Aggregate school statistics manually
        const schoolStatsMap: Record<string, SchoolStats> = {};
        classSchedules?.forEach((cs) => {
          const school = cs.school;
          if (!schoolStatsMap[school]) {
            schoolStatsMap[school] = {
              school,
              total_grades: new Set(),
              total_subjects: new Set(),
              total_classes: 0,
              total_teachers: new Set()
            } as any;
          }
          (schoolStatsMap[school].total_grades as any).add(cs.grade);
          (schoolStatsMap[school].total_subjects as any).add(cs.subject);
          schoolStatsMap[school].total_classes++;
          (schoolStatsMap[school].total_teachers as any).add(cs.teacher_id);
        });

        // Convert sets to counts
        const aggregatedStats: SchoolStats[] = Object.values(schoolStatsMap).map(stat => ({
          school: stat.school,
          total_grades: (stat.total_grades as any).size,
          total_subjects: (stat.total_subjects as any).size,
          total_classes: stat.total_classes,
          total_teachers: (stat.total_teachers as any).size
        }));

        setSchoolStats(aggregatedStats);
        console.log('School stats loaded:', aggregatedStats.length);
      }

      // Load feedback analytics
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedback_analytics')
        .select('*')
        .order('total_responses', { ascending: false });

      if (feedbackError) {
        console.error('Feedback analytics error:', feedbackError);
      } else {
        setFeedbackStats(feedbackData || []);
        console.log('Feedback stats loaded:', feedbackData?.length);
      }

      // Load subscriptions with detailed logging
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('=== SUBSCRIPTIONS DEBUG ===');
      console.log('Subscription query error:', subscriptionError);
      console.log('Subscription data:', subscriptionData);
      console.log('Number of subscriptions:', subscriptionData?.length || 0);

      if (subscriptionError) {
        console.error('Subscription error:', subscriptionError);
        toast({
          title: "Error loading subscriptions",
          description: subscriptionError.message,
          variant: "destructive",
        });
      } else {
        setSubscriptions(subscriptionData || []);
      }

      // Load student statistics
      const { statistics, error: studentStatsError } = await getStudentStatistics();
      
      if (studentStatsError) {
        console.error('Student stats error:', studentStatsError);
        toast({
          title: "Error loading student data",
          description: studentStatsError,
          variant: "destructive",
        });
      } else {
        setStudentStats(statistics || []);
        console.log('Student stats loaded:', statistics?.length);
      }

      console.log('=== PLATFORM ADMIN DASHBOARD DEBUG END ===');

    } catch (error) {
      console.error('Dashboard load error:', error);
      toast({
        title: "Error loading data",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = () => {
    console.log('Refreshing platform admin data...');
    setIsLoading(true);
    loadDashboardData();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Calculate totals for the summary cards
  const totalStudents = studentStats.reduce((acc, curr) => acc + curr.total_students, 0);
  const totalSchools = schoolStats.length;
  const totalTeachers = schoolStats.reduce((acc, curr) => acc + curr.total_teachers, 0);
  const totalResponses = feedbackStats.reduce((acc, curr) => acc + curr.total_responses, 0);
  const monthlyRevenue = subscriptions.reduce((sum, s) => sum + (s.amount || 0), 0) / 100;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        adminName={admin?.name}
        onRefresh={refreshData}
        onLogout={logout}
      />

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <SystemInfoCard
          totalSchools={totalSchools}
          totalTeachers={totalTeachers}
          totalStudents={totalStudents}
          totalResponses={totalResponses}
          subscriptionsCount={subscriptions.length}
          activeSubscriptions={subscriptions.filter(s => s.status === 'active').length}
          monthlyRevenue={monthlyRevenue}
        />

        <OverviewCards
          totalStudents={totalStudents}
          totalSchools={totalSchools}
          totalTeachers={totalTeachers}
          totalResponses={totalResponses}
        />

        <div className="space-y-8">
          <SubscriptionManagement subscriptions={subscriptions} />
          <StudentStatistics studentStats={studentStats} schoolStats={schoolStats} />
          <MentalHealthAlerts />
          <ResponseAnalytics feedbackStats={feedbackStats} />
          <FeedbackAnalytics feedbackStats={feedbackStats} />
          <SchoolOverview schoolStats={schoolStats} />
          <PerformanceFilters />
          <DiscountCodeManagement />
        </div>
      </main>
    </div>
  );
};

export default PlatformAdminDashboard;
