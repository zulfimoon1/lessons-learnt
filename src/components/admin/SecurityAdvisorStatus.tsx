
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield, CheckCircle, RefreshCw } from "lucide-react";
import { supabaseSecurityPatch } from '@/services/supabaseSecurityPatch';
import { useToast } from '@/hooks/use-toast';

interface SecurityReport {
  errors: number;
  warnings: number;
  issues: Array<{
    type: string;
    table?: string;
    function?: string;
    severity: 'error' | 'warning';
    description: string;
  }>;
  recommendations: string[];
}

const SecurityAdvisorStatus: React.FC = () => {
  const [report, setReport] = useState<SecurityReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const runSecurityDiagnosis = async () => {
    setIsLoading(true);
    try {
      const securityReport = await supabaseSecurityPatch.generateSecurityReport();
      setReport(securityReport);
      
      if (securityReport.errors === 0 && securityReport.warnings === 0) {
        toast({
          title: "Security Status",
          description: "No security issues detected",
        });
      } else {
        toast({
          title: "Security Issues Found",
          description: `${securityReport.errors} errors, ${securityReport.warnings} warnings`,
          variant: securityReport.errors > 0 ? "destructive" : "default",
        });
      }
    } catch (error) {
      console.error('Security diagnosis failed:', error);
      toast({
        title: "Diagnosis Failed",
        description: "Unable to complete security assessment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runSecurityDiagnosis();
  }, []);

  const getStatusColor = () => {
    if (!report) return 'bg-gray-100';
    if (report.errors > 0) return 'bg-red-50 border-red-200';
    if (report.warnings > 0) return 'bg-yellow-50 border-yellow-200';
    return 'bg-green-50 border-green-200';
  };

  const getStatusIcon = () => {
    if (!report) return <Shield className="w-5 h-5 text-gray-500" />;
    if (report.errors > 0) return <AlertTriangle className="w-5 h-5 text-red-500" />;
    if (report.warnings > 0) return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    return <CheckCircle className="w-5 h-5 text-green-500" />;
  };

  return (
    <Card className={`${getStatusColor()}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            Security Advisor Status
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={runSecurityDiagnosis}
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {report ? (
          <div className="space-y-4">
            {/* Status Summary */}
            <div className="flex gap-4">
              {report.errors > 0 && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {report.errors} Error{report.errors !== 1 ? 's' : ''}
                </Badge>
              )}
              {report.warnings > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {report.warnings} Warning{report.warnings !== 1 ? 's' : ''}
                </Badge>
              )}
              {report.errors === 0 && report.warnings === 0 && (
                <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3" />
                  All Clear
                </Badge>
              )}
            </div>

            {/* Issues List */}
            {report.issues.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Security Issues:</h4>
                <div className="space-y-1">
                  {report.issues.slice(0, 5).map((issue, index) => (
                    <div
                      key={index}
                      className={`text-xs p-2 rounded ${
                        issue.severity === 'error' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      <div className="font-medium">
                        {issue.table && `Table: ${issue.table}`}
                        {issue.function && `Function: ${issue.function}`}
                      </div>
                      <div>{issue.description}</div>
                    </div>
                  ))}
                  {report.issues.length > 5 && (
                    <div className="text-xs text-gray-500 italic">
                      ...and {report.issues.length - 5} more issues
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {report.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Recommendations:</h4>
                <ul className="text-xs space-y-1">
                  {report.recommendations.slice(0, 3).map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Running security diagnosis...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SecurityAdvisorStatus;
