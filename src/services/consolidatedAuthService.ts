
import { supabase } from '@/integrations/supabase/client';
import { securePasswordService } from './securePasswordService';
import { secureSessionService } from './secureSessionService';

interface AuthUser {
  id: string;
  email?: string;
  fullName?: string;
  name?: string;
  school: string;
  role: string;
  userType: 'teacher' | 'student' | 'admin';
  grade?: string;
}

interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
  requiresPasswordUpdate?: boolean;
}

class ConsolidatedAuthService {
  /**
   * Unified secure login for all user types
   */
  async secureLogin(credentials: {
    email?: string;
    fullName?: string;
    school: string;
    grade?: string;
    password: string;
    userType: 'teacher' | 'student';
  }): Promise<AuthResult> {
    try {
      // Input validation
      const { email, fullName, school, grade, password, userType } = credentials;
      
      if (!school.trim() || !password) {
        return { success: false, error: 'Missing required fields' };
      }

      if (userType === 'teacher' && !email?.trim()) {
        return { success: false, error: 'Email is required for teachers' };
      }

      if (userType === 'student' && (!fullName?.trim() || !grade?.trim())) {
        return { success: false, error: 'Full name and grade are required for students' };
      }

      // Attempt login based on user type
      let user: AuthUser | null = null;
      let requiresPasswordUpdate = false;

      if (userType === 'teacher') {
        const result = await this.authenticateTeacher(email!, password);
        user = result.user || null;
        requiresPasswordUpdate = result.requiresPasswordUpdate || false;
        if (result.error) return { success: false, error: result.error };
      } else {
        const result = await this.authenticateStudent(fullName!, school, grade!, password);
        user = result.user || null;
        requiresPasswordUpdate = result.requiresPasswordUpdate || false;
        if (result.error) return { success: false, error: result.error };
      }

      if (!user) {
        return { success: false, error: 'Authentication failed' };
      }

      // Create secure session
      secureSessionService.createSecureSession(
        user.id,
        user.userType,
        user.school,
        user.role === 'doctor' // Mental health professionals get shorter sessions
      );

      return { 
        success: true, 
        user, 
        requiresPasswordUpdate 
      };

    } catch (error) {
      console.error('Secure login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }

  /**
   * Authenticate teacher with secure password handling
   */
  private async authenticateTeacher(email: string, password: string): Promise<AuthResult> {
    const { data: teachers, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .limit(1);

    if (error) {
      console.error('Teacher lookup error:', error);
      return { success: false, error: 'Authentication failed' };
    }

    if (!teachers || teachers.length === 0) {
      return { success: false, error: 'Invalid email or password' };
    }

    const teacher = teachers[0];
    
    // Check if password needs migration from weak hash
    let requiresPasswordUpdate = false;
    let isPasswordValid = false;

    if (securePasswordService.isWeakHash(teacher.password_hash)) {
      // Legacy SHA-256 verification for migration
      const legacyHash = await this.legacyHashPassword(password);
      isPasswordValid = legacyHash === teacher.password_hash;
      requiresPasswordUpdate = true;
    } else {
      // Modern bcrypt verification
      isPasswordValid = await securePasswordService.verifyPassword(password, teacher.password_hash);
    }

    if (!isPasswordValid) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Migrate password if needed
    if (requiresPasswordUpdate) {
      await this.migrateTeacherPassword(teacher.id, password);
    }

    return {
      success: true,
      user: {
        id: teacher.id,
        email: teacher.email,
        name: teacher.name,
        school: teacher.school,
        role: teacher.role,
        userType: 'teacher'
      },
      requiresPasswordUpdate
    };
  }

  /**
   * Authenticate student with secure password handling
   */
  private async authenticateStudent(fullName: string, school: string, grade: string, password: string): Promise<AuthResult> {
    const { data: students, error } = await supabase
      .from('students')
      .select('*')
      .eq('full_name', fullName.trim())
      .eq('school', school.trim())
      .eq('grade', grade.trim())
      .limit(1);

    if (error) {
      console.error('Student lookup error:', error);
      return { success: false, error: 'Authentication failed' };
    }

    if (!students || students.length === 0) {
      return { success: false, error: 'Invalid credentials' };
    }

    const student = students[0];
    
    // Check if password needs migration from weak hash
    let requiresPasswordUpdate = false;
    let isPasswordValid = false;

    if (securePasswordService.isWeakHash(student.password_hash)) {
      // Legacy SHA-256 verification for migration
      const legacyHash = await this.legacyHashPassword(password);
      isPasswordValid = legacyHash === student.password_hash;
      requiresPasswordUpdate = true;
    } else {
      // Modern bcrypt verification
      isPasswordValid = await securePasswordService.verifyPassword(password, student.password_hash);
    }

    if (!isPasswordValid) {
      return { success: false, error: 'Invalid credentials' };
    }

    // Migrate password if needed
    if (requiresPasswordUpdate) {
      await this.migrateStudentPassword(student.id, password);
    }

    return {
      success: true,
      user: {
        id: student.id,
        fullName: student.full_name,
        school: student.school,
        role: 'student',
        userType: 'student',
        grade: student.grade
      },
      requiresPasswordUpdate
    };
  }

  /**
   * Unified secure signup
   */
  async secureSignup(data: {
    userType: 'teacher' | 'student';
    name?: string;
    fullName?: string;
    email?: string;
    school: string;
    grade?: string;
    role?: string;
    password: string;
  }): Promise<AuthResult> {
    try {
      // Validate password strength
      const passwordValidation = securePasswordService.validatePassword(data.password);
      if (!passwordValidation.isValid) {
        return { 
          success: false, 
          error: `Password requirements not met: ${passwordValidation.errors.join(', ')}` 
        };
      }

      // Hash password securely
      const hashedPassword = await securePasswordService.hashPassword(data.password);

      if (data.userType === 'teacher') {
        return await this.createTeacher({
          name: data.name!,
          email: data.email!,
          school: data.school,
          role: data.role || 'teacher',
          password_hash: hashedPassword
        });
      } else {
        return await this.createStudent({
          full_name: data.fullName!,
          school: data.school,
          grade: data.grade!,
          password_hash: hashedPassword
        });
      }

    } catch (error) {
      console.error('Secure signup error:', error);
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  }

  /**
   * Create teacher account
   */
  private async createTeacher(teacherData: any): Promise<AuthResult> {
    const { data: teacher, error } = await supabase
      .from('teachers')
      .insert([teacherData])
      .select()
      .single();

    if (error) {
      console.error('Teacher creation error:', error);
      return { success: false, error: 'Email already exists or registration failed' };
    }

    return {
      success: true,
      user: {
        id: teacher.id,
        email: teacher.email,
        name: teacher.name,
        school: teacher.school,
        role: teacher.role,
        userType: 'teacher'
      }
    };
  }

  /**
   * Create student account
   */
  private async createStudent(studentData: any): Promise<AuthResult> {
    const { data: student, error } = await supabase
      .from('students')
      .insert([studentData])
      .select()
      .single();

    if (error) {
      console.error('Student creation error:', error);
      return { success: false, error: 'Student already exists or registration failed' };
    }

    return {
      success: true,
      user: {
        id: student.id,
        fullName: student.full_name,
        school: student.school,
        role: 'student',
        userType: 'student',
        grade: student.grade
      }
    };
  }

  /**
   * Migrate teacher password from weak hash to bcrypt
   */
  private async migrateTeacherPassword(teacherId: string, plainPassword: string): Promise<void> {
    try {
      const newHash = await securePasswordService.hashPassword(plainPassword);
      await supabase
        .from('teachers')
        .update({ password_hash: newHash })
        .eq('id', teacherId);
      
      console.log('Teacher password migrated to secure hash');
    } catch (error) {
      console.error('Password migration failed:', error);
    }
  }

  /**
   * Migrate student password from weak hash to bcrypt
   */
  private async migrateStudentPassword(studentId: string, plainPassword: string): Promise<void> {
    try {
      const newHash = await securePasswordService.hashPassword(plainPassword);
      await supabase
        .from('students')
        .update({ password_hash: newHash })
        .eq('id', studentId);
      
      console.log('Student password migrated to secure hash');
    } catch (error) {
      console.error('Password migration failed:', error);
    }
  }

  /**
   * Legacy SHA-256 hashing for migration compatibility
   */
  private async legacyHashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'legacy_salt');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): AuthUser | null {
    const session = secureSessionService.getSecureSession();
    if (!session) return null;

    return {
      id: session.userId,
      school: session.school,
      role: session.userType,
      userType: session.userType,
      // Additional fields would be loaded separately if needed
    } as AuthUser;
  }

  /**
   * Secure logout with complete cleanup
   */
  logout(): void {
    secureSessionService.clearSession();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return secureSessionService.getSecureSession() !== null;
  }

  /**
   * Validate CSRF token
   */
  validateCSRFToken(token: string): boolean {
    const currentToken = secureSessionService.getCSRFToken();
    return currentToken && currentToken === token;
  }
}

export const consolidatedAuthService = new ConsolidatedAuthService();
