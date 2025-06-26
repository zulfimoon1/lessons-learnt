
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-teacher-session",
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

    // Get the request body and validate required fields
    const { email, school, teacherId } = await req.json();
    
    if (!email || !school || !teacherId) {
      console.error("Missing required fields in request body");
      throw new Error("Email, school, and teacher ID are required");
    }

    // Get the teacher session token from headers for additional verification
    const teacherSessionHeader = req.headers.get("x-teacher-session");
    
    console.log("Creating customer portal for teacher:", email, "School:", school);

    // Verify teacher exists and matches the provided details
    const { data: teacherData, error: teacherError } = await supabaseAdmin
      .from('teachers')
      .select('id, email, school, role')
      .eq('email', email)
      .eq('school', school)
      .eq('id', teacherId)
      .single();

    if (teacherError || !teacherData) {
      console.error("Teacher verification failed:", teacherError);
      
      // Log security event for failed teacher verification
      await supabaseAdmin
        .from('audit_log')
        .insert({
          table_name: 'security_events',
          operation: 'unauthorized_portal_access_attempt',
          user_id: teacherId,
          new_data: {
            attempted_email: email,
            attempted_school: school,
            ip_address: req.headers.get('x-forwarded-for') || 'unknown',
            user_agent: req.headers.get('user-agent') || 'unknown',
            timestamp: new Date().toISOString(),
            severity: 'high'
          }
        });
      
      throw new Error("Teacher verification failed");
    }

    // Additional check: ensure teacher has admin role for subscription management
    if (teacherData.role !== 'admin') {
      console.error("Teacher does not have admin role:", teacherData.email);
      
      // Log unauthorized access attempt
      await supabaseAdmin
        .from('audit_log')
        .insert({
          table_name: 'security_events',
          operation: 'insufficient_permissions',
          user_id: teacherId,
          new_data: {
            teacher_role: teacherData.role,
            required_role: 'admin',
            action_attempted: 'customer_portal_access',
            timestamp: new Date().toISOString(),
            severity: 'medium'
          }
        });
      
      throw new Error("Insufficient permissions. Admin role required.");
    }

    console.log("Teacher verified with admin role:", teacherData.email, "School:", teacherData.school);

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

    // Log successful customer portal access
    await supabaseAdmin
      .from('audit_log')
      .insert({
        table_name: 'subscription_access',
        operation: 'customer_portal_accessed',
        user_id: teacherId,
        new_data: {
          teacher_email: email,
          school: school,
          stripe_customer_id: customerId,
          timestamp: new Date().toISOString(),
          ip_address: req.headers.get('x-forwarded-for') || 'unknown'
        }
      });

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
