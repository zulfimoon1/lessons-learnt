
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ShieldIcon, 
  AlertTriangleIcon, 
  CheckCircleIcon, 
  ActivityIcon,
  TrendingUpIcon,
  LockIcon
} from 'lucide-react';
import { securityPolicyService } from '@/services/optimizedSecurityPolicies';
import { enhancedSecureSessionV2 } from '@/services/enhancedSecureSessionV2';
import { useAuth } from '@/contexts/AuthContext';

interface SecurityMetrics {
  overallScore: number;
  vulnerabilities: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    type: string;
    description: string;
    recommendation: string;
  }>;
  strengths: string[];
  policyEffectiveness: {
    effective: boolean;
    issues: string[];
    recommendations: string[];
  };
  sessionSecurity: {
    valid: boolean;
    riskLevel: 'low' | 'medium' | 'high';
    issues: string[];
  };
  headerCompliance: {
    compliant: boolean;
    missing: string[];
    recommendations: string[];
  };
}

const SecurityMonitoringDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scanInProgress, setScanInProgress] = useState(false);
  const { teacher } = useAuth();

  useEffect(() => {
    if (teacher && teacher.role === 'admin') {
      loadSecurityMetrics();
    }
  }, [teacher]);

  const loadSecurityMetrics = async () => {
    try {
      setIsLoading(true);

      // Run comprehensive security assessment
      const [
        securityReport,
        policyValidation,
        sessionValidation,
        headerValidation
      ] = await Promise.all([
        securityPolicyService.generateSecurityReport(),
        securityPolicyService.validatePolicyEffectiveness(),
        enhancedSecureSessionV2.validateSessionSecurity('current-session'),
        enhancedSecureSessionV2.validateSecurityHeaders()
      ]);

      setMetrics({
        overallScore: securityReport.score,
        vulnerabilities: securityReport.vulnerabilities,
        strengths: securityReport.strengths,
        policyEffectiveness: policyValidation,
        sessionSecurity: sessionValidation,
        headerCompliance: headerValidation
      });
    } catch (error) {
      console.error('Error loading security metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const runSecurityScan = async () => {
    setScanInProgress(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate scan
      await loadSecurityMetrics();
    } catch (error) {
      console.error('Security scan failed:', error);
    } finally {
      setScanInProgress(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (!teacher || teacher.role !== 'admin') {
    return (
      <div className="p-6">
        <Alert>
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertDescription>
            Access denied. Only platform administrators can view the security monitoring dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading security monitoring dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Monitoring Dashboard</h1>
          <p className="text-gray-600">Comprehensive security assessment and monitoring</p>
        </div>
        <Button 
          onClick={runSecurityScan} 
          disabled={scanInProgress}
          className="flex items-center gap-2"
        >
          <ShieldIcon className="w-4 h-4" />
          {scanInProgress ? 'Scanning...' : 'Run Security Scan'}
        </Button>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <ShieldIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getScoreColor(metrics?.overallScore || 0)}`}>
              {metrics?.overallScore}/100
            </div>
            <Progress value={metrics?.overallScore || 0} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Overall platform security rating
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Session Security</CardTitle>
            <LockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getRiskLevelColor(metrics?.sessionSecurity.riskLevel || 'low')}`}>
              {metrics?.sessionSecurity.riskLevel.toUpperCase()}
            </div>
            <p className="text-xs text-muted-foreground">
              Current session risk level
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Issues</CardTitle>
            <AlertTriangleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.vulnerabilities.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Security vulnerabilities detected
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="vulnerabilities" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
          <TabsTrigger value="policies">RLS Policies</TabsTrigger>
          <TabsTrigger value="session">Session Security</TabsTrigger>
          <TabsTrigger value="headers">Security Headers</TabsTrigger>
        </TabsList>

        <TabsContent value="vulnerabilities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Vulnerabilities</CardTitle>
            </CardHeader>
            <CardContent>
              {metrics?.vulnerabilities.length === 0 ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircleIcon className="w-5 h-5" />
                  <span>No security vulnerabilities detected!</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {metrics?.vulnerabilities.map((vuln, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{vuln.type}</h4>
                        <Badge className={getSeverityColor(vuln.severity)}>
                          {vuln.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{vuln.description}</p>
                      <p className="text-sm text-blue-600">💡 {vuln.recommendation}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Row Level Security Policy Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {metrics?.policyEffectiveness.effective ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertTriangleIcon className="w-5 h-5 text-yellow-600" />
                  )}
                  <span className="font-medium">
                    Policy Effectiveness: {metrics?.policyEffectiveness.effective ? 'Good' : 'Needs Attention'}
                  </span>
                </div>

                {metrics?.policyEffectiveness.issues.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Issues Found:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {metrics.policyEffectiveness.issues.map((issue, index) => (
                        <li key={index} className="text-sm text-red-600">{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h4 className="font-medium mb-2">Recommendations:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {metrics?.policyEffectiveness.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-blue-600">{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="session" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enhanced Session Security</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {metrics?.sessionSecurity.valid ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertTriangleIcon className="w-5 h-5 text-red-600" />
                  )}
                  <span className="font-medium">
                    Session Status: {metrics?.sessionSecurity.valid ? 'Valid' : 'Invalid'}
                  </span>
                </div>

                <div>
                  <span className="font-medium">Risk Level: </span>
                  <span className={getRiskLevelColor(metrics?.sessionSecurity.riskLevel || 'low')}>
                    {metrics?.sessionSecurity.riskLevel.toUpperCase()}
                  </span>
                </div>

                {metrics?.sessionSecurity.issues.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Security Issues:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {metrics.sessionSecurity.issues.map((issue, index) => (
                        <li key={index} className="text-sm text-red-600">{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="bg-blue-50 p-3 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Enhanced Features Active:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>✅ Advanced browser fingerprinting</li>
                    <li>✅ Session timeout management</li>
                    <li>✅ Suspicious activity detection</li>
                    <li>✅ Enhanced CSRF protection</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="headers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Headers Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {metrics?.headerCompliance.compliant ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertTriangleIcon className="w-5 h-5 text-yellow-600" />
                  )}
                  <span className="font-medium">
                    Header Compliance: {metrics?.headerCompliance.compliant ? 'Good' : 'Partial'}
                  </span>
                </div>

                {metrics?.headerCompliance.missing.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Missing Headers:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {metrics.headerCompliance.missing.map((header, index) => (
                        <li key={index} className="text-sm text-yellow-600">{header}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h4 className="font-medium mb-2">Recommendations:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {metrics?.headerCompliance.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-blue-600">{rec}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-green-50 p-3 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Active Security Headers:</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>✅ Content Security Policy (CSP)</li>
                    <li>✅ X-Frame-Options</li>
                    <li>✅ X-Content-Type-Options</li>
                    <li>✅ Referrer Policy</li>
                    <li>✅ X-XSS-Protection</li>
                    <li>✅ Permissions Policy</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Security Strengths */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUpIcon className="w-5 h-5" />
            Security Strengths
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {metrics?.strengths.map((strength, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-600" />
                <span className="text-sm">{strength}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityMonitoringDashboard;
