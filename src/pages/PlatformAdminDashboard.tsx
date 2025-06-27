
import React, { useState, useEffect } from 'react';
import { usePlatformAdmin } from '@/contexts/PlatformAdminContext';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ShieldIcon, 
  LogOut, 
  Settings, 
  Users, 
  School, 
  CreditCard,
  Lock,
  BarChart3,
  UserPlus,
  Receipt,
  Percent
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import SchoolManagement from '@/components/platform-admin/SchoolManagement';
import TeacherManagement from '@/components/platform-admin/TeacherManagement';
import StudentManagement from '@/components/platform-admin/StudentManagement';
import SubscriptionManagement from '@/components/platform-admin/SubscriptionManagement';
import SecurityMonitoring from '@/components/platform-admin/SecurityMonitoring';
import PasswordChangeForm from '@/components/platform-admin/PasswordChangeForm';
import AdminUserManagement from '@/components/platform-admin/AdminUserManagement';
import DiscountCodeManagement from '@/components/platform-admin/DiscountCodeManagement';
import TransactionManagement from '@/components/platform-admin/TransactionManagement';
import DiscountNotifications from '@/components/platform-admin/DiscountNotifications';

interface PlatformStats {
  studentsCount: number;
  teachersCount: number;
  responsesCount: number;
  subscriptionsCount: number;
}

const PlatformAdminDashboard: React.FC = () => {
  const { admin, logout, isLoading } = usePlatformAdmin();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<PlatformStats>({
    studentsCount: 0,
    teachersCount: 0,
    responsesCount: 0,
    subscriptionsCount: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (admin) {
      fetchPlatformStats();
    }
  }, [admin]);

  const fetchPlatformStats = async () => {
    try {
      setStatsLoading(true);
      console.log('🔄 Fetching platform stats...');
      
      const { data, error } = await supabase.functions.invoke('platform-admin', {
        body: {
          operation: 'getPlatformStats',
          adminEmail: admin?.email || 'zulfimoon1@gmail.com'
        }
      });

      if (error) {
        console.error('Stats fetch error:', error);
        throw error;
      }

      if (data?.success && data?.data) {
        setStats(data.data);
        console.log('✅ Platform stats loaded:', data.data);
      } else {
        console.warn('No stats data received');
      }
    } catch (error) {
      console.error('Failed to fetch platform stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal"></div>
          <span className="text-lg text-gray-600">Loading platform console...</span>
        </div>
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/platform-admin-login" replace />;
  }

  const tabItems = [
    {
      value: 'overview',
      icon: BarChart3,
      label: 'Overview',
      component: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
                <School className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? '--' : stats.subscriptionsCount}
                </div>
                <p className="text-xs text-muted-foreground">Active subscriptions</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? '--' : stats.teachersCount}
                </div>
                <p className="text-xs text-muted-foreground">All teachers & staff</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? '--' : stats.studentsCount}
                </div>
                <p className="text-xs text-muted-foreground">Registered students</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Feedback Responses</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? '--' : stats.responsesCount}
                </div>
                <p className="text-xs text-muted-foreground">Total responses</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Teachers</span>
                  <span className="text-lg font-bold">{statsLoading ? '--' : stats.teachersCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Students</span>
                  <span className="text-lg font-bold">{statsLoading ? '--' : stats.studentsCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Active Schools</span>
                  <span className="text-lg font-bold">{statsLoading ? '--' : stats.subscriptionsCount}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Platform Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">System Status</span>
                  <span className="text-sm text-green-600 font-medium">Operational</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Last Updated</span>
                  <span className="text-sm text-gray-600">{new Date().toLocaleTimeString()}</span>
                </div>
                <Button 
                  onClick={fetchPlatformStats} 
                  variant="outline" 
                  size="sm"
                  disabled={statsLoading}
                >
                  {statsLoading ? 'Refreshing...' : 'Refresh Stats'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      value: 'admin-users',
      icon: UserPlus,
      label: 'Admin Users',
      component: <AdminUserManagement />
    },
    {
      value: 'schools',
      icon: School,
      label: 'Schools',
      component: <SchoolManagement />
    },
    {
      value: 'teachers',
      icon: Users,
      label: 'Teachers',
      component: <TeacherManagement />
    },
    {
      value: 'students',
      icon: Users,
      label: 'Students',
      component: <StudentManagement />
    },
    {
      value: 'subscriptions',
      icon: CreditCard,
      label: 'Subscriptions',
      component: <SubscriptionManagement />
    },
    {
      value: 'transactions',
      icon: Receipt,
      label: 'Transactions',
      component: <TransactionManagement adminEmail={admin?.email || 'zulfimoon1@gmail.com'} />
    },
    {
      value: 'discounts',
      icon: Percent,
      label: 'Discount Codes',
      component: <DiscountCodeManagement adminEmail={admin?.email || 'zulfimoon1@gmail.com'} />
    },
    {
      value: 'notifications',
      icon: CreditCard,
      label: 'Payment Notifications',
      component: <DiscountNotifications adminEmail={admin?.email || 'zulfimoon1@gmail.com'} />
    },
    {
      value: 'security',
      icon: ShieldIcon,
      label: 'Security',
      component: <SecurityMonitoring />
    },
    {
      value: 'settings',
      icon: Settings,
      label: 'Settings',
      component: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PasswordChangeForm />
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Platform Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Additional platform configuration options will be available here.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Platform Version</span>
                    <span className="text-sm font-mono">v1.0.0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Admin Email</span>
                    <span className="text-sm font-mono">{admin.email}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-teal/5 via-white to-brand-orange/5">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <div className="flex items-center space-x-3">
            <ShieldIcon className="w-8 h-8 text-brand-teal" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Platform Console</h1>
              <p className="text-sm text-gray-600">Welcome, {admin.name}</p>
            </div>
          </div>
          <Button onClick={logout} variant="outline" className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          {/* Tab Navigation */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg p-6">
            <TabsList className="bg-transparent p-0 h-auto gap-2 w-full">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-11 gap-2 w-full">
                {tabItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <TabsTrigger 
                      key={item.value}
                      value={item.value} 
                      className="h-auto p-3 flex flex-col items-center gap-2 hover:bg-gray-50 border border-gray-200 data-[state=active]:bg-brand-teal data-[state=active]:text-white data-[state=active]:border-brand-teal transition-all duration-300 rounded-lg bg-white min-h-[70px] text-center"
                    >
                      <Icon 
                        className={`w-4 h-4 ${activeTab === item.value ? 'text-white' : 'text-brand-teal'}`}
                        aria-hidden="true"
                      />
                      <span className="text-xs font-medium leading-tight">
                        {item.label}
                      </span>
                    </TabsTrigger>
                  );
                })}
              </div>
            </TabsList>
          </div>

          {/* Tab Content */}
          {tabItems.map((item) => (
            <TabsContent key={item.value} value={item.value} className="space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg">
                <div className="p-6">
                  {item.component}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
};

export default PlatformAdminDashboard;
