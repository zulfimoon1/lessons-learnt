
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquareIcon, FileTextIcon, AlertTriangleIcon, BrainIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { toast } from "sonner";
import DoctorChatDashboard from "@/components/DoctorChatDashboard";
import DoctorDashboard from "@/components/dashboard/doctor/DoctorDashboard";
import SelfHarmAlertsTab from "@/components/dashboard/doctor/SelfHarmAlertsTab";
import AIInsightsTab from "@/components/dashboard/doctor/AIInsightsTab";

interface DemoDoctorDashboardProps {
  teacher: {
    id: string;
    name: string;
    school: string;
    role: string;
  };
  onLogout: () => void;
}

const DemoDoctorDashboard: React.FC<DemoDoctorDashboardProps> = ({ teacher, onLogout }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('live-chat');
  const isMobile = useIsMobile();

  const handleLogout = async () => {
    try {
      onLogout();
      toast.success(t('teacher.logout.success'));
    } catch (error) {
      toast.error(t('auth.logoutError'));
    }
  };

  const tabItems = [
    {
      value: 'live-chat',
      icon: MessageSquareIcon,
      label: t('doctor.dashboard.liveChat'),
      component: (
        <DoctorChatDashboard
          doctorId={teacher.id}
          doctorName={teacher.name}
          school={teacher.school}
        />
      )
    },
    {
      value: 'summaries',
      icon: FileTextIcon,
      label: t('doctor.dashboard.weeklySummaries'),
      component: <DoctorDashboard teacher={teacher} />
    },
    {
      value: 'self-harm',
      icon: AlertTriangleIcon,
      label: t('doctor.dashboard.selfHarmAlerts'),
      component: <SelfHarmAlertsTab teacher={teacher} />
    },
    {
      value: 'ai-insights',
      icon: BrainIcon,
      label: t('doctor.dashboard.aiInsights'),
      component: <AIInsightsTab teacher={teacher} />
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        title={t('doctor.dashboard.title')}
        userName={teacher.name}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto p-3 md:p-6">
        <div className="mb-4 md:mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-brand-dark mb-2">
            {t('dashboard.welcome')}, Dr. {teacher.name}!
          </h1>
          <p className="text-sm md:text-base text-brand-dark/70">
            {teacher.school} • {t('doctor.dashboard.title')}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
          <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2 gap-1 h-auto p-1' : 'grid-cols-4'}`}>
            {tabItems.map((item) => {
              const Icon = item.icon;
              return (
                <TabsTrigger 
                  key={item.value}
                  value={item.value} 
                  className={`flex items-center gap-1 md:gap-2 ${isMobile ? 'flex-col py-2 px-1 text-xs' : 'flex-row'}`}
                >
                  <Icon className={`${isMobile ? 'w-4 h-4' : 'w-4 h-4'}`} />
                  <span className={isMobile ? 'text-[10px] leading-tight' : ''}>{item.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {tabItems.map((item) => (
            <TabsContent key={item.value} value={item.value}>
              {item.component}
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
};

export default DemoDoctorDashboard;
