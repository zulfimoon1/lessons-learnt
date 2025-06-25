
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TestTube, TrendingUp } from 'lucide-react';

interface AIInsightsTestingProps {
  testSummary: {
    passRate: number;
    averageAccuracy: number;
    byLanguage: Record<string, { passed: number; total: number }>;
  } | null;
}

const AIInsightsTesting: React.FC<AIInsightsTestingProps> = ({
  testSummary
}) => {
  return (
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
  );
};

export default AIInsightsTesting;
