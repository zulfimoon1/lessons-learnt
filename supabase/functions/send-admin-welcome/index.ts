
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AdminWelcomeEmailRequest {
  email: string;
  name: string;
  tempPassword: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, tempPassword }: AdminWelcomeEmailRequest = await req.json();

    console.log('Sending admin welcome email to:', email);

    const loginUrl = `${req.headers.get('origin') || 'https://your-app.com'}/platform-admin-login`;

    const emailResponse = await resend.emails.send({
      from: "Platform Admin <onboarding@resend.dev>",
      to: [email],
      subject: `Welcome to Platform Administration - ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #059669;">Welcome to Platform Administration!</h1>
          
          <p>Hello <strong>${name}</strong>,</p>
          
          <p>You've been granted platform administrator access to the education platform. You now have full administrative privileges.</p>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Your Login Credentials:</h3>
            <p style="margin: 8px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 8px 0;"><strong>Password:</strong> <code style="background-color: #e5e7eb; padding: 2px 4px; border-radius: 4px;">${tempPassword}</code></p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" 
               style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Login to Platform Admin
            </a>
          </div>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #92400e;">🔒 Security Notice:</h4>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Please change your password immediately after first login</li>
              <li>You have full access to create/manage schools and users</li>
              <li>You can access all financial and sensitive data</li>
              <li>Use your privileges responsibly</li>
            </ul>
          </div>
          
          <p>If you have any questions or need assistance, please contact the primary administrator.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          
          <p style="font-size: 12px; color: #9ca3af;">
            Best regards,<br>
            Platform Administration Team
          </p>
        </div>
      `,
    });

    console.log("Admin welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending admin welcome email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
