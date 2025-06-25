
interface EmailTemplate {
  subject: string;
  htmlContent: string;
}

interface TemplateData {
  userName?: string;
  requestId?: string;
  exportFileName?: string;
}

export const generateDataExportConfirmationTemplate = (data: TemplateData): EmailTemplate => {
  const { userName = 'User', requestId } = data;
  
  return {
    subject: 'Data Export Request Confirmed - LessonsLearnt',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0891b2 0%, #f97316 100%); padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Data Export Request Confirmed</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e9ecef;">
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Dear ${userName},
          </p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            We have received your data export request and are processing it according to GDPR Article 15 (Right of Access) and Article 20 (Right to Data Portability).
          </p>
          
          <div style="background: #e3f2fd; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="color: #1976d2; font-weight: bold; margin: 0 0 10px 0;">Request Details:</p>
            <p style="color: #333; margin: 0;">Request ID: ${requestId || 'Processing'}</p>
            <p style="color: #333; margin: 5px 0 0 0;">Status: Confirmed and Processing</p>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Your data export will be available for download shortly. We will send you another email once it's ready.
          </p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            If you have any questions about this request, please don't hesitate to contact us.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
          
          <p style="color: #666; font-size: 14px; line-height: 1.4;">
            Best regards,<br>
            The LessonsLearnt Team<br>
            <em>Your privacy is our priority</em>
          </p>
        </div>
      </div>
    `
  };
};

export const generateDataExportReadyTemplate = (data: TemplateData): EmailTemplate => {
  const { userName = 'User', exportFileName } = data;
  
  return {
    subject: 'Your Data Export is Ready - LessonsLearnt',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #059669 0%, #0891b2 100%); padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Your Data Export is Ready</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e9ecef;">
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Dear ${userName},
          </p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Great news! Your data export has been completed and is ready for download.
          </p>
          
          <div style="background: #e8f5e8; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="color: #2e7d2e; font-weight: bold; margin: 0 0 10px 0;">Export Details:</p>
            <p style="color: #333; margin: 0;">File: ${exportFileName || 'data_export.json'}</p>
            <p style="color: #333; margin: 5px 0 0 0;">Format: JSON (machine-readable)</p>
            <p style="color: #333; margin: 5px 0 0 0;">Status: Ready for Download</p>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Please return to your privacy dashboard to download your data export. The file contains all your personal data in a structured format as required by GDPR.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${window.location.origin}/" style="background: #0891b2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Go to Privacy Dashboard
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; line-height: 1.4; margin-top: 30px;">
            <strong>Important:</strong> This export contains your personal data. Please store it securely and only share it if necessary.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
          
          <p style="color: #666; font-size: 14px; line-height: 1.4;">
            Best regards,<br>
            The LessonsLearnt Team<br>
            <em>Your privacy is our priority</em>
          </p>
        </div>
      </div>
    `
  };
};

export const generatePrivacyRequestTemplate = (data: TemplateData): EmailTemplate => {
  const { userName = 'User' } = data;
  
  return {
    subject: 'Privacy Request Received - LessonsLearnt',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #7c3aed 0%, #0891b2 100%); padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Privacy Request Received</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e9ecef;">
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Dear ${userName},
          </p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            We have received your privacy request and will process it within the timeframe required by GDPR (typically within 30 days).
          </p>
          
          <div style="background: #f3e8ff; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="color: #7c3aed; font-weight: bold; margin: 0 0 10px 0;">What happens next:</p>
            <ul style="color: #333; margin: 0; padding-left: 20px;">
              <li>We will verify your identity (if required)</li>
              <li>Process your request according to GDPR requirements</li>
              <li>Send you a confirmation email once completed</li>
            </ul>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            If you have any questions about this request or your privacy rights, please don't hesitate to contact us.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
          
          <p style="color: #666; font-size: 14px; line-height: 1.4;">
            Best regards,<br>
            The LessonsLearnt Team<br>
            <em>Your privacy is our priority</em>
          </p>
        </div>
      </div>
    `
  };
};

export const generateDefaultTemplate = (): EmailTemplate => {
  return {
    subject: 'LessonsLearnt Notification',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <p>Thank you for using LessonsLearnt. We'll be in touch soon.</p>
      </div>
    `
  };
};
