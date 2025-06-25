
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, PlayCircle } from 'lucide-react';

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
  const getStatusIcon = () => {
    switch (test.status) {
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'running':
        return <PlayCircle className="w-5 h-5 text-blue-600 animate-pulse" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (test.status) {
      case 'passed': return 'default';
      case 'failed': return 'destructive';
      case 'running': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card className={`transition-all duration-200 ${
      test.status === 'running' ? 'border-blue-300 shadow-md' : ''
    }`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <h4 className="font-medium">Test {index + 1}: {test.name}</h4>
              <p className="text-sm text-muted-foreground">{test.message}</p>
              {test.duration && (
                <p className="text-xs text-muted-foreground mt-1">
                  Completed in {test.duration}ms
                </p>
              )}
            </div>
          </div>
          <Badge variant={getStatusColor()}>
            {test.status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestResultCard;
