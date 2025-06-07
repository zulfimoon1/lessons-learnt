
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
    console.log("=== CREATE CHECKOUT STARTED ===");
    
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
    const { teacherCount = 1, discountCode = null, discountPercent = 0, teacherEmail, teacherName, schoolName } = body;
    console.log("Request body:", { teacherCount, discountCode, discountPercent, teacherEmail, schoolName });

    // Validate required fields
    if (!teacherEmail || !schoolName) {
      throw new Error("Teacher email and school name are required");
    }

    // Validate discount code if provided
    let validatedDiscountPercent = 0;
    let discountCodeId = null;
    
    if (discountCode) {
      const { data: discountData, error: discountError } = await supabaseAdmin
        .from('discount_codes')
        .select('*')
        .eq('code', discountCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (discountError || !discountData) {
        throw new Error("Invalid discount code");
      }

      // Check if expired
      if (discountData.expires_at && new Date(discountData.expires_at) < new Date()) {
        throw new Error("Discount code has expired");
      }

      // Check if usage limit reached
      if (discountData.max_uses && discountData.current_uses >= discountData.max_uses) {
        throw new Error("Discount code usage limit reached");
      }

      validatedDiscountPercent = discountData.discount_percent;
      discountCodeId = discountData.id;
      console.log("Discount code validated:", { code: discountCode, percent: validatedDiscountPercent });
    }

    console.log("Teacher authenticated:", teacherEmail);

    const basePrice = 999; // $9.99 in cents
    const subtotal = teacherCount * basePrice;
    const discountAmount = Math.round(subtotal * (validatedDiscountPercent / 100));
    const finalAmount = subtotal - discountAmount;

    console.log("Pricing:", { basePrice, subtotal, discountAmount, finalAmount });

    // Check if customer exists
    const customers = await stripe.customers.list({
      email: teacherEmail,
      limit: 1
    });

    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log("Existing customer found:", customerId);
    } else {
      // Create new customer
      const customer = await stripe.customers.create({
        email: teacherEmail,
        name: teacherName || teacherEmail.split('@')[0],
        metadata: {
          school: schoolName,
          teacherCount: teacherCount.toString()
        }
      });
      customerId = customer.id;
      console.log("New customer created:", customerId);
    }

    // Create line items
    const lineItems = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "LessonLens School Subscription",
            description: `Monthly subscription for ${teacherCount} teacher${teacherCount > 1 ? 's' : ''} - ${schoolName}`,
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
      success_url: `${req.headers.get("origin")}/teacher-dashboard?success=true`,
      cancel_url: `${req.headers.get("origin")}/pricing?canceled=true`,
      metadata: {
        teacherCount: teacherCount.toString(),
        originalAmount: subtotal.toString(),
        discountCode: discountCode || '',
        discountPercent: validatedDiscountPercent.toString(),
        schoolName: schoolName,
        adminEmail: teacherEmail,
        adminName: teacherName || teacherEmail.split('@')[0],
        discountCodeId: discountCodeId || ''
      },
    };

    // Add discount information to metadata if applicable
    if (discountCode && validatedDiscountPercent > 0) {
      sessionData.metadata.discountApplied = 'true';
      sessionData.metadata.discountAmount = discountAmount.toString();
    }

    const session = await stripe.checkout.sessions.create(sessionData);
    console.log("Checkout session created:", session.id);

    // Increment discount code usage if one was used
    if (discountCodeId) {
      const { error: incrementError } = await supabaseAdmin
        .from('discount_codes')
        .update({
          current_uses: supabaseAdmin.sql`current_uses + 1`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', discountCodeId);

      if (incrementError) {
        console.error("Error incrementing discount code usage:", incrementError);
        // Don't fail the request, just log the error
      } else {
        console.log("Discount code usage incremented");
      }
    }

    // Store subscription intent in our database for tracking
    const subscriptionData = {
      school_name: schoolName,
      stripe_customer_id: customerId,
      amount: finalAmount,
      plan_type: 'monthly',
      status: 'pending',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    };

    console.log("Inserting subscription data:", subscriptionData);

    const { error: insertError } = await supabaseAdmin
      .from('subscriptions')
      .insert(subscriptionData);

    if (insertError) {
      console.error("Error storing subscription:", insertError);
      // Don't fail the request, just log the error
    } else {
      console.log("Subscription data stored successfully");
    }

    console.log("=== CREATE CHECKOUT COMPLETED ===");

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
