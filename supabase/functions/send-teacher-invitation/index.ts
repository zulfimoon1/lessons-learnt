
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvitationEmailRequest {
  email: string;
  school: string;
  inviteToken: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, school, inviteToken }: InvitationEmailRequest = await req.json();

    console.log('Sending teacher invitation email to:', email);

    const inviteUrl = `${req.headers.get('origin') || 'https://your-app.com'}/accept-invitation?token=${inviteToken}`;

    const emailResponse = await resend.emails.send({
      from: "LessonsLearnt <noreply@lessonslearnt.eu>",
      to: [email],
      subject: `You're invited to join ${school}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #7c3aed;">Welcome to ${school}!</h1>
          
          <p>You've been invited to join <strong>${school}</strong> as a teacher on our education platform.</p>
          
          <p>To accept this invitation and create your account, please click the link below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteUrl}" 
               style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Accept Invitation
            </a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #6b7280;">${inviteUrl}</p>
          
          <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
            This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          
          <p style="font-size: 12px; color: #9ca3af;">
            Best regards,<br>
            The ${school} Team
          </p>
        </div>
      `,
    });

    console.log("Teacher invitation email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending teacher invitation email:", error);
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
