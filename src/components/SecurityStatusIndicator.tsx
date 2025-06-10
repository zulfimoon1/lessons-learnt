
import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { securityService } from '@/services/securityService';
import { secureSessionService } from '@/services/secureSessionService';

interface SecurityCheck {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
}

const SecurityStatusIndicator: React.FC = () => {
  const [securityChecks, setSecurityChecks] = useState<SecurityCheck[]>([]);
  const [overallStatus, setOverallStatus] = useState<'secure' | 'warning' | 'critical'>('secure');

  useEffect(() => {
    const runSecurityChecks = async () => {
      const checks: SecurityCheck[] = [];

      // Check session security
      try {
        const sessionValid = secureSessionService.checkSessionValidity();
        checks.push({
          name: 'Session Security',
          status: sessionValid ? 'pass' : 'warning',
          message: sessionValid ? 'Session security validated' : 'Session security needs attention'
        });
      } catch (error) {
        checks.push({
          name: 'Session Security',
          status: 'fail',
          message: 'Session security check failed'
        });
      }

      // Check CSRF protection
      try {
        const csrfToken = securityService.generateCSRFToken();
        const csrfValid = securityService.validateCSRFToken(csrfToken);
        checks.push({
          name: 'CSRF Protection',
          status: csrfValid ? 'pass' : 'fail',
          message: csrfValid ? 'CSRF protection active' : 'CSRF protection failed'
        });
      } catch (error) {
        checks.push({
          name: 'CSRF Protection',
          status: 'fail',
          message: 'CSRF check failed'
        });
      }

      // Check security event logging
      try {
        const securityEvents = localStorage.getItem('security_events');
        const hasEvents = securityEvents && JSON.parse(securityEvents).length > 0;
        checks.push({
          name: 'Security Logging',
          status: hasEvents ? 'pass' : 'warning',
          message: hasEvents ? 'Security events being logged' : 'No security events logged yet'
        });
      } catch (error) {
        checks.push({
          name: 'Security Logging',
          status: 'fail',
          message: 'Security logging check failed'
        });
      }

      // Check input validation
      try {
        const testValidation = securityService.validateAndSanitizeInput('test input', 'name');
        checks.push({
          name: 'Input Validation',
          status: testValidation.isValid ? 'pass' : 'fail',
          message: testValidation.isValid ? 'Input validation active' : 'Input validation failed'
        });
      } catch (error) {
        checks.push({
          name: 'Input Validation',
          status: 'fail',
          message: 'Input validation check failed'
        });
      }

      // Check concurrent session detection
      try {
        const concurrentDetected = securityService.detectConcurrentSessions();
        checks.push({
          name: 'Session Monitoring',
          status: 'pass',
          message: concurrentDetected ? 'Concurrent session detected' : 'Session monitoring active'
        });
      } catch (error) {
        checks.push({
          name: 'Session Monitoring',
          status: 'fail',
          message: 'Session monitoring check failed'
        });
      }

      setSecurityChecks(checks);

      // Determine overall status
      const failCount = checks.filter(c => c.status === 'fail').length;
      const warningCount = checks.filter(c => c.status === 'warning').length;

      if (failCount > 0) {
        setOverallStatus('critical');
      } else if (warningCount > 0) {
        setOverallStatus('warning');
      } else {
        setOverallStatus('secure');
      }
    };

    runSecurityChecks();
    const interval = setInterval(runSecurityChecks, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'fail':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getOverallBadge = () => {
    switch (overallStatus) {
      case 'secure':
        return <Badge className="bg-green-100 text-green-800">Secure</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'critical':
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Status
          </div>
          {getOverallBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {securityChecks.map((check, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(check.status)}
                <span className="font-medium">{check.name}</span>
              </div>
              <span className="text-sm text-muted-foreground">{check.message}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityStatusIndicator;
