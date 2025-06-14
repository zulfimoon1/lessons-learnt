import { securityValidationService } from './securityValidationService';
import { securityMonitoringService } from './securityMonitoringService';
import { supabase } from '@/integrations/supabase/client';

interface AuthenticationResult {
  success: boolean;
  user?: any;
  error?: string;
  requiresMFA?: boolean;
}

class EnhancedSecurityService {
  private sessionTokens = new Map<string, string>();

  // Enhanced authentication with security validation
  async authenticateUser(
    userType: 'student' | 'teacher' | 'admin',
    credentials: any,
    requestContext: {
      userAgent: string;
      ipAddress?: string;
    }
  ): Promise<AuthenticationResult> {
    
    // Rate limiting check
    const identifier = `${requestContext.ipAddress || 'unknown'}:${credentials.email || credentials.fullName}`;
    if (!securityValidationService.checkRateLimit(identifier)) {
      await securityValidationService.logSecurityEvent(
        'rate_limit_exceeded',
        undefined,
        `Authentication rate limit exceeded for ${identifier}`,
        'medium'
      );
      return { success: false, error: 'Too many login attempts. Please try again later.' };
    }

    // Input validation
    const emailValidation = credentials.email ? 
      securityValidationService.validateInput(credentials.email, 'email', { maxLength: 254 }) : 
      { isValid: true, errors: [], riskLevel: 'low' as const };
    
    const nameValidation = credentials.fullName ? 
      securityValidationService.validateInput(credentials.fullName, 'name', { maxLength: 100, requireAlphanumeric: true }) : 
      { isValid: true, errors: [], riskLevel: 'low' as const };

    if (!emailValidation.isValid || !nameValidation.isValid) {
      const errors = [...emailValidation.errors, ...nameValidation.errors];
      await securityValidationService.logSecurityEvent(
        'form_validation_failed',
        undefined,
        `Authentication validation failed: ${errors.join(', ')}`,
        emailValidation.riskLevel === 'high' || nameValidation.riskLevel === 'high' ? 'high' : 'medium'
      );
      return { success: false, error: 'Invalid input provided' };
    }

    // Session security validation
    if (!securityValidationService.validateSessionSecurity()) {
      return { success: false, error: 'Session security validation failed' };
    }

    // Generate CSRF token for session
    const csrfToken = securityValidationService.generateCSRFToken();
    
    try {
      // The actual authentication would happen here
      // For now, this is a placeholder that integrates with existing auth
      
      const sessionId = crypto.randomUUID();
      this.sessionTokens.set(sessionId, csrfToken);
      
      await securityValidationService.logSecurityEvent(
        'unauthorized_access', // This would be 'successful_login' in real implementation
        sessionId,
        `Successful ${userType} authentication`,
        'low'
      );

      return { 
        success: true, 
        user: { 
          sessionId, 
          csrfToken,
          userType 
        } 
      };
    } catch (error) {
      await securityValidationService.logSecurityEvent(
        'unauthorized_access',
        undefined,
        `Authentication error: ${error}`,
        'medium'
      );
      return { success: false, error: 'Authentication failed' };
    }
  }

  // Secure form validation with comprehensive checks
  async validateSecureForm(formData: Record<string, any>, formType: string): Promise<{
    isValid: boolean;
    errors: string[];
    sanitizedData: Record<string, any>;
  }> {
    const errors: string[] = [];
    const sanitizedData: Record<string, any> = {};

    for (const [key, value] of Object.entries(formData)) {
      if (typeof value === 'string') {
        const validation = securityValidationService.validateInput(value, key, {
          maxLength: key === 'email' ? 254 : 1000,
          allowHtml: false,
          requireAlphanumeric: ['name', 'school', 'grade'].includes(key)
        });

        if (!validation.isValid) {
          errors.push(...validation.errors);
        } else {
          // Basic sanitization
          sanitizedData[key] = value.trim();
        }

        // Log high-risk content
        if (validation.riskLevel === 'high') {
          await securityValidationService.logSecurityEvent(
            'suspicious_activity',
            undefined,
            `High-risk content detected in ${formType} form field ${key}`,
            'high'
          );
        }
      } else {
        sanitizedData[key] = value;
      }
    }

    // Audit form submission
    await securityMonitoringService.auditDataAccess('form_submission', formType, 1);

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData
    };
  }

  // Enhanced data access validation
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
      await securityValidationService.logSecurityEvent(
        'unauthorized_access',
        undefined,
        `Attempted ${operation} on ${tableName} without authentication`,
        'high'
      );
      return { allowed: false, reason: 'Authentication required for sensitive data' };
    }

    // Role-based access control
    if (tableName === 'mental_health_alerts' && userContext.userRole !== 'doctor' && userContext.userRole !== 'admin') {
      await securityValidationService.logSecurityEvent(
        'unauthorized_access',
        userContext.userId,
        `Attempted access to mental health alerts without proper role: ${userContext.userRole}`,
        'high'
      );
      return { allowed: false, reason: 'Insufficient privileges for mental health data' };
    }

    // School-based isolation
    if (['students', 'teachers', 'class_schedules'].includes(tableName) && 
        filters?.school && filters.school !== userContext.userSchool) {
      await securityValidationService.logSecurityEvent(
        'unauthorized_access',
        userContext.userId,
        `Attempted cross-school data access: ${filters.school} != ${userContext.userSchool}`,
        'medium'
      );
      return { allowed: false, reason: 'Cross-school data access not permitted' };
    }

    // Log successful access
    await securityMonitoringService.auditDataAccess(operation, tableName, 1);

    return { allowed: true };
  }

  // Security dashboard data
  async getSecurityDashboard() {
    const metrics = await securityMonitoringService.getSecurityMetrics();
    const alerts = securityMonitoringService.getActiveAlerts();
    
    return {
      metrics,
      alerts,
      recommendations: this.generateSecurityRecommendations(metrics, alerts)
    };
  }

  private generateSecurityRecommendations(metrics: any, alerts: any[]): string[] {
    const recommendations: string[] = [];
    
    if (metrics.criticalViolations > 0) {
      recommendations.push('Review and address critical security violations immediately');
    }
    
    if (alerts.filter(a => a.type === 'critical').length > 0) {
      recommendations.push('Critical security alerts require immediate attention');
    }
    
    if (metrics.recentAttempts > 50) {
      recommendations.push('Consider implementing stricter rate limiting');
    }
    
    if (metrics.blockedIPs.length > 10) {
      recommendations.push('Review blocked IP list for potential threats');
    }
    
    return recommendations;
  }

  // Cleanup expired sessions and security data
  cleanup(): void {
    // Clean up expired CSRF tokens
    // In a real implementation, you'd check timestamps
    if (this.sessionTokens.size > 1000) {
      this.sessionTokens.clear();
    }
  }
}

export const enhancedSecurityService = new EnhancedSecurityService();

// Cleanup every hour
setInterval(() => {
  enhancedSecurityService.cleanup();
}, 60 * 60 * 1000);
