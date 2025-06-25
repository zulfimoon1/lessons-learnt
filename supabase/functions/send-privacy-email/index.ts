
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PrivacyEmailRequest {
  type: 'data_export_confirmation' | 'privacy_request_received' | 'data_export_ready';
  userEmail: string;
  userName?: string;
  requestId?: string;
  exportFileName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const emailRequest: PrivacyEmailRequest = await req.json();
    console.log('📧 Processing privacy email request:', emailRequest);

    const template = generateEmailTemplate(emailRequest);
    
    const emailResponse = await resend.emails.send({
      from: "LessonsLearnt Privacy <privacy@resend.dev>",
      to: [emailRequest.userEmail],
      subject: template.subject,
      html: template.htmlContent,
    });

    console.log("✅ Privacy email sent successfully:", emailResponse);

    return new Response(JSON.stringify({
      success: true,
      emailId: emailResponse.data?.id,
      recipient: emailRequest.userEmail
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("❌ Error sending privacy email:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

function generateEmailTemplate(request: PrivacyEmailRequest) {
  const { type, userName = 'User', requestId, exportFileName } = request;
  
  switch (type) {
    case 'data_export_confirmation':
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

    case 'data_export_ready':
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
                <a href="https://bjpgloftnlnzndgliqty.supabase.co/" style="background: #0891b2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                  Go to Privacy Dashboard
                </a>
              </div>
              
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

    case 'privacy_request_received':
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

    default:
      return {
        subject: 'LessonsLearnt Notification',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <p>Thank you for using LessonsLearnt. We'll be in touch soon.</p>
          </div>
        `
      };
  }
}

serve(handler);
