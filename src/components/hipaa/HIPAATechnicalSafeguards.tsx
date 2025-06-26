
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Lock, Key, Monitor, CheckCircle, XCircle } from 'lucide-react';

interface TechnicalSafeguard {
  id: string;
  category: 'access_control' | 'audit_controls' | 'integrity' | 'transmission_security';
  name: string;
  status: 'compliant' | 'non_compliant' | 'partial';
  description: string;
  lastAssessment: string;
  requiredActions: string[];
}

const HIPAATechnicalSafeguards: React.FC = () => {
  const [safeguards] = useState<TechnicalSafeguard[]>([
    {
      id: '1',
      category: 'access_control',
      name: 'User Access Management',
      status: 'compliant',
      description: 'Assign unique user identification, emergency access, automatic logoff, encryption and decryption',
      lastAssessment: '2024-06-20',
      requiredActions: []
    },
    {
      id: '2',
      category: 'audit_controls',
      name: 'Audit Controls',
      status: 'compliant',
      description: 'Hardware, software, and procedural mechanisms for recording PHI access',
      lastAssessment: '2024-06-20',
      requiredActions: []
    },
    {
      id: '3',
      category: 'integrity',
      name: 'Data Integrity',
      status: 'partial',
      description: 'PHI must not be improperly altered or destroyed',
      lastAssessment: '2024-06-15',
      requiredActions: ['Implement additional backup verification', 'Enhanced change logging']
    },
    {
      id: '4',
      category: 'transmission_security',
      name: 'Transmission Security',
      status: 'compliant',
      description: 'Guard against unauthorized access to PHI transmitted over networks',
      lastAssessment: '2024-06-20',
      requiredActions: []
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'non_compliant':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Shield className="w-4 h-4 text-orange-600" />;
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
      case 'access_control': return <Key className="w-4 h-4" />;
      case 'audit_controls': return <Monitor className="w-4 h-4" />;
      case 'integrity': return <Shield className="w-4 h-4" />;
      default: return <Lock className="w-4 h-4" />;
    }
  };

  const nonCompliantCount = safeguards.filter(s => s.status === 'non_compliant').length;
  const partialCount = safeguards.filter(s => s.status === 'partial').length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Technical Safeguards Management
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Monitor and manage HIPAA technical safeguards compliance
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 mb-6">
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
                <Shield className="w-4 h-4" />
                <h4 className="font-medium">Partial Compliance</h4>
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
          </div>

          {(nonCompliantCount > 0 || partialCount > 0) && (
            <Alert className="mb-6">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                {partialCount > 0 && `${partialCount} technical safeguard(s) require attention. `}
                {nonCompliantCount > 0 && `${nonCompliantCount} critical compliance issue(s) need immediate resolution.`}
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
                      <p className="text-sm text-gray-600 capitalize">
                        {safeguard.category.replace('_', ' ')} Safeguard
                      </p>
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
                
                <div className="mb-3 text-sm">
                  <span className="font-medium">Last Assessment:</span> {safeguard.lastAssessment}
                </div>
                
                {safeguard.requiredActions.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-orange-700 mb-1">Required Actions:</p>
                    <ul className="text-sm text-orange-600 list-disc list-inside">
                      {safeguard.requiredActions.map((action, index) => (
                        <li key={index}>{action}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Shield className="w-4 h-4 mr-2" />
                    Assess Compliance
                  </Button>
                  {safeguard.status !== 'compliant' && (
                    <Button size="sm" variant="outline">
                      Create Action Plan
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

export default HIPAATechnicalSafeguards;
