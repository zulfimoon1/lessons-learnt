
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ComplianceControl {
  id: string;
  name: string;
  category: 'security' | 'availability' | 'integrity' | 'confidentiality' | 'privacy';
  status: 'compliant' | 'partial' | 'non_compliant';
  description: string;
  lastChecked: string;
}

const SOC2ComplianceControls: React.FC = () => {
  const controls: ComplianceControl[] = [
    {
      id: 'CC6.1',
      name: 'Logical Access Controls',
      category: 'security',
      status: 'compliant',
      description: 'Role-based access controls with MFA enforcement for privileged users',
      lastChecked: new Date().toISOString()
    },
    {
      id: 'CC6.2',
      name: 'Authentication Controls',
      category: 'security',
      status: 'partial',
      description: 'Multi-factor authentication implemented for admin roles',
      lastChecked: new Date().toISOString()
    },
    {
      id: 'CC6.3',
      name: 'User Access Management',
      category: 'security',
      status: 'compliant',
      description: 'User provisioning and de-provisioning processes established',
      lastChecked: new Date().toISOString()
    },
    {
      id: 'CC7.1',
      name: 'System Monitoring',
      category: 'security',
      status: 'compliant',
      description: 'Continuous monitoring of security events and access patterns',
      lastChecked: new Date().toISOString()
    },
    {
      id: 'A1.1',
      name: 'System Availability',
      category: 'availability',
      status: 'compliant',
      description: 'System uptime monitoring and alerting mechanisms',
      lastChecked: new Date().toISOString()
    },
    {
      id: 'PI1.1',
      name: 'Data Processing Integrity',
      category: 'integrity',
      status: 'compliant',
      description: 'Data validation and integrity checks implemented',
      lastChecked: new Date().toISOString()
    },
    {
      id: 'C1.1',
      name: 'Data Confidentiality',
      category: 'confidentiality',
      status: 'partial',
      description: 'Encryption at rest and in transit for sensitive data',
      lastChecked: new Date().toISOString()
    },
    {
      id: 'P1.1',
      name: 'Privacy Controls',
      category: 'privacy',
      status: 'compliant',
      description: 'Student data privacy controls and consent management',
      lastChecked: new Date().toISOString()
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'partial':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'non_compliant':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      compliant: 'default',
      partial: 'secondary',
      non_compliant: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const categoryCounts = controls.reduce((acc, control) => {
    acc[control.category] = (acc[control.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusCounts = controls.reduce((acc, control) => {
    acc[control.status] = (acc[control.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Compliance Summary */}
      <div className="grid gap-4 md:grid-cols-5">
        {Object.entries(categoryCounts).map(([category, count]) => (
          <Card key={category}>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{count}</div>
              <p className="text-xs text-muted-foreground capitalize">{category}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Control Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Compliant: {statusCounts.compliant || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <span>Partial: {statusCounts.partial || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <span>Non-compliant: {statusCounts.non_compliant || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Controls */}
      <Card>
        <CardHeader>
          <CardTitle>SOC 2 Trust Service Criteria</CardTitle>
          <p className="text-sm text-muted-foreground">
            Detailed compliance status for each control
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {controls.map((control) => (
              <div key={control.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(control.status)}
                      <h4 className="font-medium">{control.id} - {control.name}</h4>
                      {getStatusBadge(control.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {control.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="capitalize">Category: {control.category}</span>
                      <span>Last checked: {new Date(control.lastChecked).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SOC2ComplianceControls;
