import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePlatformAdmin } from '@/contexts/PlatformAdminContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { BarChart3, Users, GraduationCap, Building, MessageSquare, TrendingUp, CreditCard, Receipt, Stethoscope, Shield, ShieldCheck } from 'lucide-react';
import SchoolOverview from '@/components/platform-admin/SchoolOverview';
import TeacherManagement from '@/components/platform-admin/TeacherManagement';
import StudentManagement from '@/components/platform-admin/StudentManagement';
import SchoolManagement from '@/components/platform-admin/SchoolManagement';
import ResponseManagement from '@/components/platform-admin/ResponseManagement';
import FeedbackAnalytics from '@/components/platform-admin/FeedbackAnalytics';
import SubscriptionManagement from '@/components/platform-admin/SubscriptionManagement';
import TransactionManagement from '@/components/platform-admin/TransactionManagement';
import DoctorManagement from '@/components/platform-admin/DoctorManagement';
import SecurityMonitoring from '@/components/platform-admin/SecurityMonitoring';
import TabNavigation from '@/components/platform-admin/TabNavigation';
import AdvancedSecurityMonitoring from '@/components/security/AdvancedSecurityMonitoring';

const PlatformAdminDashboard: React.FC = () => {
  const { admin, isAuthenticated } = usePlatformAdmin();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!isAuthenticated || !admin) {
      toast.error('Unauthorized: You must be an authenticated platform admin to access this dashboard.');
      navigate('/console');
    }
  }, [isAuthenticated, admin, navigate]);

  if (!isAuthenticated || !admin) {
    return null;
  }

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <SchoolOverview />;
      case 'teachers':
        return <TeacherManagement />;
      case 'students':
        return <StudentManagement />;
      case 'schools':
        return <SchoolManagement />;
      case 'responses':
        return <ResponseManagement />;
      case 'feedback':
        return <FeedbackAnalytics />;
      case 'subscriptions':
        return <SubscriptionManagement />;
      case 'transactions':
        return <TransactionManagement />;
      case 'doctors':
        return <DoctorManagement />;
      case 'security':
        return <SecurityMonitoring />;
      case 'advanced-security':
        return <AdvancedSecurityMonitoring />;
      default:
        return <SchoolOverview />;
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Platform Admin Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />
          <div className="mt-6">{renderTabContent()}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformAdminDashboard;
