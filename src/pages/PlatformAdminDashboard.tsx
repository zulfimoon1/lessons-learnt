
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

// FORCE DEPLOYMENT: 2025-06-11T11:45:00Z - GitHub Pages refresh
// VERSION TRACKING FOR DEPLOYMENT VERIFICATION
const DASHBOARD_VERSION = "v2.2.0-FORCE-DEPLOY-" + new Date().getTime();
console.log("🚀 DASHBOARD VERSION LOADED:", DASHBOARD_VERSION);

const PlatformAdminDashboard = () => {
  const { admin, isLoading, logout } = usePlatformAdmin();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);
  const [lastRefreshTime, setLastRefreshTime] = useState<string>('Never');

  const loadDashboardData = async (isRefresh = false) => {
    const timestamp = new Date().toISOString();
    console.log(`🔄 [${timestamp}] REFRESH TRIGGERED - Count: ${refreshCount}, isRefresh: ${isRefresh}`);
    
    if (isRefresh) {
      const newCount = refreshCount + 1;
      setRefreshCount(newCount);
      setLastRefreshTime(new Date().toLocaleTimeString());
      toast.info(`Refreshing dashboard data... (Refresh #${newCount})`);
      console.log(`🔄 [${timestamp}] REFRESH COUNT UPDATED TO: ${newCount}`);
    }
    
    setDataLoading(true);
    
    try {
      console.log(`📊 [${timestamp}] FETCHING DATA...`);
      
      // Fetch all data
      const [schoolsResult, teachersResult, studentsResult, feedbackResult, subscriptionsResult] = await Promise.all([
        supabase.from('teachers').select('school').not('school', 'is', null),
        supabase.from('teachers').select('*', { count: 'exact', head: true }),
        supabase.from('students').select('*', { count: 'exact', head: true }),
        supabase.from('feedback').select('*', { count: 'exact', head: true }),
        supabase.from('subscriptions').select('*')
      ]);

      if (schoolsResult.error) throw schoolsResult.error;
      if (teachersResult.error) throw teachersResult.error;
      if (studentsResult.error) throw studentsResult.error;
      if (feedbackResult.error) throw feedbackResult.error;
      if (subscriptionsResult.error) throw subscriptionsResult.error;

      const uniqueSchools = [...new Set(schoolsResult.data?.map(t => t.school) || [])];
      const activeSubscriptions = subscriptionsResult.data?.filter(s => s.status === 'active').length || 0;
      const monthlyRevenue = subscriptionsResult.data?.reduce((sum, sub) => {
        if (sub.status === 'active') {
          return sum + (sub.amount / 100);
        }
        return sum;
      }, 0) || 0;

      const newData = {
        totalSchools: uniqueSchools.length,
        totalTeachers: teachersResult.count || 0,
        totalStudents: studentsResult.count || 0,
        totalResponses: feedbackResult.count || 0,
        subscriptions: subscriptionsResult.data || [],
        activeSubscriptions,
        monthlyRevenue,
        studentStats: [],
        schoolStats: uniqueSchools.map(school => ({
          school,
          total_teachers: schoolsResult.data?.filter(t => t.school === school).length || 0
        })),
        feedbackStats: []
      };

      setDashboardData(newData);
      console.log(`✅ [${timestamp}] DATA LOADED SUCCESSFULLY - Schools: ${newData.totalSchools}, Teachers: ${newData.totalTeachers}`);
      
      if (isRefresh) {
        toast.success(`Dashboard refreshed successfully! (Refresh #${refreshCount + 1})`);
      }
      
    } catch (error) {
      console.error(`❌ [${timestamp}] ERROR:`, error);
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
      console.log(`📊 [${timestamp}] LOADING COMPLETE`);
    }
  };

  useEffect(() => {
    if (admin) {
      console.log('📊 INITIAL LOAD FOR ADMIN:', admin.email);
      loadDashboardData(false);
    }
  }, [admin]);

  const handleRefresh = () => {
    console.log('🔄 REFRESH BUTTON CLICKED - CURRENT COUNT:', refreshCount);
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
        {/* DEPLOYMENT VERIFICATION BANNER */}
        <div className="bg-gradient-to-r from-green-100 to-blue-100 border-2 border-green-400 rounded-xl p-6 shadow-lg">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-green-800">
              🚀 DEPLOYMENT VERIFICATION TEST
            </h2>
            <p className="text-lg font-semibold text-blue-700">
              Version: {DASHBOARD_VERSION}
            </p>
            <p className="text-green-700">
              If you can see this banner, the NEW code is deployed! ✅
            </p>
            <p className="text-sm text-gray-600">
              Deployed: {new Date().toLocaleString()}
            </p>
          </div>
        </div>

        {/* PROMINENT DEBUG PANEL - This MUST be visible */}
        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400 rounded-xl p-6 shadow-lg">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-yellow-800 flex items-center gap-2">
                🐛 DEBUG PANEL - REFRESH MONITORING
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/50 rounded-lg p-3">
                  <p className="text-yellow-700 font-semibold">Refresh Count:</p>
                  <p className="text-2xl font-bold text-blue-600">{refreshCount}</p>
                </div>
                <div className="bg-white/50 rounded-lg p-3">
                  <p className="text-yellow-700 font-semibold">Last Refresh:</p>
                  <p className="text-lg font-bold text-blue-600">{lastRefreshTime}</p>
                </div>
                <div className="bg-white/50 rounded-lg p-3">
                  <p className="text-yellow-700 font-semibold">Data Loading:</p>
                  <p className="text-lg font-bold text-blue-600">{dataLoading ? 'Yes' : 'No'}</p>
                </div>
                <div className="bg-white/50 rounded-lg p-3">
                  <p className="text-yellow-700 font-semibold">Current Time:</p>
                  <p className="text-lg font-bold text-blue-600">{new Date().toLocaleTimeString()}</p>
                </div>
              </div>
            </div>
            <div className="text-sm text-yellow-600 bg-white/30 rounded-lg p-3">
              <p className="font-semibold">Console Log Markers:</p>
              <p>🔄 = Refresh events</p>
              <p>📊 = Data operations</p>
              <p>✅ = Success</p>
              <p>❌ = Errors</p>
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
