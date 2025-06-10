
import { useEffect, useState } from "react";
import { usePlatformAdminContext } from "@/contexts/PlatformAdminContext";
import { toast } from "sonner";
import DashboardHeader from "@/components/platform-admin/DashboardHeader";
import SystemInfoCard from "@/components/platform-admin/SystemInfoCard";
import OverviewCards from "@/components/platform-admin/OverviewCards";
import SubscriptionManagement from "@/components/platform-admin/SubscriptionManagement";
import StudentStats from "@/components/platform-admin/StudentStatistics";
import ResponseAnalytics from "@/components/platform-admin/ResponseAnalytics";
import FeedbackAnalytics from "@/components/platform-admin/FeedbackAnalytics";
import SchoolOverview from "@/components/platform-admin/SchoolOverview";

const PlatformAdminDashboard = () => {
  const { adminData, isLoading, error, loadAdminData } = usePlatformAdminContext();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      loadAdminData();
      setIsInitialized(true);
    }
  }, [loadAdminData, isInitialized]);

  useEffect(() => {
    if (error) {
      toast.error("Error loading data", {
        description: "Failed to load dashboard data",
      });
    }
  }, [error]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-red-600">Error loading data</div>
      </div>
    );
  }

  if (!adminData) {
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
    recentSignups,
    subscriptions,
    activeSubscriptions,
    monthlyRevenue,
    topSchools,
    topTeachers,
    recentResponses,
    mentalHealthAlerts,
    recentFeedback,
  } = adminData;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* System Information */}
        <SystemInfoCard
          totalSchools={totalSchools}
          totalTeachers={totalTeachers}
          totalStudents={totalStudents}
          totalResponses={totalResponses}
          subscriptionsCount={subscriptions.length}
          activeSubscriptions={activeSubscriptions}
          monthlyRevenue={monthlyRevenue}
        />

        {/* Overview Cards */}
        <OverviewCards
          totalSchools={totalSchools}
          totalTeachers={totalTeachers}
          totalStudents={totalStudents}
          totalResponses={totalResponses}
        />

        {/* Subscription Management */}
        <SubscriptionManagement
          subscriptions={subscriptions}
          activeSubscriptions={activeSubscriptions}
          monthlyRevenue={monthlyRevenue}
        />

        {/* Student Statistics */}
        <StudentStats
          totalStudents={totalStudents}
          recentSignups={recentSignups}
        />

        {/* Response Analytics */}
        <ResponseAnalytics
          totalResponses={totalResponses}
          recentResponses={recentResponses}
        />

        {/* Feedback Analytics */}
        <FeedbackAnalytics
          recentFeedback={recentFeedback}
          mentalHealthAlerts={mentalHealthAlerts}
        />

        {/* School Overview */}
        <SchoolOverview
          topSchools={topSchools}
          topTeachers={topTeachers}
        />
      </div>
    </div>
  );
};

export default PlatformAdminDashboard;
