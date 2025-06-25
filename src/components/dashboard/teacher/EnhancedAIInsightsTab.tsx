
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import EnhancedSmartFeedbackAnalyzer from '@/components/ai/EnhancedSmartFeedbackAnalyzer';
import MentalHealthAIAnalyzer from '@/components/ai/MentalHealthAIAnalyzer';
import MobileDistressDetector from '@/components/mobile/MobileDistressDetector';
import AdvancedInsightsDashboard from '@/components/ai/AdvancedInsightsDashboard';
import AIInsightsHeader from './ai-insights/AIInsightsHeader';
import AIInsightsOverview from './ai-insights/AIInsightsOverview';
import AIInsightsAutomation from './ai-insights/AIInsightsAutomation';
import AIInsightsTesting from './ai-insights/AIInsightsTesting';
import { useAIIntegration } from '@/hooks/useAIIntegration';
import { useOptimizedDistressAnalysis } from '@/hooks/useOptimizedDistressAnalysis';
import { useAutomatedNotifications } from '@/hooks/useAutomatedNotifications';
import { useDistressDetectionTesting } from '@/hooks/useDistressDetectionTesting';
import { useRealTimeNotifications } from '@/hooks/useRealTimeNotifications';

interface EnhancedAIInsightsTabProps {
  teacher: {
    id: string;
    school: string;
    name: string;
    role: string;
  };
}

const EnhancedAIInsightsTab: React.FC<EnhancedAIInsightsTabProps> = ({ teacher }) => {
  const [activeTab, setActiveTab] = useState('advanced');
  const { getActionableInsights } = useAIIntegration();
  const { getCacheStats } = useOptimizedDistressAnalysis();
  const { pendingNotifications } = useAutomatedNotifications();
  const { getTestSummary } = useDistressDetectionTesting();
  const { notificationStats } = useRealTimeNotifications(teacher.id, teacher.role, teacher.school);

  const actionableInsights = getActionableInsights();
  const cacheStats = getCacheStats;
  const testSummary = getTestSummary();

  return (
    <div className="space-y-6">
      <AIInsightsHeader
        notificationStats={notificationStats}
        pendingNotifications={pendingNotifications}
        actionableInsights={actionableInsights}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="mobile">Mobile</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="advanced" className="space-y-6">
          <AdvancedInsightsDashboard 
            school={teacher.school}
            userRole={teacher.role}
          />
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <AIInsightsOverview
            teacher={teacher}
            cacheStats={cacheStats}
            notificationStats={notificationStats}
            pendingNotifications={pendingNotifications}
            testSummary={testSummary}
          />
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-1">
            <EnhancedSmartFeedbackAnalyzer />
            <MentalHealthAIAnalyzer school={teacher.school} />
          </div>
        </TabsContent>

        <TabsContent value="mobile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Mobile Distress Detection
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Mobile-optimized interface for real-time distress analysis
              </p>
            </CardHeader>
            <CardContent>
              <MobileDistressDetector />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <AIInsightsAutomation pendingNotifications={pendingNotifications} />
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <AIInsightsTesting testSummary={testSummary} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedAIInsightsTab;
