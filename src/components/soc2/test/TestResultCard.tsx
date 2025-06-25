
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  message: string;
  duration?: number;
}

interface TestResultCardProps {
  test: TestResult;
  index: number;
}

const TestResultCard: React.FC<TestResultCardProps> = ({ test, index }) => {
  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running': return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return 'border-green-200 bg-green-50';
      case 'failed': return 'border-red-200 bg-red-50';
      case 'running': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <Card className={`${getStatusColor(test.status)} transition-colors`}>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon(test.status)}
            <div>
              <h4 className="font-medium">{test.name}</h4>
              <p className="text-sm text-muted-foreground">{test.message}</p>
            </div>
          </div>
          {test.duration && (
            <Badge variant="outline" className="text-xs">
              {test.duration}ms
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TestResultCard;
