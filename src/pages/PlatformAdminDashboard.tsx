
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

const DASHBOARD_VERSION = `v8.0.0-REAL-DATA-${Date.now()}`;

console.log("🔥 PLATFORM ADMIN DASHBOARD LOADED - VERSION:", DASHBOARD_VERSION);

const PlatformAdminDashboard = () => {
  const { admin, isLoading, logout } = usePlatformAdmin();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);
  const [lastRefreshTime, setLastRefreshTime] = useState<string>('Never');

  const loadRealDashboardData = async (isRefresh = false) => {
    const timestamp = new Date().toISOString();
    
    console.log(`🔄 [${timestamp}] LOADING REAL DASHBOARD DATA - isRefresh: ${isRefresh}`);
    
    if (isRefresh) {
      const newCount = refreshCount + 1;
      setRefreshCount(newCount);
      setLastRefreshTime(new Date().toLocaleTimeString());
      console.log(`🔄 REFRESH COUNT UPDATED TO: ${newCount}`);
      toast.info("Refreshing dashboard data...");
    }
    
    setDataLoading(true);
    
    try {
      console.log(`📊 FETCHING REAL DATA FROM SUPABASE...`);
      
      // Get real counts from database with proper error handling
      const [
        { count: teachersCount, error: teachersError },
        { count: studentsCount, error: studentsError },
        { count: feedbackCount, error: feedbackError },
        { data: subscriptionsData, error: subscriptionsError, count: subscriptionsCount }
      ] = await Promise.all([
        supabase.from('teachers').select('*', { count: 'exact', head: true }),
        supabase.from('students').select('*', { count: 'exact', head: true }),
        supabase.from('feedback').select('*', { count: 'exact', head: true }),
        supabase.from('subscriptions').select('*', { count: 'exact' })
      ]);

      console.log('🔍 REAL DATABASE COUNTS:');
      console.log('Teachers count:', teachersCount, 'Error:', teachersError);
      console.log('Students count:', studentsCount, 'Error:', studentsError);
      console.log('Feedback count:', feedbackCount, 'Error:', feedbackError);
      console.log('Subscriptions:', subscriptionsData?.length, 'Error:', subscriptionsError);

      // Handle errors
      if (teachersError) {
        console.error('Teachers query failed:', teachersError);
        throw new Error(`Teachers query failed: ${teachersError.message}`);
      }
      if (studentsError) {
        console.error('Students query failed:', studentsError);
        throw new Error(`Students query failed: ${studentsError.message}`);
      }
      if (feedbackError) {
        console.error('Feedback query failed:', feedbackError);
        throw new Error(`Feedback query failed: ${feedbackError.message}`);
      }
      if (subscriptionsError) {
        console.error('Subscriptions query failed:', subscriptionsError);
        throw new Error(`Subscriptions query failed: ${subscriptionsError.message}`);
      }

      // Get unique schools from teachers table
      const { data: teachersData, error: teachersDataError } = await supabase
        .from('teachers')
        .select('school')
        .not('school', 'is', null);

      if (teachersDataError) {
        console.error('Teachers data query failed:', teachersDataError);
        throw new Error(`Teachers data query failed: ${teachersDataError.message}`);
      }

      const uniqueSchools = [...new Set(teachersData?.map(t => t.school).filter(Boolean) || [])];
      const activeSubscriptions = subscriptionsData?.filter(s => s.status === 'active').length || 0;
      const monthlyRevenue = subscriptionsData?.reduce((sum, sub) => {
        if (sub.status === 'active') {
          return sum + (sub.amount / 100);
        }
        return sum;
      }, 0) || 0;

      const realData = {
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
          total_teachers: teachersData?.filter(t => t.school === school).length || 0
        })),
        feedbackStats: [],
        lastUpdated: timestamp,
        cacheBreaker: `real-${Date.now()}-${Math.random()}`
      };

      console.log(`✅ REAL DASHBOARD DATA LOADED:`, realData);
      
      setDashboardData(realData);
      
      if (isRefresh) {
        toast.success(`Dashboard refreshed! Real data loaded at ${new Date().toLocaleTimeString()}`);
      } else {
        toast.success("Real dashboard data loaded successfully!");
      }
      
    } catch (error) {
      console.error(`❌ ERROR LOADING REAL DASHBOARD DATA:`, error);
      toast.error(`Failed to load dashboard data: ${error.message}`);
      
      // Set error state with zero counts (real data)
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
        error: true,
        errorMessage: error.message,
        cacheBreaker: `error-${Date.now()}`
      });
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (admin) {
      console.log('📊 INITIAL LOAD FOR ADMIN:', admin.email);
      loadRealDashboardData(false);
    }
  }, [admin]);

  const handleRefresh = () => {
    console.log('🔄 MANUAL REFRESH TRIGGERED BY USER');
    loadRealDashboardData(true);
  };

  const handleLogout = () => {
    console.log('🚪 LOGOUT TRIGGERED');
    logout();
  };

  if (isLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">
          {isLoading ? 'Loading admin session...' : 'Loading real dashboard data...'}
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
    error,
    errorMessage,
    cacheBreaker
  } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        adminName={admin.email}
        onRefresh={handleRefresh}
        onLogout={handleLogout}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* REAL DATA STATUS BANNER */}
        <div className={`${error ? 'bg-gradient-to-r from-red-100 to-orange-100 border-2 border-red-500' : 'bg-gradient-to-r from-green-100 to-blue-100 border-2 border-green-500'} rounded-xl p-6`}>
          <div className="text-center space-y-3">
            <h1 className={`text-2xl font-bold ${error ? 'text-red-800' : 'text-green-800'}`}>
              {error ? '❌ REAL DATA ERROR' : '✅ REAL DATA DASHBOARD'}
            </h1>
            <div className="bg-white/80 rounded-lg p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-blue-700">Version:</p>
                  <p className="text-xs">{DASHBOARD_VERSION}</p>
                </div>
                <div>
                  <p className="font-semibold text-green-700">Refresh Count:</p>
                  <p className="text-lg font-bold">{refreshCount}</p>
                </div>
                <div>
                  <p className="font-semibold text-purple-700">Last Refresh:</p>
                  <p>{lastRefreshTime}</p>
                </div>
                <div>
                  <p className="font-semibold text-orange-700">Status:</p>
                  <p className={error ? "text-red-600 font-bold" : "text-green-600 font-bold"}>
                    {error ? 'ERROR' : 'OK'}
                  </p>
                </div>
              </div>
              {lastUpdated && (
                <p className="text-sm text-gray-600 mt-2">
                  Last Updated: {new Date(lastUpdated).toLocaleString()}
                </p>
              )}
              {error && errorMessage && (
                <p className="text-red-600 font-bold mt-2 text-sm">
                  Error: {errorMessage}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* REAL DATA DISPLAY */}
        <div className="bg-white border-2 border-gray-300 rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📊 REAL DATABASE COUNTS</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-600">Schools</p>
              <p className="text-3xl font-bold text-blue-600">{totalSchools}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-600">Teachers</p>
              <p className="text-3xl font-bold text-green-600">{totalTeachers}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-600">Students</p>
              <p className="text-3xl font-bold text-purple-600">{totalStudents}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-600">Responses</p>
              <p className="text-3xl font-bold text-orange-600">{totalResponses}</p>
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
