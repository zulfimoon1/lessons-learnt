
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, FileText, Download, Eye, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface DataSubjectRequest {
  id: string;
  type: string;
  status: string;
  requestedAt: string;
  completedAt?: string;
  requesterEmail?: string;
  school?: string;
}

interface PrivacyMetrics {
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  exportRequests: number;
  deletionRequests: number;
}

const GDPRAdminDashboard: React.FC = () => {
  const [requests, setRequests] = useState<DataSubjectRequest[]>([]);
  const [metrics, setMetrics] = useState<PrivacyMetrics>({
    totalRequests: 0,
    pendingRequests: 0,
    completedRequests: 0,
    exportRequests: 0,
    deletionRequests: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGDPRData();
  }, []);

  const loadGDPRData = () => {
    try {
      // Load mock data from localStorage for demo
      const savedRequests = JSON.parse(localStorage.getItem('admin-gdpr-requests') || '[]');
      const savedExportLogs = JSON.parse(localStorage.getItem('data-export-logs') || '[]');
      
      // Convert export logs to request format
      const exportRequests = savedExportLogs.map((log: any) => ({
        id: crypto.randomUUID(),
        type: 'data_export',
        status: log.status || 'completed',
        requestedAt: log.timestamp,
        completedAt: log.status === 'completed' ? log.timestamp : undefined,
        requesterEmail: 'user@example.com',
        school: 'Demo School'
      }));

      const allRequests = [...savedRequests, ...exportRequests];
      setRequests(allRequests);

      // Calculate metrics
      const newMetrics = {
        totalRequests: allRequests.length,
        pendingRequests: allRequests.filter(r => r.status === 'pending').length,
        completedRequests: allRequests.filter(r => r.status === 'completed').length,
        exportRequests: allRequests.filter(r => r.type === 'data_export').length,
        deletionRequests: allRequests.filter(r => r.type === 'erasure').length,
      };
      setMetrics(newMetrics);
    } catch (error) {
      console.error('Error loading GDPR data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load GDPR data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'in_progress':
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRequestTypeLabel = (type: string) => {
    switch (type) {
      case 'data_export':
        return 'Data Export';
      case 'access':
        return 'Data Access';
      case 'rectification':
        return 'Data Rectification';
      case 'erasure':
        return 'Data Erasure';
      case 'portability':
        return 'Data Portability';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading GDPR data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-6 h-6 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">GDPR Administration</h2>
          <p className="text-gray-600">Manage privacy requests and compliance monitoring</p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-xl font-semibold">{metrics.totalRequests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-xl font-semibold">{metrics.pendingRequests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-xl font-semibold">{metrics.completedRequests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Download className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Data Exports</p>
                <p className="text-xl font-semibold">{metrics.exportRequests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Deletions</p>
                <p className="text-xl font-semibold">{metrics.deletionRequests}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="requests">Privacy Requests</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Data Subject Requests
              </CardTitle>
              <CardDescription>
                Monitor and manage all GDPR data subject requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {requests.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">No privacy requests found</p>
                  <p className="text-sm text-gray-500">
                    Data subject requests will appear here when users submit them
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Requester</TableHead>
                      <TableHead>School</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Download className="w-4 h-4 text-gray-500" />
                            {getRequestTypeLabel(request.type)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(request.status)}
                            <Badge className={getStatusColor(request.status)}>
                              {request.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{request.requesterEmail || 'Anonymous'}</TableCell>
                        <TableCell>{request.school || 'N/A'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="w-3 h-3" />
                            {new Date(request.requestedAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          {request.completedAt ? (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Calendar className="w-3 h-3" />
                              {new Date(request.completedAt).toLocaleDateString()}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Compliance Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Cookie Consent</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Privacy Policy</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Published</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Data Export</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Available</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Email Notifications</span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Pending</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {requests.slice(0, 5).map((request) => (
                    <div key={request.id} className="flex items-center gap-3 p-2 border rounded-lg">
                      {getStatusIcon(request.status)}
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {getRequestTypeLabel(request.type)} request
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(request.requestedAt).toLocaleString()}
                        </p>
                      </div>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </div>
                  ))}
                  
                  {requests.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No recent activity</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GDPRAdminDashboard;
