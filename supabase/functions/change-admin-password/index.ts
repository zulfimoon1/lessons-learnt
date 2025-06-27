
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const validatePasswordStrength = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  // Check for common weak patterns
  const weakPatterns = ['password', '123456', 'qwerty', 'admin', 'letmein'];
  if (weakPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
    errors.push('Password contains common weak patterns');
  }
  
  return { isValid: errors.length === 0, errors };
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

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Password does not meet security requirements',
          details: passwordValidation.errors
        }),
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

    // Verify current password
    let isCurrentPasswordValid = false;
    
    try {
      if (adminData.password_hash.startsWith('$2')) {
        // bcrypt hash
        isCurrentPasswordValid = await bcrypt.compare(currentPassword, adminData.password_hash);
      } else {
        // Legacy SHA-256 hash
        const encoder = new TextEncoder();
        const data = encoder.encode(currentPassword + 'platform_salt_2024');
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const sha256Hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        isCurrentPasswordValid = sha256Hash === adminData.password_hash;
      }
    } catch (verifyError) {
      console.error('Password verification error:', verifyError);
      isCurrentPasswordValid = false;
    }

    if (!isCurrentPasswordValid) {
      return new Response(
        JSON.stringify({ success: false, error: 'Current password is incorrect' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create secure bcrypt hash for new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    const { error: updateError } = await supabaseClient
      .from('teachers')
      .update({ 
        password_hash: newPasswordHash,
        updated_at: new Date().toISOString()
      })
      .eq('id', adminData.id);

    if (updateError) {
      console.error('Failed to update password:', updateError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to update password' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log the password change for security audit
    console.log(`Password changed successfully for admin: ${email}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Password updated successfully with enhanced security'
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
