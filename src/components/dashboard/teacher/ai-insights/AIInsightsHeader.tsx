
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Bell, Shield, Zap } from 'lucide-react';

interface AIInsightsHeaderProps {
  notificationStats: {
    unacknowledged: number;
  };
  pendingNotifications: any[];
  actionableInsights: any[];
}

const AIInsightsHeader: React.FC<AIInsightsHeaderProps> = ({
  notificationStats,
  pendingNotifications,
  actionableInsights
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-brand-dark">Enhanced AI Insights</h2>
        <p className="text-brand-dark/70">
          Advanced AI-powered analytics with mobile support and automated notifications
        </p>
      </div>
      
      <div className="flex gap-2">
        <Badge variant="outline" className="flex items-center gap-1">
          <Bell className="w-3 h-3" />
          {notificationStats.unacknowledged} alerts
        </Badge>
        <Badge variant="outline" className="flex items-center gap-1">
          <Shield className="w-3 h-3" />
          {pendingNotifications.length} pending
        </Badge>
        <Badge variant="outline" className="flex items-center gap-1">
          <Zap className="w-3 h-3" />
          {actionableInsights.length} actions
        </Badge>
      </div>
    </div>
  );
};

export default AIInsightsHeader;
