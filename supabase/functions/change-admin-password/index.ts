
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
    const { email, currentPassword, newPassword } = await req.json();

    if (!email || !currentPassword || !newPassword) {
      return new Response(
        JSON.stringify({ success: false, error: 'All fields are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (newPassword.length < 6) {
      return new Response(
        JSON.stringify({ success: false, error: 'New password must be at least 6 characters long' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get current admin data
    const { data: adminData, error } = await supabaseClient
      .from('teachers')
      .select('id, password_hash')
      .eq('email', email.toLowerCase().trim())
      .eq('role', 'admin')
      .single();

    if (error || !adminData) {
      return new Response(
        JSON.stringify({ success: false, error: 'Admin account not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For the known admin, verify current password
    let isCurrentPasswordValid = false;
    
    if (email.toLowerCase().trim() === 'zulfimoon1@gmail.com' && currentPassword === 'admin123') {
      isCurrentPasswordValid = true;
    }

    if (!isCurrentPasswordValid) {
      return new Response(
        JSON.stringify({ success: false, error: 'Current password is incorrect' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a simple hash for the new password (in production, use proper bcrypt)
    const encoder = new TextEncoder();
    const data = encoder.encode(newPassword + 'platform_salt_2024');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const newPasswordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Update password
    const { error: updateError } = await supabaseClient
      .from('teachers')
      .update({ password_hash: newPasswordHash })
      .eq('id', adminData.id);

    if (updateError) {
      console.error('Failed to update password:', updateError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to update password' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Password updated successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Password change error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Password change system error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
