
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

const SOC2ComplianceControls: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Security Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span>Access Control</span>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <div className="flex items-center justify-between">
            <span>Authentication</span>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <div className="flex items-center justify-between">
            <span>Audit Logging</span>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <div className="flex items-center justify-between">
            <span>Data Encryption</span>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Availability Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span>System Monitoring</span>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <div className="flex items-center justify-between">
            <span>Backup Procedures</span>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <div className="flex items-center justify-between">
            <span>Incident Response</span>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <div className="flex items-center justify-between">
            <span>Change Management</span>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SOC2ComplianceControls;
