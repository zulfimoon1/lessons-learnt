
import React, { useState } from 'react';
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
  UserPlus
} from 'lucide-react';
import SchoolManagement from '@/components/platform-admin/SchoolManagement';
import TeacherManagement from '@/components/platform-admin/TeacherManagement';
import StudentManagement from '@/components/platform-admin/StudentManagement';
import SubscriptionManagement from '@/components/platform-admin/SubscriptionManagement';
import SecurityMonitoring from '@/components/platform-admin/SecurityMonitoring';
import PasswordChangeForm from '@/components/platform-admin/PasswordChangeForm';
import AdminUserManagement from '@/components/platform-admin/AdminUserManagement';

const PlatformAdminDashboard: React.FC = () => {
  const { admin, logout, isLoading } = usePlatformAdmin();
  const [activeTab, setActiveTab] = useState('overview');

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
                <School className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
                <p className="text-xs text-muted-foreground">Active subscriptions</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
                <p className="text-xs text-muted-foreground">Teachers + Students</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
                <p className="text-xs text-muted-foreground">This month</p>
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
            <TabsList className="bg-transparent p-0 h-auto gap-3 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8">
              {tabItems.map((item) => {
                const Icon = item.icon;
                return (
                  <TabsTrigger 
                    key={item.value}
                    value={item.value} 
                    className="h-auto p-4 flex items-center gap-3 hover:bg-gray-50 border border-gray-200 justify-center data-[state=active]:bg-brand-teal data-[state=active]:text-white data-[state=active]:border-brand-teal transition-all duration-300 rounded-lg bg-white flex-col text-center min-h-[80px]"
                  >
                    <Icon 
                      className={`w-5 h-5 ${activeTab === item.value ? 'text-white' : 'text-brand-teal'}`}
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium block">
                      {item.label}
                    </span>
                  </TabsTrigger>
                );
              })}
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
