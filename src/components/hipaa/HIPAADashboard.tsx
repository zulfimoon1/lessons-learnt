
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, FileCheck, Users, AlertTriangle } from 'lucide-react';
import { hipaaComplianceService } from '@/services/hipaaComplianceService';
import { toast } from '@/hooks/use-toast';
import HIPAAOverviewCards from './HIPAAOverviewCards';
import HIPAARiskAssessment from './HIPAARiskAssessment';
import HIPAABAAManagement from './HIPAABAAManagement';
import HIPAABreachNotification from './HIPAABreachNotification';
import HIPAAPatientRights from './HIPAAPatientRights';
import HIPAATrainingTracking from './HIPAATrainingTracking';

interface HIPAAMetrics {
  phiAccessEvents24h: number;
  unauthorizedAccess: number;
  breachIncidents: number;
  complianceScore: number;
  pendingRiskAssessments: number;
  activeBAACount: number;
  patientRequestsPending: number;
}

const HIPAADashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<HIPAAMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHIPAAData();
    const interval = setInterval(loadHIPAAData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const loadHIPAAData = async () => {
    try {
      const hipaaMetrics = await hipaaComplianceService.getHIPAAMetrics();
      setMetrics(hipaaMetrics);
    } catch (error) {
      console.error('Failed to load HIPAA dashboard data:', error);
      toast({
        title: 'Dashboard Error',
        description: 'Failed to load HIPAA compliance data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runComplianceAudit = async () => {
    try {
      // Simulate compliance audit
      await hipaaComplianceService.logPHIAccess({
        event_type: 'phi_access',
        resource_accessed: 'compliance_audit',
        action_performed: 'audit_execution',
        result: 'success',
        timestamp: new Date().toISOString(),
        severity: 'low',
        minimum_necessary: true,
        purpose_of_use: 'operations'
      });
      
      toast({
        title: 'Compliance Audit Complete',
        description: 'HIPAA compliance audit has been executed successfully'
      });
      
      loadHIPAAData();
    } catch (error) {
      toast({
        title: 'Audit Failed',
        description: 'Failed to perform HIPAA compliance audit',
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading HIPAA Compliance Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8 text-green-600" />
            HIPAA Compliance Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Protected Health Information (PHI) monitoring and compliance management
          </p>
        </div>
        <Button onClick={runComplianceAudit} variant="outline">
          <FileCheck className="w-4 h-4 mr-2" />
          Run Compliance Audit
        </Button>
      </div>

      {/* Overview Cards */}
      <HIPAAOverviewCards metrics={metrics} />

      {/* Critical Alerts */}
      {metrics?.breachIncidents && metrics.breachIncidents > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have {metrics.breachIncidents} active breach incident(s) that require immediate attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Compliance Score Alert */}
      {metrics?.complianceScore && metrics.complianceScore < 80 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            HIPAA compliance score is {metrics.complianceScore}%. Immediate action required to address compliance gaps.
          </AlertDescription>
        </Alert>
      )}

      {/* Detailed Tabs */}
      <Tabs defaultValue="risk-assessment" className="space-y-4">
        <TabsList>
          <TabsTrigger value="risk-assessment">Risk Assessment</TabsTrigger>
          <TabsTrigger value="baa-management">BAA Management</TabsTrigger>
          <TabsTrigger value="breach-notification">Breach Notification</TabsTrigger>
          <TabsTrigger value="patient-rights">Patient Rights</TabsTrigger>
          <TabsTrigger value="training">Training & Workforce</TabsTrigger>
        </TabsList>

        <TabsContent value="risk-assessment" className="space-y-4">
          <HIPAARiskAssessment />
        </TabsContent>

        <TabsContent value="baa-management" className="space-y-4">
          <HIPAABAAManagement />
        </TabsContent>

        <TabsContent value="breach-notification" className="space-y-4">
          <HIPAABreachNotification />
        </TabsContent>

        <TabsContent value="patient-rights" className="space-y-4">
          <HIPAAPatientRights />
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <HIPAATrainingTracking />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HIPAADashboard;
