
import { supabase } from '@/integrations/supabase/client';
import { EmailLogger } from './emailLogger';
import { 
  generateDataExportConfirmationTemplate,
  generateDataExportReadyTemplate,
  generatePrivacyRequestTemplate,
  generateDefaultTemplate 
} from './emailTemplates';

export interface EmailNotificationRequest {
  type: 'data_export_confirmation' | 'privacy_request_received' | 'data_export_ready';
  userEmail: string;
  userName?: string;
  requestId?: string;
  exportFileName?: string;
}

class EmailNotificationService {
  private generateEmailTemplate(request: EmailNotificationRequest) {
    const { type, userName, requestId, exportFileName } = request;
    const templateData = { userName, requestId, exportFileName };
    
    switch (type) {
      case 'data_export_confirmation':
        return generateDataExportConfirmationTemplate(templateData);
      case 'data_export_ready':
        return generateDataExportReadyTemplate(templateData);
      case 'privacy_request_received':
        return generatePrivacyRequestTemplate(templateData);
      default:
        return generateDefaultTemplate();
    }
  }

  async sendNotification(request: EmailNotificationRequest): Promise<boolean> {
    try {
      console.log('📧 Preparing email notification:', {
        type: request.type,
        email: request.userEmail,
        requestId: request.requestId
      });

      // Call the Supabase Edge Function for real email sending
      const { data, error } = await supabase.functions.invoke('send-privacy-email', {
        body: request
      });

      if (error) {
        console.error('❌ Edge function error:', error);
        EmailLogger.showErrorToast();
        return false;
      }

      if (!data?.success) {
        console.error('❌ Email sending failed:', data);
        EmailLogger.showErrorToast();
        return false;
      }

      console.log('✅ Email sent successfully:', data);
      
      // Log the email locally
      EmailLogger.logEmail({
        type: request.type,
        recipient: request.userEmail,
        subject: this.generateEmailTemplate(request).subject,
      });

      // Show success notification
      EmailLogger.showSuccessToast(request.userEmail);

      return true;
    } catch (error) {
      console.error('❌ Failed to send email notification:', error);
      EmailLogger.showErrorToast();
      return false;
    }
  }

  // Helper methods that delegate to EmailLogger
  getEmailLogs() {
    return EmailLogger.getEmailLogs();
  }

  clearEmailLogs() {
    EmailLogger.clearEmailLogs();
  }
}

export const emailNotificationService = new EmailNotificationService();
