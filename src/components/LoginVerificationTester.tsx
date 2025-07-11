
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface TestResult {
  test: string;
  status: 'pending' | 'success' | 'error' | 'running';
  message?: string;
  details?: string;
}

const LoginVerificationTester: React.FC = () => {
  const { studentLogin, studentSignup } = useAuth();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const updateTestResult = (testName: string, status: TestResult['status'], message?: string, details?: string) => {
    setTestResults(prev => {
      const existing = prev.find(r => r.test === testName);
      if (existing) {
        existing.status = status;
        existing.message = message;
        existing.details = details;
        return [...prev];
      } else {
        return [...prev, { test: testName, status, message, details }];
      }
    });
  };

  const runLoginTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    // Test 1: Student Login Input Validation
    updateTestResult('Student Login Validation', 'running');
    try {
      const result = await studentLogin('', '');
      if (result.error) {
        updateTestResult('Student Login Validation', 'success', 'Input validation working', result.error);
      } else {
        updateTestResult('Student Login Validation', 'error', 'Input validation failed', 'Empty inputs should be rejected');
      }
    } catch (error) {
      updateTestResult('Student Login Validation', 'error', 'Validation test failed', String(error));
    }

    // Test 2: Student Login with Invalid Credentials
    updateTestResult('Invalid Credentials Test', 'running');
    try {
      const result = await studentLogin('NonExistent User', 'wrongpassword');
      if (result.error && result.error.includes('Invalid credentials')) {
        updateTestResult('Invalid Credentials Test', 'success', 'Invalid credentials properly rejected', result.error);
      } else {
        updateTestResult('Invalid Credentials Test', 'error', 'Security issue detected', 'Invalid credentials should be rejected');
      }
    } catch (error) {
      updateTestResult('Invalid Credentials Test', 'error', 'Test failed', String(error));
    }

    // Test 3: Student Signup Input Validation
    updateTestResult('Student Signup Validation', 'running');
    try {
      const result = await studentSignup('', '', '', '');
      if (result.error) {
        updateTestResult('Student Signup Validation', 'success', 'Signup validation working', result.error);
      } else {
        updateTestResult('Student Signup Validation', 'error', 'Signup validation failed', 'Empty inputs should be rejected');
      }
    } catch (error) {
      updateTestResult('Student Signup Validation', 'error', 'Signup validation test failed', String(error));
    }

    // Test 4: Password Strength Test
    updateTestResult('Password Strength Test', 'running');
    try {
      const result = await studentSignup('Test User', 'Test School', 'Grade 1', '123');
      if (result.error && (result.error.includes('password') || result.error.includes('strength'))) {
        updateTestResult('Password Strength Test', 'success', 'Password strength validation working', result.error);
      } else {
        updateTestResult('Password Strength Test', 'error', 'Weak password accepted', 'Weak passwords should be rejected');
      }
    } catch (error) {
      updateTestResult('Password Strength Test', 'error', 'Password test failed', String(error));
    }

    // Test 5: Rate Limiting Check
    updateTestResult('Rate Limiting Test', 'running');
    try {
      // Attempt multiple rapid logins
      const promises = Array(6).fill(0).map(() => 
        studentLogin('Rate Test User', 'wrongpassword')
      );
      
      const results = await Promise.all(promises);
      const hasRateLimit = results.some(r => r.error && (r.error.includes('rate') || r.error.includes('attempts') || r.error.includes('locked')));
      
      if (hasRateLimit) {
        updateTestResult('Rate Limiting Test', 'success', 'Rate limiting is active', 'Multiple failed attempts properly blocked');
      } else {
        updateTestResult('Rate Limiting Test', 'error', 'Rate limiting may not be working', 'Multiple rapid attempts were not blocked');
      }
    } catch (error) {
      updateTestResult('Rate Limiting Test', 'error', 'Rate limiting test failed', String(error));
    }

    // Test 6: Security Event Logging
    updateTestResult('Security Logging Test', 'running');
    try {
      const securityEvents = localStorage.getItem('security_events');
      if (securityEvents) {
        const events = JSON.parse(securityEvents);
        const recentEvents = events.filter((e: any) => 
          new Date(e.timestamp).getTime() > Date.now() - 60000 // Last minute
        );
        
        if (recentEvents.length > 0) {
          updateTestResult('Security Logging Test', 'success', 'Security events are being logged', `${recentEvents.length} events logged in last minute`);
        } else {
          updateTestResult('Security Logging Test', 'error', 'No recent security events found', 'Security logging may not be working');
        }
      } else {
        updateTestResult('Security Logging Test', 'error', 'No security events storage found', 'Security logging not initialized');
      }
    } catch (error) {
      updateTestResult('Security Logging Test', 'error', 'Security logging test failed', String(error));
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'running':
        return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">PASS</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">FAIL</Badge>;
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800">RUNNING</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">PENDING</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Login System Verification
          <Button onClick={runLoginTests} disabled={isRunning}>
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              'Run Login Tests'
            )}
          </Button>
        </CardTitle>
        <CardDescription>
          Comprehensive verification of all login functionalities and security measures
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {testResults.map((result, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(result.status)}
                <div>
                  <h4 className="font-medium">{result.test}</h4>
                  {result.message && (
                    <p className="text-sm text-muted-foreground">{result.message}</p>
                  )}
                  {result.details && (
                    <p className="text-xs text-muted-foreground mt-1">{result.details}</p>
                  )}
                </div>
              </div>
              {getStatusBadge(result.status)}
            </div>
          ))}
          
          {testResults.length === 0 && !isRunning && (
            <div className="text-center py-8 text-muted-foreground">
              Click "Run Login Tests" to verify all login functionalities
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginVerificationTester;
