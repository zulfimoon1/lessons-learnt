
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, PlayCircle, Loader2 } from 'lucide-react';
import { hipaaComplianceService } from '@/services/hipaaComplianceService';
import { toast } from '@/hooks/use-toast';

interface TestResult {
  test: string;
  status: 'PASSED' | 'FAILED';
  error?: any;
}

const HIPAAComplianceTestPanel: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [overallResult, setOverallResult] = useState<boolean | null>(null);

  const runComplianceTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    setOverallResult(null);

    try {
      toast({
        title: 'Running HIPAA Compliance Tests',
        description: 'Testing all HIPAA compliance components...'
      });

      const { passed, results } = await hipaaComplianceService.runComplianceTest();
      
      setTestResults(results);
      setOverallResult(passed);

      toast({
        title: passed ? 'All Tests Passed' : 'Some Tests Failed',
        description: `Compliance test suite ${passed ? 'completed successfully' : 'found issues'}`,
        variant: passed ? 'default' : 'destructive'
      });
    } catch (error) {
      console.error('Test suite failed:', error);
      
      toast({
        title: 'Test Suite Error',
        description: 'Failed to run HIPAA compliance tests',
        variant: 'destructive'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    return status === 'PASSED' 
      ? <CheckCircle className="w-4 h-4 text-green-600" />
      : <XCircle className="w-4 h-4 text-red-600" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlayCircle className="w-5 h-5" />
          HIPAA Compliance Testing
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Run comprehensive tests to validate HIPAA compliance implementation
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            onClick={runComplianceTests} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <PlayCircle className="w-4 h-4 mr-2" />
                Run Compliance Test Suite
              </>
            )}
          </Button>

          {overallResult !== null && (
            <Alert className={overallResult ? 'border-green-200' : 'border-red-200'}>
              {overallResult ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription>
                Test Suite {overallResult ? 'PASSED' : 'FAILED'}: 
                {overallResult 
                  ? ' All HIPAA compliance components are functioning correctly.'
                  : ' Some compliance components need attention.'
                }
              </AlertDescription>
            </Alert>
          )}

          {testResults.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Test Results:</h4>
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.status)}
                    <span className="text-sm">{result.test}</span>
                  </div>
                  <span className={`text-xs font-medium ${
                    result.status === 'PASSED' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {result.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default HIPAAComplianceTestPanel;
