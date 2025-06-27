
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  messageId: string;
  senderName: string;
  senderEmail: string;
  senderSchool: string;
  subject: string;
  message: string;
  category: string;
  priority: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const {
      messageId,
      senderName,
      senderEmail,
      senderSchool,
      subject,
      message,
      category,
      priority
    }: NotificationRequest = await req.json();

    const priorityEmoji = {
      'critical': '🚨',
      'high': '⚠️',
      'medium': '📋',
      'low': '💬'
    };

    const categoryEmoji = {
      'technical': '🔧',
      'billing': '💳',
      'feature_request': '💡',
      'urgent': '🚨'
    };

    // Create email content
    const emailSubject = `${priorityEmoji[priority]} Support Request: ${subject}`;
    const emailBody = `
      <h2>New Platform Support Request</h2>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Request Details</h3>
        <p><strong>Priority:</strong> ${priorityEmoji[priority]} ${priority.toUpperCase()}</p>
        <p><strong>Category:</strong> ${categoryEmoji[category]} ${category.replace('_', ' ').toUpperCase()}</p>
        <p><strong>Subject:</strong> ${subject}</p>
      </div>

      <div style="background: #fff; padding: 20px; border-left: 4px solid #007bff; margin: 20px 0;">
        <h3>Message</h3>
        <p style="white-space: pre-wrap;">${message}</p>
      </div>

      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Sender Information</h3>
        <p><strong>Name:</strong> ${senderName}</p>
        <p><strong>Email:</strong> ${senderEmail}</p>
        <p><strong>School:</strong> ${senderSchool}</p>
      </div>

      <div style="margin: 30px 0; padding: 20px; background: #e8f4f8; border-radius: 8px;">
        <p><strong>Message ID:</strong> ${messageId}</p>
        <p><strong>Reply to:</strong> ${senderEmail}</p>
        <p style="color: #666; font-size: 14px;">
          You can respond directly to this email, and the response will be forwarded to the sender.
        </p>
      </div>
    `;

    // Log the notification (you can replace this with actual email sending)
    console.log("Platform Admin Notification:", {
      messageId,
      priority,
      category,
      subject,
      senderEmail,
      senderSchool
    });

    // In a real implementation, you would send an email here
    // For now, we'll just return success
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Notification logged successfully",
        messageId 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error sending platform admin notification:", error);
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
