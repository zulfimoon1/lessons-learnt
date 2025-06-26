
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
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Create Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get the request body to extract teacher info
    const { email, school } = await req.json();
    
    if (!email) {
      console.error("No email provided in request body");
      throw new Error("Email is required");
    }

    console.log("Creating customer portal for teacher:", email, "School:", school);

    // Verify teacher exists in our database
    const { data: teacherData, error: teacherError } = await supabaseAdmin
      .from('teachers')
      .select('email, school')
      .eq('email', email)
      .single();

    if (teacherError || !teacherData) {
      console.error("Teacher not found:", teacherError);
      throw new Error("Teacher not found");
    }

    console.log("Teacher verified:", teacherData.email, "School:", teacherData.school);

    // Find Stripe customer by email
    const customers = await stripe.customers.list({
      email: email,
      limit: 1
    });

    if (customers.data.length === 0) {
      console.error("No Stripe customer found for email:", email);
      throw new Error("No Stripe customer found");
    }

    const customerId = customers.data[0].id;
    console.log("Found Stripe customer:", customerId);

    // Create customer portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${req.headers.get("origin")}/admin-dashboard?tab=settings`,
    });

    console.log("Customer portal session created:", session.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Customer portal error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
