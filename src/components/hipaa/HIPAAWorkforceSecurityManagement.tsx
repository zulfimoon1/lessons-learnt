
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Shield, Key, Clock, CheckCircle, XCircle } from 'lucide-react';

interface WorkforceMember {
  id: string;
  name: string;
  role: string;
  department: string;
  accessLevel: 'basic' | 'elevated' | 'admin';
  phiAccess: boolean;
  lastAccessReview: string;
  nextReviewDue: string;
  status: 'active' | 'suspended' | 'terminated';
  securityResponsibilities: string[];
}

const HIPAAWorkforceSecurityManagement: React.FC = () => {
  const [workforceMembers] = useState<WorkforceMember[]>([
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      role: 'School Psychologist',
      department: 'Mental Health Services',
      accessLevel: 'elevated',
      phiAccess: true,
      lastAccessReview: '2024-05-15',
      nextReviewDue: '2024-11-15',
      status: 'active',
      securityResponsibilities: ['PHI Access Control', 'Incident Response', 'Security Training']
    },
    {
      id: '2',
      name: 'Mike Chen',
      role: 'Teacher',
      department: 'Education',
      accessLevel: 'basic',
      phiAccess: false,
      lastAccessReview: '2024-04-20',
      nextReviewDue: '2024-10-20',
      status: 'active',
      securityResponsibilities: ['Data Protection Awareness']
    },
    {
      id: '3',
      name: 'Lisa Rodriguez',
      role: 'IT Administrator',
      department: 'Technology',
      accessLevel: 'admin',
      phiAccess: true,
      lastAccessReview: '2024-06-01',
      nextReviewDue: '2024-12-01',
      status: 'active',
      securityResponsibilities: ['System Security', 'Access Management', 'Audit Trail Monitoring']
    }
  ]);

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'elevated': return 'bg-orange-100 text-orange-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'suspended':
        return <Clock className="w-4 h-4 text-orange-600" />;
      default:
        return <XCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const membersNeedingReview = workforceMembers.filter(member => {
    const reviewDate = new Date(member.nextReviewDue);
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    return reviewDate <= thirtyDaysFromNow;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Workforce Security Management
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage security responsibilities and access controls for workforce members
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4" />
                <h4 className="font-medium">Total Workforce</h4>
              </div>
              <div className="text-2xl font-bold">{workforceMembers.length}</div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4" />
                <h4 className="font-medium">PHI Access Granted</h4>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {workforceMembers.filter(m => m.phiAccess).length}
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4" />
                <h4 className="font-medium">Reviews Due</h4>
              </div>
              <div className="text-2xl font-bold text-red-600">
                {membersNeedingReview.length}
              </div>
            </div>
          </div>

          {membersNeedingReview.length > 0 && (
            <Alert className="mb-6">
              <Clock className="h-4 w-4" />
              <AlertDescription>
                {membersNeedingReview.length} workforce member(s) have access reviews due within 30 days.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {workforceMembers.map((member) => (
              <div key={member.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(member.status)}
                    <div>
                      <h4 className="font-medium">{member.name}</h4>
                      <p className="text-sm text-gray-600">{member.role} - {member.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getAccessLevelColor(member.accessLevel)}>
                      {member.accessLevel.toUpperCase()}
                    </Badge>
                    {member.phiAccess && (
                      <Badge variant="outline" className="text-orange-600 border-orange-600">
                        PHI ACCESS
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                  <div>
                    <span className="font-medium">Last Review:</span> {member.lastAccessReview}
                  </div>
                  <div>
                    <span className="font-medium">Next Review:</span> {member.nextReviewDue}
                  </div>
                </div>
                
                <div className="mb-3">
                  <span className="text-sm font-medium">Security Responsibilities:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {member.securityResponsibilities.map((responsibility, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {responsibility}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Key className="w-4 h-4 mr-2" />
                    Review Access
                  </Button>
                  <Button size="sm" variant="outline">
                    Update Responsibilities
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HIPAAWorkforceSecurityManagement;
