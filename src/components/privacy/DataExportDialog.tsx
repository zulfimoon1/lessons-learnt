
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Download, FileText, Shield, Clock, CheckCircle, AlertCircle, Mail } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { emailNotificationService } from '@/services/emailNotificationService';

interface DataExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ExportProgress {
  stage: string;
  progress: number;
  completed: boolean;
}

const DataExportDialog: React.FC<DataExportDialogProps> = ({ open, onOpenChange }) => {
  const { t } = useLanguage();
  const [exportingData, setExportingData] = useState<string | null>(null);
  const [exportStatus, setExportStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [exportProgress, setExportProgress] = useState<ExportProgress>({
    stage: '',
    progress: 0,
    completed: false
  });

  const updateProgress = (stage: string, progress: number) => {
    setExportProgress({ stage, progress, completed: progress >= 100 });
  };

  const generateDataExport = async (dataType: string) => {
    setExportingData(dataType);
    setExportStatus('processing');
    setExportProgress({ stage: 'Initializing...', progress: 0, completed: false });

    try {
      // Stage 1: Initialize export
      updateProgress('Preparing export...', 10);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Stage 2: Collect data
      updateProgress('Collecting data...', 30);
      await new Promise(resolve => setTimeout(resolve, 800));

      let exportData: any = {};
      const timestamp = new Date().toISOString();
      const exportId = crypto.randomUUID();

      // Stage 3: Process data based on type
      updateProgress('Processing data...', 60);
      await new Promise(resolve => setTimeout(resolve, 700));

      switch (dataType) {
        case 'personal':
          exportData = {
            export_metadata: {
              export_id: exportId,
              export_type: 'personal_data',
              generated_at: timestamp,
              format_version: '1.0',
              gdpr_article: 'Article 15 - Right of Access'
            },
            user_profile: {
              // Mock data - in real implementation, this would come from the database
              basic_info: {
                name: 'User Name',
                email: 'user@example.com',
                account_created: '2024-01-01T00:00:00Z',
                last_login: timestamp
              },
              preferences: JSON.parse(localStorage.getItem('privacy-settings') || '{}'),
              consent_history: JSON.parse(localStorage.getItem('consent-logs') || '[]')
            },
            data_processing: {
              purposes: ['Educational feedback', 'Platform improvement', 'Communication'],
              legal_basis: 'Consent (GDPR Article 6(1)(a))',
              retention_period: 'Until account deletion or withdrawal of consent'
            }
          };
          break;

        case 'feedback':
          exportData = {
            export_metadata: {
              export_id: exportId,
              export_type: 'feedback_data',
              generated_at: timestamp,
              format_version: '1.0',
              gdpr_article: 'Article 15 - Right of Access'
            },
            feedback_summary: {
              total_submissions: 0,
              date_range: {
                first_submission: null,
                last_submission: null
              }
            },
            feedback_entries: [],
            data_processing: {
              purpose: 'Educational improvement and teacher insights',
              legal_basis: 'Consent (GDPR Article 6(1)(a))',
              retention_period: 'Until account deletion or withdrawal of consent'
            },
            note: 'No feedback data found in current session'
          };
          break;

        case 'complete':
          exportData = {
            export_metadata: {
              export_id: exportId,
              export_type: 'complete_data_export',
              generated_at: timestamp,
              format_version: '1.0',
              gdpr_articles: ['Article 15 - Right of Access', 'Article 20 - Right to Data Portability']
            },
            personal_data: {
              basic_info: {
                name: 'User Name',
                email: 'user@example.com',
                account_created: '2024-01-01T00:00:00Z',
                last_login: timestamp
              },
              preferences: JSON.parse(localStorage.getItem('privacy-settings') || '{}'),
              consent_history: JSON.parse(localStorage.getItem('consent-logs') || '[]')
            },
            educational_data: {
              feedback_summary: {
                total_submissions: 0,
                feedback_entries: []
              }
            },
            privacy_requests: JSON.parse(localStorage.getItem('data-subject-requests') || '[]'),
            data_processing_info: {
              purposes: ['Educational feedback', 'Platform improvement', 'Communication'],
              legal_basis: 'Consent (GDPR Article 6(1)(a))',
              retention_period: 'Until account deletion or withdrawal of consent',
              third_party_sharing: 'None - data is not shared with third parties'
            }
          };
          break;
      }

      // Stage 4: Generate file
      updateProgress('Generating file...', 80);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Create and download the file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `lessonslearnt_${dataType}_export_${dateStr}.json`;
      link.download = fileName;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Stage 5: Complete
      updateProgress('Export completed!', 100);
      setExportStatus('completed');
      
      toast({
        title: t('common.success'),
        description: `${dataType} data export completed successfully`,
      });

      // Log the export request
      const exportLog = {
        export_id: exportId,
        type: 'data_export',
        data_type: dataType,
        timestamp: timestamp,
        status: 'completed',
        file_name: fileName
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('data-export-logs') || '[]');
      existingLogs.push(exportLog);
      localStorage.setItem('data-export-logs', JSON.stringify(existingLogs));

      // NEW: Send email notification
      updateProgress('Sending confirmation email...', 95);
      const emailSent = await emailNotificationService.sendNotification({
        type: 'data_export_ready',
        userEmail: 'user@example.com', // In real app, this would come from auth context
        userName: 'User Name',
        requestId: exportId,
        exportFileName: fileName
      });

      if (emailSent) {
        console.log('✅ Email notification sent successfully');
      }

    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus('error');
      updateProgress('Export failed', 0);
      
      toast({
        title: t('common.error'),
        description: 'Failed to export data',
        variant: 'destructive',
      });
    } finally {
      setTimeout(() => {
        setExportingData(null);
        if (exportStatus === 'completed') {
          setExportStatus('idle');
          setExportProgress({ stage: '', progress: 0, completed: false });
        }
      }, 3000);
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
              A confirmation email will be sent once the export is complete.
            </AlertDescription>
          </Alert>

          {/* Progress indicator */}
          {exportStatus === 'processing' && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{exportProgress.stage}</span>
                    <span className="text-sm text-gray-600">{exportProgress.progress}%</span>
                  </div>
                  <Progress value={exportProgress.progress} className="w-full" />
                  {exportProgress.progress > 90 && (
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <Mail className="w-4 h-4" />
                      <span>Sending confirmation email...</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Success message */}
          {exportStatus === 'completed' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Export completed successfully! Check your downloads folder for the exported file and your email for confirmation.
              </AlertDescription>
            </Alert>
          )}

          {/* Error message */}
          {exportStatus === 'error' && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Export failed. Please try again or contact support if the problem persists.
              </AlertDescription>
            </Alert>
          )}

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
                  Includes: Profile information, privacy settings, consent history, data processing details
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    ~30 seconds
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    JSON Format
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    GDPR Art. 15
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Mail className="w-3 h-3 mr-1" />
                    Email Confirmation
                  </Badge>
                </div>
                <Button
                  onClick={() => generateDataExport('personal')}
                  disabled={exportingData === 'personal' || exportStatus === 'processing'}
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

            {/* Educational Data Export */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Educational Data Export
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">
                  Includes: All feedback submissions, ratings, educational interactions, and learning data
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    ~45 seconds
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    JSON Format
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    GDPR Art. 15
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Mail className="w-3 h-3 mr-1" />
                    Email Confirmation
                  </Badge>
                </div>
                <Button
                  onClick={() => generateDataExport('feedback')}
                  disabled={exportingData === 'feedback' || exportStatus === 'processing'}
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
                      Export Educational Data
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
                  Includes: All your data in a single comprehensive export with full GDPR compliance metadata
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    ~60 seconds
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    JSON Format
                  </Badge>
                  <Badge className="text-xs bg-blue-100 text-blue-800">
                    Recommended
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    GDPR Art. 15 & 20
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Mail className="w-3 h-3 mr-1" />
                    Email Confirmation
                  </Badge>
                </div>
                <Button
                  onClick={() => generateDataExport('complete')}
                  disabled={exportingData === 'complete' || exportStatus === 'processing'}
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DataExportDialog;
