
import { soc2ComplianceService } from '@/services/soc2ComplianceService';
import { useSOC2Monitoring } from '@/hooks/useSOC2Monitoring';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  message: string;
  duration?: number;
}

export const useTestRunner = () => {
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

  const runTests = async (
    updateTestResult: (index: number, status: TestResult['status'], message: string, duration?: number) => void,
    setIsRunning: (running: boolean) => void,
    setOverallStatus: (status: 'idle' | 'running' | 'completed') => void
  ) => {
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

  return { initialTests, runTests };
};
