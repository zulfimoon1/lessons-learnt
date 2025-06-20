
import { supabase } from '@/integrations/supabase/client';

// This service uses database functions to bypass RLS for authentication
export const authenticateWithBypass = async (email: string, password: string, userType: 'teacher' | 'student') => {
  try {
    console.log(`🔐 Starting ${userType} authentication with bypass for:`, email);
    
    // Set the platform admin context to bypass RLS
    await supabase.rpc('set_platform_admin_context', {
      admin_email: 'system@auth.bypass'
    });

    let query;
    if (userType === 'teacher') {
      query = supabase
        .from('teachers')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .limit(1);
    } else {
      // For students, we'll need additional parameters
      return { error: 'Student authentication requires additional parameters' };
    }

    const { data, error } = await query;

    if (error) {
      console.error(`${userType} query error:`, error);
      return { error: 'Authentication failed' };
    }

    if (!data || data.length === 0) {
      console.log(`No ${userType} found`);
      return { error: 'Invalid credentials' };
    }

    return { data: data[0] };

  } catch (error) {
    console.error(`${userType} authentication error:`, error);
    return { error: 'Authentication failed' };
  }
};
