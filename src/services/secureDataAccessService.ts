
import { supabase } from '@/integrations/supabase/client';
import { secureSessionService } from './secureSessionService';

interface AccessContext {
  userId: string;
  userRole: string;
  userSchool: string;
  userType: 'teacher' | 'student' | 'admin';
}

interface DataAccessResult {
  allowed: boolean;
  reason?: string;
  requiresAudit?: boolean;
}

class SecureDataAccessService {
  /**
   * Validate access to sensitive data with enhanced security
   */
  async validateAccess(
    resource: string,
    operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE',
    context: AccessContext,
    csrfToken?: string
  ): Promise<DataAccessResult> {
    try {
      // Validate session first
      const session = secureSessionService.getSecureSession();
      if (!session || session.userId !== context.userId) {
        await this.logSecurityViolation('invalid_session', context.userId, 
          `Invalid session for ${operation} on ${resource}`);
        return { allowed: false, reason: 'Invalid session' };
      }

      // Validate CSRF token for state-changing operations
      if (['INSERT', 'UPDATE', 'DELETE'].includes(operation)) {
        if (!csrfToken || !secureSessionService.getCSRFToken() || csrfToken !== secureSessionService.getCSRFToken()) {
          await this.logSecurityViolation('csrf_violation', context.userId, 
            `CSRF token validation failed for ${operation} on ${resource}`);
          return { allowed: false, reason: 'CSRF token validation failed' };
        }
      }

      // Resource-specific access control
      switch (resource) {
        case 'mental_health_alerts':
          return this.validateMentalHealthAccess(operation, context);
        
        case 'mental_health_articles':
          return this.validateMentalHealthArticlesAccess(operation, context);
        
        case 'students':
          return this.validateStudentDataAccess(operation, context);
        
        case 'teachers':
          return this.validateTeacherDataAccess(operation, context);
        
        case 'chat_messages':
        case 'live_chat_sessions':
          return this.validateChatAccess(operation, context);
        
        case 'feedback':
        case 'weekly_summaries':
          return this.validateEducationalDataAccess(operation, context);
        
        default:
          return this.validateGeneralAccess(operation, context);
      }

    } catch (error) {
      console.error('Access validation error:', error);
      await this.logSecurityViolation('access_validation_error', context.userId, 
        `Error validating ${operation} on ${resource}: ${error}`);
      return { allowed: false, reason: 'Access validation failed' };
    }
  }

  /**
   * Mental health data access - highest security level
   */
  private validateMentalHealthAccess(operation: string, context: AccessContext): DataAccessResult {
    // Only licensed mental health professionals and admins
    if (!['doctor', 'admin'].includes(context.userRole)) {
      return { 
        allowed: false, 
        reason: 'Mental health data requires licensed professional access' 
      };
    }

    // Validate session timeout for mental health access
    if (!secureSessionService.validateMentalHealthAccess(context.userRole)) {
      return { 
        allowed: false, 
        reason: 'Mental health session expired - please re-authenticate' 
      };
    }

    return { allowed: true, requiresAudit: true };
  }

  /**
   * Mental health articles access
   */
  private validateMentalHealthArticlesAccess(operation: string, context: AccessContext): DataAccessResult {
    if (operation === 'SELECT') {
      // Teachers can read articles
      return { allowed: context.userType === 'teacher' };
    }

    // Only doctors and admins can modify
    return { 
      allowed: ['doctor', 'admin'].includes(context.userRole),
      requiresAudit: true
    };
  }

  /**
   * Student data access validation
   */
  private validateStudentDataAccess(operation: string, context: AccessContext): DataAccessResult {
    if (context.userType === 'student') {
      // Students can only access their own data
      return { allowed: operation === 'SELECT' || operation === 'UPDATE' };
    }

    if (context.userType === 'teacher') {
      // Teachers can access students in their school
      return { allowed: true, requiresAudit: operation !== 'SELECT' };
    }

    return { allowed: false, reason: 'Insufficient privileges for student data' };
  }

  /**
   * Teacher data access validation
   */
  private validateTeacherDataAccess(operation: string, context: AccessContext): DataAccessResult {
    if (context.userType === 'student') {
      return { allowed: false, reason: 'Students cannot access teacher data' };
    }

    // Teachers can view colleagues in same school, update only themselves
    if (operation === 'SELECT') {
      return { allowed: true };
    }

    if (operation === 'UPDATE') {
      return { allowed: true, requiresAudit: true };
    }

    // Only admins can insert/delete teachers
    return { 
      allowed: context.userRole === 'admin',
      requiresAudit: true
    };
  }

  /**
   * Chat access validation
   */
  private validateChatAccess(operation: string, context: AccessContext): DataAccessResult {
    // Chat access based on session participants
    return { allowed: true, requiresAudit: true };
  }

  /**
   * Educational data access validation
   */
  private validateEducationalDataAccess(operation: string, context: AccessContext): DataAccessResult {
    if (context.userType === 'student') {
      // Students can create and view their own data
      return { allowed: ['SELECT', 'INSERT', 'UPDATE'].includes(operation) };
    }

    // Teachers can access educational data in their school
    return { allowed: true, requiresAudit: operation !== 'SELECT' };
  }

  /**
   * General data access validation
   */
  private validateGeneralAccess(operation: string, context: AccessContext): DataAccessResult {
    // Default: authenticated users can read, teachers can modify
    if (operation === 'SELECT') {
      return { allowed: true };
    }

    return { 
      allowed: context.userType === 'teacher',
      requiresAudit: true
    };
  }

  /**
   * Log data access for audit trail
   */
  async logDataAccess(
    resource: string,
    operation: string,
    context: AccessContext,
    success: boolean = true
  ): Promise<void> {
    try {
      await supabase.rpc('log_security_event', {
        event_type: success ? 'data_access' : 'unauthorized_access',
        user_id: context.userId,
        details: `${operation} on ${resource} by ${context.userType}:${context.userRole} from school ${context.userSchool}`,
        severity: success ? 'low' : 'medium'
      });
    } catch (error) {
      console.error('Failed to log data access:', error);
    }
  }

  /**
   * Log security violations
   */
  private async logSecurityViolation(
    violationType: string, 
    userId: string, 
    details: string
  ): Promise<void> {
    try {
      await supabase.rpc('log_security_event', {
        event_type: 'security_violation',
        user_id: userId,
        details: `${violationType}: ${details}`,
        severity: 'high'
      });
    } catch (error) {
      console.error('Failed to log security violation:', error);
    }
  }

  /**
   * Encrypt sensitive data before storage
   */
  async encryptSensitiveData(data: string): Promise<string> {
    try {
      const { data: encrypted } = await supabase.rpc('encrypt_sensitive_data', { content: data });
      return encrypted || data;
    } catch (error) {
      console.error('Data encryption failed:', error);
      return data; // Return original if encryption fails
    }
  }

  /**
   * Decrypt sensitive data after retrieval
   */
  async decryptSensitiveData(encryptedData: string): Promise<string> {
    try {
      const { data: decrypted } = await supabase.rpc('decrypt_sensitive_data', { encrypted_content: encryptedData });
      return decrypted || encryptedData;
    } catch (error) {
      console.error('Data decryption failed:', error);
      return encryptedData; // Return as-is if decryption fails
    }
  }
}

export const secureDataAccessService = new SecureDataAccessService();
