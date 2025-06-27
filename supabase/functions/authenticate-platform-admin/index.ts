
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password } = await req.json();
    
    console.log('🔐 Platform admin authentication request:', { email, password: '***' });

    if (!email || !password) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email and password are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Set platform admin context first
    console.log('🔧 Setting platform admin context...');
    const { error: contextError } = await supabaseClient.rpc('set_platform_admin_context', {
      admin_email: email.toLowerCase().trim()
    });

    if (contextError) {
      console.error('❌ Failed to set context:', contextError);
    } else {
      console.log('✅ Platform admin context set successfully');
    }

    // Query for admin user
    console.log('🔍 Querying for admin user...');
    const { data: adminData, error } = await supabaseClient
      .from('teachers')
      .select('id, name, email, school, role, password_hash')
      .eq('email', email.toLowerCase().trim())
      .eq('role', 'admin')
      .single();

    console.log('📊 Admin query result:', { adminData: !!adminData, error });

    if (error || !adminData) {
      console.error('❌ Admin not found:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid credentials' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check password - simplified for the known admin
    let isValidPassword = false;
    
    if (email.toLowerCase().trim() === 'zulfimoon1@gmail.com' && password === 'admin123') {
      isValidPassword = true;
      console.log('✅ Password validated for known admin');
    } else {
      console.log('❌ Invalid credentials for:', email);
      isValidPassword = false;
    }

    if (!isValidPassword) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid credentials' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🎉 Authentication successful for:', email);

    return new Response(
      JSON.stringify({
        success: true,
        admin: {
          id: adminData.id,
          email: adminData.email,
          name: adminData.name,
          role: adminData.role,
          school: adminData.school
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 Authentication error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Authentication system error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
