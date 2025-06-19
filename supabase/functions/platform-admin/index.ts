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

    // Set admin context for all operations with multiple approaches
    try {
      // Set multiple context variables for maximum compatibility
      await supabaseAdmin.rpc('set_platform_admin_context', { admin_email: adminEmail });
    } catch (error) {
      console.warn('Failed to set platform admin context via RPC, continuing with service role access');
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

      case 'getMentalHealthAlerts':
        console.log('🧠 Fetching mental health alerts...');
        const { data: alertsData, error: alertsError } = await supabaseAdmin
          .from('mental_health_alerts')
          .select('*')
          .order('created_at', { ascending: false });

        if (alertsError) {
          console.error('Error fetching mental health alerts:', alertsError);
          throw alertsError;
        }

        console.log(`✅ Mental health alerts fetched: ${alertsData?.length || 0}`);
        result = alertsData || [];
        break;

      case 'markAlertAsReviewed':
        console.log('✅ Marking alert as reviewed...');
        const { alertId } = params;
        const { error: reviewError } = await supabaseAdmin
          .from('mental_health_alerts')
          .update({
            is_reviewed: true,
            reviewed_by: 'Platform Admin',
            reviewed_at: new Date().toISOString()
          })
          .eq('id', alertId);

        if (reviewError) throw reviewError;
        result = { success: true, message: 'Alert marked as reviewed' };
        break;

      case 'getTeachers':
        const { data: teachersData, error: teachersError } = await supabaseAdmin
          .from('teachers')
          .select('*')
          .order('name');

        if (teachersError) throw teachersError;

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

      case 'getStudents':
        const { data: studentsData, error: studentsError } = await supabaseAdmin
          .from('students')
          .select('*')
          .order('full_name');

        if (studentsError) throw studentsError;

        console.log(`Retrieved ${studentsData?.length || 0} students from database`);
        result = studentsData || [];
        break;

      case 'createStudent':
        const { studentData } = params;
        
        // Hash password server-side
        const hashedStudentPassword = await hashPassword(studentData.password);
        const studentDataWithHash = {
          full_name: studentData.full_name,
          school: studentData.school,
          grade: studentData.grade,
          password_hash: hashedStudentPassword
        };

        const { data: newStudent, error: createStudentError } = await supabaseAdmin
          .from('students')
          .insert(studentDataWithHash)
          .select()
          .single();

        if (createStudentError) throw createStudentError;
        result = { id: newStudent.id, success: true, message: 'Student created successfully' };
        break;

      case 'deleteStudent':
        const { studentId } = params;
        const { error: deleteStudentError } = await supabaseAdmin
          .from('students')
          .delete()
          .eq('id', studentId);

        if (deleteStudentError) throw deleteStudentError;
        result = { success: true, message: 'Student deleted successfully' };
        break;

      case 'getDoctors':
        const { data: doctorsData, error: doctorsError } = await supabaseAdmin
          .from('teachers')
          .select('*')
          .eq('role', 'doctor')
          .order('name');

        if (doctorsError) throw doctorsError;

        console.log(`Retrieved ${doctorsData?.length || 0} doctors from database`);
        result = doctorsData || [];
        break;

      case 'createDoctor':
        const { doctorData } = params;
        
        // Hash password server-side
        const hashedDoctorPassword = await hashPassword(doctorData.password);
        const doctorDataWithHash = {
          name: doctorData.name,
          email: doctorData.email,
          school: doctorData.school,
          role: 'doctor',
          specialization: doctorData.specialization || null,
          license_number: doctorData.license_number || null,
          password_hash: hashedDoctorPassword,
          is_available: true
        };

        const { data: newDoctor, error: createDoctorError } = await supabaseAdmin
          .from('teachers')
          .insert(doctorDataWithHash)
          .select()
          .single();

        if (createDoctorError) throw createDoctorError;
        result = { id: newDoctor.id, success: true, message: 'Doctor created successfully' };
        break;

      case 'deleteDoctor':
        const { doctorId } = params;
        const { error: deleteDoctorError } = await supabaseAdmin
          .from('teachers')
          .delete()
          .eq('id', doctorId);

        if (deleteDoctorError) throw deleteDoctorError;
        result = { success: true, message: 'Doctor deleted successfully' };
        break;

      case 'getSchoolData':
        const { data: teachersSchoolData } = await supabaseAdmin
          .from('teachers')
          .select('school');

        // Get unique schools
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

      case 'getDiscountCodes':
        console.log('💰 Fetching discount codes via admin function...');
        const { data: discountCodesData, error: discountCodesError } = await supabaseAdmin
          .from('discount_codes')
          .select('*')
          .order('created_at', { ascending: false });

        if (discountCodesError) {
          console.error('Direct query failed, trying RPC function:', discountCodesError);
          // Fallback to RPC function
          try {
            const { data: rpcData, error: rpcError } = await supabaseAdmin
              .rpc('platform_admin_get_discount_codes', { admin_email_param: adminEmail });
            
            if (rpcError) throw rpcError;
            result = rpcData || [];
          } catch (rpcErr) {
            console.error('RPC function also failed:', rpcErr);
            throw discountCodesError;
          }
        } else {
          result = discountCodesData || [];
        }
        console.log(`✅ Discount codes fetched: ${result.length}`);
        break;

      case 'createDiscountCode':
        console.log('🔨 Creating discount code via admin function...');
        const { discountCodeData } = params;
        
        try {
          // Try RPC function first
          const { data: rpcData, error: rpcError } = await supabaseAdmin
            .rpc('platform_admin_create_discount_code', {
              admin_email_param: adminEmail,
              code_param: discountCodeData.code,
              discount_percent_param: discountCodeData.discount_percent,
              description_param: discountCodeData.description,
              max_uses_param: discountCodeData.max_uses,
              expires_at_param: discountCodeData.expires_at,
              is_active_param: discountCodeData.is_active,
              school_name_param: discountCodeData.school_name,
              created_by_param: discountCodeData.created_by,
              duration_months_param: discountCodeData.duration_months
            });

          if (rpcError) {
            console.error('RPC function failed, trying direct insert:', rpcError);
            // Fallback to direct insert
            const { data: directData, error: directError } = await supabaseAdmin
              .from('discount_codes')
              .insert({
                code: discountCodeData.code,
                discount_percent: discountCodeData.discount_percent,
                description: discountCodeData.description,
                max_uses: discountCodeData.max_uses,
                expires_at: discountCodeData.expires_at,
                is_active: discountCodeData.is_active,
                school_name: discountCodeData.school_name,
                created_by: discountCodeData.created_by,
                duration_months: discountCodeData.duration_months,
                current_uses: 0
              })
              .select()
              .single();

            if (directError) throw directError;
            result = directData;
          } else {
            result = rpcData;
          }
        } catch (error) {
          console.error('Both RPC and direct insert failed:', error);
          throw error;
        }
        
        console.log('✅ Discount code created successfully');
        break;

      case 'updateDiscountCode':
        console.log('🔄 Updating discount code...');
        const { discountCodeId, discountCodeUpdates } = params;
        
        try {
          // Try RPC function first
          const { data: rpcUpdateData, error: rpcUpdateError } = await supabaseAdmin
            .rpc('platform_admin_update_discount_code', {
              admin_email_param: adminEmail,
              code_id_param: discountCodeId,
              code_param: discountCodeUpdates.code,
              discount_percent_param: discountCodeUpdates.discount_percent,
              description_param: discountCodeUpdates.description,
              max_uses_param: discountCodeUpdates.max_uses,
              expires_at_param: discountCodeUpdates.expires_at,
              is_active_param: discountCodeUpdates.is_active,
              school_name_param: discountCodeUpdates.school_name
            });

          if (rpcUpdateError) {
            console.error('RPC update failed, trying direct update:', rpcUpdateError);
            // Fallback to direct update
            const { data: directUpdateData, error: directUpdateError } = await supabaseAdmin
              .from('discount_codes')
              .update({
                ...discountCodeUpdates,
                updated_at: new Date().toISOString()
              })
              .eq('id', discountCodeId)
              .select()
              .single();

            if (directUpdateError) throw directUpdateError;
            result = directUpdateData;
          } else {
            result = rpcUpdateData;
          }
        } catch (error) {
          console.error('Both RPC and direct update failed:', error);
          throw error;
        }
        
        console.log('✅ Discount code updated successfully');
        break;

      case 'deleteDiscountCode':
        console.log('🗑️ Deleting discount code...');
        const { discountCodeId: deleteDiscountCodeId } = params;
        
        try {
          // Try RPC function first
          const { data: rpcDeleteData, error: rpcDeleteError } = await supabaseAdmin
            .rpc('platform_admin_delete_discount_code', {
              admin_email_param: adminEmail,
              code_id_param: deleteDiscountCodeId
            });

          if (rpcDeleteError) {
            console.error('RPC delete failed, trying direct delete:', rpcDeleteError);
            // Fallback to direct delete
            const { error: directDeleteError } = await supabaseAdmin
              .from('discount_codes')
              .delete()
              .eq('id', deleteDiscountCodeId);

            if (directDeleteError) throw directDeleteError;
            result = { success: true, message: 'Discount code deleted successfully' };
          } else {
            result = { success: true, message: 'Discount code deleted successfully' };
          }
        } catch (error) {
          console.error('Both RPC and direct delete failed:', error);
          throw error;
        }
        
        console.log('✅ Discount code deleted successfully');
        break;

      case 'testConnection':
        // Test database connection
        const { data: testData, error: testError } = await supabaseAdmin
          .from('discount_codes')
          .select('id', { count: 'exact', head: true });

        if (testError) throw testError;
        result = { 
          success: true, 
          message: 'Connection successful', 
          readCount: testData?.length || 0 
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
