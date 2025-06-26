import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  
  if (!signature || !endpointSecret) {
    logStep("Missing signature or webhook secret");
    return new Response('Missing signature or webhook secret', { status: 400 });
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    
    logStep("Webhook event received", { type: event.type, id: event.id });

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logStep("Payment intent succeeded", { 
          id: paymentIntent.id,
          amount: paymentIntent.amount,
          metadata: paymentIntent.metadata 
        });

        // Check if this is a transaction payment
        const transactionId = paymentIntent.metadata.transaction_id;
        if (transactionId) {
          try {
            // Update transaction status to completed and paid
            const { error: updateError } = await supabase
              .from('transactions')
              .update({
                status: 'completed',
                payment_status: 'paid',
                payment_processed_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq('stripe_payment_intent_id', paymentIntent.id)
              .eq('id', transactionId);

            if (updateError) {
              logStep("ERROR updating transaction payment status", { error: updateError });
            } else {
              logStep("Transaction payment status updated to paid", { transactionId });

              // Send notification to platform admin about completed payment
              await supabase
                .from('in_app_notifications')
                .insert({
                  recipient_email: 'zulfimoon1@gmail.com',
                  recipient_type: 'platform_admin',
                  title: 'Transaction Payment Completed',
                  message: `Payment completed for transaction #${transactionId} from ${paymentIntent.metadata.school_name || 'Unknown School'}`,
                  notification_type: 'payment_completed',
                  related_id: transactionId
                });

              // Send notification to school admin about payment completion
              if (paymentIntent.metadata.admin_email) {
                await supabase
                  .from('in_app_notifications')
                  .insert({
                    recipient_email: paymentIntent.metadata.admin_email,
                    recipient_type: 'school_admin',
                    title: 'Payment Completed',
                    message: `Your payment for ${paymentIntent.metadata.school_name || 'your school'} has been completed successfully.`,
                    notification_type: 'payment_success',
                    related_id: transactionId
                  });
              }
            }
          } catch (error) {
            logStep("ERROR processing transaction payment completion", { error, transactionId });
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logStep("Payment intent failed", { 
          id: paymentIntent.id,
          last_payment_error: paymentIntent.last_payment_error 
        });

        // Check if this is a transaction payment
        const transactionId = paymentIntent.metadata.transaction_id;
        if (transactionId) {
          try {
            // Update transaction payment status to failed
            const { error: updateError } = await supabase
              .from('transactions')
              .update({
                payment_status: 'failed',
                updated_at: new Date().toISOString()
              })
              .eq('stripe_payment_intent_id', paymentIntent.id)
              .eq('id', transactionId);

            if (updateError) {
              logStep("ERROR updating transaction payment failure", { error: updateError });
            } else {
              logStep("Transaction payment status updated to failed", { transactionId });

              // Send notification to school admin about payment failure
              if (paymentIntent.metadata.admin_email) {
                await supabase
                  .from('in_app_notifications')
                  .insert({
                    recipient_email: paymentIntent.metadata.admin_email,
                    recipient_type: 'school_admin',
                    title: 'Payment Failed',
                    message: `Payment for ${paymentIntent.metadata.school_name || 'your school'} has failed. Please try again or contact support.`,
                    notification_type: 'payment_failed',
                    related_id: transactionId
                  });
              }
            }
          } catch (error) {
            logStep("ERROR processing transaction payment failure", { error, transactionId });
          }
        }
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Checkout session completed", { 
          id: session.id,
          payment_intent: session.payment_intent,
          metadata: session.metadata 
        });

        // Update transaction with session completion if needed
        const transactionId = session.metadata?.transaction_id;
        if (transactionId) {
          await supabase
            .from('transactions')
            .update({
              updated_at: new Date().toISOString()
            })
            .eq('stripe_session_id', session.id)
            .eq('id', transactionId);
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        logStep("Subscription event handled", { type: event.type });
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    logStep("Webhook error", { error: err.message });
    return new Response(`Webhook error: ${err.message}`, { status: 400 });
  }
});
