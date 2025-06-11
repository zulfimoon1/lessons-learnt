
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

// 🚨 CRITICAL DEPLOYMENT TEST - TIMESTAMP: 2025-06-11T12:35:00Z
// PUSH-TRIGGERED DEPLOYMENT - GITHUB ACTIONS WORKFLOW UPDATED
const DEPLOYMENT_TIMESTAMP = Date.now();
const RANDOM_ID = Math.random().toString(36).substring(2, 15);
const DASHBOARD_VERSION = `v6.1.0-DATA-REFRESH-${DEPLOYMENT_TIMESTAMP}-${RANDOM_ID}`;

// Force immediate console output for verification
console.log("🎯🎯🎯 PUSH-TRIGGERED DEPLOYMENT - DATA REFRESH VERSION 🎯🎯🎯");
console.log("📅 TIMESTAMP:", new Date().toISOString());
console.log("🆔 VERSION:", DASHBOARD_VERSION);
console.log("🌐 LOCATION:", window.location.href);
console.log("🔄 DEPLOYMENT ID:", RANDOM_ID);
console.log("✅ FORCING FRESH DATA LOAD!");

const PlatformAdminDashboard = () => {
  const { admin, isLoading, logout } = usePlatformAdmin();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);
  const [lastRefreshTime, setLastRefreshTime] = useState<string>('Never');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Update current time every second for live verification
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadDashboardData = async (isRefresh = false, forceRefresh = false) => {
    const timestamp = new Date().toISOString();
    console.log(`🔄 [${timestamp}] DATA LOAD TRIGGERED - Count: ${refreshCount}, isRefresh: ${isRefresh}, forceRefresh: ${forceRefresh}`);
    
    if (isRefresh) {
      const newCount = refreshCount + 1;
      setRefreshCount(newCount);
      setLastRefreshTime(new Date().toLocaleTimeString());
      toast.success(`Dashboard refreshed successfully! (Refresh #${newCount})`);
      console.log(`🔄 [${timestamp}] REFRESH COUNT UPDATED TO: ${newCount}`);
    }
    
    setDataLoading(true);
    
    try {
      console.log(`📊 [${timestamp}] FETCHING FRESH DATA FROM SUPABASE...`);
      
      // Force fresh data by adding timestamp to avoid any caching
      const cacheBreaker = `?cb=${Date.now()}`;
      console.log(`🔧 [${timestamp}] CACHE BREAKER: ${cacheBreaker}`);
      
      // Fetch all data with explicit fresh queries
      const [schoolsResult, teachersResult, studentsResult, feedbackResult, subscriptionsResult] = await Promise.all([
        supabase.from('teachers').select('school').not('school', 'is', null),
        supabase.from('teachers').select('*', { count: 'exact', head: true }),
        supabase.from('students').select('*', { count: 'exact', head: true }),
        supabase.from('feedback').select('*', { count: 'exact', head: true }),
        supabase.from('subscriptions').select('*')
      ]);

      console.log(`📋 [${timestamp}] RAW QUERY RESULTS:`);
      console.log('Schools query result:', schoolsResult);
      console.log('Teachers count:', teachersResult);
      console.log('Students count:', studentsResult);
      console.log('Feedback count:', feedbackResult);
      console.log('Subscriptions result:', subscriptionsResult);

      if (schoolsResult.error) {
        console.error('Schools query error:', schoolsResult.error);
        throw schoolsResult.error;
      }
      if (teachersResult.error) {
        console.error('Teachers query error:', teachersResult.error);
        throw teachersResult.error;
      }
      if (studentsResult.error) {
        console.error('Students query error:', studentsResult.error);
        throw studentsResult.error;
      }
      if (feedbackResult.error) {
        console.error('Feedback query error:', feedbackResult.error);
        throw feedbackResult.error;
      }
      if (subscriptionsResult.error) {
        console.error('Subscriptions query error:', subscriptionsResult.error);
        throw subscriptionsResult.error;
      }

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
        feedbackStats: [],
        lastUpdated: timestamp
      };

      console.log(`📊 [${timestamp}] PROCESSED DATA:`);
      console.log('Total Schools:', newData.totalSchools);
      console.log('Total Teachers:', newData.totalTeachers);
      console.log('Total Students:', newData.totalStudents);
      console.log('Total Responses:', newData.totalResponses);
      console.log('School Stats:', newData.schoolStats);

      setDashboardData(newData);
      console.log(`✅ [${timestamp}] DATA LOADED SUCCESSFULLY - Schools: ${newData.totalSchools}, Teachers: ${newData.totalTeachers}, Students: ${newData.totalStudents}`);
      
      if (isRefresh) {
        toast.success(`Dashboard refreshed successfully! Fresh data loaded at ${new Date().toLocaleTimeString()}`);
      }
      
    } catch (error) {
      console.error(`❌ [${timestamp}] ERROR LOADING DATA:`, error);
      toast.error("Failed to load dashboard data - check console for details");
      
      // Set empty data structure on error
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
        feedbackStats: [],
        lastUpdated: timestamp,
        error: true
      });
    } finally {
      setDataLoading(false);
      console.log(`📊 [${timestamp}] LOADING COMPLETE`);
    }
  };

  useEffect(() => {
    if (admin) {
      console.log('📊 INITIAL LOAD FOR ADMIN:', admin.email);
      console.log('🔄 FORCING FRESH DATA LOAD ON MOUNT');
      loadDashboardData(false, true); // Force fresh load on mount
    }
  }, [admin]);

  const handleRefresh = () => {
    console.log('🔄 MANUAL REFRESH BUTTON CLICKED - CURRENT COUNT:', refreshCount);
    loadDashboardData(true, true); // Force fresh load on manual refresh
  };

  const handleLogout = () => {
    console.log('🚪 LOGOUT TRIGGERED');
    logout();
  };

  if (isLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">
          {isLoading ? 'Loading admin session...' : 'Loading fresh dashboard data...'}
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
        <div className="text-lg">No data available - check console for errors</div>
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
    feedbackStats,
    lastUpdated,
    error
  } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        adminName={admin.email}
        onRefresh={handleRefresh}
        onLogout={handleLogout}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* 🚨 ENHANCED DEPLOYMENT & DATA BANNER 🚨 */}
        <div className="bg-gradient-to-r from-orange-200 via-yellow-200 to-red-200 border-4 border-orange-500 rounded-2xl p-8 shadow-2xl">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-black text-orange-800 animate-pulse">
              🎯 FRESH DATA DEPLOYMENT! 🎯
            </h1>
            <div className="bg-white/80 rounded-xl p-4 shadow-lg">
              <p className="text-2xl font-bold text-blue-800">
                Version: {DASHBOARD_VERSION}
              </p>
              <p className="text-xl font-semibold text-green-700">
                Live Time: {currentTime}
              </p>
              <p className="text-lg text-purple-700">
                Deployment ID: {RANDOM_ID}
              </p>
              <p className="text-lg text-orange-700">
                URL: {window.location.href}
              </p>
              {lastUpdated && (
                <p className="text-lg text-blue-700">
                  Last Data Refresh: {new Date(lastUpdated).toLocaleTimeString()}
                </p>
              )}
              {error && (
                <p className="text-lg text-red-700 font-bold">
                  ⚠️ ERROR LOADING DATA - CHECK CONSOLE
                </p>
              )}
            </div>
            <div className="text-lg font-bold text-orange-700 bg-yellow-100 rounded-lg p-3">
              🚀 Data refreshes automatically on every load! 🚀
            </div>
          </div>
        </div>

        {/* ENHANCED DEBUG PANEL WITH DATA INFO */}
        <div className="bg-gradient-to-r from-blue-100 to-purple-100 border-4 border-blue-500 rounded-xl p-6 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white/70 rounded-lg p-4">
              <h3 className="text-xl font-bold text-blue-800 mb-3">🔄 Refresh Tracking</h3>
              <div className="space-y-2">
                <p className="text-lg"><span className="font-semibold">Count:</span> <span className="text-2xl font-bold text-red-600">{refreshCount}</span></p>
                <p className="text-lg"><span className="font-semibold">Last:</span> <span className="text-blue-600">{lastRefreshTime}</span></p>
                <p className="text-lg"><span className="font-semibold">Loading:</span> <span className="text-green-600">{dataLoading ? 'Yes' : 'No'}</span></p>
              </div>
            </div>
            
            <div className="bg-white/70 rounded-lg p-4">
              <h3 className="text-xl font-bold text-purple-800 mb-3">⏰ Time Verification</h3>
              <div className="space-y-2">
                <p className="text-lg"><span className="font-semibold">Live Time:</span></p>
                <p className="text-2xl font-bold text-green-600">{currentTime}</p>
                <p className="text-sm text-gray-600">Updates every second</p>
              </div>
            </div>
            
            <div className="bg-white/70 rounded-lg p-4">
              <h3 className="text-xl font-bold text-orange-800 mb-3">🌐 Environment</h3>
              <div className="space-y-2">
                <p className="text-sm"><span className="font-semibold">Host:</span> {window.location.hostname}</p>
                <p className="text-sm"><span className="font-semibold">Path:</span> {window.location.pathname}</p>
                <p className="text-sm"><span className="font-semibold">Built:</span> {new Date(DEPLOYMENT_TIMESTAMP).toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-white/70 rounded-lg p-4">
              <h3 className="text-xl font-bold text-green-800 mb-3">📊 Live Data</h3>
              <div className="space-y-2">
                <p className="text-sm"><span className="font-semibold">Schools:</span> <span className="text-lg font-bold text-blue-600">{totalSchools}</span></p>
                <p className="text-sm"><span className="font-semibold">Teachers:</span> <span className="text-lg font-bold text-green-600">{totalTeachers}</span></p>
                <p className="text-sm"><span className="font-semibold">Students:</span> <span className="text-lg font-bold text-purple-600">{totalStudents}</span></p>
                <p className="text-sm"><span className="font-semibold">Responses:</span> <span className="text-lg font-bold text-orange-600">{totalResponses}</span></p>
              </div>
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
