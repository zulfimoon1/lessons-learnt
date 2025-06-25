
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, FileText, Shield, Clock, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface DataExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DataExportDialog: React.FC<DataExportDialogProps> = ({ open, onOpenChange }) => {
  const { t } = useLanguage();
  const [exportingData, setExportingData] = useState<string | null>(null);
  const [exportStatus, setExportStatus] = useState<'idle' | 'processing' | 'completed'>('idle');

  const generateDataExport = async (dataType: string) => {
    setExportingData(dataType);
    setExportStatus('processing');

    try {
      // Simulate data export generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      let exportData: any = {};
      const timestamp = new Date().toISOString();

      switch (dataType) {
        case 'personal':
          exportData = {
            export_type: 'personal_data',
            generated_at: timestamp,
            user_data: {
              // Mock data - in real implementation, this would come from the database
              profile: {
                name: 'User Name',
                email: 'user@example.com',
                created_at: '2024-01-01T00:00:00Z'
              },
              privacy_settings: JSON.parse(localStorage.getItem('privacy-settings') || '{}'),
              consent_history: JSON.parse(localStorage.getItem('consent-logs') || '[]')
            }
          };
          break;

        case 'feedback':
          exportData = {
            export_type: 'feedback_data',
            generated_at: timestamp,
            feedback_data: {
              // Mock feedback data
              total_submissions: 0,
              feedback_history: [],
              note: 'No feedback data found in localStorage'
            }
          };
          break;

        case 'complete':
          exportData = {
            export_type: 'complete_data_export',
            generated_at: timestamp,
            personal_data: {
              profile: {
                name: 'User Name',
                email: 'user@example.com',
                created_at: '2024-01-01T00:00:00Z'
              },
              privacy_settings: JSON.parse(localStorage.getItem('privacy-settings') || '{}'),
              consent_history: JSON.parse(localStorage.getItem('consent-logs') || '[]')
            },
            feedback_data: {
              total_submissions: 0,
              feedback_history: []
            },
            request_history: JSON.parse(localStorage.getItem('data-subject-requests') || '[]')
          };
          break;
      }

      // Create and download the file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${dataType}_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportStatus('completed');
      
      toast({
        title: t('common.success'),
        description: `${dataType} data export completed successfully`,
      });

      // Log the export request
      const exportLog = {
        type: 'data_export',
        data_type: dataType,
        timestamp: timestamp,
        status: 'completed'
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('data-export-logs') || '[]');
      existingLogs.push(exportLog);
      localStorage.setItem('data-export-logs', JSON.stringify(existingLogs));

    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus('idle');
      
      toast({
        title: t('common.error'),
        description: 'Failed to export data',
        variant: 'destructive',
      });
    } finally {
      setExportingData(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            {t('privacy.rightToPortability')}
          </DialogTitle>
          <DialogDescription>
            Export your personal data in a machine-readable format (GDPR Article 20)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Your data will be exported in JSON format and downloaded to your device. 
              No data is sent to external servers during this process.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 gap-4">
            {/* Personal Data Export */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Personal Data Export
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">
                  Includes: Profile information, privacy settings, consent history
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    ~1-2 minutes
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    JSON Format
                  </Badge>
                </div>
                <Button
                  onClick={() => generateDataExport('personal')}
                  disabled={exportingData === 'personal'}
                  className="w-full"
                >
                  {exportingData === 'personal' ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Export Personal Data
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Feedback Data Export */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Feedback Data Export
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">
                  Includes: All feedback submissions, ratings, and educational data
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    ~2-3 minutes
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    JSON Format
                  </Badge>
                </div>
                <Button
                  onClick={() => generateDataExport('feedback')}
                  disabled={exportingData === 'feedback'}
                  className="w-full"
                  variant="outline"
                >
                  {exportingData === 'feedback' ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Export Feedback Data
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Complete Export */}
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Download className="w-5 h-5 text-blue-600" />
                  Complete Data Export
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">
                  Includes: All your data in a single comprehensive export
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    ~3-5 minutes
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    JSON Format
                  </Badge>
                  <Badge className="text-xs bg-blue-100 text-blue-800">
                    Recommended
                  </Badge>
                </div>
                <Button
                  onClick={() => generateDataExport('complete')}
                  disabled={exportingData === 'complete'}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {exportingData === 'complete' ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Export All Data
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {exportStatus === 'completed' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Export completed successfully! Check your downloads folder for the exported file.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DataExportDialog;
