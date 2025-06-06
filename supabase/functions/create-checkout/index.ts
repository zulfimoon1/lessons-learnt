
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

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

    // Parse request body for pricing details
    const body = await req.json();
    const { teacherCount = 1, discountCode = null, discountPercent = 0 } = body;

    const basePrice = 999; // $9.99 in cents
    const subtotal = teacherCount * basePrice;
    const discountAmount = Math.round(subtotal * (discountPercent / 100));
    const finalAmount = subtotal - discountAmount;

    // Create line items
    const lineItems = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "LessonLens School Subscription",
            description: `Monthly subscription for ${teacherCount} teacher${teacherCount > 1 ? 's' : ''} - school feedback system`,
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
      line_items: lineItems,
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/admin-dashboard?success=true`,
      cancel_url: `${req.headers.get("origin")}/pricing?canceled=true`,
      metadata: {
        teacherCount: teacherCount.toString(),
        originalAmount: subtotal.toString(),
        discountCode: discountCode || '',
        discountPercent: discountPercent.toString(),
      },
    };

    // Add discount information to metadata if applicable
    if (discountCode && discountPercent > 0) {
      sessionData.metadata.discountApplied = 'true';
      sessionData.metadata.discountAmount = discountAmount.toString();
    }

    const session = await stripe.checkout.sessions.create(sessionData);

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
