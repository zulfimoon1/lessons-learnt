
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, PlayCircle } from 'lucide-react';
import { useSOC2Monitoring } from '@/hooks/useSOC2Monitoring';
import TestResultCard from './test/TestResultCard';
import TestSummaryCard from './test/TestSummaryCard';
import { useTestRunner } from './test/TestRunner';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  message: string;
  duration?: number;
}

const SOC2SystemTest: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [overallStatus, setOverallStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const { logUserAction } = useSOC2Monitoring();
  const { initialTests, runTests } = useTestRunner();

  useEffect(() => {
    setTestResults(initialTests);
  }, []);

  useEffect(() => {
    logUserAction('view', 'soc2_test_page', {
      test_suite: 'system_validation'
    });
  }, [logUserAction]);

  const updateTestResult = (index: number, status: TestResult['status'], message: string, duration?: number) => {
    setTestResults(prev => prev.map((test, i) => 
      i === index ? { ...test, status, message, duration } : test
    ));
  };

  const handleRunTests = () => {
    runTests(updateTestResult, setIsRunning, setOverallStatus);
  };

  const passedTests = testResults.filter(t => t.status === 'passed').length;
  const failedTests = testResults.filter(t => t.status === 'failed').length;
  const totalTests = testResults.length;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            SOC 2 System Test Suite
          </h2>
          <p className="text-muted-foreground mt-1">
            Validate SOC 2 compliance implementation without affecting existing functionality
          </p>
        </div>
        <Button 
          onClick={handleRunTests} 
          disabled={isRunning}
          className="flex items-center gap-2"
        >
          <PlayCircle className="w-4 h-4" />
          {isRunning ? 'Running Tests...' : 'Run Tests'}
        </Button>
      </div>

      {/* Test Results Summary */}
      {overallStatus !== 'idle' && (
        <TestSummaryCard
          passedTests={passedTests}
          failedTests={failedTests}
          totalTests={totalTests}
          overallStatus={overallStatus}
        />
      )}

      {/* Test Results */}
      <div className="grid gap-3">
        {testResults.map((test, index) => (
          <TestResultCard key={index} test={test} index={index} />
        ))}
      </div>

      {/* Core Principles Compliance Note */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Core Principles Adherence:</strong> This test suite validates SOC 2 functionality without 
          modifying existing systems, following our zero-risk implementation approach. All tests are 
          read-only or use dedicated test data to ensure backward compatibility.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default SOC2SystemTest;
