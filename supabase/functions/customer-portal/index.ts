
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
    console.log("Customer portal function started");
    console.log("Request method:", req.method);
    console.log("Request headers:", Object.fromEntries(req.headers.entries()));

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Create Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Parse request body with better error handling
    let requestBody;
    try {
      const bodyText = await req.text();
      console.log("Raw request body length:", bodyText?.length || 0);
      console.log("Raw request body content:", bodyText || "(empty)");
      
      if (!bodyText || bodyText.trim() === "") {
        console.log("Request body is empty, checking if this is a GET request or malformed POST");
        throw new Error("Request body is required. Please ensure you're sending a POST request with JSON data.");
      }
      
      requestBody = JSON.parse(bodyText);
      console.log("Parsed request body:", JSON.stringify(requestBody, null, 2));
    } catch (parseError) {
      console.error("JSON parsing error details:", parseError);
      console.error("Failed to parse body as JSON");
      throw new Error(`Invalid JSON in request body: ${parseError.message}`);
    }

    const { email, school, teacherId } = requestBody;
    
    if (!email || !school || !teacherId) {
      console.error("Missing required fields:", { 
        email: !!email, 
        school: !!school, 
        teacherId: !!teacherId,
        receivedFields: Object.keys(requestBody)
      });
      throw new Error("Email, school, and teacher ID are required");
    }

    console.log("Processing customer portal request for:", email, "School:", school, "Teacher ID:", teacherId);

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
      console.error("Teacher does not have admin role:", teacherData.email, "Role:", teacherData.role);
      
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

    console.log("Teacher verified successfully:", teacherData.email, "School:", teacherData.school);

    // Find Stripe customer by email
    const customers = await stripe.customers.list({
      email: email,
      limit: 1
    });

    if (customers.data.length === 0) {
      console.error("No Stripe customer found for email:", email);
      throw new Error("No Stripe customer found. Please contact support.");
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

    // Create customer portal session with proper return URL
    const origin = req.headers.get("origin") || "https://lessonslearnt.eu";
    const returnUrl = `${origin}/admin-dashboard?tab=settings`;
    
    console.log("Creating portal session with return URL:", returnUrl);

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    console.log("Customer portal session created successfully:", session.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Customer portal error:", error);
    console.error("Error stack:", error.stack);
    
    // Return a proper error response
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: "Please check the server logs for more information"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
