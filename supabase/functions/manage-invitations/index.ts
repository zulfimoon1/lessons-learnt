
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
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, adminEmail, ...data } = requestBody;
    
    console.log('🔧 Manage invitations request:', { action, adminEmail, data });

    // Verify platform admin permissions
    if (adminEmail !== 'zulfimoon1@gmail.com') {
      console.error('❌ Unauthorized access attempt:', adminEmail);
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Platform admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
          throw listError;
        }
        result = { invitations };
        break;

      case 'create':
        console.log('➕ Creating invitation:', data);
        const { data: newInvitation, error: createError } = await supabaseClient
          .from('invitations')
          .insert({
            email: data.email.trim().toLowerCase(),
            school: data.school,
            role: data.role || 'teacher',
            specialization: data.specialization || null,
          })
          .select()
          .single();

        if (createError) {
          console.error('❌ Create error:', createError);
          throw createError;
        }
        
        console.log('✅ Invitation created:', newInvitation);
        
        // Send invitation email
        try {
          const { error: emailError } = await supabaseClient.functions.invoke('send-teacher-invitation', {
            body: {
              email: data.email.trim().toLowerCase(),
              school: data.school,
              inviteToken: newInvitation.invite_token,
            },
          });

          if (emailError) {
            console.error('📧 Email sending failed:', emailError);
            result = { 
              invitation: newInvitation, 
              emailSent: false, 
              emailError: emailError.message 
            };
          } else {
            console.log('📧 Email sent successfully');
            result = { invitation: newInvitation, emailSent: true };
          }
        } catch (emailErr) {
          console.error('📧 Email function error:', emailErr);
          result = { 
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
          throw fetchError;
        }

        const { error: resendError } = await supabaseClient.functions.invoke('send-teacher-invitation', {
          body: {
            email: invitation.email,
            school: invitation.school,
            inviteToken: invitation.invite_token,
          },
        });

        if (resendError) {
          console.error('❌ Resend error:', resendError);
          throw resendError;
        }
        result = { success: true, message: 'Invitation resent successfully' };
        break;

      case 'delete':
        console.log('🗑️ Deleting invitation:', data.invitationId);
        const { error: deleteError } = await supabaseClient
          .from('invitations')
          .delete()
          .eq('id', data.invitationId);

        if (deleteError) {
          console.error('❌ Delete error:', deleteError);
          throw deleteError;
        }
        result = { success: true, message: 'Invitation deleted successfully' };
        break;

      default:
        console.error('❌ Invalid action:', action);
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    console.log('✅ Operation completed successfully:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Edge function error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        details: error.toString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
