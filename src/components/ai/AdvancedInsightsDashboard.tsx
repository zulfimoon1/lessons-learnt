
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Eye, 
  RefreshCw,
  Clock,
  Target,
  Lightbulb
} from 'lucide-react';
import { useAdvancedAIInsights } from '@/hooks/useAdvancedAIInsights';
import { AnalyticsInsight } from '@/services/advancedAIAnalyticsService';

interface AdvancedInsightsDashboardProps {
  school: string;
  userRole: string;
  className?: string;
}

const AdvancedInsightsDashboard: React.FC<AdvancedInsightsDashboardProps> = ({
  school,
  userRole,
  className
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'semester'>('week');
  const {
    insights,
    isLoading,
    error,
    lastUpdated,
    refreshInsights,
    getCriticalInsights,
    getActionableInsights,
    markInsightAsRead,
    dismissInsight,
    getInsightsSummary
  } = useAdvancedAIInsights(school, userRole);

  const summary = getInsightsSummary();
  const criticalInsights = getCriticalInsights();
  const actionableInsights = getActionableInsights();

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      default: return <Brain className="w-4 h-4 text-blue-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'warning': return 'secondary';
      default: return 'outline';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'trend': return <TrendingUp className="w-4 h-4" />;
      case 'pattern': return <Eye className="w-4 h-4" />;
      case 'prediction': return <Target className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  const renderInsightCard = (insight: AnalyticsInsight) => (
    <Card key={insight.id} className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getSeverityIcon(insight.severity)}
            {getTypeIcon(insight.type)}
            <CardTitle className="text-sm">{insight.title}</CardTitle>
          </div>
          <div className="flex gap-2">
            <Badge variant={getSeverityColor(insight.severity) as any}>
              {insight.severity}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {Math.round(insight.confidence * 100)}%
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{insight.description}</p>
        
        {insight.affectedStudents.length > 0 && (
          <div className="text-xs">
            <span className="font-medium">Affected Students: </span>
            {insight.affectedStudents.length} student(s)
          </div>
        )}

        {insight.recommendedActions.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-xs font-medium">Recommended Actions:</h5>
            <ul className="space-y-1">
              {insight.recommendedActions.map((action, index) => (
                <li key={index} className="text-xs bg-blue-50 p-2 rounded border-l-2 border-blue-200">
                  {action}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-between items-center pt-2">
          <span className="text-xs text-muted-foreground">
            {new Date(insight.timestamp).toLocaleString()}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => markInsightAsRead(insight.id)}
              className="text-xs h-6"
            >
              Mark Read
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => dismissInsight(insight.id)}
              className="text-xs h-6"
            >
              Dismiss
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with refresh and timeframe controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6" />
            Advanced AI Insights
          </h2>
          <p className="text-sm text-muted-foreground">
            AI-powered analytics and predictive insights for {school}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as any)}
            className="px-3 py-1 border rounded text-sm"
          >
            <option value="week">Past Week</option>
            <option value="month">Past Month</option>
            <option value="semester">Semester</option>
          </select>
          
          <Button
            onClick={() => refreshInsights(selectedTimeframe)}
            disabled={isLoading}
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{summary.total}</div>
            <p className="text-xs text-muted-foreground">Total Insights</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-600">{summary.critical}</div>
            <p className="text-xs text-muted-foreground">Critical Alerts</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">{summary.actionable}</div>
            <p className="text-xs text-muted-foreground">Action Required</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-gray-600">{summary.unread}</div>
            <p className="text-xs text-muted-foreground">Unread</p>
          </CardContent>
        </Card>
      </div>

      {/* Last Updated Info */}
      {lastUpdated && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          Last updated: {lastUpdated.toLocaleString()}
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs defaultValue="critical">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="critical">
            Critical ({criticalInsights.length})
          </TabsTrigger>
          <TabsTrigger value="actionable">
            Actionable ({actionableInsights.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All Insights ({insights.length})
          </TabsTrigger>
          <TabsTrigger value="analytics">
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="critical" className="space-y-4">
          {criticalInsights.length > 0 ? (
            criticalInsights.map(renderInsightCard)
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No critical insights at this time</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="actionable" className="space-y-4">
          {actionableInsights.length > 0 ? (
            actionableInsights.map(renderInsightCard)
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No actionable insights at this time</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {insights.length > 0 ? (
            insights.map(renderInsightCard)
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">
                  {isLoading ? 'Loading insights...' : 'No insights available'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Insight Types Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Trends:</span>
                  <span className="font-medium">{summary.trends}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Patterns:</span>
                  <span className="font-medium">{summary.patterns}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Predictions:</span>
                  <span className="font-medium">{summary.predictions}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Severity Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Critical:</span>
                  <span className="font-medium text-red-600">{summary.critical}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Warning:</span>
                  <span className="font-medium text-orange-600">{summary.warning}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Info:</span>
                  <span className="font-medium text-blue-600">
                    {summary.total - summary.critical - summary.warning}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedInsightsDashboard;
