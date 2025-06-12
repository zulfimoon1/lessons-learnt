
import { useEffect, useState } from "react";
import { usePlatformAdmin } from "@/contexts/PlatformAdminContext";
import { toast } from "sonner";
import { platformDataService, PlatformStats } from "@/services/platformDataService";
import DashboardHeader from "@/components/platform-admin/DashboardHeader";
import SystemInfoCard from "@/components/platform-admin/SystemInfoCard";
import OverviewCards from "@/components/platform-admin/OverviewCards";
import SubscriptionManagement from "@/components/platform-admin/SubscriptionManagement";

const PlatformAdminDashboard = () => {
  const { admin, isLoading: adminLoading, logout, isAuthenticated } = usePlatformAdmin();
  const [dashboardData, setDashboardData] = useState<PlatformStats>({
    totalSchools: 0,
    totalTeachers: 0,
    totalStudents: 0,
    totalResponses: 0,
    subscriptions: [],
    activeSubscriptions: 0,
    monthlyRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString());

  const fetchDashboardData = async () => {
    if (!admin) {
      console.error('No admin session available');
      return;
    }

    console.log('🔄 Fetching real platform data...');
    setIsLoading(true);
    setError(null);
    
    try {
      const realData = await platformDataService.fetchRealPlatformData();
      setDashboardData(realData);
      setLastUpdated(new Date().toISOString());
      
      toast.success(`✅ Real data loaded: ${realData.totalStudents} students, ${realData.totalTeachers} teachers from ${realData.totalSchools} schools`);
      
    } catch (error: any) {
      console.error('❌ Failed to fetch dashboard data:', error);
      const errorMessage = error.message || "Failed to fetch dashboard data";
      setError(errorMessage);
      toast.error(`❌ Data fetch failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    console.log('🔄 Manual refresh triggered');
    toast.info('🔄 Refreshing data...');
    await fetchDashboardData();
  };

  const handleLogout = () => {
    console.log('🚪 Admin logout');
    logout();
  };

  // Initial data fetch
  useEffect(() => {
    if (isAuthenticated && admin) {
      console.log('🚀 Admin authenticated, fetching real data');
      fetchDashboardData();
    }
  }, [isAuthenticated, admin]);

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

  if (!isAuthenticated || !admin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">Admin Access Denied</div>
          <p className="text-gray-600">Please log in as an administrator</p>
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
        {/* Status Banner */}
        <div className={`${error ? 'bg-red-100 border-red-500' : 'bg-green-100 border-green-500'} border-2 rounded-xl p-6`}>
          <div className="text-center">
            <h1 className={`text-xl font-bold ${error ? 'text-red-800' : 'text-green-800'}`}>
              {error ? '❌ DASHBOARD ERROR' : '🟢 LIVE PLATFORM DATA'} {isLoading ? '(Loading...)' : ''}
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
                Last Updated: {new Date(lastUpdated).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Live Stats */}
        <div className="bg-white border-4 border-blue-500 rounded-xl p-6">
          <h2 className="text-xl font-bold text-blue-800 mb-4">📊 REAL PLATFORM STATISTICS</h2>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading real data from database...</p>
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
