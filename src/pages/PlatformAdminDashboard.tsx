
import { useEffect, useState } from "react";
import { usePlatformAdmin } from "@/contexts/PlatformAdminContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import DashboardHeader from "@/components/platform-admin/DashboardHeader";
import SystemInfoCard from "@/components/platform-admin/SystemInfoCard";
import OverviewCards from "@/components/platform-admin/OverviewCards";
import SubscriptionManagement from "@/components/platform-admin/SubscriptionManagement";

interface DashboardData {
  totalSchools: number;
  totalTeachers: number;
  totalStudents: number;
  totalResponses: number;
  subscriptions: any[];
  activeSubscriptions: number;
  monthlyRevenue: number;
  lastUpdated: string;
}

const PlatformAdminDashboard = () => {
  const { admin, isLoading: adminLoading, logout } = usePlatformAdmin();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalSchools: 0,
    totalTeachers: 0,
    totalStudents: 0,
    totalResponses: 0,
    subscriptions: [],
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    lastUpdated: new Date().toISOString()
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRealData = async () => {
    console.log("🔄 Starting fresh data fetch...");
    setIsLoading(true);
    setError(null);
    
    try {
      // Set platform admin context first
      console.log("🔧 Setting platform admin context...");
      await supabase.rpc('set_config', {
        setting_name: 'app.platform_admin',
        setting_value: 'true'
      });

      console.log("📊 Fetching all data in parallel...");
      
      // Fetch all data in parallel for faster loading
      const [studentsResult, teachersResult, feedbackResult, subscriptionsResult] = await Promise.all([
        supabase.from('students').select('school', { count: 'exact' }),
        supabase.from('teachers').select('*', { count: 'exact' }),
        supabase.from('feedback').select('*', { count: 'exact' }),
        supabase.from('subscriptions').select('*')
      ]);

      console.log("📊 Raw query results:", {
        students: studentsResult,
        teachers: teachersResult,
        feedback: feedbackResult,
        subscriptions: subscriptionsResult
      });

      // Check for errors
      if (studentsResult.error) throw new Error(`Students: ${studentsResult.error.message}`);
      if (teachersResult.error) throw new Error(`Teachers: ${teachersResult.error.message}`);
      if (feedbackResult.error) throw new Error(`Feedback: ${feedbackResult.error.message}`);
      if (subscriptionsResult.error) throw new Error(`Subscriptions: ${subscriptionsResult.error.message}`);

      // Calculate metrics
      const totalStudents = studentsResult.count || 0;
      const totalTeachers = teachersResult.count || 0;
      const totalResponses = feedbackResult.count || 0;
      
      // Get unique schools
      const uniqueSchools = new Set();
      if (studentsResult.data) {
        studentsResult.data.forEach(student => {
          if (student.school) uniqueSchools.add(student.school);
        });
      }
      if (teachersResult.data) {
        teachersResult.data.forEach(teacher => {
          if (teacher.school) uniqueSchools.add(teacher.school);
        });
      }
      const totalSchools = uniqueSchools.size;

      const subscriptions = subscriptionsResult.data || [];
      const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
      const monthlyRevenue = subscriptions
        .filter(s => s.status === 'active')
        .reduce((sum, sub) => sum + (sub.amount / 100), 0);

      const newData = {
        totalSchools,
        totalTeachers,
        totalStudents,
        totalResponses,
        subscriptions,
        activeSubscriptions,
        monthlyRevenue,
        lastUpdated: new Date().toISOString()
      };

      console.log("✅ Processed data:", newData);
      setDashboardData(newData);
      
      toast.success(`✅ Data refreshed! ${totalStudents} students, ${totalTeachers} teachers, ${totalSchools} schools, ${totalResponses} responses`);
      
    } catch (error: any) {
      console.error("❌ Data fetch failed:", error);
      const errorMessage = error.message || "Failed to fetch dashboard data";
      setError(errorMessage);
      toast.error(`❌ Refresh failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    console.log('🔄 REFRESH BUTTON CLICKED - Starting manual refresh...');
    await fetchRealData();
  };

  const handleLogout = () => {
    console.log('🚪 Logout triggered');
    logout();
  };

  // Auto-fetch data when admin loads
  useEffect(() => {
    if (!adminLoading && admin) {
      console.log('🚀 Admin loaded, fetching initial data...');
      fetchRealData();
    }
  }, [admin, adminLoading]);

  // Set up real-time subscription for live updates
  useEffect(() => {
    if (!admin) return;

    console.log('🔴 Setting up real-time subscriptions...');
    
    const channel = supabase
      .channel('dashboard-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => {
        console.log('🔴 Students table changed - refreshing data');
        fetchRealData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teachers' }, () => {
        console.log('🔴 Teachers table changed - refreshing data');
        fetchRealData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feedback' }, () => {
        console.log('🔴 Feedback table changed - refreshing data');
        fetchRealData();
      })
      .subscribe();

    return () => {
      console.log('🔴 Cleaning up real-time subscriptions');
      supabase.removeChannel(channel);
    };
  }, [admin]);

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-lg">Loading admin session...</div>
        </div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">Access Denied</div>
          <p className="text-gray-600">Please log in as a platform administrator</p>
          <a href="/console" className="text-blue-500 hover:text-blue-700 underline mt-4 inline-block">
            Go to Admin Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        adminName={admin.email}
        onRefresh={handleRefresh}
        onLogout={handleLogout}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Live Status Banner */}
        <div className={`${error ? 'bg-red-100 border-red-500' : 'bg-green-100 border-green-500'} border-2 rounded-xl p-6`}>
          <div className="text-center">
            <h1 className={`text-xl font-bold ${error ? 'text-red-800' : 'text-green-800'}`}>
              {error ? '❌ ERROR' : '🔴 LIVE DASHBOARD'} {isLoading ? '(Refreshing...)' : ''}
            </h1>
            {error ? (
              <div>
                <p className="text-sm mt-2 text-red-700">{error}</p>
                <button 
                  onClick={handleRefresh}
                  className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Retrying...' : 'Retry'}
                </button>
              </div>
            ) : (
              <p className="text-sm mt-2 text-green-700">
                Last Updated: {new Date(dashboardData.lastUpdated).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Real-Time Data Display */}
        <div className="bg-white border-4 border-blue-500 rounded-xl p-6">
          <h2 className="text-xl font-bold text-blue-800 mb-4">🔴 LIVE DATABASE COUNTS</h2>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading fresh data...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center bg-blue-50 p-4 rounded">
                <p className="text-sm font-semibold text-gray-600">Schools</p>
                <p className="text-4xl font-bold text-blue-600">{dashboardData.totalSchools}</p>
              </div>
              <div className="text-center bg-green-50 p-4 rounded">
                <p className="text-sm font-semibold text-gray-600">Teachers</p>
                <p className="text-4xl font-bold text-green-600">{dashboardData.totalTeachers}</p>
              </div>
              <div className="text-center bg-purple-50 p-4 rounded">
                <p className="text-sm font-semibold text-gray-600">Students</p>
                <p className="text-4xl font-bold text-purple-600">{dashboardData.totalStudents}</p>
              </div>
              <div className="text-center bg-orange-50 p-4 rounded">
                <p className="text-sm font-semibold text-gray-600">Responses</p>
                <p className="text-4xl font-bold text-orange-600">{dashboardData.totalResponses}</p>
              </div>
            </div>
          )}
        </div>
        
        <SystemInfoCard
          totalSchools={dashboardData.totalSchools}
          totalTeachers={dashboardData.totalTeachers}
          totalStudents={dashboardData.totalStudents}
          totalResponses={dashboardData.totalResponses}
          subscriptionsCount={dashboardData.subscriptions.length}
          activeSubscriptions={dashboardData.activeSubscriptions}
          monthlyRevenue={dashboardData.monthlyRevenue}
        />

        <OverviewCards
          totalSchools={dashboardData.totalSchools}
          totalTeachers={dashboardData.totalTeachers}
          totalStudents={dashboardData.totalStudents}
          totalResponses={dashboardData.totalResponses}
        />

        <SubscriptionManagement
          subscriptions={dashboardData.subscriptions}
        />
      </div>
    </div>
  );
};

export default PlatformAdminDashboard;
