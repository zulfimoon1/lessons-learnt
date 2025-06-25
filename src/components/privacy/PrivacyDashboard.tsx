
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  Download, 
  Trash2, 
  Edit, 
  Eye, 
  Settings, 
  FileText, 
  Mail,
  Clock,
  CheckCircle,
  AlertTriangle 
} from 'lucide-react';
import DataExportDialog from './DataExportDialog';
import PrivacyRequestConfirmationDialog from './PrivacyRequestConfirmationDialog';

const PrivacyDashboard: React.FC = () => {
  const { t } = useLanguage();
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [currentRequestType, setCurrentRequestType] = useState<'data_export' | 'data_deletion' | 'data_correction'>('data_export');

  // Get privacy settings from localStorage
  const privacySettings = JSON.parse(localStorage.getItem('privacy-settings') || '{}');
  const consentLogs = JSON.parse(localStorage.getItem('consent-logs') || '[]');
  const dataRequests = JSON.parse(localStorage.getItem('data-subject-requests') || '[]');

  const handlePrivacyRequest = (type: 'data_export' | 'data_deletion' | 'data_correction') => {
    if (type === 'data_export') {
      setExportDialogOpen(true);
    } else {
      setCurrentRequestType(type);
      setConfirmDialogOpen(true);
    }
  };

  const handleRequestConfirmed = () => {
    // Request has been confirmed and logged
    console.log(`${currentRequestType} request confirmed`);
  };

  const getRequestStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />Processing</Badge>;
      case 'submitted':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="w-3 h-3 mr-1" />Submitted</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Shield className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Privacy Dashboard</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Manage your personal data, privacy settings, and exercise your rights under GDPR. 
          Your privacy is important to us.
        </p>
      </div>

      {/* Your Data Rights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Your Data Rights
          </CardTitle>
          <CardDescription>
            Under GDPR, you have the right to access, correct, or delete your personal data
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col items-center gap-2"
            onClick={() => handlePrivacyRequest('data_export')}
          >
            <Download className="w-6 h-6 text-blue-600" />
            <div className="text-center">
              <div className="font-semibold">Export Data</div>
              <div className="text-xs text-gray-500">Download your data</div>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col items-center gap-2"
            onClick={() => handlePrivacyRequest('data_correction')}
          >
            <Edit className="w-6 h-6 text-orange-600" />
            <div className="text-center">
              <div className="font-semibold">Correct Data</div>
              <div className="text-xs text-gray-500">Request corrections</div>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col items-center gap-2"
            onClick={() => handlePrivacyRequest('data_deletion')}
          >
            <Trash2 className="w-6 h-6 text-red-600" />
            <div className="text-center">
              <div className="font-semibold">Delete Data</div>
              <div className="text-xs text-gray-500">Request deletion</div>
            </div>
          </Button>
        </CardContent>
      </Card>

      {/* Recent Privacy Requests */}
      {dataRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Recent Privacy Requests
            </CardTitle>
            <CardDescription>
              Track the status of your privacy requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dataRequests.slice(-3).reverse().map((request: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium capitalize">{request.type.replace('_', ' ')}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(request.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  {getRequestStatusBadge(request.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Privacy Settings
          </CardTitle>
          <CardDescription>
            Your current privacy preferences and settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 border rounded-lg">
              <div className="font-medium mb-1">Cookies</div>
              <div className="text-sm text-gray-600">
                {privacySettings.analytics ? 'Analytics enabled' : 'Analytics disabled'}
              </div>
              <div className="text-sm text-gray-600">
                {privacySettings.marketing ? 'Marketing enabled' : 'Marketing disabled'}
              </div>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="font-medium mb-1">Data Processing</div>
              <div className="text-sm text-gray-600">
                Consent status: {consentLogs.length > 0 ? 'Given' : 'Pending'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* GDPR Information */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Your Privacy Rights:</strong> Under GDPR, you have the right to access, rectify, erase, restrict processing, 
          data portability, and object to processing of your personal data. 
          For questions, contact our Data Protection Officer.
        </AlertDescription>
      </Alert>

      {/* Dialogs */}
      <DataExportDialog 
        open={exportDialogOpen} 
        onOpenChange={setExportDialogOpen} 
      />
      
      <PrivacyRequestConfirmationDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        requestType={currentRequestType}
        onConfirm={handleRequestConfirmed}
      />
    </div>
  );
};

export default PrivacyDashboard;
