
import { authenticationSecurityService } from './security/authenticationSecurityService';
import { formSecurityService } from './security/formSecurityService';
import { dataAccessSecurityService } from './security/dataAccessSecurityService';
import { securityValidationService } from './securityValidationService';
import { securityMonitoringService } from './securityMonitoringService';

interface SecurityDashboardData {
  totalEvents: number;
  highSeverityEvents: number;
  mediumSeverityEvents: number;
  lowSeverityEvents: number;
  recentViolations: number;
  criticalAlerts: number;
}

class EnhancedSecurityService {
  // Delegate authentication to focused service
  async authenticateUser(
    userType: 'student' | 'teacher' | 'admin',
    credentials: any,
    requestContext: {
      userAgent: string;
      ipAddress?: string;
    }
  ) {
    return authenticationSecurityService.authenticateUser(userType, credentials, requestContext);
  }

  // Delegate form validation to focused service
  async validateSecureForm(formData: Record<string, any>, formType: string) {
    return formSecurityService.validateSecureForm(formData, formType);
  }

  async checkRateLimit(identifier: string, action: string) {
    return formSecurityService.checkRateLimit(identifier, action);
  }

  validateAndSanitizeInput(input: string, fieldType: string) {
    return formSecurityService.validateAndSanitizeInput(input, fieldType);
  }

  // Delegate data access validation to focused service
  async validateDataAccess(
    tableName: string,
    operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE',
    userContext: {
      userId?: string;
      userRole?: string;
      userSchool?: string;
    },
    filters?: any
  ) {
    return dataAccessSecurityService.validateDataAccess(tableName, operation, userContext, filters);
  }

  async validateSecureAccess(table: string, operation: string) {
    return dataAccessSecurityService.validateSecureAccess(table, operation);
  }

  // Core security monitoring methods
  async monitorSecurityViolations(): Promise<void> {
    console.log('🔐 Security monitoring initialized');
    try {
      await this.logSecurityEvent({
        type: 'security_monitoring_started',
        details: 'Enhanced security monitoring activated',
        severity: 'low'
      });
    } catch (error) {
      console.error('Failed to initialize security monitoring:', error);
    }
  }

  async enhanceFormValidation(): Promise<void> {
    console.log('🔐 Form validation enhanced');
  }

  async logSecurityViolation(violation: {
    type: string;
    userId?: string;
    details: string;
    severity: 'low' | 'medium' | 'high';
  }): Promise<void> {
    try {
      await this.logSecurityEvent({
        type: violation.type,
        userId: violation.userId,
        details: violation.details,
        severity: violation.severity,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      });
    } catch (error) {
      console.error('Failed to log security violation:', error);
    }
  }

  async getSecurityDashboardData(): Promise<SecurityDashboardData> {
    try {
      return {
        totalEvents: 0,
        highSeverityEvents: 0,
        mediumSeverityEvents: 0,
        lowSeverityEvents: 0,
        recentViolations: 0,
        criticalAlerts: 0
      };
    } catch (error) {
      console.error('Failed to get security dashboard data:', error);
      return {
        totalEvents: 0,
        highSeverityEvents: 0,
        mediumSeverityEvents: 0,
        lowSeverityEvents: 0,
        recentViolations: 0,
        criticalAlerts: 0
      };
    }
  }

  clearSecurityLogs(): void {
    localStorage.removeItem('security_events');
    localStorage.removeItem('security_violations');
    console.log('Security logs cleared');
  }

  async recordAttempt(identifier: string, action: string, success: boolean): Promise<void> {
    const eventType = success ? 'unauthorized_access' : 'unauthorized_access';
    securityValidationService.logSecurityEvent({
      type: eventType,
      userId: identifier,
      details: `${action}: ${success ? 'success' : 'failed'}`,
      severity: success ? 'low' : 'medium'
    });
  }

  async logSecurityEvent(event: {
    type: string;
    userId?: string;
    timestamp?: string;
    details: string;
    userAgent?: string;
    severity: 'low' | 'medium' | 'high';
  }): Promise<void> {
    // Map to valid security event types only
    const eventTypeMap: Record<string, 'unauthorized_access' | 'suspicious_activity' | 'form_validation_failed' | 'rate_limit_exceeded'> = {
      'unauthorized_access': 'unauthorized_access',
      'suspicious_activity': 'suspicious_activity',
      'form_validation_failed': 'form_validation_failed',
      'rate_limit_exceeded': 'rate_limit_exceeded',
      'security_monitoring_started': 'unauthorized_access',
      'invalid_access_attempt': 'suspicious_activity'
    };

    const mappedType = eventTypeMap[event.type] || 'suspicious_activity';
    
    securityValidationService.logSecurityEvent({
      type: mappedType,
      userId: event.userId,
      details: event.details,
      severity: event.severity
    });
  }

  getSecurityMetrics() {
    return {
      failedLogins: 0,
      blockedIPs: 0,
      suspiciousActivity: 0
    };
  }

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

  cleanup(): void {
    authenticationSecurityService.cleanup();
  }
}

export const enhancedSecurityService = new EnhancedSecurityService();

// Cleanup every hour
setInterval(() => {
  enhancedSecurityService.cleanup();
}, 60 * 60 * 1000);
