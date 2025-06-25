
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

      const template = this.generateEmailTemplate(request);
      
      // For now, we'll simulate sending the email
      // In a real implementation, this would call a Supabase Edge Function with Resend
      console.log('📧 Email would be sent:', {
        to: request.userEmail,
        subject: template.subject,
        html: template.htmlContent.substring(0, 100) + '...'
      });

      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Log the email
      EmailLogger.logEmail({
        type: request.type,
        recipient: request.userEmail,
        subject: template.subject,
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
