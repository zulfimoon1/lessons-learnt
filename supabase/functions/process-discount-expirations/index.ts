
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== PROCESSING DISCOUNT EXPIRATIONS ===");
    
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Process expired discounts
    console.log("Processing expired discounts...");
    const { error: processError } = await supabaseAdmin.rpc('process_expired_discounts');
    
    if (processError) {
      console.error("Error processing expired discounts:", processError);
      throw processError;
    }

    // Schedule upcoming discount ending notifications
    console.log("Scheduling discount ending notifications...");
    const { error: scheduleError } = await supabaseAdmin.rpc('schedule_discount_notifications');
    
    if (scheduleError) {
      console.error("Error scheduling notifications:", scheduleError);
      throw scheduleError;
    }

    // Send pending notifications
    console.log("Sending pending notifications...");
    const { data: pendingNotifications, error: notificationError } = await supabaseAdmin
      .from('payment_notifications')
      .select('*')
      .is('sent_at', null)
      .lte('scheduled_for', new Date().toISOString());

    if (notificationError) {
      console.error("Error fetching pending notifications:", notificationError);
      throw notificationError;
    }

    console.log(`Found ${pendingNotifications?.length || 0} pending notifications`);

    for (const notification of pendingNotifications || []) {
      try {
        console.log(`Sending ${notification.notification_type} notification to ${notification.admin_email}`);
        
        // Here you would integrate with your email service
        // For now, we'll just log and mark as sent
        console.log(`Notification sent: ${notification.notification_type} for ${notification.school_name}`);
        
        // Mark notification as sent
        await supabaseAdmin
          .from('payment_notifications')
          .update({ sent_at: new Date().toISOString() })
          .eq('id', notification.id);

      } catch (error) {
        console.error(`Error sending notification ${notification.id}:`, error);
      }
    }

    console.log("=== DISCOUNT EXPIRATION PROCESSING COMPLETED ===");

    return new Response(JSON.stringify({ 
      success: true, 
      processed: pendingNotifications?.length || 0 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Discount expiration processing error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
