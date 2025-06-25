
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";

const SecurityStatusPanel: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-500" />
          Security Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Rate Limiting</span>
              <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>CSRF Protection</span>
              <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Input Validation</span>
              <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Session Security</span>
              <Badge variant="default" className="bg-green-100 text-green-800">Enhanced</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Password Security</span>
              <Badge variant="default" className="bg-green-100 text-green-800">Strong</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Database Security</span>
              <Badge variant="default" className="bg-green-100 text-green-800">RLS Enabled</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityStatusPanel;
