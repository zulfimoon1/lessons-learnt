
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple password hashing function using built-in Web Crypto API
async function hashPassword(password: string, salt: string = 'platform_salt_2024'): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

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
    const requestBody = await req.json();
    const { name, email, password, adminEmail, allowUpdate } = requestBody;

    console.log('🔐 Platform admin creation request:', { name, email, requestedBy: adminEmail, allowUpdate });

    // Verify the requesting admin is authorized
    if (adminEmail !== 'zulfimoon1@gmail.com') {
      console.log('❌ Unauthorized admin creation attempt from:', adminEmail);
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized: Only the primary admin can create new admin accounts' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!name || !email || !password) {
      return new Response(
        JSON.stringify({ success: false, error: 'Name, email, and password are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Basic validation
    if (!email.includes('@') || password.length < 12) {
      console.log('❌ Basic validation failed');
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid email format or password too short' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
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

    // Set platform admin context
    console.log('🔧 Setting platform admin context...');
    const { error: contextError } = await supabaseClient.rpc('set_platform_admin_context', {
      admin_email: adminEmail
    });

    if (contextError) {
      console.error('❌ Failed to set context:', contextError);
    } else {
      console.log('✅ Platform admin context set successfully');
    }

    // Check if admin already exists
    console.log('🔍 Checking if admin already exists...');
    const { data: existingAdmin, error: checkError } = await supabaseClient
      .from('teachers')
      .select('id, email, name')
      .eq('email', email.toLowerCase().trim())
      .eq('role', 'admin')
      .single();

    if (existingAdmin && !allowUpdate) {
      console.log('❌ Admin already exists:', email);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'An admin account with this email already exists',
          existing_admin: {
            id: existingAdmin.id,
            email: existingAdmin.email,
            name: existingAdmin.name
          },
          suggestion: 'You can update the existing admin or use a different email address'
        }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Hash the password
    console.log('🔒 Hashing password...');
    const hashedPassword = await hashPassword(password);

    let result;
    if (existingAdmin && allowUpdate) {
      // Update existing admin
      console.log('🔄 Updating existing platform admin account...');
      const { data: updatedAdmin, error: updateError } = await supabaseClient
        .from('teachers')
        .update({
          name: name.trim(),
          password_hash: hashedPassword
        })
        .eq('id', existingAdmin.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Failed to update admin:', updateError);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to update admin account' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      result = updatedAdmin;
      console.log('🎉 Platform admin updated successfully:', email);
    } else {
      // Create new admin account
      console.log('👤 Creating new platform admin account...');
      const { data: newAdmin, error: createError } = await supabaseClient
        .from('teachers')
        .insert([{
          name: name.trim(),
          email: email.toLowerCase().trim(),
          school: 'Platform Administration',
          role: 'admin',
          password_hash: hashedPassword
        }])
        .select()
        .single();

      if (createError) {
        console.error('❌ Failed to create admin:', createError);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to create admin account' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      result = newAdmin;
      console.log('🎉 Platform admin created successfully:', email);
    }

    // Send welcome email with better error handling
    let emailSent = false;
    try {
      console.log('📧 Attempting to send welcome email...');
      const { data: emailData, error: emailError } = await supabaseClient.functions.invoke('send-admin-welcome', {
        body: {
          email: email.toLowerCase().trim(),
          name: name.trim(),
          tempPassword: password
        }
      });

      if (emailError) {
        console.log('📧 Email sending failed:', emailError);
      } else {
        console.log('📧 Welcome email sent successfully:', emailData);
        emailSent = true;
      }
    } catch (emailErr) {
      console.log('📧 Email function not available or failed:', emailErr);
    }

    return new Response(
      JSON.stringify({
        success: true,
        admin: {
          id: result.id,
          email: result.email,
          name: result.name,
          role: result.role,
          school: result.school
        },
        emailSent,
        message: existingAdmin && allowUpdate ? 'Platform admin account updated successfully' : 'Platform admin account created successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 Platform admin creation error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Admin creation system error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
