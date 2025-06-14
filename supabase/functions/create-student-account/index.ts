
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
    const { full_name, school, grade, password_hash } = await req.json()

    // Create Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check if student already exists
    const { data: existingStudents } = await supabaseAdmin
      .from('students')
      .select('id')
      .eq('full_name', full_name.trim())
      .eq('school', school.trim())

    if (existingStudents && existingStudents.length > 0) {
      return new Response(
        JSON.stringify({ error: 'A student with this name already exists at this school.' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create new student
    const { data: newStudent, error } = await supabaseAdmin
      .from('students')
      .insert({
        full_name: full_name.trim(),
        school: school.trim(),
        grade: grade.trim(),
        password_hash
      })
      .select()
      .single()

    if (error) {
      return new Response(
        JSON.stringify({ error: 'Failed to create student account' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({ student: newStudent }),
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
