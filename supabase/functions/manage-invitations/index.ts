
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let requestBody;
    try {
      requestBody = await req.json();
    } catch (e) {
      console.error('Failed to parse request body:', e);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON in request body' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, adminEmail, ...data } = requestBody;
    
    console.log('🔧 Manage invitations request:', { action, adminEmail, data });

    // Verify admin permissions - allow both platform admin and school admins
    let isAuthorized = false;
    
    if (adminEmail === 'zulfimoon1@gmail.com') {
      // Platform admin - always allowed
      isAuthorized = true;
      console.log('✅ Platform admin access granted');
    } else {
      // Check if it's a school admin
      const { data: schoolAdmin, error: adminError } = await supabaseClient
        .from('teachers')
        .select('id, role, school')
        .eq('email', adminEmail)
        .eq('role', 'admin')
        .single();

      if (schoolAdmin && !adminError) {
        isAuthorized = true;
        console.log('✅ School admin access granted for:', schoolAdmin.school);
      }
    }

    if (!isAuthorized) {
      console.error('❌ Unauthorized access attempt:', adminEmail);
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized: Admin access required' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result;

    switch (action) {
      case 'list':
        console.log('📋 Listing invitations for school:', data.school);
        const { data: invitations, error: listError } = await supabaseClient
          .from('invitations')
          .select('*')
          .eq('school', data.school)
          .order('created_at', { ascending: false });

        if (listError) {
          console.error('❌ List error:', listError);
          return new Response(
            JSON.stringify({ success: false, error: `Failed to list invitations: ${listError.message}` }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        result = { success: true, invitations };
        break;

      case 'create':
        console.log('➕ Creating invitation:', data);
        
        // Check if invitation already exists
        const { data: existingInvite, error: checkError } = await supabaseClient
          .from('invitations')
          .select('id')
          .eq('email', data.email.trim().toLowerCase())
          .eq('school', data.school)
          .eq('status', 'pending')
          .single();

        if (existingInvite) {
          return new Response(
            JSON.stringify({ 
              success: false,
              error: 'An invitation for this email already exists for this school' 
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Generate a secure invite token with proper base64 encoding
        const tokenBytes = new Uint8Array(32);
        crypto.getRandomValues(tokenBytes);
        const base64Token = btoa(String.fromCharCode(...tokenBytes));

        const { data: newInvitation, error: createError } = await supabaseClient
          .from('invitations')
          .insert({
            email: data.email.trim().toLowerCase(),
            school: data.school,
            role: data.role || 'teacher',
            specialization: data.specialization || null,
            invite_token: base64Token,
          })
          .select()
          .single();

        if (createError) {
          console.error('❌ Create error:', createError);
          return new Response(
            JSON.stringify({ 
              success: false,
              error: `Failed to create invitation: ${createError.message}` 
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        console.log('✅ Invitation created:', newInvitation);
        
        // Send invitation email
        try {
          console.log('📧 Attempting to send invitation email...');
          const { data: emailData, error: emailError } = await supabaseClient.functions.invoke('send-teacher-invitation', {
            body: {
              email: data.email.trim().toLowerCase(),
              school: data.school,
              inviteToken: base64Token,
            },
          });

          if (emailError) {
            console.error('📧 Email sending failed:', emailError);
            result = { 
              success: true,
              invitation: newInvitation, 
              emailSent: false, 
              emailError: emailError.message 
            };
          } else {
            console.log('📧 Email sent successfully:', emailData);
            result = { success: true, invitation: newInvitation, emailSent: true };
          }
        } catch (emailErr) {
          console.error('📧 Email function error:', emailErr);
          result = { 
            success: true,
            invitation: newInvitation, 
            emailSent: false, 
            emailError: 'Email function failed' 
          };
        }
        break;

      case 'resend':
        console.log('📧 Resending invitation:', data.invitationId);
        const { data: invitation, error: fetchError } = await supabaseClient
          .from('invitations')
          .select('*')
          .eq('id', data.invitationId)
          .single();

        if (fetchError) {
          console.error('❌ Fetch error:', fetchError);
          return new Response(
            JSON.stringify({ success: false, error: `Failed to fetch invitation: ${fetchError.message}` }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        try {
          const { error: resendError } = await supabaseClient.functions.invoke('send-teacher-invitation', {
            body: {
              email: invitation.email,
              school: invitation.school,
              inviteToken: invitation.invite_token,
            },
          });

          if (resendError) {
            console.error('❌ Resend error:', resendError);
            result = { success: false, error: resendError.message };
          } else {
            result = { success: true, message: 'Invitation resent successfully' };
          }
        } catch (resendErr) {
          console.error('❌ Resend function error:', resendErr);
          result = { success: false, error: 'Failed to resend invitation' };
        }
        break;

      case 'delete':
        console.log('🗑️ Deleting invitation:', data.invitationId);
        const { error: deleteError } = await supabaseClient
          .from('invitations')
          .delete()
          .eq('id', data.invitationId);

        if (deleteError) {
          console.error('❌ Delete error:', deleteError);
          return new Response(
            JSON.stringify({ success: false, error: `Failed to delete invitation: ${deleteError.message}` }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        result = { success: true, message: 'Invitation deleted successfully' };
        break;

      default:
        console.error('❌ Invalid action:', action);
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid action' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    console.log('✅ Operation completed successfully:', result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Edge function error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'An unexpected error occurred',
        details: error.toString()
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
