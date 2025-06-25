
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { emailNotificationService } from '@/services/emailNotificationService';

interface PrivacyRequestConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestType: 'data_export' | 'data_deletion' | 'data_correction';
  onConfirm: () => void;
}

const PrivacyRequestConfirmationDialog: React.FC<PrivacyRequestConfirmationDialogProps> = ({
  open,
  onOpenChange,
  requestType,
  onConfirm
}) => {
  const { t } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const getRequestTypeLabel = () => {
    switch (requestType) {
      case 'data_export':
        return 'Data Export Request';
      case 'data_deletion':
        return 'Data Deletion Request';
      case 'data_correction':
        return 'Data Correction Request';
      default:
        return 'Privacy Request';
    }
  };

  const handleConfirmRequest = async () => {
    setIsProcessing(true);
    
    try {
      // Generate request ID
      const requestId = crypto.randomUUID();
      
      // Send confirmation email
      const emailSent = await emailNotificationService.sendNotification({
        type: 'data_export_confirmation',
        userEmail: 'user@example.com', // In real app, this would come from auth context
        userName: 'User Name',
        requestId: requestId
      });

      if (emailSent) {
        setEmailSent(true);
        
        // Log the privacy request
        const requestLog = {
          id: requestId,
          type: requestType,
          status: 'submitted',
          timestamp: new Date().toISOString(),
          user_email: 'user@example.com'
        };
        
        const existingRequests = JSON.parse(localStorage.getItem('data-subject-requests') || '[]');
        existingRequests.push(requestLog);
        localStorage.setItem('data-subject-requests', JSON.stringify(existingRequests));

        toast({
          title: 'Request Submitted',
          description: 'Your privacy request has been submitted successfully. Check your email for confirmation.',
        });

        // Call the onConfirm callback
        onConfirm();
      }
    } catch (error) {
      console.error('Failed to submit privacy request:', error);
      
      toast({
        title: 'Request Failed',
        description: 'Failed to submit your privacy request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
      
      // Close dialog after a short delay if email was sent
      if (emailSent) {
        setTimeout(() => {
          onOpenChange(false);
          setEmailSent(false);
        }, 2000);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Confirm {getRequestTypeLabel()}
          </DialogTitle>
          <DialogDescription>
            We'll send you an email confirmation once your request is processed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Success State */}
          {emailSent && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Request submitted successfully! Check your email for confirmation.
              </AlertDescription>
            </Alert>
          )}

          {/* Processing State */}
          {isProcessing && !emailSent && (
            <Alert className="border-blue-200 bg-blue-50">
              <Clock className="h-4 w-4 text-blue-600 animate-spin" />
              <AlertDescription className="text-blue-800">
                Submitting your request and sending confirmation email...
              </AlertDescription>
            </Alert>
          )}

          {/* Initial State */}
          {!isProcessing && !emailSent && (
            <>
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  By confirming this request, you agree that we will process your request according to GDPR requirements and send you email updates about the status.
                </AlertDescription>
              </Alert>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmRequest}
                  disabled={isProcessing}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isProcessing ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Confirm Request
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyRequestConfirmationDialog;
