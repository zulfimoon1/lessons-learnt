
import { supabase } from '@/integrations/supabase/client';
import { authenticationSecurityService } from './security/authenticationSecurityService';
import { secureSessionManager } from './security/secureSessionManager';
import { enhancedInputValidator } from './security/enhancedInputValidator';
import { securityMonitor } from './security/securityMonitor';
import { csrfProtection } from './security/csrfProtection';

interface SecurityEvent {
  type: 'login_success' | 'login_failed' | 'logout' | 'unauthorized_access' | 'suspicious_activity' | 'rate_limit_exceeded' | 'session_restored' | 'session_error' | 'csrf_violation' | 'test_admin_created' | 'forced_password_reset' | 'security_alert';
  userId?: string;
  timestamp: string;
  details: string;
  userAgent: string;
  ipAddress?: string;
  sessionId?: string;
  errorStack?: string;
}

interface RateLimitConfig {
  maxAttempts: number;
  windowMinutes: number;
}

class SecurityService {
  private defaultRateLimit: RateLimitConfig = {
    maxAttempts: 5,
    windowMinutes: 15
  };

  // Enhanced session validation
  async validateSession(): Promise<boolean> {
    const session = secureSessionManager.getCurrentSession();
    if (!session) {
      return false;
    }

    // Additional security checks could be added here
    return true;
  }

  // Secure CSRF token management
  generateCSRFToken(): string {
    try {
      return csrfProtection.getToken();
    } catch (error) {
      console.error('Failed to generate CSRF token:', error);
      // Fallback token generation
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
  }

  validateCSRFToken(token: string): boolean {
    return csrfProtection.validateToken(token);
  }

  // Enhanced rate limiting with persistent tracking
  async checkRateLimit(identifier: string, action: string, config?: RateLimitConfig): Promise<{ allowed: boolean; message?: string }> {
    const rateConfig = config || this.defaultRateLimit;
    
    try {
      // Check local rate limits first (immediate response)
      const allowed = enhancedInputValidator.checkValidationRateLimit(identifier);
      
      if (!allowed) {
        await this.logSecurityEvent({
          type: 'rate_limit_exceeded',
          timestamp: new Date().toISOString(),
          details: `Rate limit exceeded for ${action} by ${identifier}`,
          userAgent: navigator.userAgent
        });
        
        return { 
          allowed: false, 
          message: `Too many ${action} attempts. Please wait before trying again.` 
        };
      }
      
      return { allowed: true };
    } catch (error) {
      console.error('Rate limit check failed:', error);
      // Default to allowing to avoid blocking legitimate users
      return { allowed: true };
    }
  }

  async recordAttempt(identifier: string, action: string, success: boolean): Promise<void> {
    try {
      const eventType = success ? 'login_success' : 'login_failed';
      await this.logSecurityEvent({
        type: eventType,
        timestamp: new Date().toISOString(),
        details: `${action} attempt by ${identifier}: ${success ? 'success' : 'failed'}`,
        userAgent: navigator.userAgent
      });
    } catch (error) {
      console.error('Failed to record attempt:', error);
    }
  }

  // Enhanced input validation
  validateAndSanitizeInput(input: string, type: 'name' | 'email' | 'school' | 'grade'): { isValid: boolean; sanitized: string; message?: string } {
    const result = enhancedInputValidator.validateInput(input, type);
    
    return {
      isValid: result.isValid,
      sanitized: result.sanitized,
      message: result.errors.length > 0 ? result.errors[0] : undefined
    };
  }

  // Enhanced password validation
  validatePassword(password: string, gradeLevel?: number): { isValid: boolean; message?: string; score?: number } {
    const result = enhancedInputValidator.validatePassword(password, gradeLevel);
    
    let score = 1;
    if (result.isValid) {
      score = password.length >= 8 ? 4 : password.length >= 6 ? 3 : 2;
    }
    
    return {
      isValid: result.isValid,
      message: result.errors.length > 0 ? result.errors[0] : undefined,
      score
    };
  }

  // Enhanced session management
  async clearSession(): Promise<void> {
    try {
      secureSessionManager.clearSession();
      localStorage.removeItem('platformAdmin');
      
      await this.logSecurityEvent({
        type: 'logout',
        timestamp: new Date().toISOString(),
        details: 'User session cleared',
        userAgent: navigator.userAgent
      });
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }

  // Enhanced security monitoring
  monitorSecurityViolations(): void {
    // Security monitoring is now handled by securityMonitor service
    securityMonitor.logSecurityEvent({
      type: 'security_monitoring_started',
      severity: 'low',
      details: 'Security monitoring activated',
      userAgent: navigator.userAgent
    });
  }

  detectConcurrentSessions(): boolean {
    const session = secureSessionManager.getCurrentSession();
    if (!session) return false;
    
    // Enhanced concurrent session detection could be implemented here
    // For now, we rely on the session manager's built-in limits
    return false;
  }

  // Enhanced security logging
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      // Log to security monitor
      securityMonitor.logSecurityEvent({
        type: event.type,
        severity: this.getSeverityLevel(event.type),
        details: event.details,
        userId: event.userId,
        sessionId: event.sessionId,
        userAgent: event.userAgent,
        timestamp: new Date(event.timestamp).getTime()
      });

      // Also log to Supabase for persistence
      await supabase.from('audit_log').insert({
        table_name: 'security_events',
        operation: event.type,
        user_id: event.userId || null,
        new_data: {
          details: event.details,
          timestamp: event.timestamp,
          user_agent: event.userAgent,
          ip_address: event.ipAddress,
          session_id: event.sessionId,
          error_stack: event.errorStack
        }
      });
    } catch (error) {
      // Fallback to console logging if all else fails
      console.warn('Failed to log security event:', event, error);
    }
  }

  private getSeverityLevel(eventType: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (eventType) {
      case 'login_failed':
      case 'unauthorized_access':
      case 'suspicious_activity':
        return 'medium';
      case 'rate_limit_exceeded':
      case 'csrf_violation':
        return 'high';
      case 'security_alert':
        return 'critical';
      default:
        return 'low';
    }
  }

  // Get comprehensive security status
  async getSecurityStatus(): Promise<{
    sessionValid: boolean;
    rateLimitStatus: string;
    securityScore: number;
    recommendations: string[];
    recentEvents: number;
  }> {
    try {
      const sessionValid = await this.validateSession();
      const securitySummary = securityMonitor.getSecuritySummary();
      const scanResults = await securityMonitor.runSecurityScan();
      
      return {
        sessionValid,
        rateLimitStatus: 'Normal',
        securityScore: Math.max(0, 100 - scanResults.riskScore),
        recommendations: scanResults.recommendations,
        recentEvents: securitySummary.totalEvents
      };
    } catch (error) {
      console.error('Failed to get security status:', error);
      return {
        sessionValid: false,
        rateLimitStatus: 'Unknown',
        securityScore: 50,
        recommendations: ['Security status check failed - manual review recommended'],
        recentEvents: 0
      };
    }
  }
}

export const securityService = new SecurityService();
