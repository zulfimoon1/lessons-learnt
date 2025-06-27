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
    // Create service role client with maximum permissions
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

    const requestBody = await req.json();
    const { operation, adminEmail, ...params } = requestBody;

    console.log(`🔧 Admin operation: ${operation} by ${adminEmail}`);

    // Verify admin email for security
    if (adminEmail !== 'zulfimoon1@gmail.com') {
      throw new Error('Unauthorized: Not a platform admin')
    }

    // Set multiple admin context variables for comprehensive RLS bypass
    try {
      await supabaseAdmin.rpc('set_platform_admin_context', { admin_email: adminEmail });
    } catch (contextError) {
      console.warn('Context setting failed, proceeding with service role permissions:', contextError);
    }

    let result;

    switch (operation) {
      case 'getPlatformStats':
        console.log('📊 Fetching platform stats...');
        
        try {
          const [studentsResult, teachersResult, feedbackResult, subscriptionsResult] = await Promise.all([
            supabaseAdmin.from('students').select('*', { count: 'exact', head: true }),
            supabaseAdmin.from('teachers').select('*', { count: 'exact', head: true }),
            supabaseAdmin.from('feedback').select('*', { count: 'exact', head: true }),
            supabaseAdmin.from('subscriptions').select('*', { count: 'exact', head: true })
          ]);

          result = {
            studentsCount: studentsResult.count || 0,
            teachersCount: teachersResult.count || 0,
            responsesCount: feedbackResult.count || 0,
            subscriptionsCount: subscriptionsResult.count || 0,
          };
          
          console.log('✅ Platform stats fetched:', result);
        } catch (statsError) {
          console.error('Error fetching platform stats:', statsError);
          // Return zero counts if there's an error
          result = {
            studentsCount: 0,
            teachersCount: 0,
            responsesCount: 0,
            subscriptionsCount: 0,
          };
        }
        break;

      case 'getTeachers':
        console.log('👨‍🏫 Fetching teachers and school admins...');
        try {
          const { data: allTeachers, error: teachersError } = await supabaseAdmin
            .from('teachers')
            .select('*')
            .order('name');

          if (teachersError) throw teachersError;

          // Filter to only include teachers, doctors, and school admins (not platform admins)
          const teachers = (allTeachers || []).filter(t => 
            t.role === 'teacher' || 
            t.role === 'doctor' || 
            (t.role === 'admin' && t.school !== 'Platform Administration')
          );

          result = { teachers };
          
          console.log(`✅ Teachers and school admins fetched: ${teachers.length}`);
        } catch (error) {
          console.error('Error fetching teachers:', error);
          result = { teachers: [] };
        }
        break;

      case 'getAdminUsers':
        console.log('👑 Fetching platform admin users...');
        try {
          const { data: allTeachers, error: teachersError } = await supabaseAdmin
            .from('teachers')
            .select('*')
            .order('name');

          if (teachersError) throw teachersError;

          // Filter to only include platform admins
          const platformAdmins = (allTeachers || []).filter(t => 
            t.role === 'admin' && t.school === 'Platform Administration'
          );

          result = { admins: platformAdmins };
          
          console.log(`✅ Platform admin users fetched: ${platformAdmins.length}`);
        } catch (error) {
          console.error('Error fetching platform admin users:', error);
          result = { admins: [] };
        }
        break;

      case 'getSchoolData':
        console.log('🏫 Fetching school data...');
        try {
          // Get all teachers that are actual school members (not platform admins)
          const { data: teachersSchoolData, error: teachersError } = await supabaseAdmin
            .from('teachers')
            .select('school, role, name')
            .neq('school', 'Platform Administration');

          if (teachersError) throw teachersError;

          const uniqueSchools = [...new Set(
            teachersSchoolData?.map(t => t.school)
              .filter(school => school) || []
          )];
          
          const schoolStats = [];
          for (const school of uniqueSchools) {
            const [teacherResult, studentResult] = await Promise.all([
              supabaseAdmin.from('teachers').select('id', { count: 'exact', head: true }).eq('school', school).neq('school', 'Platform Administration'),
              supabaseAdmin.from('students').select('id', { count: 'exact', head: true }).eq('school', school)
            ]);

            schoolStats.push({
              name: school,
              teacher_count: teacherResult.count || 0,
              student_count: studentResult.count || 0
            });
          }

          result = schoolStats;
          console.log(`✅ School data fetched: ${schoolStats.length} schools`);
        } catch (error) {
          console.error('Error fetching school data:', error);
          result = [];
        }
        break;

      case 'getSubscriptions':
        console.log('💳 Fetching subscriptions...');
        const { data: subscriptionsData, error: subscriptionsError } = await supabaseAdmin
          .from('subscriptions')
          .select('*')
          .order('created_at', { ascending: false });

        if (subscriptionsError) {
          console.error('Error fetching subscriptions:', subscriptionsError);
          throw subscriptionsError;
        }

        result = subscriptionsData || [];
        console.log(`✅ Subscriptions fetched: ${result.length}`);
        break;

      case 'pauseSubscription':
        console.log('⏸️ Pausing subscription...');
        const { subscriptionId } = params;
        
        const { error: pauseError } = await supabaseAdmin
          .from('subscriptions')
          .update({ status: 'paused' })
          .eq('id', subscriptionId);

        if (pauseError) {
          console.error('Error pausing subscription:', pauseError);
          throw pauseError;
        }

        result = { success: true, message: 'Subscription paused successfully' };
        console.log(`✅ Subscription paused: ${subscriptionId}`);
        break;

      case 'resumeSubscription':
        console.log('▶️ Resuming subscription...');
        const { subscriptionId: resumeSubscriptionId } = params;
        
        const { error: resumeError } = await supabaseAdmin
          .from('subscriptions')
          .update({ status: 'active' })
          .eq('id', resumeSubscriptionId);

        if (resumeError) {
          console.error('Error resuming subscription:', resumeError);
          throw resumeError;
        }

        result = { success: true, message: 'Subscription resumed successfully' };
        console.log(`✅ Subscription resumed: ${resumeSubscriptionId}`);
        break;

      case 'cleanupDemoData':
        console.log('🧹 Starting comprehensive demo data cleanup...');
        
        try {
          // Get all subscriptions first
          const { data: allSubscriptions, error: fetchError } = await supabaseAdmin
            .from('subscriptions')
            .select('*');

          if (fetchError) {
            console.error('Error fetching subscriptions:', fetchError);
            throw fetchError;
          }

          console.log(`Total subscriptions found: ${allSubscriptions?.length || 0}`);

          // Filter demo subscriptions with comprehensive criteria
          const demoSubscriptions = (allSubscriptions || []).filter(sub => {
            const schoolName = (sub.school_name || '').toLowerCase().trim();
            console.log(`Checking school: "${schoolName}"`);
            
            const isDemoSchool = schoolName.includes('demo') || 
                               schoolName.includes('default') || 
                               schoolName.includes('test') ||
                               schoolName === 'demo school' ||
                               schoolName === 'default school' ||
                               schoolName === 'test school' ||
                               schoolName.startsWith('demo') ||
                               schoolName.startsWith('default') ||
                               schoolName.startsWith('test') ||
                               schoolName.endsWith('demo') ||
                               schoolName.endsWith('default') ||
                               schoolName.endsWith('test');
            
            if (isDemoSchool) {
              console.log(`✓ Identified demo school: "${schoolName}"`);
            }
            
            return isDemoSchool;
          });

          console.log(`Found ${demoSubscriptions.length} demo subscriptions to delete:`, 
                     demoSubscriptions.map(s => `"${s.school_name}"`));
          
          let deletedCount = 0;
          
          if (demoSubscriptions.length > 0) {
            for (const subscription of demoSubscriptions) {
              console.log(`Deleting subscription for school: "${subscription.school_name}"`);
              
              const { error: deleteError } = await supabaseAdmin
                .from('subscriptions')
                .delete()
                .eq('id', subscription.id);

              if (deleteError) {
                console.error(`Error deleting subscription ${subscription.id}:`, deleteError);
              } else {
                deletedCount++;
                console.log(`✅ Deleted subscription for: "${subscription.school_name}"`);
              }
            }
          }

          result = { 
            success: true, 
            message: `Demo data cleanup completed. Deleted ${deletedCount} demo subscriptions.`,
            deletedCount: deletedCount,
            deletedSchools: demoSubscriptions.map(s => s.school_name),
            totalChecked: allSubscriptions?.length || 0
          };
          
          console.log(`✅ Demo cleanup completed: ${deletedCount} subscriptions deleted`);
        } catch (error) {
          console.error('Demo cleanup failed:', error);
          throw new Error(`Demo cleanup failed: ${error.message}`);
        }
        break;

      case 'getPaymentNotifications':
        console.log('🔔 Fetching payment notifications with bypassed RLS...');
        try {
          // Bypass RLS entirely with service role
          const { data: notificationsData, error: notificationsError } = await supabaseAdmin
            .from('payment_notifications')
            .select('*')
            .order('created_at', { ascending: false });

          // Always return array, even if empty or error
          result = notificationsData || [];
          console.log(`✅ Payment notifications fetched: ${result.length}`);
          
          if (notificationsError) {
            console.warn('Payment notifications query had warning:', notificationsError);
          }
        } catch (error) {
          console.warn('Payment notifications fetch error, returning empty array:', error);
          result = [];
        }
        break;

      case 'getTransactions':
        console.log('💳 Fetching transactions with service role privileges...');
        
        try {
          // Use service role to directly access transactions table
          const { data: transactionsData, error: transactionsError } = await supabaseAdmin
            .from('transactions')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (transactionsError) {
            console.error('Direct query failed:', transactionsError);
            // Try using RPC function as fallback
            const { data: rpcData, error: rpcError } = await supabaseAdmin
              .rpc('get_all_transactions_admin');
            
            if (rpcError) {
              console.error('RPC fallback failed:', rpcError);
              result = [];
            } else {
              result = rpcData || [];
              console.log(`✅ Transactions fetched via RPC: ${result.length} records`);
            }
          } else {
            result = transactionsData || [];
            console.log(`✅ Transactions fetched directly: ${result.length} records`);
          }
        } catch (error) {
          console.error('Error in getTransactions:', error);
          result = [];
        }
        break;

      case 'createTransaction':
        console.log('💳 Creating transaction with service role privileges...');
        const { transactionData } = params;
        
        try {
          // Validate required fields
          if (!transactionData.school_name || !transactionData.amount) {
            throw new Error('School name and amount are required');
          }

          // Prepare transaction data
          const insertData = {
            school_name: transactionData.school_name.trim(),
            amount: Math.round(parseFloat(transactionData.amount) * 100), // Convert to cents
            currency: transactionData.currency || 'eur',
            transaction_type: transactionData.transaction_type || 'payment',
            status: transactionData.status || 'completed',
            description: transactionData.description || '',
            created_by: null // Platform admin creation
          };

          console.log('📝 Inserting transaction data:', insertData);

          // Use service role to insert transaction
          const { data: newTransaction, error: createTransactionError } = await supabaseAdmin
            .from('transactions')
            .insert(insertData)
            .select()
            .single();

          if (createTransactionError) {
            console.error('Direct insert failed:', createTransactionError);
            throw new Error(`Failed to create transaction: ${createTransactionError.message}`);
          }

          result = newTransaction;
          console.log('✅ Transaction created successfully:', result.id);
        } catch (error) {
          console.error('Error in createTransaction:', error);
          throw error;
        }
        break;

      case 'deleteTransaction':
        console.log('🗑️ Deleting transaction with service role privileges...');
        const { transactionId } = params;
        
        try {
          const { error: deleteTransactionError } = await supabaseAdmin
            .from('transactions')
            .delete()
            .eq('id', transactionId);

          if (deleteTransactionError) {
            console.error('Delete transaction failed:', deleteTransactionError);
            throw new Error(`Failed to delete transaction: ${deleteTransactionError.message}`);
          }

          result = { success: true, message: 'Transaction deleted successfully' };
          console.log('✅ Transaction deleted successfully:', transactionId);
        } catch (error) {
          console.error('Error in deleteTransaction:', error);
          throw error;
        }
        break;

      case 'getMentalHealthAlerts':
        console.log('🧠 Fetching mental health alerts with bypassed RLS...');
        try {
          // Bypass RLS entirely with service role
          const { data: alertsData, error: alertsError } = await supabaseAdmin
            .from('mental_health_alerts')
            .select('*')
            .order('created_at', { ascending: false });

          // Always return array, even if empty or error
          result = alertsData || [];
          console.log(`✅ Mental health alerts fetched: ${result.length}`);
          
          if (alertsError) {
            console.warn('Mental health alerts query had warning:', alertsError);
          }
        } catch (error) {
          console.warn('Mental health alerts fetch error, returning empty array:', error);
          result = [];
        }
        break;

      case 'markAlertAsReviewed':
        console.log('✅ Marking alert as reviewed...');
        const { alertId } = params;
        
        try {
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
        } catch (error) {
          console.error('Error marking alert as reviewed:', error);
          throw error;
        }
        break;

      case 'getStudents':
        console.log('👨‍🎓 Fetching students...');
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
        console.log('👨‍⚕️ Fetching doctors...');
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

      case 'createSchool':
        const { schoolName } = params;
        const adminPassword = await hashPassword('admin123');
        
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
        console.log('💰 Fetching discount codes...');
        const { data: discountCodesData, error: discountCodesError } = await supabaseAdmin
          .from('discount_codes')
          .select('*')
          .order('created_at', { ascending: false });

        if (discountCodesError) {
          console.error('Error fetching discount codes:', discountCodesError);
          throw discountCodesError;
        }

        result = discountCodesData || [];
        console.log(`✅ Discount codes fetched: ${result.length}`);
        break;

      case 'createDiscountCode':
        console.log('🔨 Creating discount code...');
        const { discountCodeData } = params;
        
        const discountCodeInsert = {
          code: discountCodeData.code,
          discount_percent: discountCodeData.discount_percent,
          description: discountCodeData.description,
          max_uses: discountCodeData.max_uses,
          expires_at: discountCodeData.expires_at,
          is_active: discountCodeData.is_active,
          school_name: discountCodeData.school_name,
          duration_months: discountCodeData.duration_months,
          current_uses: 0
        };

        if (discountCodeData.created_by && discountCodeData.created_by.length === 36 && discountCodeData.created_by.includes('-')) {
          discountCodeInsert.created_by = discountCodeData.created_by;
        }

        const { data: directData, error: directError } = await supabaseAdmin
          .from('discount_codes')
          .insert(discountCodeInsert)
          .select()
          .single();

        if (directError) throw directError;
        result = directData;
        
        console.log('✅ Discount code created successfully');
        break;

      case 'updateDiscountCode':
        console.log('🔄 Updating discount code...');
        const { discountCodeId, discountCodeUpdates } = params;
        
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
        
        console.log('✅ Discount code updated successfully');
        break;

      case 'deleteDiscountCode':
        console.log('🗑️ Deleting discount code...');
        const { discountCodeId: deleteDiscountCodeId } = params;
        
        const { error: directDeleteError } = await supabaseAdmin
          .from('discount_codes')
          .delete()
          .eq('id', deleteDiscountCodeId);

        if (directDeleteError) throw directDeleteError;
        result = { success: true, message: 'Discount code deleted successfully' };
        
        console.log('✅ Discount code deleted successfully');
        break;

      case 'testConnection':
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
        console.error('❌ Invalid operation:', operation);
        return new Response(
          JSON.stringify({ error: 'Invalid operation' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    console.log('✅ Operation completed successfully:', result);

    return new Response(JSON.stringify({ success: true, data: result }), {
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
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
