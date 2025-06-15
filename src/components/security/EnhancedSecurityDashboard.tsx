
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle, Lock, Eye, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SecurityMetrics {
  totalEvents: number;
  highSeverityEvents: number;
  mediumSeverityEvents: number;
  lowSeverityEvents: number;
  recentViolations: number;
  securityScore: number;
  violations: string[];
  recommendations: string[];
}

const EnhancedSecurityDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalEvents: 0,
    highSeverityEvents: 0,
    mediumSeverityEvents: 0,
    lowSeverityEvents: 0,
    recentViolations: 0,
    securityScore: 100,
    violations: [],
    recommendations: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSecurityMetrics();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadSecurityMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadSecurityMetrics = async () => {
    try {
      // Get security dashboard data
      const { data: dashboardData } = await supabase.rpc('get_security_dashboard_data');
      
      if (dashboardData && dashboardData.length > 0) {
        const data = dashboardData[0];
        
        // Get security health check
        const { data: healthCheck } = await supabase.rpc('enhanced_security_check');
        
        if (healthCheck && healthCheck.length > 0) {
          const health = healthCheck[0];
          
          setMetrics({
            totalEvents: parseInt(data.total_events) || 0,
            highSeverityEvents: parseInt(data.high_severity_events) || 0,
            mediumSeverityEvents: parseInt(data.medium_severity_events) || 0,
            lowSeverityEvents: parseInt(data.low_severity_events) || 0,
            recentViolations: parseInt(data.recent_violations) || 0,
            securityScore: health.security_score || 100,
            violations: health.violations || [],
            recommendations: health.recommendations || []
          });
        } else {
          setMetrics(prev => ({
            ...prev,
            totalEvents: parseInt(data.total_events) || 0,
            highSeverityEvents: parseInt(data.high_severity_events) || 0,
            mediumSeverityEvents: parseInt(data.medium_severity_events) || 0,
            lowSeverityEvents: parseInt(data.low_severity_events) || 0,
            recentViolations: parseInt(data.recent_violations) || 0
          }));
        }
      }
    } catch (error) {
      console.error('Failed to load security metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSecurityScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSecurityScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 90) return 'default';
    if (score >= 70) return 'secondary';
    return 'destructive';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading security metrics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Health Overview
          </CardTitle>
          <CardDescription>
            Real-time security monitoring and threat assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getSecurityScoreColor(metrics.securityScore)}`}>
                {metrics.securityScore}%
              </div>
              <div className="text-sm text-gray-600">Security Score</div>
              <Badge variant={getSecurityScoreBadgeVariant(metrics.securityScore)} className="mt-2">
                {metrics.securityScore >= 90 ? 'Excellent' : 
                 metrics.securityScore >= 70 ? 'Good' : 'Needs Attention'}
              </Badge>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{metrics.totalEvents}</div>
              <div className="text-sm text-gray-600">Total Events</div>
              <Eye className="w-5 h-5 mx-auto mt-2 text-blue-500" />
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{metrics.highSeverityEvents}</div>
              <div className="text-sm text-gray-600">High Severity</div>
              <AlertTriangle className="w-5 h-5 mx-auto mt-2 text-red-500" />
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{metrics.recentViolations}</div>
              <div className="text-sm text-gray-600">Recent (1hr)</div>
              <Activity className="w-5 h-5 mx-auto mt-2 text-orange-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              High Severity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.highSeverityEvents}</div>
            <div className="text-sm text-gray-600">Critical security events requiring immediate attention</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              Medium Severity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{metrics.mediumSeverityEvents}</div>
            <div className="text-sm text-gray-600">Security events requiring monitoring</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Low Severity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.lowSeverityEvents}</div>
            <div className="text-sm text-gray-600">Routine security audit events</div>
          </CardContent>
        </Card>
      </div>

      {/* Security Violations */}
      {metrics.violations.length > 0 && (
        <Alert className="border-red-500 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="font-semibold mb-2">Security Violations Detected:</div>
            <ul className="list-disc list-inside space-y-1">
              {metrics.violations.map((violation, index) => (
                <li key={index}>{violation}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Security Recommendations */}
      {metrics.recommendations.length > 0 && (
        <Alert className="border-blue-500 bg-blue-50">
          <Lock className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="font-semibold mb-2">Security Recommendations:</div>
            <ul className="list-disc list-inside space-y-1">
              {metrics.recommendations.map((recommendation, index) => (
                <li key={index}>{recommendation}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Security Features Active */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Active Security Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Enhanced Input Validation</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Rate Limiting Protection</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Session Security Monitoring</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>CSRF Protection</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>SQL Injection Prevention</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>XSS Attack Prevention</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedSecurityDashboard;
