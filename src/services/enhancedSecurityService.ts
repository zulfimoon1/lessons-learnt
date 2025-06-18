import { supabase } from '@/integrations/supabase/client';
import { inputValidationService } from './inputValidationService';

interface SecurityEvent {
  type: string;
  userId?: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

interface SecurityViolation {
  type: string;
  userId?: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

interface SecurityDashboardData {
  totalEvents: number;
  highSeverityEvents: number;
  mediumSeverityEvents: number;
  lowSeverityEvents: number;
  recentViolations: number;
  activeSessions: number;
  failedLogins: number;
  suspiciousActivities: number;
  lastSecurityScan: string;
}

class EnhancedSecurityService {
  private readonly maxLoginAttempts = 5;
  private readonly lockoutDuration = 15 * 60 * 1000; // 15 minutes

  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      // Use the enhanced security logging function
      await supabase.rpc('log_security_event_enhanced', {
        event_type: event.type,
        user_id: event.userId,
        details: inputValidationService.sanitizeInput(event.details),
        severity: event.severity,
        metadata: event.metadata || {}
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
      // Store locally as fallback
      this.storeSecurityEventLocally(event);
    }
  }

  async logSecurityViolation(violation: SecurityViolation): Promise<void> {
    // Alias for logSecurityEvent for backward compatibility
    await this.logSecurityEvent(violation);
  }

  async validateSecureAccess(table: string, operation: string): Promise<boolean> {
    try {
      // Check if user has valid session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        await this.logSecurityEvent({
          type: 'unauthorized_access_attempt',
          details: `Unauthorized ${operation} attempt on ${table}`,
          severity: 'high'
        });
        return false;
      }

      // Additional security checks for sensitive tables
      if (['mental_health_alerts', 'audit_log'].includes(table)) {
        // Check if user has appropriate role
        const { data: teacher } = await supabase
          .from('teachers')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (!teacher || !['admin', 'doctor'].includes(teacher.role)) {
          await this.logSecurityEvent({
            type: 'insufficient_privileges',
            userId: session.user.id,
            details: `Insufficient privileges for ${operation} on ${table}`,
            severity: 'high'
          });
          return false;
        }
      }

      return true;
    } catch (error) {
      await this.logSecurityEvent({
        type: 'access_validation_error',
        details: `Error validating access: ${error}`,
        severity: 'medium'
      });
      return false;
    }
  }

  async validateSecureForm(formData: Record<string, any>, formAction: string): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Validate CSRF token
      const csrfToken = formData.csrf_token;
      const sessionToken = sessionStorage.getItem('csrf_token');
      
      if (!this.validateCSRFToken(csrfToken, sessionToken || '')) {
        errors.push('CSRF token validation failed');
      }

      // Validate each form field
      for (const [key, value] of Object.entries(formData)) {
        if (key === 'csrf_token') continue;
        
        if (typeof value === 'string') {
          let fieldType: 'email' | 'password' | 'name' | 'text' = 'text';
          
          if (key.toLowerCase().includes('email')) fieldType = 'email';
          else if (key.toLowerCase().includes('password')) fieldType = 'password';
          else if (key.toLowerCase().includes('name')) fieldType = 'name';
          
          if (!this.validateInputSecurity(value, fieldType)) {
            errors.push(`Invalid input for field: ${key}`);
          }
        }
      }

      // Check for suspicious patterns
      const combinedText = Object.values(formData).join(' ');
      if (this.detectSuspiciousContent(combinedText)) {
        errors.push('Suspicious content detected');
        await this.logSecurityEvent({
          type: 'suspicious_form_content',
          details: `Suspicious content in form: ${formAction}`,
          severity: 'high'
        });
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    } catch (error) {
      return {
        isValid: false,
        errors: ['Form validation error']
      };
    }
  }

  async getSecurityDashboardData(): Promise<SecurityDashboardData> {
    try {
      // Get recent security events from audit log
      const { data: recentEvents } = await supabase
        .from('audit_log')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      const violations = recentEvents?.filter(event => 
        event.operation?.includes('violation') || 
        event.operation?.includes('failed') ||
        event.operation?.includes('suspicious')
      ).length || 0;

      const failedLogins = recentEvents?.filter(event => event.operation === 'login_failed').length || 0;
      const suspiciousActivities = recentEvents?.filter(event => event.operation?.includes('suspicious')).length || 0;
      
      // Calculate severity breakdown
      const highSeverityEvents = recentEvents?.filter(event => 
        event.new_data && typeof event.new_data === 'object' && 
        'severity' in event.new_data && event.new_data.severity === 'high'
      ).length || 0;
      
      const mediumSeverityEvents = recentEvents?.filter(event => 
        event.new_data && typeof event.new_data === 'object' && 
        'severity' in event.new_data && event.new_data.severity === 'medium'
      ).length || 0;
      
      const lowSeverityEvents = recentEvents?.filter(event => 
        event.new_data && typeof event.new_data === 'object' && 
        'severity' in event.new_data && event.new_data.severity === 'low'
      ).length || 0;

      return {
        totalEvents: recentEvents?.length || 0,
        highSeverityEvents,
        mediumSeverityEvents,
        lowSeverityEvents,
        recentViolations: violations,
        activeSessions: 0, // Would need session tracking
        failedLogins,
        suspiciousActivities,
        lastSecurityScan: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting security dashboard data:', error);
      return {
        totalEvents: 0,
        highSeverityEvents: 0,
        mediumSeverityEvents: 0,
        lowSeverityEvents: 0,
        recentViolations: 0,
        activeSessions: 0,
        failedLogins: 0,
        suspiciousActivities: 0,
        lastSecurityScan: new Date().toISOString()
      };
    }
  }

  monitorSecurityViolations(): void {
    // Set up monitoring for security violations
    console.log('Security violation monitoring initialized');
    
    // Monitor for suspicious activity patterns
    setInterval(() => {
      this.checkForAnomalousActivity();
    }, 60000); // Check every minute
  }

  enhanceFormValidation(): void {
    // Enhance form validation across the application
    console.log('Enhanced form validation initialized');
    
    // Add event listeners for real-time validation
    document.addEventListener('input', this.handleInputValidation.bind(this));
    document.addEventListener('submit', this.handleFormValidation.bind(this));
  }

  private async checkForAnomalousActivity(): Promise<void> {
    try {
      // Check for unusual patterns in recent activity
      const dashboardData = await this.getSecurityDashboardData();
      
      if (dashboardData.recentViolations > 10) {
        await this.logSecurityEvent({
          type: 'anomalous_activity_detected',
          details: `High number of security violations: ${dashboardData.recentViolations}`,
          severity: 'high'
        });
      }
    } catch (error) {
      console.error('Error checking for anomalous activity:', error);
    }
  }

  private handleInputValidation(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input || !input.value) return;

    const isValid = this.validateInputSecurity(input.value, 'text');
    if (!isValid) {
      input.classList.add('border-red-500');
    } else {
      input.classList.remove('border-red-500');
    }
  }

  private async handleFormValidation(event: Event): Promise<void> {
    const form = event.target as HTMLFormElement;
    if (!form) return;

    const formData = new FormData(form);
    const data: Record<string, any> = {};
    
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    const validation = await this.validateSecureForm(data, form.action);
    if (!validation.isValid) {
      event.preventDefault();
      console.warn('Form validation failed:', validation.errors);
    }
  }

  private detectSuspiciousContent(text: string): boolean {
    const suspiciousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /(union|select|insert|update|delete|drop|create|alter)\s+/gi
    ];

    return suspiciousPatterns.some(pattern => pattern.test(text));
  }

  private storeSecurityEventLocally(event: SecurityEvent): void {
    try {
      const existingLogs = JSON.parse(localStorage.getItem('security_logs') || '[]');
      existingLogs.push({
        ...event,
        timestamp: new Date().toISOString(),
        source: 'local_fallback'
      });
      
      // Keep only last 100 events locally
      if (existingLogs.length > 100) {
        existingLogs.splice(0, existingLogs.length - 100);
      }
      
      localStorage.setItem('security_logs', JSON.stringify(existingLogs));
    } catch (error) {
      console.error('Failed to store security event locally:', error);
    }
  }

  async validateLoginAttempt(identifier: string): Promise<boolean> {
    const attempts = this.getLoginAttempts(identifier);
    const now = Date.now();
    
    // Remove old attempts (older than lockout duration)
    const recentAttempts = attempts.filter(
      attempt => now - attempt < this.lockoutDuration
    );
    
    if (recentAttempts.length >= this.maxLoginAttempts) {
      await this.logSecurityEvent({
        type: 'login_rate_limit_exceeded',
        details: `Rate limit exceeded for identifier: ${identifier}`,
        severity: 'high',
        metadata: { identifier, attemptCount: recentAttempts.length }
      });
      return false;
    }
    
    return true;
  }

  recordLoginAttempt(identifier: string, success: boolean): void {
    const key = `login_attempts_${identifier}`;
    const attempts = this.getLoginAttempts(identifier);
    attempts.push(Date.now());
    
    // Keep only recent attempts
    const now = Date.now();
    const recentAttempts = attempts.filter(
      attempt => now - attempt < this.lockoutDuration
    );
    
    localStorage.setItem(key, JSON.stringify(recentAttempts));
    
    // Log the attempt
    this.logSecurityEvent({
      type: success ? 'login_success' : 'login_failure',
      details: `Login ${success ? 'successful' : 'failed'} for: ${identifier}`,
      severity: success ? 'low' : 'medium',
      metadata: { identifier, success, attemptCount: recentAttempts.length }
    });
  }

  private getLoginAttempts(identifier: string): number[] {
    try {
      const key = `login_attempts_${identifier}`;
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch {
      return [];
    }
  }

  validateInputSecurity(input: string, type: 'email' | 'password' | 'name' | 'text'): boolean {
    switch (type) {
      case 'email':
        return inputValidationService.validateEmail(input);
      case 'password':
        return inputValidationService.validatePassword(input).isValid;
      case 'name':
        return inputValidationService.validatePersonName(input);
      case 'text':
        return inputValidationService.validateTextContent(input);
      default:
        return false;
    }
  }

  generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  validateCSRFToken(token: string, expectedToken: string): boolean {
    if (!token || !expectedToken || token.length !== expectedToken.length) {
      return false;
    }
    
    // Timing-safe comparison
    let result = 0;
    for (let i = 0; i < token.length; i++) {
      result |= token.charCodeAt(i) ^ expectedToken.charCodeAt(i);
    }
    
    return result === 0;
  }

  async checkSessionSecurity(): Promise<boolean> {
    try {
      // Verify current session is still valid
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        await this.logSecurityEvent({
          type: 'invalid_session_detected',
          details: 'Session validation failed',
          severity: 'medium'
        });
        return false;
      }
      
      // Check if session is expired
      const now = Math.floor(Date.now() / 1000);
      if (session.expires_at && session.expires_at < now) {
        await this.logSecurityEvent({
          type: 'expired_session_detected',
          details: 'Expired session detected',
          severity: 'medium'
        });
        return false;
      }
      
      return true;
    } catch (error) {
      await this.logSecurityEvent({
        type: 'session_check_error',
        details: `Session security check failed: ${error}`,
        severity: 'high'
      });
      return false;
    }
  }

  sanitizeFormData(formData: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(formData)) {
      if (typeof value === 'string') {
        sanitized[key] = inputValidationService.sanitizeInput(value);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }
}

export const enhancedSecurityService = new EnhancedSecurityService();
