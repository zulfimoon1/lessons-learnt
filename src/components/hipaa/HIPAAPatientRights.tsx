
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Download, Edit, Eye } from 'lucide-react';

const HIPAAPatientRights: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Patient Rights Management
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Manage patient access, amendment, and portability requests
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4" />
              <h4 className="font-medium">Access Requests</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Students can request access to their PHI
            </p>
            <Button variant="outline" size="sm">
              Process Access Request
            </Button>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Download className="w-4 h-4" />
              <h4 className="font-medium">Data Portability</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Export student data in machine-readable format
            </p>
            <Button variant="outline" size="sm">
              Generate Export
            </Button>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Edit className="w-4 h-4" />
              <h4 className="font-medium">Amendment Requests</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Handle requests to amend PHI records
            </p>
            <Button variant="outline" size="sm">
              Review Amendments
            </Button>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4" />
              <h4 className="font-medium">Consent Management</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Track patient consent and authorizations
            </p>
            <Button variant="outline" size="sm">
              Manage Consent
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HIPAAPatientRights;
