
import { supabase } from '@/integrations/supabase/client';

export interface PlatformAdmin {
  id: string;
  name: string;
  email: string;
}

export const platformAdminLoginService = async (email: string, password: string) => {
  try {
    console.log('Attempting login for email:', email);
    
    const { data: admin, error } = await supabase
      .from('platform_admins')
      .select('*')
      .eq('email', email)
      .single();

    console.log('Database query result:', { admin, error });

    if (error) {
      console.error('Database error:', error);
      return { error: 'Invalid email or password' };
    }

    if (!admin) {
      console.log('No admin found with this email');
      return { error: 'Invalid email or password' };
    }

    // For now, using simple password comparison
    // In production, you should use proper password hashing
    if (admin.password_hash !== password) {
      console.log('Password mismatch');
      return { error: 'Invalid email or password' };
    }

    console.log('Login successful for admin:', admin.name);

    const adminData: PlatformAdmin = {
      id: admin.id,
      name: admin.name,
      email: admin.email
    };

    return { admin: adminData };
  } catch (error) {
    console.error('Login service error:', error);
    return { error: 'Login failed. Please try again.' };
  }
};

// Helper function to create a test admin account
export const createTestAdmin = async () => {
  try {
    const { data, error } = await supabase
      .from('platform_admins')
      .insert([
        {
          name: 'Test Admin',
          email: 'admin@test.com',
          password_hash: 'admin123' // In production, this should be properly hashed
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating test admin:', error);
      return { error: error.message };
    }

    console.log('Test admin created successfully:', data);
    return { success: true, admin: data };
  } catch (error) {
    console.error('Error in createTestAdmin:', error);
    return { error: 'Failed to create test admin' };
  }
};
