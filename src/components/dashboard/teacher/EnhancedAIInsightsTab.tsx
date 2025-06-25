import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Shield, 
  Zap, 
  TestTube, 
  Settings,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AIRecommendationsCard from '@/components/ai/AIRecommendationsCard';
import StudentEngagementPredictor from '@/components/ai/StudentEngagementPredictor';
import MentalHealthAIAnalyzer from '@/components/ai/MentalHealthAIAnalyzer';
import SmartFeedbackAnalyzer from '@/components/ai/SmartFeedbackAnalyzer';
import EnhancedSmartFeedbackAnalyzer from '@/components/ai/EnhancedSmartFeedbackAnalyzer';
import MobileDistressDetector from '@/components/mobile/MobileDistressDetector';
import { useAIIntegration } from '@/hooks/useAIIntegration';
import { useOptimizedDistressAnalysis } from '@/hooks/useOptimizedDistressAnalysis';
import { useAutomatedNotifications } from '@/hooks/useAutomatedNotifications';
import { useDistressDetectionTesting } from '@/hooks/useDistressDetectionTesting';

interface EnhancedAIInsightsTabProps {
  teacher: {
    id: string;
    school: string;
    name: string;
    role: string;
  };
}

const EnhancedAIInsightsTab: React.FC<EnhancedAIInsightsTabProps> = ({ teacher }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { getActionableInsights } = useAIIntegration();
  const { getCacheStats } = useOptimizedDistressAnalysis();
  const { pendingNotifications } = useAutomatedNotifications();
  const { getTestSummary } = useDistressDetectionTesting();

  const actionableInsights = getActionableInsights();
  const cacheStats = getCacheStats();
  const testSummary = getTestSummary();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-brand-dark">Enhanced AI Insights</h2>
          <p className="text-brand-dark/70">
            Advanced AI-powered analytics with mobile support and automated notifications
          </p>
        </div>
        
        <div className="flex gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            {pendingNotifications.length} alerts
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            {actionableInsights.length} actions
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="mobile">Mobile</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Performance metrics */}
          <div className="grid gap-4 md:grid-cols-3">
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Automated Notifications
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure automated alerts and teacher notifications
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingNotifications.map(notification => (
                  <div key={notification.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{notification.studentName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {notification.analysis.riskLevel.toUpperCase()} risk detected
                        </p>
                      </div>
                      <Badge variant={notification.analysis.riskLevel === 'critical' ? 'destructive' : 'secondary'}>
                        {notification.analysis.riskLevel}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Scheduled: {notification.scheduledFor.toLocaleString()}
                    </p>
                  </div>
                ))}
                
                {pendingNotifications.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    No pending notifications
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="w-5 h-5" />
                System Testing & Validation
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Test AI accuracy and system performance
              </p>
            </CardHeader>
            <CardContent>
              {testSummary ? (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-medium mb-2">Overall Performance</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm">Pass Rate:</span>
                          <span className="text-sm font-medium">{testSummary.passRate.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Average Accuracy:</span>
                          <span className="text-sm font-medium">{testSummary.averageAccuracy.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">By Language</h4>
                      <div className="space-y-1">
                        {Object.entries(testSummary.byLanguage).map(([lang, stats]) => (
                          <div key={lang} className="flex justify-between">
                            <span className="text-sm">{lang.toUpperCase()}:</span>
                            <span className="text-sm font-medium">
                              {stats.passed}/{stats.total} ({((stats.passed/stats.total)*100).toFixed(0)}%)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-4">No test results available</p>
                  <Button>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Run System Tests
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedAIInsightsTab;
