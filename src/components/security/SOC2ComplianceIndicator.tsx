
import React from 'react';
import { Shield, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const SOC2ComplianceIndicator: React.FC = () => {
  return (
    <Card className="border-green-200 bg-green-50">
      <CardContent className="pt-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-green-600" />
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-green-800">SOC 2 Compliant</p>
            <p className="text-sm text-green-600">
              Security controls actively monitored
            </p>
          </div>
          <Badge variant="outline" className="border-green-600 text-green-700">
            Operational
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default SOC2ComplianceIndicator;
