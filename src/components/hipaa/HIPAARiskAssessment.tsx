
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { FileCheck, AlertTriangle, CheckCircle } from 'lucide-react';

const HIPAARiskAssessment: React.FC = () => {
  const riskAreas = [
    {
      area: 'Physical Safeguards',
      status: 'compliant',
      lastAssessed: '2024-06-15',
      nextDue: '2024-12-15',
      findings: 'All physical access controls are properly implemented'
    },
    {
      area: 'Administrative Safeguards', 
      status: 'needs_attention',
      lastAssessed: '2024-06-10',
      nextDue: '2024-12-10',
      findings: 'Training records need updates for 3 workforce members'
    },
    {
      area: 'Technical Safeguards',
      status: 'compliant',
      lastAssessed: '2024-06-12',
      nextDue: '2024-12-12',
      findings: 'Access controls and audit logs functioning properly'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'needs_attention':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'border-green-200 bg-green-50';
      case 'needs_attention': return 'border-orange-200 bg-orange-50';
      default: return 'border-red-200 bg-red-50';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="w-5 h-5" />
            HIPAA Risk Assessment
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Ongoing evaluation of security risks to Protected Health Information (PHI)
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {riskAreas.map((area, index) => (
              <div key={index} className={`p-4 border rounded-lg ${getStatusColor(area.status)}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(area.status)}
                    <h4 className="font-medium">{area.area}</h4>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Last assessed: {area.lastAssessed}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{area.findings}</p>
                <p className="text-xs text-muted-foreground">
                  Next assessment due: {area.nextDue}
                </p>
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex gap-2">
            <Button variant="outline">
              <FileCheck className="w-4 h-4 mr-2" />
              Generate Risk Assessment Report
            </Button>
            <Button variant="outline">
              Schedule New Assessment
            </Button>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Administrative Safeguards require attention. Training updates needed for compliance.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default HIPAARiskAssessment;
