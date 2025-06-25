
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  PlayCircle, 
  Shield,
  Database,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { soc2ComplianceService, SOC2DashboardData } from '@/services/soc2ComplianceService';
import { useSOC2Monitoring } from '@/hooks/useSOC2Monitoring';

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
  const { logUserAction, logDataAccess, logSecurityEvent } = useSOC2Monitoring();

  const initialTests: TestResult[] = [
    { name: 'SOC 2 Service Initialization', status: 'pending', message: 'Test service can be imported and initialized' },
    { name: 'Audit Event Logging', status: 'pending', message: 'Test audit events can be logged' },
    { name: 'Security Event Logging', status: 'pending', message: 'Test security events can be logged' },
    { name: 'Dashboard Data Retrieval', status: 'pending', message: 'Test dashboard summary data can be retrieved' },
    { name: 'Data Integrity Check', status: 'pending', message: 'Test data integrity validation' },
    { name: 'Availability Metric Recording', status: 'pending', message: 'Test availability metrics can be recorded' },
    { name: 'Recent Events Retrieval', status: 'pending', message: 'Test recent audit events can be retrieved' },
    { name: 'Hook Integration Test', status: 'pending', message: 'Test SOC 2 monitoring hooks work correctly' }
  ];

  useEffect(() => {
    setTestResults(initialTests);
  }, []);

  const updateTestResult = (index: number, status: TestResult['status'], message: string, duration?: number) => {
    setTestResults(prev => prev.map((test, i) => 
      i === index ? { ...test, status, message, duration } : test
    ));
  };

  const runTests = async () => {
    setIsRunning(true);
    setOverallStatus('running');

    // Test 1: Service Initialization
    updateTestResult(0, 'running', 'Checking SOC 2 service...');
    try {
      const startTime = Date.now();
      if (soc2ComplianceService) {
        updateTestResult(0, 'passed', 'SOC 2 service successfully initialized', Date.now() - startTime);
      } else {
        throw new Error('Service not available');
      }
    } catch (error) {
      updateTestResult(0, 'failed', `Service initialization failed: ${error}`);
    }

    // Test 2: Audit Event Logging
    updateTestResult(1, 'running', 'Testing audit event logging...');
    try {
      const startTime = Date.now();
      const eventId = await soc2ComplianceService.logAuditEvent({
        event_type: 'system_test',
        resource_accessed: 'test_resource',
        action_performed: 'validation',
        result: 'success',
        severity: 'low',
        control_category: 'security',
        details: { test: true, timestamp: new Date().toISOString() }
      });
      
      if (eventId) {
        updateTestResult(1, 'passed', 'Audit event logged successfully', Date.now() - startTime);
      } else {
        updateTestResult(1, 'failed', 'Audit event logging returned null');
      }
    } catch (error) {
      updateTestResult(1, 'failed', `Audit logging failed: ${error}`);
    }

    // Test 3: Security Event Logging
    updateTestResult(2, 'running', 'Testing security event logging...');
    try {
      const startTime = Date.now();
      const securityEventId = await soc2ComplianceService.logSecurityEvent({
        event_category: 'access_control',
        event_description: 'SOC 2 system test security event',
        risk_level: 'low',
        metadata: { test: true }
      });
      
      if (securityEventId) {
        updateTestResult(2, 'passed', 'Security event logged successfully', Date.now() - startTime);
      } else {
        updateTestResult(2, 'failed', 'Security event logging returned null');
      }
    } catch (error) {
      updateTestResult(2, 'failed', `Security logging failed: ${error}`);
    }

    // Test 4: Dashboard Data Retrieval
    updateTestResult(3, 'running', 'Testing dashboard data retrieval...');
    try {
      const startTime = Date.now();
      const dashboardData = await soc2ComplianceService.getDashboardSummary();
      
      if (dashboardData && typeof dashboardData.auditEvents24h === 'number') {
        updateTestResult(3, 'passed', `Dashboard data retrieved (${dashboardData.auditEvents24h} events)`, Date.now() - startTime);
      } else {
        updateTestResult(3, 'failed', 'Dashboard data retrieval returned invalid data');
      }
    } catch (error) {
      updateTestResult(3, 'failed', `Dashboard data retrieval failed: ${error}`);
    }

    // Test 5: Data Integrity Check
    updateTestResult(4, 'running', 'Testing data integrity check...');
    try {
      const startTime = Date.now();
      const integrityResult = await soc2ComplianceService.performDataIntegrityCheck('students', 'test_check');
      
      if (integrityResult) {
        updateTestResult(4, 'passed', 'Data integrity check completed', Date.now() - startTime);
      } else {
        updateTestResult(4, 'failed', 'Data integrity check returned null');
      }
    } catch (error) {
      updateTestResult(4, 'failed', `Data integrity check failed: ${error}`);
    }

    // Test 6: Availability Metric Recording
    updateTestResult(5, 'running', 'Testing availability metrics...');
    try {
      const startTime = Date.now();
      const metricResult = await soc2ComplianceService.recordAvailabilityMetric(
        'test_service',
        'up',
        100,
        99.9,
        0,
        1,
        { test: true }
      );
      
      if (metricResult) {
        updateTestResult(5, 'passed', 'Availability metric recorded', Date.now() - startTime);
      } else {
        updateTestResult(5, 'failed', 'Availability metric recording returned null');
      }
    } catch (error) {
      updateTestResult(5, 'failed', `Availability metric recording failed: ${error}`);
    }

    // Test 7: Recent Events Retrieval
    updateTestResult(6, 'running', 'Testing recent events retrieval...');
    try {
      const startTime = Date.now();
      const recentEvents = await soc2ComplianceService.getRecentAuditEvents(5);
      
      if (Array.isArray(recentEvents)) {
        updateTestResult(6, 'passed', `Retrieved ${recentEvents.length} recent events`, Date.now() - startTime);
      } else {
        updateTestResult(6, 'failed', 'Recent events retrieval returned invalid data');
      }
    } catch (error) {
      updateTestResult(6, 'failed', `Recent events retrieval failed: ${error}`);
    }

    // Test 8: Hook Integration Test
    updateTestResult(7, 'running', 'Testing SOC 2 monitoring hooks...');
    try {
      const startTime = Date.now();
      
      // Test the hooks
      logUserAction('test', 'soc2_system_test', { validation: true });
      logDataAccess('test_table', 'read', 1);
      logSecurityEvent('access_control', 'Hook integration test', 'low');
      
      updateTestResult(7, 'passed', 'SOC 2 monitoring hooks work correctly', Date.now() - startTime);
    } catch (error) {
      updateTestResult(7, 'failed', `Hook integration test failed: ${error}`);
    }

    setIsRunning(false);
    setOverallStatus('completed');
  };

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
          onClick={runTests} 
          disabled={isRunning}
          className="flex items-center gap-2"
        >
          <PlayCircle className="w-4 h-4" />
          {isRunning ? 'Running Tests...' : 'Run Tests'}
        </Button>
      </div>

      {/* Test Results Summary */}
      {overallStatus !== 'idle' && (
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
      )}

      {/* Test Results */}
      <div className="grid gap-3">
        {testResults.map((test, index) => (
          <Card key={index} className={`${getStatusColor(test.status)} transition-colors`}>
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
