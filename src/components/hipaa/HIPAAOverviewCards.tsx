
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Shield, 
  Eye, 
  AlertTriangle, 
  FileCheck, 
  Users, 
  Clock,
  Database 
} from 'lucide-react';

interface HIPAAMetrics {
  phiAccessEvents24h: number;
  unauthorizedAccess: number;
  breachIncidents: number;
  complianceScore: number;
  pendingRiskAssessments: number;
  activeBAACount: number;
  patientRequestsPending: number;
}

interface HIPAAOverviewCardsProps {
  metrics: HIPAAMetrics | null;
}

const HIPAAOverviewCards: React.FC<HIPAAOverviewCardsProps> = ({ metrics }) => {
  if (!metrics) return null;

  const getComplianceColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-7">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Database className="w-4 h-4" />
            PHI Access Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.phiAccessEvents24h}</div>
          <p className="text-xs text-muted-foreground">Last 24 hours</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Unauthorized Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {metrics.unauthorizedAccess}
          </div>
          <p className="text-xs text-muted-foreground">Security violations</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Breach Incidents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {metrics.breachIncidents}
          </div>
          <p className="text-xs text-muted-foreground">Active incidents</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Compliance Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getComplianceColor(metrics.complianceScore)}`}>
            {metrics.complianceScore}%
          </div>
          <p className="text-xs text-muted-foreground">HIPAA compliance</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FileCheck className="w-4 h-4" />
            Risk Assessments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {metrics.pendingRiskAssessments}
          </div>
          <p className="text-xs text-muted-foreground">Pending review</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="w-4 h-4" />
            Active BAAs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.activeBAACount}
          </div>
          <p className="text-xs text-muted-foreground">Business associates</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Patient Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {metrics.patientRequestsPending}
          </div>
          <p className="text-xs text-muted-foreground">Pending response</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default HIPAAOverviewCards;
