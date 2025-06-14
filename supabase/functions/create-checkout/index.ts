
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

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const body = await req.json();
    const { 
      teacherCount = 1, 
      tierType = 'teacher',
      isAnnual = false,
      discountCode = null, 
      discountPercent = 0, 
      teacherEmail, 
      teacherName, 
      schoolName,
      amount,
      trialDays = 30
    } = body;
    
    console.log("Request body:", { teacherCount, tierType, isAnnual, discountCode, discountPercent, teacherEmail, schoolName, amount });

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

      if (discountData.expires_at && new Date(discountData.expires_at) < new Date()) {
        throw new Error("Discount code has expired");
      }

      if (discountData.max_uses && discountData.current_uses >= discountData.max_uses) {
        throw new Error("Discount code usage limit reached");
      }

      validatedDiscountPercent = discountData.discount_percent;
      discountCodeId = discountData.id;
      console.log("Discount code validated:", { code: discountCode, percent: validatedDiscountPercent });
    }

    console.log("Teacher authenticated:", teacherEmail);

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
      const customer = await stripe.customers.create({
        email: teacherEmail,
        name: teacherName || teacherEmail.split('@')[0],
        metadata: {
          school: schoolName,
          teacherCount: teacherCount.toString(),
          tierType: tierType
        }
      });
      customerId = customer.id;
      console.log("New customer created:", customerId);
    }

    // Create line items
    const planName = tierType === 'admin' ? 'School Admin Bundle' : 'Teacher Plan';
    const billingInterval = isAnnual ? 'year' : 'month';
    
    const lineItems = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `LessonLens ${planName}`,
            description: `${isAnnual ? 'Annual' : 'Monthly'} subscription for ${teacherCount} teacher${teacherCount > 1 ? 's' : ''} - ${schoolName}`,
          },
          unit_amount: amount || (tierType === 'admin' ? 1499 : 999),
          recurring: {
            interval: billingInterval,
          },
        },
        quantity: teacherCount,
      },
    ];

    const sessionData: any = {
      customer: customerId,
      line_items: lineItems,
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/teacher-dashboard?success=true`,
      cancel_url: `${req.headers.get("origin")}/pricing?canceled=true`,
      subscription_data: {
        trial_period_days: trialDays,
      },
      metadata: {
        teacherCount: teacherCount.toString(),
        tierType: tierType,
        isAnnual: isAnnual.toString(),
        originalAmount: amount?.toString() || '0',
        discountCode: discountCode || '',
        discountPercent: validatedDiscountPercent.toString(),
        schoolName: schoolName,
        adminEmail: teacherEmail,
        adminName: teacherName || teacherEmail.split('@')[0],
        discountCodeId: discountCodeId || '',
        trialDays: trialDays.toString()
      },
    };

    if (discountCode && validatedDiscountPercent > 0) {
      sessionData.metadata.discountApplied = 'true';
    }

    const session = await stripe.checkout.sessions.create(sessionData);
    console.log("Checkout session created:", session.id);

    // Increment discount code usage if one was used
    if (discountCodeId) {
      // Get current usage first
      const { data: currentCode, error: fetchError } = await supabaseAdmin
        .from('discount_codes')
        .select('current_uses')
        .eq('id', discountCodeId)
        .single();

      if (fetchError) {
        console.error("Error fetching current usage:", fetchError);
      } else {
        // Update with incremented usage
        const { error: incrementError } = await supabaseAdmin
          .from('discount_codes')
          .update({
            current_uses: (currentCode.current_uses || 0) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', discountCodeId);

        if (incrementError) {
          console.error("Error incrementing discount code usage:", incrementError);
        } else {
          console.log("Discount code usage incremented");
        }
      }
    }

    // Store subscription intent
    const subscriptionData = {
      school_name: schoolName,
      stripe_customer_id: customerId,
      amount: amount || (tierType === 'admin' ? 1499 : 999),
      plan_type: `${tierType}_${isAnnual ? 'annual' : 'monthly'}`,
      status: 'trialing',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + (trialDays * 24 * 60 * 60 * 1000)).toISOString(),
    };

    console.log("Inserting subscription data:", subscriptionData);

    const { error: insertError } = await supabaseAdmin
      .from('subscriptions')
      .insert(subscriptionData);

    if (insertError) {
      console.error("Error storing subscription:", insertError);
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
