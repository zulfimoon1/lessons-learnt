
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Download, Trash2, FileText, Calendar, Check, X, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PrivacySettings {
  analytics_enabled: boolean;
  marketing_enabled: boolean;
  data_sharing_enabled: boolean;
  anonymize_feedback: boolean;
  data_retention_preference: string;
}

interface DataSubjectRequest {
  id: string;
  request_type: string;
  status: string;
  requested_at: string;
  completed_at: string | null;
}

const PrivacyDashboard: React.FC = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<PrivacySettings | null>(null);
  const [requests, setRequests] = useState<DataSubjectRequest[]>([]);

  useEffect(() => {
    loadPrivacyData();
  }, []);

  const loadPrivacyData = async () => {
    try {
      // Load from localStorage for now (simplified implementation)
      const savedSettings = localStorage.getItem('privacy-settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      } else {
        // Create default settings
        const defaultSettings = {
          analytics_enabled: false,
          marketing_enabled: false,
          data_sharing_enabled: false,
          anonymize_feedback: true,
          data_retention_preference: 'standard'
        };
        
        localStorage.setItem('privacy-settings', JSON.stringify(defaultSettings));
        setSettings(defaultSettings);
      }

      // Load data subject requests from localStorage
      const savedRequests = localStorage.getItem('data-subject-requests');
      if (savedRequests) {
        setRequests(JSON.parse(savedRequests));
      }
    } catch (error) {
      console.error('Failed to load privacy data:', error);
      toast({
        title: t('common.error'),
        description: 'Failed to load privacy settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: keyof PrivacySettings, value: boolean | string) => {
    if (!settings) return;

    try {
      const updatedSettings = { ...settings, [key]: value };
      
      localStorage.setItem('privacy-settings', JSON.stringify(updatedSettings));
      setSettings(updatedSettings);
      
      toast({
        title: t('common.success'),
        description: 'Privacy settings updated',
      });
    } catch (error) {
      console.error('Failed to update setting:', error);
      toast({
        title: t('common.error'),
        description: 'Failed to update privacy settings',
        variant: 'destructive',
      });
    }
  };

  const submitDataRequest = async (requestType: string) => {
    try {
      const newRequest = {
        id: crypto.randomUUID(),
        request_type: requestType,
        status: 'pending',
        requested_at: new Date().toISOString(),
        completed_at: null
      };

      const existingRequests = JSON.parse(localStorage.getItem('data-subject-requests') || '[]');
      existingRequests.push(newRequest);
      localStorage.setItem('data-subject-requests', JSON.stringify(existingRequests));

      setRequests(existingRequests);

      toast({
        title: t('common.success'),
        description: `${requestType} request submitted successfully`,
      });
    } catch (error) {
      console.error('Failed to submit request:', error);
      toast({
        title: t('common.error'),
        description: 'Failed to submit request',
        variant: 'destructive',
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'rejected':
        return <X className="w-4 h-4 text-red-600" />;
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
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Failed to load privacy settings. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {t('privacy.privacyDashboard')}
          </CardTitle>
          <CardDescription>
            Manage your privacy preferences and data settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Analytics Setting */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="font-medium">{t('privacy.analytics')}</h4>
              <p className="text-sm text-gray-600">{t('privacy.analyticsDescription')}</p>
            </div>
            <Switch
              checked={settings.analytics_enabled}
              onCheckedChange={(checked) => updateSetting('analytics_enabled', checked)}
            />
          </div>

          {/* Marketing Setting */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="font-medium">{t('privacy.marketing')}</h4>
              <p className="text-sm text-gray-600">{t('privacy.marketingDescription')}</p>
            </div>
            <Switch
              checked={settings.marketing_enabled}
              onCheckedChange={(checked) => updateSetting('marketing_enabled', checked)}
            />
          </div>

          {/* Data Sharing Setting */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="font-medium">Data Sharing</h4>
              <p className="text-sm text-gray-600">Allow sharing anonymized data for research purposes</p>
            </div>
            <Switch
              checked={settings.data_sharing_enabled}
              onCheckedChange={(checked) => updateSetting('data_sharing_enabled', checked)}
            />
          </div>

          {/* Anonymize Feedback Setting */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="font-medium">Anonymize Feedback</h4>
              <p className="text-sm text-gray-600">Submit feedback anonymously by default</p>
            </div>
            <Switch
              checked={settings.anonymize_feedback}
              onCheckedChange={(checked) => updateSetting('anonymize_feedback', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Rights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {t('privacy.dataRights')}
          </CardTitle>
          <CardDescription>
            Exercise your GDPR rights regarding your personal data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => submitDataRequest('access')}
              className="flex items-center gap-2 h-auto p-4 justify-start"
            >
              <Download className="w-4 h-4" />
              <div className="text-left">
                <div className="font-medium">{t('privacy.rightToAccess')}</div>
                <div className="text-sm text-gray-600">Request a copy of your data</div>
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={() => submitDataRequest('rectification')}
              className="flex items-center gap-2 h-auto p-4 justify-start"
            >
              <FileText className="w-4 h-4" />
              <div className="text-left">
                <div className="font-medium">{t('privacy.rightToRectification')}</div>
                <div className="text-sm text-gray-600">Request data corrections</div>
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={() => submitDataRequest('erasure')}
              className="flex items-center gap-2 h-auto p-4 justify-start"
            >
              <Trash2 className="w-4 h-4" />
              <div className="text-left">
                <div className="font-medium">{t('privacy.rightToErasure')}</div>
                <div className="text-sm text-gray-600">Request data deletion</div>
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={() => submitDataRequest('portability')}
              className="flex items-center gap-2 h-auto p-4 justify-start"
            >
              <Download className="w-4 h-4" />
              <div className="text-left">
                <div className="font-medium">{t('privacy.rightToPortability')}</div>
                <div className="text-sm text-gray-600">Export your data</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Request History */}
      {requests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Request History
            </CardTitle>
            <CardDescription>
              Track the status of your data requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {requests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(request.status)}
                    <div>
                      <div className="font-medium capitalize">{request.request_type} Request</div>
                      <div className="text-sm text-gray-600">
                        Requested: {new Date(request.requested_at).toLocaleDateString()}
                        {request.completed_at && (
                          <> • Completed: {new Date(request.completed_at).toLocaleDateString()}</>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge className={getStatusColor(request.status)}>
                    {request.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PrivacyDashboard;
