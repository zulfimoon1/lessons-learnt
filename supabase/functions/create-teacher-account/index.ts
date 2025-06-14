
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { name, email, school, password_hash, role, specialization, license_number } = await req.json()

    // Create Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check if teacher already exists
    const { data: existingTeachers } = await supabaseAdmin
      .from('teachers')
      .select('id')
      .eq('email', email.toLowerCase())

    if (existingTeachers && existingTeachers.length > 0) {
      return new Response(
        JSON.stringify({ error: 'A teacher with this email already exists.' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create new teacher
    const { data: newTeacher, error } = await supabaseAdmin
      .from('teachers')
      .insert({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        school: school.trim(),
        password_hash,
        role: role || 'teacher',
        specialization: specialization?.trim() || null,
        license_number: license_number?.trim() || null,
        is_available: true
      })
      .select()
      .single()

    if (error) {
      return new Response(
        JSON.stringify({ error: 'Failed to create teacher account' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({ teacher: newTeacher }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
