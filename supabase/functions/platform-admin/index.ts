
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simple password hashing using Deno's built-in crypto API
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'simple_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { operation, adminEmail, ...params } = await req.json()

    // Verify admin email
    if (adminEmail !== 'zulfimoon1@gmail.com') {
      throw new Error('Unauthorized: Not a platform admin')
    }

    let result;

    switch (operation) {
      case 'getPlatformStats':
        const [studentsResult, teachersResult, feedbackResult, subscriptionsResult] = await Promise.all([
          supabaseAdmin.from('students').select('*', { count: 'exact', head: true }),
          supabaseAdmin.from('teachers').select('*', { count: 'exact', head: true }),
          supabaseAdmin.from('feedback').select('*', { count: 'exact', head: true }),
          supabaseAdmin.from('subscriptions').select('*', { count: 'exact', head: true })
        ])

        result = {
          studentsCount: studentsResult.count || 0,
          teachersCount: teachersResult.count || 0,
          responsesCount: feedbackResult.count || 0,
          subscriptionsCount: subscriptionsResult.count || 0,
        }
        break;

      case 'getTeachers':
        const { data: teachersData, error: teachersError } = await supabaseAdmin
          .from('teachers')
          .select('*')
          .order('name');

        if (teachersError) throw teachersError;

        // Since we've removed hardcoded teachers from DB, we can return all results
        console.log(`Retrieved ${teachersData?.length || 0} teachers from database`);
        result = teachersData || [];
        break;

      case 'createTeacher':
        const { teacherData } = params;
        
        // Hash password server-side
        const hashedPassword = await hashPassword(teacherData.password);
        const teacherDataWithHash = {
          ...teacherData,
          password_hash: hashedPassword
        };
        delete teacherDataWithHash.password; // Remove plain password

        const { data: newTeacher, error: createTeacherError } = await supabaseAdmin
          .from('teachers')
          .insert(teacherDataWithHash)
          .select()
          .single();

        if (createTeacherError) throw createTeacherError;
        result = { id: newTeacher.id, success: true, message: 'Teacher created successfully' };
        break;

      case 'deleteTeacher':
        const { teacherId } = params;
        const { error: deleteTeacherError } = await supabaseAdmin
          .from('teachers')
          .delete()
          .eq('id', teacherId);

        if (deleteTeacherError) throw deleteTeacherError;
        result = { success: true, message: 'Teacher deleted successfully' };
        break;

      case 'getSchoolData':
        const { data: teachersSchoolData } = await supabaseAdmin
          .from('teachers')
          .select('school');

        // Get unique schools (hardcoded ones already removed from DB)
        const uniqueSchools = [...new Set(
          teachersSchoolData?.map(t => t.school)
            .filter(school => school) || []
        )];
        
        const schoolStats = [];
        for (const school of uniqueSchools) {
          const [teacherResult, studentResult] = await Promise.all([
            supabaseAdmin.from('teachers').select('id', { count: 'exact', head: true }).eq('school', school),
            supabaseAdmin.from('students').select('id', { count: 'exact', head: true }).eq('school', school)
          ]);

          schoolStats.push({
            name: school,
            teacher_count: teacherResult.count || 0,
            student_count: studentResult.count || 0
          });
        }

        result = schoolStats;
        break;

      case 'createSchool':
        const { schoolName } = params;
        const adminPassword = await hashPassword('admin123'); // Default password
        
        const { data: newSchool, error: createError } = await supabaseAdmin
          .from('teachers')
          .insert({
            name: `${schoolName} Admin`,
            email: `admin@${schoolName.toLowerCase().replace(/\s+/g, '')}.edu`,
            school: schoolName,
            role: 'admin',
            password_hash: adminPassword
          })
          .select()
          .single();

        if (createError) throw createError;
        result = { id: newSchool.id, success: true, message: 'School created successfully' };
        break;

      case 'deleteSchool':
        const { schoolName: deleteSchoolName } = params;
        const { data: deleteResult, error: deleteError } = await supabaseAdmin.rpc('platform_admin_delete_school', {
          school_name_param: deleteSchoolName,
          admin_email_param: adminEmail
        });

        if (deleteError) throw deleteError;
        result = { 
          success: true, 
          schoolName: deleteSchoolName, 
          deletedAt: new Date().toISOString(),
          message: 'School deleted successfully',
          details: deleteResult
        };
        break;

      default:
        throw new Error(`Unknown operation: ${operation}`)
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Platform admin error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
