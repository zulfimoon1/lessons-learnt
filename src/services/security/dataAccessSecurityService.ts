
import { securityValidationService } from '../securityValidationService';
import { securityMonitoringService } from '../securityMonitoringService';

class DataAccessSecurityService {
  async validateDataAccess(
    tableName: string,
    operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE',
    userContext: {
      userId?: string;
      userRole?: string;
      userSchool?: string;
    },
    filters?: any
  ): Promise<{ allowed: boolean; reason?: string }> {
    
    // Critical table protection
    const criticalTables = ['mental_health_alerts', 'students', 'teachers'];
    
    if (criticalTables.includes(tableName) && !userContext.userId) {
      await securityValidationService.logSecurityEvent({
        type: 'unauthorized_access',
        userId: undefined,
        details: `Attempted ${operation} on ${tableName} without authentication`,
        severity: 'high'
      });
      return { allowed: false, reason: 'Authentication required for sensitive data' };
    }

    // Role-based access control
    if (tableName === 'mental_health_alerts' && userContext.userRole !== 'doctor' && userContext.userRole !== 'admin') {
      await securityValidationService.logSecurityEvent({
        type: 'unauthorized_access',
        userId: userContext.userId,
        details: `Attempted access to mental health alerts without proper role: ${userContext.userRole}`,
        severity: 'high'
      });
      return { allowed: false, reason: 'Insufficient privileges for mental health data' };
    }

    // School-based isolation
    if (['students', 'teachers', 'class_schedules'].includes(tableName) && 
        filters?.school && filters.school !== userContext.userSchool) {
      await securityValidationService.logSecurityEvent({
        type: 'unauthorized_access',
        userId: userContext.userId,
        details: `Attempted cross-school data access: ${filters.school} != ${userContext.userSchool}`,
        severity: 'medium'
      });
      return { allowed: false, reason: 'Cross-school data access not permitted' };
    }

    // Log successful access
    await securityMonitoringService.auditDataAccess(operation, tableName, 1);

    return { allowed: true };
  }

  async validateSecureAccess(table: string, operation: string): Promise<boolean> {
    try {
      // Basic validation - in production this would be more sophisticated
      const validTables = ['teachers', 'students', 'mental_health_alerts'];
      const validOperations = ['SELECT', 'INSERT', 'UPDATE', 'DELETE'];
      
      if (!validTables.includes(table) || !validOperations.includes(operation)) {
        await securityValidationService.logSecurityEvent({
          type: 'suspicious_activity',
          userId: undefined,
          details: `Invalid access to ${table} with ${operation}`,
          severity: 'medium'
        });
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Security access validation failed:', error);
      return false;
    }
  }
}

export const dataAccessSecurityService = new DataAccessSecurityService();
