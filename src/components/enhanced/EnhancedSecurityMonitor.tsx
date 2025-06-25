
import React, { memo, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { useDebounce } from "@/hooks/usePerformanceOptimization";

interface SecurityMetrics {
  totalEvents: number;
  highSeverityEvents: number;
  mediumSeverityEvents: number;
  lowSeverityEvents: number;
  recentViolations: number;
  securityScore: number;
}

const EnhancedSecurityMonitor = memo(() => {
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalEvents: 0,
    highSeverityEvents: 0,
    mediumSeverityEvents: 0,
    lowSeverityEvents: 0,
    recentViolations: 0,
    securityScore: 100
  });
  const [isLoading, setIsLoading] = useState(true);

  // Debounced metrics update to prevent excessive API calls
  const debouncedUpdateMetrics = useDebounce(async () => {
    try {
      // Simulate fetching security metrics
      // In production, this would call a secure endpoint
      setMetrics({
        totalEvents: Math.floor(Math.random() * 100) + 50,
        highSeverityEvents: Math.floor(Math.random() * 5),
        mediumSeverityEvents: Math.floor(Math.random() * 15) + 5,
        lowSeverityEvents: Math.floor(Math.random() * 30) + 10,
        recentViolations: Math.floor(Math.random() * 3),
        securityScore: Math.floor(Math.random() * 20) + 80
      });
    } catch (error) {
      console.error('Failed to fetch security metrics:', error);
    } finally {
      setIsLoading(false);
    }
  }, 1000);

  useEffect(() => {
    debouncedUpdateMetrics();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(debouncedUpdateMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const getSecurityScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSecurityScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (score >= 70) return <Clock className="w-5 h-5 text-yellow-600" />;
    return <AlertTriangle className="w-5 h-5 text-red-600" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-teal"></div>
          <span className="ml-3">Loading security metrics...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-brand-teal/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-brand-teal" />
          Security Monitor
          <Badge variant="outline" className="ml-auto">
            Real-time
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Security Score */}
          <div className="col-span-2 md:col-span-1">
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Security Score</p>
                  <p className={`text-3xl font-bold ${getSecurityScoreColor(metrics.securityScore)}`}>
                    {metrics.securityScore}%
                  </p>
                </div>
                {getSecurityScoreIcon(metrics.securityScore)}
              </div>
            </Card>
          </div>

          {/* Recent Violations */}
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Recent Violations</p>
                <p className="text-2xl font-bold text-red-600">{metrics.recentViolations}</p>
              </div>
            </div>
          </Card>

          {/* Total Events */}
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Events</p>
                <p className="text-2xl font-bold">{metrics.totalEvents}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Severity Breakdown */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Event Severity Breakdown</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm">High Severity</span>
              </div>
              <Badge variant="destructive">{metrics.highSeverityEvents}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">Medium Severity</span>
              </div>
              <Badge variant="secondary">{metrics.mediumSeverityEvents}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Low Severity</span>
              </div>
              <Badge variant="outline">{metrics.lowSeverityEvents}</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

EnhancedSecurityMonitor.displayName = "EnhancedSecurityMonitor";

export default EnhancedSecurityMonitor;
