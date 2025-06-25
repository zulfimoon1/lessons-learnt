
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';

interface TestSummaryCardProps {
  passedTests: number;
  failedTests: number;
  totalTests: number;
  overallStatus: 'idle' | 'running' | 'completed';
}

const TestSummaryCard: React.FC<TestSummaryCardProps> = ({
  passedTests,
  failedTests,
  totalTests,
  overallStatus
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Test Results Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="bg-green-100 text-green-800">
            ✓ {passedTests} Passed
          </Badge>
          {failedTests > 0 && (
            <Badge variant="outline" className="bg-red-100 text-red-800">
              ✗ {failedTests} Failed
            </Badge>
          )}
          <Badge variant="outline">
            {passedTests}/{totalTests} Complete
          </Badge>
          <span className="text-sm text-muted-foreground">
            Status: {overallStatus === 'running' ? 'Running...' : 'Completed'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestSummaryCard;
