
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

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

    // Basic validation
    if (!email.includes('@') || password.length < 8) {
      console.log('❌ Basic validation failed');
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid credentials' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

    // Proper password verification using bcrypt
    console.log('🔍 Verifying password against stored hash...');
    let isValidPassword = false;
    
    try {
      if (adminData.password_hash) {
        // Check if it's a bcrypt hash (starts with $2a$, $2b$, $2x$, or $2y$)
        if (adminData.password_hash.startsWith('$2')) {
          isValidPassword = await bcrypt.compare(password, adminData.password_hash);
          console.log('✅ Using bcrypt verification');
        } else {
          // Legacy SHA-256 hash - create new bcrypt hash and update
          const encoder = new TextEncoder();
          const data = encoder.encode(password + 'platform_salt_2024');
          const hashBuffer = await crypto.subtle.digest('SHA-256', data);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const sha256Hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
          
          if (sha256Hash === adminData.password_hash) {
            // Password is correct, upgrade to bcrypt
            const newBcryptHash = await bcrypt.hash(password, 12);
            
            await supabaseClient
              .from('teachers')
              .update({ password_hash: newBcryptHash })
              .eq('id', adminData.id);
              
            isValidPassword = true;
            console.log('✅ Upgraded legacy hash to bcrypt');
          }
        }
      }
    } catch (hashError) {
      console.error('❌ Password verification error:', hashError);
      isValidPassword = false;
    }

    if (!isValidPassword) {
      console.log('❌ Invalid password for:', email);
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
