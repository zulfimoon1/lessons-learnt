
import { supabase } from '@/integrations/supabase/client';

export interface PlatformAdmin {
  id: string;
  name: string;
  email: string;
}

export const platformAdminLoginService = async (email: string, password: string) => {
  try {
    const { data: admin, error } = await supabase
      .from('platform_admins')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !admin) {
      return { error: 'Invalid email or password' };
    }

    if (admin.password_hash !== password) {
      return { error: 'Invalid email or password' };
    }

    const adminData: PlatformAdmin = {
      id: admin.id,
      name: admin.name,
      email: admin.email
    };

    return { admin: adminData };
  } catch (error) {
    return { error: 'Login failed. Please try again.' };
  }
};
