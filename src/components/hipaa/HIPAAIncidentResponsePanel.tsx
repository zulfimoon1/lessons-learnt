
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, FileText, Clock, CheckCircle } from 'lucide-react';

interface SecurityIncident {
  id: string;
  type: 'unauthorized_access' | 'data_breach' | 'system_compromise' | 'policy_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'contained' | 'resolved';
  reportedDate: string;
  description: string;
  affectedPHI: boolean;
  reportedBy: string;
  assignedTo: string;
}

const HIPAAIncidentResponsePanel: React.FC = () => {
  const [incidents] = useState<SecurityIncident[]>([
    {
      id: '1',
      type: 'unauthorized_access',
      severity: 'medium',
      status: 'investigating',
      reportedDate: '2024-06-25',
      description: 'Attempted access to student mental health records from unverified device',
      affectedPHI: true,
      reportedBy: 'System Monitoring',
      assignedTo: 'Lisa Rodriguez'
    },
    {
      id: '2',
      type: 'policy_violation',
      severity: 'low',
      status: 'resolved',
      reportedDate: '2024-06-20',
      description: 'Shared login credentials between staff members',
      affectedPHI: false,
      reportedBy: 'Mike Chen',
      assignedTo: 'Dr. Sarah Johnson'
    }
  ]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'investigating':
        return <Clock className="w-4 h-4 text-orange-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
    }
  };

  const activeIncidents = incidents.filter(i => i.status !== 'resolved');
  const phiIncidents = incidents.filter(i => i.affectedPHI);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            HIPAA Incident Response Management
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Track and manage security incidents affecting PHI and HIPAA compliance
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <h4 className="font-medium">Active Incidents</h4>
              </div>
              <div className="text-2xl font-bold text-red-600">{activeIncidents.length}</div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4" />
                <h4 className="font-medium">PHI Affected</h4>
              </div>
              <div className="text-2xl font-bold text-orange-600">{phiIncidents.length}</div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4" />
                <h4 className="font-medium">Resolved (30 days)</h4>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {incidents.filter(i => i.status === 'resolved').length}
              </div>
            </div>
          </div>

          {activeIncidents.length > 0 && (
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You have {activeIncidents.length} active security incident(s) requiring attention.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {incidents.map((incident) => (
              <div key={incident.id} className={`p-4 border rounded-lg ${getSeverityColor(incident.severity)}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(incident.status)}
                    <div>
                      <h4 className="font-medium capitalize">
                        {incident.type.replace('_', ' ')} - {incident.severity.toUpperCase()}
                      </h4>
                      <p className="text-sm">Reported: {incident.reportedDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {incident.affectedPHI && (
                      <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">
                        PHI AFFECTED
                      </span>
                    )}
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded capitalize">
                      {incident.status}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm mb-3">{incident.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-3 text-xs">
                  <div>
                    <span className="font-medium">Reported By:</span> {incident.reportedBy}
                  </div>
                  <div>
                    <span className="font-medium">Assigned To:</span> {incident.assignedTo}
                  </div>
                </div>
                
                {incident.status !== 'resolved' && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Update Status
                    </Button>
                    <Button size="sm" variant="outline">
                      Add Notes
                    </Button>
                    {incident.affectedPHI && (
                      <Button size="sm" variant="outline">
                        Breach Assessment
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex gap-2">
            <Button variant="outline">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Report New Incident
            </Button>
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Incident Response Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HIPAAIncidentResponsePanel;
