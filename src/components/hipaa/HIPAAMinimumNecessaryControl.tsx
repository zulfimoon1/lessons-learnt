
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Users, CheckCircle, XCircle } from 'lucide-react';

interface AccessRequest {
  id: string;
  userId: string;
  userName: string;
  dataRequested: string;
  purpose: 'treatment' | 'payment' | 'operations' | 'disclosure';
  accessLevel: 'read' | 'write' | 'delete' | 'export';
  justification: string;
  status: 'pending' | 'approved' | 'denied';
  requestedAt: string;
}

const HIPAAMinimumNecessaryControl: React.FC = () => {
  const [accessRequests] = useState<AccessRequest[]>([
    {
      id: '1',
      userId: 'teacher_1',
      userName: 'Dr. Sarah Johnson',
      dataRequested: 'Student mental health assessment records',
      purpose: 'treatment',
      accessLevel: 'read',
      justification: 'Need to review for ongoing therapy session planning',
      status: 'approved',
      requestedAt: '2024-06-24'
    },
    {
      id: '2',
      userId: 'admin_1',
      userName: 'Mike Chen',
      dataRequested: 'All student records for data export',
      purpose: 'operations',
      accessLevel: 'export',
      justification: 'Annual compliance reporting requirement',
      status: 'pending',
      requestedAt: '2024-06-25'
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'denied':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Shield className="w-4 h-4 text-orange-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'border-green-200 bg-green-50';
      case 'denied': return 'border-red-200 bg-red-50';
      default: return 'border-orange-200 bg-orange-50';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Minimum Necessary Access Control
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Ensure PHI access follows the minimum necessary standard
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {accessRequests.map((request) => (
            <div key={request.id} className={`p-4 border rounded-lg ${getStatusColor(request.status)}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(request.status)}
                  <h4 className="font-medium">{request.userName}</h4>
                </div>
                <span className="text-sm text-muted-foreground">
                  {request.requestedAt}
                </span>
              </div>
              
              <div className="mb-2">
                <p className="text-sm font-medium">Data Requested:</p>
                <p className="text-sm text-gray-700">{request.dataRequested}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-2 text-sm">
                <div>
                  <span className="font-medium">Purpose:</span> {request.purpose}
                </div>
                <div>
                  <span className="font-medium">Access Level:</span> {request.accessLevel}
                </div>
              </div>
              
              <div className="mb-3">
                <p className="text-sm font-medium">Justification:</p>
                <p className="text-sm text-gray-700">{request.justification}</p>
              </div>
              
              {request.status === 'pending' && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button size="sm" variant="outline">
                    <XCircle className="w-4 h-4 mr-2" />
                    Deny
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <Alert className="mt-6">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            All PHI access requests are reviewed to ensure they meet the minimum necessary standard for the intended purpose.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default HIPAAMinimumNecessaryControl;
