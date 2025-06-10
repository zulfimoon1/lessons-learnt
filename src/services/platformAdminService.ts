
import { supabase } from '@/integrations/supabase/client';
import { verifyPassword } from './securePasswordService';

export interface PlatformAdmin {
  id: string;
  name: string;
  email: string;
  role: string;
  school: string;
}

export const platformAdminLoginService = async (email: string, password: string) => {
  try {
    console.log('Platform admin login attempt:', email);

    // Input validation and sanitization
    const sanitizedEmail = email.trim().toLowerCase();
    
    if (!sanitizedEmail || !password) {
      return { error: 'Email and password are required' };
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return { error: 'Invalid email format' };
    }

    const { data: admin, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('email', sanitizedEmail)
      .eq('role', 'admin')
      .single();

    if (error || !admin) {
      console.log('Platform admin not found');
      return { error: 'Invalid credentials' };
    }

    // Use secure password verification
    const isPasswordValid = await verifyPassword(password, admin.password_hash);
    if (!isPasswordValid) {
      console.log('Invalid password for platform admin');
      return { error: 'Invalid credentials' };
    }

    console.log('Platform admin login successful');
    return { 
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        school: admin.school
      }
    };
  } catch (error) {
    console.error('Platform admin login error:', error);
    return { error: 'Login failed. Please try again.' };
  }
};

export const createTestAdmin = async () => {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return { error: 'Test admin creation is disabled in production' };
    }

    const { data: existingAdmin } = await supabase
      .from('teachers')
      .select('id')
      .eq('email', 'admin@test.com')
      .single();

    if (existingAdmin) {
      return { error: 'Test admin already exists' };
    }

    // Test admin already created via migration with secure hash
    return { success: true };
  } catch (error) {
    console.error('Create test admin error:', error);
    return { error: 'Failed to create test admin' };
  }
};
