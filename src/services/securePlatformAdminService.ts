
import { supabase } from '@/integrations/supabase/client';

export interface PlatformAdmin {
  id: string;
  name: string;
  email: string;
  role: string;
  school: string;
}

export const securePlatformAdminLogin = async (email: string, password: string) => {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return { error: error.message };
    }

    // Get current session to verify admin role
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return { error: 'Authentication failed' };
    }

    // Verify user is an admin
    const { data: teacher } = await supabase
      .from('teachers')
      .select('*')
      .eq('id', session.user.id)
      .eq('role', 'admin')
      .single();

    if (!teacher) {
      await supabase.auth.signOut();
      return { error: 'Unauthorized: Not a platform admin' };
    }

    const admin: PlatformAdmin = {
      id: teacher.id,
      email: teacher.email,
      name: teacher.name,
      role: teacher.role,
      school: teacher.school
    };

    return { admin };
  } catch (error) {
    return { error: 'Authentication system error' };
  }
};

export const getSecurityMetrics = async () => {
  try {
    const { data: securityEvents } = await supabase
      .from('audit_log')
      .select('*')
      .eq('table_name', 'security_events')
      .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    return {
      loginAttempts: securityEvents?.filter(e => e.operation?.includes('login')).length || 0,
      suspiciousActivities: securityEvents?.filter(e => e.new_data?.severity === 'high').length || 0,
      blockedIPs: [],
      lastSecurityScan: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching security metrics:', error);
    return {
      loginAttempts: 0,
      suspiciousActivities: 0,
      blockedIPs: [],
      lastSecurityScan: new Date().toISOString()
    };
  }
};
