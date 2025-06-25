
import { toast } from '@/hooks/use-toast';

export interface EmailLog {
  id: string;
  type: string;
  recipient: string;
  subject: string;
  sentAt: string;
  status: 'sent' | 'failed';
}

export class EmailLogger {
  private static readonly STORAGE_KEY = 'email-notification-logs';

  static logEmail(emailData: Omit<EmailLog, 'id' | 'sentAt' | 'status'>): EmailLog {
    const emailLog: EmailLog = {
      id: crypto.randomUUID(),
      type: emailData.type,
      recipient: emailData.recipient,
      subject: emailData.subject,
      sentAt: new Date().toISOString(),
      status: 'sent'
    };
    
    const existingLogs = this.getEmailLogs();
    existingLogs.push(emailLog);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingLogs));
    
    return emailLog;
  }

  static getEmailLogs(): EmailLog[] {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  static clearEmailLogs(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('📧 Email notification logs cleared');
  }

  static showSuccessToast(recipient: string): void {
    toast({
      title: 'Email Notification Sent',
      description: `Confirmation email sent to ${recipient}`,
    });
  }

  static showErrorToast(): void {
    toast({
      title: 'Email Notification Failed',
      description: 'Could not send confirmation email. Please try again.',
      variant: 'destructive',
    });
  }
}
