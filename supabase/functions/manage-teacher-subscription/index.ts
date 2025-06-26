
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[MANAGE-TEACHER-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { action, teacherId, pauseStartDate, pauseEndDate, adminEmail } = await req.json();
    logStep("Request data", { action, teacherId, adminEmail });

    // Verify admin permissions
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('teachers')
      .select('id, email, role, school')
      .eq('email', adminEmail)
      .eq('role', 'admin')
      .single();

    if (adminError || !adminData) {
      throw new Error("Unauthorized: Admin verification failed");
    }

    // Get teacher data
    const { data: teacherData, error: teacherError } = await supabaseAdmin
      .from('teachers')
      .select('*')
      .eq('id', teacherId)
      .eq('school', adminData.school)
      .single();

    if (teacherError || !teacherData) {
      throw new Error("Teacher not found or not in same school");
    }

    logStep("Teacher data retrieved", { teacherName: teacherData.name, stripeSubId: teacherData.stripe_subscription_id });

    if (action === 'pause') {
      // Pause subscription
      if (teacherData.stripe_subscription_id) {
        const pauseData: any = {
          pause_collection: {
            behavior: 'void',
          },
        };

        // If end date is provided, set resume date
        if (pauseEndDate) {
          pauseData.pause_collection.resumes_at = Math.floor(new Date(pauseEndDate).getTime() / 1000);
        }

        const subscription = await stripe.subscriptions.update(
          teacherData.stripe_subscription_id,
          pauseData
        );

        logStep("Stripe subscription paused", { subscriptionId: subscription.id, status: subscription.status });

        // Update teacher record
        await supabaseAdmin
          .from('teachers')
          .update({
            is_available: false,
            pause_start_date: pauseStartDate,
            pause_end_date: pauseEndDate,
            subscription_status: 'paused'
          })
          .eq('id', teacherId);

        logStep("Teacher record updated - paused");
      } else {
        // No Stripe subscription, just update local record
        await supabaseAdmin
          .from('teachers')
          .update({
            is_available: false,
            pause_start_date: pauseStartDate,
            pause_end_date: pauseEndDate
          })
          .eq('id', teacherId);

        logStep("Teacher record updated - paused (no Stripe subscription)");
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: "Teacher subscription paused successfully",
        billingPaused: !!teacherData.stripe_subscription_id
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });

    } else if (action === 'resume') {
      // Resume subscription
      if (teacherData.stripe_subscription_id) {
        const subscription = await stripe.subscriptions.update(
          teacherData.stripe_subscription_id,
          {
            pause_collection: null,
          }
        );

        logStep("Stripe subscription resumed", { subscriptionId: subscription.id, status: subscription.status });

        // Update teacher record
        await supabaseAdmin
          .from('teachers')
          .update({
            is_available: true,
            pause_start_date: null,
            pause_end_date: null,
            subscription_status: 'active'
          })
          .eq('id', teacherId);

        logStep("Teacher record updated - resumed");
      } else {
        // No Stripe subscription, just update local record
        await supabaseAdmin
          .from('teachers')
          .update({
            is_available: true,
            pause_start_date: null,
            pause_end_date: null
          })
          .eq('id', teacherId);

        logStep("Teacher record updated - resumed (no Stripe subscription)");
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: "Teacher subscription resumed successfully",
        billingResumed: !!teacherData.stripe_subscription_id
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });

    } else {
      throw new Error("Invalid action. Use 'pause' or 'resume'");
    }

  } catch (error) {
    logStep("ERROR", { message: error.message });
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
