
import { supabase } from '@/integrations/supabase/client';

class SecurityPatchService {
  private async logSecurityEvent(eventType: string, details: string, severity: 'low' | 'medium' | 'high' = 'medium') {
    try {
      // Use the existing log_critical_security_event function instead
      await supabase.rpc('log_critical_security_event', {
        event_type: eventType,
        user_id: null, // Use null for system events
        details,
        severity
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  async validateTableAccess(tableName: string, operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE', userEmail?: string) {
    const sensitiveOperations = ['INSERT', 'UPDATE', 'DELETE'];
    const protectedTables = ['students', 'teachers', 'mental_health_alerts', 'discount_codes', 'subscriptions'];
    
    if (protectedTables.includes(tableName) && sensitiveOperations.includes(operation)) {
      if (!userEmail) {
        await this.logSecurityEvent(
          'unauthorized_access_attempt',
          `Attempted ${operation} on ${tableName} without authentication`,
          'high'
        );
        throw new Error('Authentication required for this operation');
      }

      // Verify user is authorized for this table
      const { data, error } = await supabase
        .from('teachers')
        .select('role, school')
        .eq('email', userEmail)
        .single();

      if (error || !data) {
        await this.logSecurityEvent(
          'invalid_user_access',
          `User ${userEmail} attempted ${operation} on ${tableName} but is not authorized`,
          'high'
        );
        throw new Error('User not authorized for this operation');
      }

      await this.logSecurityEvent(
        'authorized_access',
        `User ${userEmail} performed ${operation} on ${tableName}`,
        'low'
      );
    }

    return true;
  }

  async secureQuery(tableName: string, operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE', userEmail?: string) {
    await this.validateTableAccess(tableName, operation, userEmail);
    
    // Set secure context if admin user
    if (userEmail) {
      const { data } = await supabase
        .from('teachers')
        .select('role')
        .eq('email', userEmail)
        .eq('role', 'admin')
        .single();

      if (data) {
        await supabase.rpc('set_platform_admin_context', { admin_email: userEmail });
      }
    }

    // Return appropriate table query based on tableName
    switch (tableName) {
      case 'students':
        return supabase.from('students');
      case 'teachers':
        return supabase.from('teachers');
      case 'mental_health_alerts':
        return supabase.from('mental_health_alerts');
      case 'discount_codes':
        return supabase.from('discount_codes');
      case 'subscriptions':
        return supabase.from('subscriptions');
      case 'feedback':
        return supabase.from('feedback');
      case 'class_schedules':
        return supabase.from('class_schedules');
      case 'weekly_summaries':
        return supabase.from('weekly_summaries');
      default:
        throw new Error(`Table ${tableName} not supported for secure queries`);
    }
  }

  async auditDataAccess(userEmail: string, dataType: string, recordCount: number) {
    await this.logSecurityEvent(
      'data_access_audit',
      `User ${userEmail} accessed ${recordCount} records of type ${dataType}`,
      'low'
    );
  }
}

export const securityPatchService = new SecurityPatchService();
