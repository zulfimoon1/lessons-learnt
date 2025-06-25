
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, FileText, Calendar } from 'lucide-react';

const HIPAABAAManagement: React.FC = () => {
  const businessAssociates = [
    {
      name: 'Cloud Storage Provider',
      type: 'Technology Service',
      baaStatus: 'Active',
      signedDate: '2024-01-15',
      expirationDate: '2025-01-15',
      services: 'Data storage and backup'
    },
    {
      name: 'Analytics Platform',
      type: 'Data Analytics',
      baaStatus: 'Active', 
      signedDate: '2024-03-10',
      expirationDate: '2025-03-10',
      services: 'Student performance analytics'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Business Associate Agreement (BAA) Management
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Manage agreements with third-party vendors handling PHI
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {businessAssociates.map((ba, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{ba.name}</h4>
                <span className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded">
                  {ba.baaStatus}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{ba.services}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Signed: {ba.signedDate}</span>
                <span>Expires: {ba.expirationDate}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex gap-2">
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Add New BAA
          </Button>
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Review Expiring BAAs
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HIPAABAAManagement;
