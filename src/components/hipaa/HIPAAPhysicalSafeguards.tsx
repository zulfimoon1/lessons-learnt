
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building, Lock, Eye, Server, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface PhysicalSafeguard {
  id: string;
  category: 'facility_access' | 'workstation_use' | 'device_controls' | 'media_controls';
  name: string;
  status: 'compliant' | 'non_compliant' | 'partial';
  description: string;
  location: string;
  lastInspection: string;
  nextInspection: string;
  findings: string[];
}

const HIPAAPhysicalSafeguards: React.FC = () => {
  const [safeguards] = useState<PhysicalSafeguard[]>([
    {
      id: '1',
      category: 'facility_access',
      name: 'Facility Access Controls',
      status: 'compliant',
      description: 'Limit physical access to facilities while ensuring appropriate access is authorized',
      location: 'Main Campus - Administration Building',
      lastInspection: '2024-06-15',
      nextInspection: '2024-09-15',
      findings: []
    },
    {
      id: '2',
      category: 'workstation_use',
      name: 'Workstation Use Controls',
      status: 'partial',
      description: 'Restrict access to workstations that access PHI to authorized users only',
      location: 'Counseling Office - Room 201',
      lastInspection: '2024-06-10',
      nextInspection: '2024-09-10',
      findings: ['Screen positioning needs adjustment for privacy', 'Auto-lock timeout should be reduced']
    },
    {
      id: '3',
      category: 'device_controls',
      name: 'Device and Media Controls',
      status: 'compliant',
      description: 'Control receipt and removal of hardware and electronic media containing PHI',
      location: 'IT Department - Server Room',
      lastInspection: '2024-06-20',
      nextInspection: '2024-09-20',
      findings: []
    },
    {
      id: '4',
      category: 'media_controls',
      name: 'Media Reuse and Disposal',
      status: 'non_compliant',
      description: 'Ensure proper disposal/reuse of electronic media containing PHI',
      location: 'Various Locations',
      lastInspection: '2024-06-05',
      nextInspection: '2024-07-05',
      findings: ['Missing disposal documentation', 'Secure destruction procedures not followed']
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'non_compliant':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'border-green-200 bg-green-50';
      case 'non_compliant': return 'border-red-200 bg-red-50';
      default: return 'border-orange-200 bg-orange-50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'facility_access': return <Building className="w-4 h-4" />;
      case 'workstation_use': return <Eye className="w-4 h-4" />;
      case 'device_controls': return <Server className="w-4 h-4" />;
      default: return <Lock className="w-4 h-4" />;
    }
  };

  const nonCompliantCount = safeguards.filter(s => s.status === 'non_compliant').length;
  const partialCount = safeguards.filter(s => s.status === 'partial').length;
  const upcomingInspections = safeguards.filter(s => {
    const inspectionDate = new Date(s.nextInspection);
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    return inspectionDate <= thirtyDaysFromNow;
  }).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Physical Safeguards Management
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Monitor and manage HIPAA physical safeguards compliance
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4" />
                <h4 className="font-medium">Compliant</h4>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {safeguards.filter(s => s.status === 'compliant').length}
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <h4 className="font-medium">Partial</h4>
              </div>
              <div className="text-2xl font-bold text-orange-600">{partialCount}</div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-4 h-4" />
                <h4 className="font-medium">Non-Compliant</h4>
              </div>
              <div className="text-2xl font-bold text-red-600">{nonCompliantCount}</div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4" />
                <h4 className="font-medium">Inspections Due</h4>
              </div>
              <div className="text-2xl font-bold text-blue-600">{upcomingInspections}</div>
            </div>
          </div>

          {(nonCompliantCount > 0 || partialCount > 0) && (
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {nonCompliantCount > 0 && `${nonCompliantCount} critical physical safeguard issue(s) require immediate attention. `}
                {partialCount > 0 && `${partialCount} physical safeguard(s) need improvement.`}
              </AlertDescription>
            </Alert>
          )}

          {upcomingInspections > 0 && (
            <Alert className="mb-6">
              <Eye className="h-4 w-4" />
              <AlertDescription>
                {upcomingInspections} physical safeguard inspection(s) are due within 30 days.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {safeguards.map((safeguard) => (
              <div key={safeguard.id} className={`p-4 border rounded-lg ${getStatusColor(safeguard.status)}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getCategoryIcon(safeguard.category)}
                    <div>
                      <h4 className="font-medium">{safeguard.name}</h4>
                      <p className="text-sm text-gray-600">{safeguard.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(safeguard.status)}
                    <span className="text-sm capitalize font-medium">
                      {safeguard.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 mb-3">{safeguard.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                  <div>
                    <span className="font-medium">Last Inspection:</span> {safeguard.lastInspection}
                  </div>
                  <div>
                    <span className="font-medium">Next Inspection:</span> {safeguard.nextInspection}
                  </div>
                </div>
                
                {safeguard.findings.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-orange-700 mb-1">Inspection Findings:</p>
                    <ul className="text-sm text-orange-600 list-disc list-inside">
                      {safeguard.findings.map((finding, index) => (
                        <li key={index}>{finding}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    Schedule Inspection
                  </Button>
                  {safeguard.status !== 'compliant' && (
                    <Button size="sm" variant="outline">
                      Create Remediation Plan
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HIPAAPhysicalSafeguards;
