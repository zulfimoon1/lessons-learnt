
import React from 'react';
import { BarChart3, Users, GraduationCap, Building, MessageSquare, TrendingUp, CreditCard, Receipt, Stethoscope, Shield, ShieldCheck, Tag } from 'lucide-react';

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  // Check if this is being used in the login page context
  const isLoginContext = activeTab === 'login' || activeTab === 'create';
  
  const loginTabs = [
    { id: 'login', label: 'Sign In', icon: Users },
    { id: 'create', label: 'Request Access', icon: Shield }
  ];

  const dashboardTabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'teachers', label: 'Teachers', icon: Users },
    { id: 'students', label: 'Students', icon: GraduationCap },
    { id: 'schools', label: 'Schools', icon: Building },
    { id: 'responses', label: 'Responses', icon: MessageSquare },
    { id: 'feedback', label: 'Feedback Analytics', icon: TrendingUp },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'discount-codes', label: 'Discount Codes', icon: Tag },
    { id: 'doctors', label: 'Doctors', icon: Stethoscope },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'advanced-security', label: 'Advanced Security', icon: ShieldCheck }
  ];

  const tabs = isLoginContext ? loginTabs : dashboardTabs;

  return (
    <div className="w-full mb-6">
      <div className="flex flex-wrap gap-2 rounded-xl bg-slate-200 p-2 border">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              className={`flex items-center gap-2 rounded-lg py-2 px-3 text-sm font-semibold leading-5 transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white text-blue-700 shadow-md border border-blue-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
              }`}
              onClick={() => onTabChange(tab.id)}
            >
              <IconComponent className="w-4 h-4" />
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TabNavigation;
