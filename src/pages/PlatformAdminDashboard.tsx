
import { useEffect, useState } from "react";
import { usePlatformAdmin } from "@/contexts/PlatformAdminContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import DashboardHeader from "@/components/platform-admin/DashboardHeader";
import SystemInfoCard from "@/components/platform-admin/SystemInfoCard";
import OverviewCards from "@/components/platform-admin/OverviewCards";
import SubscriptionManagement from "@/components/platform-admin/SubscriptionManagement";
import StudentStatistics from "@/components/platform-admin/StudentStatistics";
import ResponseAnalytics from "@/components/platform-admin/ResponseAnalytics";
import FeedbackAnalytics from "@/components/platform-admin/FeedbackAnalytics";
import SchoolOverview from "@/components/platform-admin/SchoolOverview";

const PlatformAdminDashboard = () => {
  const { admin, isLoading, logout } = usePlatformAdmin();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);
  const [lastRefreshTime, setLastRefreshTime] = useState<string>('Never');

  const loadDashboardData = async (isRefresh = false) => {
    console.log('📊 LOADING DASHBOARD DATA - START', { isRefresh, currentRefreshCount: refreshCount });
    
    if (isRefresh) {
      toast.info("Refreshing dashboard data...");
      setLastRefreshTime(new Date().toLocaleTimeString());
    }
    
    setDataLoading(true);
    
    try {
      console.log('📊 FETCHING SCHOOLS DATA...');
      const { data: schoolsData, error: schoolsError } = await supabase
        .from('teachers')
        .select('school')
        .not('school', 'is', null);
      
      if (schoolsError) {
        console.error('❌ SCHOOLS ERROR:', schoolsError);
        throw schoolsError;
      }
      
      console.log('✅ SCHOOLS DATA FETCHED:', schoolsData?.length);
      const uniqueSchools = [...new Set(schoolsData?.map(t => t.school) || [])];
      
      console.log('📊 FETCHING TEACHERS COUNT...');
      const { count: teachersCount, error: teachersError } = await supabase
        .from('teachers')
        .select('*', { count: 'exact', head: true });
      
      if (teachersError) {
        console.error('❌ TEACHERS ERROR:', teachersError);
        throw teachersError;
      }
      
      console.log('✅ TEACHERS COUNT:', teachersCount);
      
      console.log('📊 FETCHING STUDENTS COUNT...');
      const { count: studentsCount, error: studentsError } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });
      
      if (studentsError) {
        console.error('❌ STUDENTS ERROR:', studentsError);
        throw studentsError;
      }
      
      console.log('✅ STUDENTS COUNT:', studentsCount);
      
      console.log('📊 FETCHING FEEDBACK COUNT...');
      const { count: feedbackCount, error: feedbackError } = await supabase
        .from('feedback')
        .select('*', { count: 'exact', head: true });
      
      if (feedbackError) {
        console.error('❌ FEEDBACK ERROR:', feedbackError);
        throw feedbackError;
      }
      
      console.log('✅ FEEDBACK COUNT:', feedbackCount);
      
      console.log('📊 FETCHING SUBSCRIPTIONS...');
      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from('subscriptions')
        .select('*');
      
      if (subscriptionsError) {
        console.error('❌ SUBSCRIPTIONS ERROR:', subscriptionsError);
        throw subscriptionsError;
      }
      
      console.log('✅ SUBSCRIPTIONS DATA:', subscriptionsData?.length);
      
      const activeSubscriptions = subscriptionsData?.filter(s => s.status === 'active').length || 0;
      const monthlyRevenue = subscriptionsData?.reduce((sum, sub) => {
        if (sub.status === 'active') {
          return sum + (sub.amount / 100);
        }
        return sum;
      }, 0) || 0;
      
      const newData = {
        totalSchools: uniqueSchools.length,
        totalTeachers: teachersCount || 0,
        totalStudents: studentsCount || 0,
        totalResponses: feedbackCount || 0,
        subscriptions: subscriptionsData || [],
        activeSubscriptions,
        monthlyRevenue,
        studentStats: [],
        schoolStats: uniqueSchools.map(school => ({
          school,
          total_teachers: schoolsData?.filter(t => t.school === school).length || 0
        })),
        feedbackStats: []
      };
      
      console.log('📊 NEW DATA PREPARED:', {
        schools: newData.totalSchools,
        teachers: newData.totalTeachers,
        students: newData.totalStudents,
        responses: newData.totalResponses,
        subscriptions: newData.subscriptions.length
      });
      
      setDashboardData(newData);
      
      if (isRefresh) {
        const newCount = refreshCount + 1;
        setRefreshCount(newCount);
        console.log('🔄 REFRESH COUNT UPDATED TO:', newCount);
        toast.success(`Dashboard refreshed successfully! (Refresh #${newCount})`);
      }
      
      console.log('✅ DASHBOARD DATA LOADED SUCCESSFULLY');
      
    } catch (error) {
      console.error('❌ DASHBOARD DATA ERROR:', error);
      toast.error("Failed to load dashboard data");
      
      setDashboardData({
        totalSchools: 0,
        totalTeachers: 0,
        totalStudents: 0,
        totalResponses: 0,
        subscriptions: [],
        activeSubscriptions: 0,
        monthlyRevenue: 0,
        studentStats: [],
        schoolStats: [],
        feedbackStats: []
      });
    } finally {
      setDataLoading(false);
      console.log('📊 LOADING DASHBOARD DATA - COMPLETE');
    }
  };

  useEffect(() => {
    if (admin) {
      console.log('📊 INITIAL LOAD FOR ADMIN:', admin.email);
      loadDashboardData(false);
    }
  }, [admin]);

  const handleRefresh = () => {
    console.log('🔄 REFRESH TRIGGERED - CURRENT COUNT:', refreshCount);
    loadDashboardData(true);
  };

  const handleLogout = () => {
    console.log('🚪 LOGOUT TRIGGERED');
    logout();
  };

  if (isLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">
          {isLoading ? 'Loading admin session...' : 'Loading dashboard data...'}
        </div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-red-600">Please log in to access the dashboard</div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">No data available</div>
      </div>
    );
  }

  const {
    totalSchools,
    totalTeachers,
    totalStudents,
    totalResponses,
    subscriptions,
    activeSubscriptions,
    monthlyRevenue,
    studentStats,
    schoolStats,
    feedbackStats
  } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        adminName={admin.email}
        onRefresh={handleRefresh}
        onLogout={handleLogout}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-yellow-800">Debug Information</h3>
              <p className="text-yellow-700">Refresh Count: <span className="font-bold">{refreshCount}</span></p>
              <p className="text-yellow-700">Last Refresh: <span className="font-bold">{lastRefreshTime}</span></p>
              <p className="text-yellow-700">Data Loading: <span className="font-bold">{dataLoading ? 'Yes' : 'No'}</span></p>
            </div>
            <div className="text-sm text-yellow-600">
              Check console for detailed logs (🔄, 📊, ✅, ❌)
            </div>
          </div>
        </div>
        
        <SystemInfoCard
          totalSchools={totalSchools}
          totalTeachers={totalTeachers}
          totalStudents={totalStudents}
          totalResponses={totalResponses}
          subscriptionsCount={subscriptions.length}
          activeSubscriptions={activeSubscriptions}
          monthlyRevenue={monthlyRevenue}
        />

        <OverviewCards
          totalSchools={totalSchools}
          totalTeachers={totalTeachers}
          totalStudents={totalStudents}
          totalResponses={totalResponses}
        />

        <SubscriptionManagement
          subscriptions={subscriptions}
        />

        <StudentStatistics
          studentStats={studentStats}
          schoolStats={schoolStats}
        />

        <ResponseAnalytics
          feedbackStats={feedbackStats}
        />

        <FeedbackAnalytics
          feedbackStats={feedbackStats}
        />

        <SchoolOverview
          schoolStats={schoolStats}
        />
      </div>
    </div>
  );
};

export default PlatformAdminDashboard;
