
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

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
  const getOverallStatusColor = () => {
    if (overallStatus === 'running') return 'border-blue-300 bg-blue-50';
    if (failedTests === 0 && passedTests === totalTests) return 'border-green-300 bg-green-50';
    if (failedTests > 0) return 'border-red-300 bg-red-50';
    return 'border-gray-300';
  };

  const getStatusMessage = () => {
    if (overallStatus === 'running') return 'Tests in progress...';
    if (failedTests === 0 && passedTests === totalTests) return 'All tests passed!';
    if (failedTests > 0) return `${failedTests} test(s) failed`;
    return 'Tests completed';
  };

  return (
    <Card className={`${getOverallStatusColor()}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {overallStatus === 'running' && <Clock className="w-5 h-5 text-blue-600 animate-pulse" />}
          {overallStatus === 'completed' && failedTests === 0 && <CheckCircle className="w-5 h-5 text-green-600" />}
          {overallStatus === 'completed' && failedTests > 0 && <XCircle className="w-5 h-5 text-red-600" />}
          Test Results Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">{passedTests}</div>
            <p className="text-sm text-muted-foreground">Passed</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">{failedTests}</div>
            <p className="text-sm text-muted-foreground">Failed</p>
          </div>
          <div>
            <div className="text-2xl font-bold">{totalTests}</div>
            <p className="text-sm text-muted-foreground">Total</p>
          </div>
        </div>
        <p className="text-center mt-4 font-medium">{getStatusMessage()}</p>
      </CardContent>
    </Card>
  );
};

export default TestSummaryCard;
