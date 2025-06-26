
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-TRANSACTION-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Payment processing function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    // Use service role key for database operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { transaction_id, school_admin_email } = await req.json();
    
    if (!transaction_id || !school_admin_email) {
      throw new Error("Missing required parameters: transaction_id and school_admin_email");
    }

    logStep("Processing payment for transaction", { transaction_id, school_admin_email });

    // Get transaction details
    const { data: transaction, error: transactionError } = await supabaseClient
      .from('transactions')
      .select('*')
      .eq('id', transaction_id)
      .eq('status', 'approved')
      .single();

    if (transactionError || !transaction) {
      throw new Error(`Transaction not found or not approved: ${transactionError?.message}`);
    }

    logStep("Transaction found", { 
      id: transaction.id, 
      amount: transaction.amount, 
      school: transaction.school_name 
    });

    // Get school admin details to find customer
    const { data: admin, error: adminError } = await supabaseClient
      .from('teachers')
      .select('email, school')
      .eq('email', school_admin_email)
      .eq('role', 'admin')
      .single();

    if (adminError || !admin) {
      throw new Error(`School admin not found: ${adminError?.message}`);
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Find or create Stripe customer
    let customer;
    const existingCustomers = await stripe.customers.list({ 
      email: admin.email, 
      limit: 1 
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
      logStep("Found existing Stripe customer", { customerId: customer.id });
    } else {
      customer = await stripe.customers.create({
        email: admin.email,
        name: admin.school,
        metadata: {
          school_name: admin.school,
          admin_email: admin.email
        }
      });
      logStep("Created new Stripe customer", { customerId: customer.id });
    }

    // Create payment intent for the transaction
    const paymentIntent = await stripe.paymentIntents.create({
      amount: transaction.amount,
      currency: transaction.currency.toLowerCase(),
      customer: customer.id,
      description: `${transaction.description || 'School payment'} - ${transaction.school_name}`,
      metadata: {
        transaction_id: transaction.id,
        school_name: transaction.school_name,
        admin_email: school_admin_email,
        transaction_type: transaction.transaction_type
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    logStep("Created Stripe payment intent", { 
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount 
    });

    // Update transaction with Stripe payment intent ID
    const { error: updateError } = await supabaseClient
      .from('transactions')
      .update({
        stripe_payment_intent_id: paymentIntent.id,
        payment_status: 'requires_payment',
        updated_at: new Date().toISOString()
      })
      .eq('id', transaction_id);

    if (updateError) {
      logStep("ERROR updating transaction", { error: updateError });
      throw new Error(`Failed to update transaction: ${updateError.message}`);
    }

    // Create checkout session for easier payment
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_intent: paymentIntent.id,
      mode: 'payment',
      success_url: `${req.headers.get("origin") || "http://localhost:3000"}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin") || "http://localhost:3000"}/payment-cancelled`,
      metadata: {
        transaction_id: transaction.id,
        school_name: transaction.school_name
      }
    });

    // Update transaction with session ID
    await supabaseClient
      .from('transactions')
      .update({
        stripe_session_id: session.id
      })
      .eq('id', transaction_id);

    // Send notification to school admin with payment link
    await supabaseClient
      .from('in_app_notifications')
      .insert({
        recipient_email: school_admin_email,
        recipient_type: 'school_admin',
        title: 'Payment Required',
        message: `Your approved transaction for ${transaction.school_name} requires payment. Click the link to complete payment.`,
        notification_type: 'payment_required',
        related_id: transaction.id
      });

    logStep("Payment processing completed successfully", {
      paymentIntentId: paymentIntent.id,
      sessionId: session.id,
      checkoutUrl: session.url
    });

    return new Response(JSON.stringify({
      success: true,
      payment_intent_id: paymentIntent.id,
      session_id: session.id,
      checkout_url: session.url,
      amount: transaction.amount,
      currency: transaction.currency
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in process-transaction-payment", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
