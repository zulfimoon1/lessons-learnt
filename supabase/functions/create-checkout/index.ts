
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

    // Create Supabase client with service role key for writing subscription data
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Parse request body for pricing details
    const body = await req.json();
    const { teacherCount = 1, discountCode = null, discountPercent = 0 } = body;

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) {
      throw new Error("User not authenticated");
    }

    // Get teacher info to identify school
    const { data: teacherData, error: teacherError } = await supabaseAdmin
      .from('teachers')
      .select('name, school, email')
      .eq('email', userData.user.email)
      .single();

    if (teacherError || !teacherData) {
      throw new Error("Teacher not found");
    }

    const basePrice = 999; // $9.99 in cents
    const subtotal = teacherCount * basePrice;
    const discountAmount = Math.round(subtotal * (discountPercent / 100));
    const finalAmount = subtotal - discountAmount;

    // Check if customer exists
    const customers = await stripe.customers.list({
      email: userData.user.email,
      limit: 1
    });

    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      // Create new customer
      const customer = await stripe.customers.create({
        email: userData.user.email,
        name: teacherData.name,
        metadata: {
          school: teacherData.school,
          teacherCount: teacherCount.toString()
        }
      });
      customerId = customer.id;
    }

    // Create line items
    const lineItems = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "LessonLens School Subscription",
            description: `Monthly subscription for ${teacherCount} teacher${teacherCount > 1 ? 's' : ''} - ${teacherData.school}`,
          },
          unit_amount: finalAmount,
          recurring: {
            interval: "month",
          },
        },
        quantity: 1,
      },
    ];

    const sessionData: any = {
      customer: customerId,
      line_items: lineItems,
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/admin-dashboard?success=true`,
      cancel_url: `${req.headers.get("origin")}/pricing?canceled=true`,
      metadata: {
        teacherCount: teacherCount.toString(),
        originalAmount: subtotal.toString(),
        discountCode: discountCode || '',
        discountPercent: discountPercent.toString(),
        schoolName: teacherData.school,
        adminEmail: userData.user.email,
        adminName: teacherData.name
      },
    };

    // Add discount information to metadata if applicable
    if (discountCode && discountPercent > 0) {
      sessionData.metadata.discountApplied = 'true';
      sessionData.metadata.discountAmount = discountAmount.toString();
    }

    const session = await stripe.checkout.sessions.create(sessionData);

    // Store subscription intent in our database for tracking
    const { error: insertError } = await supabaseAdmin
      .from('subscriptions')
      .insert({
        school_name: teacherData.school,
        stripe_customer_id: customerId,
        amount: finalAmount,
        plan_type: 'monthly',
        status: 'pending',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      });

    if (insertError) {
      console.error("Error storing subscription:", insertError);
      // Don't fail the request, just log the error
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
