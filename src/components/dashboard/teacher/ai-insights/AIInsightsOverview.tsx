import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AIRecommendationsCard from '@/components/ai/AIRecommendationsCard';
import StudentEngagementPredictor from '@/components/ai/StudentEngagementPredictor';

interface AIInsightsOverviewProps {
  teacher: {
    id: string;
    school: string;
  };
  cacheStats: {
    validEntries: number;
    hitRate: number;
  };
  notificationStats: {
    unacknowledged: number;
  };
  pendingNotifications: any[];
  testSummary: {
    passRate: number;
  } | null;
}

const AIInsightsOverview: React.FC<AIInsightsOverviewProps> = ({
  teacher,
  cacheStats,
  notificationStats,
  pendingNotifications,
  testSummary
}) => {
  return (
    <div className="space-y-6">
      {/* Performance metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Analysis Cache</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cacheStats.validEntries}</div>
            <p className="text-xs text-muted-foreground">
              {cacheStats.hitRate.toFixed(1)}% hit rate
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Real-time Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notificationStats.unacknowledged}</div>
            <p className="text-xs text-muted-foreground">
              Unacknowledged notifications
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingNotifications.length}</div>
            <p className="text-xs text-muted-foreground">
              Automated notifications
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {testSummary ? testSummary.passRate.toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              System accuracy
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Existing AI components */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <AIRecommendationsCard teacherId={teacher.id} />
        <StudentEngagementPredictor school={teacher.school} />
      </div>
    </div>
  );
};

export default AIInsightsOverview;
