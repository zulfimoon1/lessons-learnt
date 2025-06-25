import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Database, AlertTriangle } from 'lucide-react';
import { soc2ComplianceService, SOC2DashboardData } from '@/services/soc2ComplianceService';
import { toast } from '@/hooks/use-toast';
import SOC2OverviewCards from './SOC2OverviewCards';
import SOC2AuditEvents from './SOC2AuditEvents';
import SOC2SecurityEvents from './SOC2SecurityEvents';
import SOC2ComplianceControls from './SOC2ComplianceControls';
import SOC2AccessControlPanel from './SOC2AccessControlPanel';
import SOC2DataProtectionPanel from './SOC2DataProtectionPanel';

const SOC2Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<SOC2DashboardData | null>(null);
  const [auditEvents, setAuditEvents] = useState<any[]>([]);
  const [securityEvents, setSecurityEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [summary, events, security] = await Promise.all([
        soc2ComplianceService.getDashboardSummary(),
        soc2ComplianceService.getRecentAuditEvents(20),
        soc2ComplianceService.getSecurityEvents()
      ]);

      setDashboardData(summary);
      setAuditEvents(events);
      setSecurityEvents(security);
    } catch (error) {
      console.error('Failed to load SOC 2 dashboard data:', error);
      toast({
        title: 'Dashboard Error',
        description: 'Failed to load SOC 2 compliance data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runIntegrityCheck = async () => {
    try {
      const tables = ['students', 'teachers', 'feedback', 'mental_health_alerts'];
      
      for (const table of tables) {
        await soc2ComplianceService.performDataIntegrityCheck(table, 'count');
      }
      
      toast({
        title: 'Integrity Check Complete',
        description: 'Data integrity checks have been performed on all critical tables'
      });
      
      loadDashboardData();
    } catch (error) {
      toast({
        title: 'Integrity Check Failed',
        description: 'Failed to perform data integrity checks',
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading SOC 2 Compliance Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8 text-blue-600" />
            SOC 2 Compliance Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Real-time monitoring of security controls and compliance metrics
          </p>
        </div>
        <Button onClick={runIntegrityCheck} variant="outline">
          <Database className="w-4 h-4 mr-2" />
          Run Integrity Check
        </Button>
      </div>

      {/* Overview Cards */}
      <SOC2OverviewCards dashboardData={dashboardData} />

      {/* Critical Alerts */}
      {dashboardData?.criticalAlerts && dashboardData.criticalAlerts > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have {dashboardData.criticalAlerts} critical security alerts that require immediate attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Detailed Tabs */}
      <Tabs defaultValue="access-control" className="space-y-4">
        <TabsList>
          <TabsTrigger value="access-control">Access Control</TabsTrigger>
          <TabsTrigger value="data-protection">Data Protection</TabsTrigger>
          <TabsTrigger value="audit">Audit Events</TabsTrigger>
          <TabsTrigger value="security">Security Events</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Controls</TabsTrigger>
        </TabsList>

        <TabsContent value="access-control" className="space-y-4">
          <SOC2AccessControlPanel />
        </TabsContent>

        <TabsContent value="data-protection" className="space-y-4">
          <SOC2DataProtectionPanel />
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <SOC2AuditEvents auditEvents={auditEvents} />
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <SOC2SecurityEvents securityEvents={securityEvents} />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <SOC2ComplianceControls />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SOC2Dashboard;
