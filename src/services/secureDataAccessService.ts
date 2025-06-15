
import { supabase } from '@/integrations/supabase/client';
import { enhancedSecurityValidationService } from './enhancedSecurityValidationService';

interface AccessContext {
  userId?: string;
  userRole?: string;
  userSchool?: string;
  userType?: 'teacher' | 'student' | 'admin';
}

class SecureDataAccessService {
  // Secure mental health alerts access
  async getMentalHealthAlerts(context: AccessContext) {
    try {
      // Validate user has appropriate role
      if (!context.userRole || !['doctor', 'admin'].includes(context.userRole)) {
        await enhancedSecurityValidationService.logSecurityEvent({
          type: 'unauthorized_access',
          userId: context.userId,
          details: `Unauthorized mental health alerts access attempt by role: ${context.userRole}`,
          severity: 'high'
        });
        throw new Error('Insufficient privileges to access mental health alerts');
      }

      // Rate limiting check
      const rateLimitKey = `mental_health_${context.userId}`;
      if (!enhancedSecurityValidationService.checkRateLimit(rateLimitKey, 10, 60000)) {
        throw new Error('Rate limit exceeded for mental health alerts access');
      }

      const { data, error } = await supabase
        .from('mental_health_alerts')
        .select('*')
        .eq('school', context.userSchool)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Log successful access
      await enhancedSecurityValidationService.logSecurityEvent({
        type: 'suspicious_activity', // Using valid enum value for audit trail
        userId: context.userId,
        details: `Mental health alerts accessed successfully for school: ${context.userSchool}`,
        severity: 'low'
      });

      return data;
    } catch (error) {
      await enhancedSecurityValidationService.logSecurityEvent({
        type: 'unauthorized_access',
        userId: context.userId,
        details: `Mental health alerts access failed: ${error}`,
        severity: 'medium'
      });
      throw error;
    }
  }

  // Secure student data access
  async getStudentData(context: AccessContext) {
    try {
      // Rate limiting
      const rateLimitKey = `student_data_${context.userId}`;
      if (!enhancedSecurityValidationService.checkRateLimit(rateLimitKey, 20, 60000)) {
        throw new Error('Rate limit exceeded for student data access');
      }

      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('school', context.userSchool);

      if (error) throw error;

      // Log access for audit trail
      await enhancedSecurityValidationService.logSecurityEvent({
        type: 'suspicious_activity',
        userId: context.userId,
        details: `Student data accessed for school: ${context.userSchool}`,
        severity: 'low'
      });

      return data;
    } catch (error) {
      await enhancedSecurityValidationService.logSecurityEvent({
        type: 'unauthorized_access',
        userId: context.userId,
        details: `Student data access failed: ${error}`,
        severity: 'medium'
      });
      throw error;
    }
  }

  // Secure chat messages access
  async getChatMessages(sessionId: string, context: AccessContext) {
    try {
      // Rate limiting
      const rateLimitKey = `chat_messages_${context.userId}`;
      if (!enhancedSecurityValidationService.checkRateLimit(rateLimitKey, 50, 60000)) {
        throw new Error('Rate limit exceeded for chat messages access');
      }

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('sent_at', { ascending: true });

      if (error) throw error;

      return data;
    } catch (error) {
      await enhancedSecurityValidationService.logSecurityEvent({
        type: 'unauthorized_access',
        userId: context.userId,
        details: `Chat messages access failed for session ${sessionId}: ${error}`,
        severity: 'medium'
      });
      throw error;
    }
  }

  // Secure feedback data access with school isolation
  async getFeedbackData(context: AccessContext) {
    try {
      // Rate limiting
      const rateLimitKey = `feedback_${context.userId}`;
      if (!enhancedSecurityValidationService.checkRateLimit(rateLimitKey, 30, 60000)) {
        throw new Error('Rate limit exceeded for feedback access');
      }

      const { data, error } = await supabase
        .from('feedback')
        .select(`
          *,
          class_schedules!inner(school, grade, subject, lesson_topic)
        `)
        .eq('class_schedules.school', context.userSchool);

      if (error) throw error;

      return data;
    } catch (error) {
      await enhancedSecurityValidationService.logSecurityEvent({
        type: 'unauthorized_access',
        userId: context.userId,
        details: `Feedback data access failed: ${error}`,
        severity: 'medium'
      });
      throw error;
    }
  }

  // Validate data access permissions
  async validateAccess(tableName: string, operation: string, context: AccessContext): Promise<boolean> {
    try {
      const protectedTables = ['mental_health_alerts', 'students', 'teachers', 'chat_messages'];
      
      if (protectedTables.includes(tableName)) {
        // Log access attempt
        await enhancedSecurityValidationService.logSecurityEvent({
          type: 'suspicious_activity',
          userId: context.userId,
          details: `Access validation for ${operation} on ${tableName}`,
          severity: 'low'
        });

        // Additional validation for sensitive tables
        if (tableName === 'mental_health_alerts' && !['doctor', 'admin'].includes(context.userRole || '')) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Access validation failed:', error);
      return false;
    }
  }
}

export const secureDataAccessService = new SecureDataAccessService();
