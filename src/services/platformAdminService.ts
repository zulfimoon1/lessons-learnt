
import { supabase } from '@/integrations/supabase/client';
import { verifyPassword, hashPassword } from './securePasswordService';
import { validateInput } from './secureInputValidation';
import { sessionService } from './secureSessionService';
import { logUserSecurityEvent } from '@/components/SecurityAuditLogger';

export interface PlatformAdmin {
  id: string;
  name: string;
  email: string;
  role: string;
  school: string;
}

export interface StudentStatistics {
  school: string;
  total_students: number;
  student_response_rate: number;
}

// Rate limiting for platform admin login
const loginAttempts = new Map<string, { count: number; lastAttempt: number; blocked: boolean }>();
const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

const checkRateLimit = (identifier: string): { allowed: boolean; message?: string } => {
  const now = Date.now();
  const attempts = loginAttempts.get(identifier);
  
  if (attempts) {
    if (attempts.blocked && now - attempts.lastAttempt < LOCKOUT_DURATION) {
      const remainingTime = Math.ceil((LOCKOUT_DURATION - (now - attempts.lastAttempt)) / 1000 / 60);
      return { 
        allowed: false, 
        message: `Account temporarily locked. Try again in ${remainingTime} minutes.` 
      };
    }
    
    if (now - attempts.lastAttempt > LOCKOUT_DURATION) {
      loginAttempts.delete(identifier);
    }
  }
  
  return { allowed: true };
};

const recordFailedAttempt = (identifier: string) => {
  const now = Date.now();
  const attempts = loginAttempts.get(identifier) || { count: 0, lastAttempt: now, blocked: false };
  attempts.count++;
  attempts.lastAttempt = now;
  
  if (attempts.count >= MAX_ATTEMPTS) {
    attempts.blocked = true;
  }
  
  loginAttempts.set(identifier, attempts);
};

const clearFailedAttempts = (identifier: string) => {
  loginAttempts.delete(identifier);
};

export const platformAdminLoginService = async (email: string, password: string) => {
  try {
    console.log('Platform admin login attempt:', email);

    // Input validation and sanitization
    const sanitizedEmail = validateInput.sanitizeText(email).toLowerCase();
    
    if (!sanitizedEmail || !password) {
      return { error: 'Email and password are required' };
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return { error: 'Invalid email format' };
    }

    // Rate limiting check
    const rateCheck = checkRateLimit(sanitizedEmail);
    if (!rateCheck.allowed) {
      logUserSecurityEvent({
        type: 'rate_limit_exceeded',
        timestamp: new Date().toISOString(),
        details: `Platform admin login rate limit exceeded: ${sanitizedEmail}`,
        userAgent: navigator.userAgent
      });
      return { error: rateCheck.message };
    }

    const { data: admin, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('email', sanitizedEmail)
      .eq('role', 'admin')
      .single();

    if (error || !admin) {
      console.log('Platform admin not found');
      recordFailedAttempt(sanitizedEmail);
      logUserSecurityEvent({
        type: 'login_failed',
        timestamp: new Date().toISOString(),
        details: `Platform admin not found: ${sanitizedEmail}`,
        userAgent: navigator.userAgent
      });
      return { error: 'Invalid credentials' };
    }

    // Use secure password verification
    const isPasswordValid = await verifyPassword(password, admin.password_hash);
    if (!isPasswordValid) {
      console.log('Invalid password for platform admin');
      recordFailedAttempt(sanitizedEmail);
      logUserSecurityEvent({
        type: 'login_failed',
        userId: admin.id,
        timestamp: new Date().toISOString(),
        details: `Invalid password for platform admin: ${sanitizedEmail}`,
        userAgent: navigator.userAgent
      });
      return { error: 'Invalid credentials' };
    }

    // Clear failed attempts and create secure session
    clearFailedAttempts(sanitizedEmail);
    await sessionService.createSession(admin.id, 'admin', admin.school);

    logUserSecurityEvent({
      type: 'login_success',
      userId: admin.id,
      timestamp: new Date().toISOString(),
      details: `Successful platform admin login: ${sanitizedEmail}`,
      userAgent: navigator.userAgent
    });

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
    logUserSecurityEvent({
      type: 'suspicious_activity',
      timestamp: new Date().toISOString(),
      details: `Platform admin login error: ${error}`,
      userAgent: navigator.userAgent
    });
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

    // Create test admin with secure password hash
    const hashedPassword = await hashPassword('admin123');
    
    const { data: admin, error } = await supabase
      .from('teachers')
      .insert([{
        name: 'Test Admin',
        email: 'admin@test.com',
        school: 'Test School',
        role: 'admin',
        password_hash: hashedPassword
      }])
      .select()
      .single();

    if (error) {
      console.error('Test admin creation error:', error);
      return { error: 'Failed to create test admin' };
    }

    return { success: true, admin };
  } catch (error) {
    console.error('Create test admin error:', error);
    return { error: 'Failed to create test admin' };
  }
};
