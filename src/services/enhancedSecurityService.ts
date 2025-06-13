import { supabase } from '@/integrations/supabase/client';

interface SecurityEvent {
  type: 'login_attempt' | 'login_success' | 'login_failed' | 'unauthorized_access' | 'suspicious_activity' | 'session_expired' | 'rate_limit_exceeded';
  userId?: string;
  timestamp: string;
  details: string;
  userAgent: string;
  ipAddress?: string;
  sessionId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface RateLimitConfig {
  maxAttempts: number;
  windowMinutes: number;
  blockDurationMinutes: number;
}

class EnhancedSecurityService {
  private loginAttempts = new Map<string, { count: number; lastAttempt: number; blocked: boolean }>();
  private sessions = new Map<string, { userId: string; createdAt: number; lastActivity: number }>();
  
  private defaultRateLimit: RateLimitConfig = {
    maxAttempts: 5,
    windowMinutes: 15,
    blockDurationMinutes: 30
  };

  // Enhanced session validation with server-side verification
  async validateSession(): Promise<{ isValid: boolean; user?: any; session?: any }> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        this.logSecurityEvent({
          type: 'session_expired',
          timestamp: new Date().toISOString(),
          details: 'Session validation failed',
          userAgent: navigator.userAgent,
          severity: 'medium'
        });
        return { isValid: false };
      }

      // Verify session hasn't been tampered with
      const { data: user, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        this.logSecurityEvent({
          type: 'suspicious_activity',
          timestamp: new Date().toISOString(),
          details: 'Session token invalid or tampered',
          userAgent: navigator.userAgent,
          severity: 'high'
        });
        return { isValid: false };
      }

      // Check session age (max 24 hours)
      const sessionAge = Date.now() - new Date(session.created_at).getTime();
      if (sessionAge > 24 * 60 * 60 * 1000) {
        this.logSecurityEvent({
          type: 'session_expired',
          userId: user.user.id,
          timestamp: new Date().toISOString(),
          details: 'Session expired due to age limit',
          userAgent: navigator.userAgent,
          severity: 'medium'
        });
        await this.clearSession();
        return { isValid: false };
      }

      return { isValid: true, user: user.user, session };
    } catch (error) {
      this.logSecurityEvent({
        type: 'suspicious_activity',
        timestamp: new Date().toISOString(),
        details: `Session validation error: ${error}`,
        userAgent: navigator.userAgent,
        severity: 'high'
      });
      return { isValid: false };
    }
  }

  // Enhanced rate limiting with progressive penalties
  async checkRateLimit(identifier: string, action: string, config?: RateLimitConfig): Promise<{ allowed: boolean; message?: string; delay?: number }> {
    const rateConfig = config || this.defaultRateLimit;
    const now = Date.now();
    const attempts = this.loginAttempts.get(identifier);
    
    if (attempts) {
      const timeSinceLastAttempt = now - attempts.lastAttempt;
      const windowMs = rateConfig.windowMinutes * 60 * 1000;
      const blockDurationMs = rateConfig.blockDurationMinutes * 60 * 1000;
      
      // Check if user is currently blocked
      if (attempts.blocked && timeSinceLastAttempt < blockDurationMs) {
        const remainingTime = Math.ceil((blockDurationMs - timeSinceLastAttempt) / 1000 / 60);
        this.logSecurityEvent({
          type: 'rate_limit_exceeded',
          timestamp: new Date().toISOString(),
          details: `Rate limit exceeded for ${action}: ${identifier}`,
          userAgent: navigator.userAgent,
          severity: 'medium'
        });
        return { 
          allowed: false, 
          message: `Too many failed attempts. Account temporarily locked for ${remainingTime} minutes.`
        };
      }
      
      // Reset if outside time window
      if (timeSinceLastAttempt > windowMs) {
        this.loginAttempts.delete(identifier);
        return { allowed: true };
      }
      
      // Check if approaching limit
      if (attempts.count >= rateConfig.maxAttempts) {
        attempts.blocked = true;
        this.loginAttempts.set(identifier, attempts);
        return { 
          allowed: false, 
          message: `Maximum attempts exceeded. Account locked for ${rateConfig.blockDurationMinutes} minutes.`
        };
      }
      
      // Progressive delay based on attempt count
      const delay = Math.min(attempts.count * 1000, 10000);
      return { allowed: true, delay };
    }
    
    return { allowed: true };
  }

  async recordAttempt(identifier: string, action: string, success: boolean): Promise<void> {
    const now = Date.now();
    
    if (success) {
      this.loginAttempts.delete(identifier);
      this.logSecurityEvent({
        type: 'login_success',
        timestamp: new Date().toISOString(),
        details: `Successful ${action}: ${identifier}`,
        userAgent: navigator.userAgent,
        severity: 'low'
      });
    } else {
      const attempts = this.loginAttempts.get(identifier) || { count: 0, lastAttempt: now, blocked: false };
      attempts.count++;
      attempts.lastAttempt = now;
      this.loginAttempts.set(identifier, attempts);
      
      this.logSecurityEvent({
        type: 'login_failed',
        timestamp: new Date().toISOString(),
        details: `Failed ${action} attempt ${attempts.count}: ${identifier}`,
        userAgent: navigator.userAgent,
        severity: attempts.count >= 3 ? 'high' : 'medium'
      });
    }
  }

  // Enhanced input validation with security focus
  validateAndSanitizeInput(input: string, type: 'name' | 'email' | 'school' | 'grade' | 'password'): { isValid: boolean; sanitized: string; message?: string } {
    if (!input || typeof input !== 'string') {
      return { isValid: false, sanitized: '', message: 'Input cannot be empty' };
    }

    // Check for common injection patterns
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+=/i,
      /\x00/,
      /\x1a/,
      /<iframe/i,
      /eval\(/i,
      /expression\(/i
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(input)) {
        this.logSecurityEvent({
          type: 'suspicious_activity',
          timestamp: new Date().toISOString(),
          details: `Potential injection attempt detected in ${type}: ${input.substring(0, 50)}`,
          userAgent: navigator.userAgent,
          severity: 'high'
        });
        return { isValid: false, sanitized: '', message: 'Invalid characters detected' };
      }
    }

    // Basic sanitization
    let sanitized = input.trim().replace(/[<>]/g, '');
    
    switch (type) {
      case 'email':
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(sanitized) || sanitized.length > 254) {
          return { isValid: false, sanitized, message: 'Invalid email format' };
        }
        break;
      
      case 'name':
        if (sanitized.length < 2 || sanitized.length > 100) {
          return { isValid: false, sanitized, message: 'Name must be between 2 and 100 characters' };
        }
        sanitized = sanitized.replace(/[^a-zA-Z\s'-]/g, '');
        break;
      
      case 'school':
        if (sanitized.length < 2 || sanitized.length > 100) {
          return { isValid: false, sanitized, message: 'School name must be between 2 and 100 characters' };
        }
        break;
      
      case 'grade':
        if (!/^[0-9]{1,2}$|^K$/.test(sanitized)) {
          return { isValid: false, sanitized, message: 'Invalid grade format' };
        }
        break;
      
      case 'password':
        if (sanitized.length < 8) {
          return { isValid: false, sanitized, message: 'Password must be at least 8 characters long' };
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(sanitized)) {
          return { isValid: false, sanitized, message: 'Password must contain uppercase, lowercase, and number' };
        }
        break;
    }
    
    return { isValid: true, sanitized };
  }

  // Enhanced session management
  async clearSession(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      }
      
      // Clear all local storage
      localStorage.clear();
      sessionStorage.clear();
      
      this.logSecurityEvent({
        type: 'login_attempt',
        timestamp: new Date().toISOString(),
        details: 'Session cleared successfully',
        userAgent: navigator.userAgent,
        severity: 'low'
      });
    } catch (error) {
      this.logSecurityEvent({
        type: 'suspicious_activity',
        timestamp: new Date().toISOString(),
        details: `Error clearing session: ${error}`,
        userAgent: navigator.userAgent,
        severity: 'medium'
      });
    }
  }

  // Enhanced security monitoring
  detectSuspiciousActivity(): boolean {
    try {
      // Check for rapid-fire requests
      const now = Date.now();
      const recentLogs = Array.from(this.loginAttempts.values())
        .filter(attempt => now - attempt.lastAttempt < 60000); // Last minute
      
      if (recentLogs.length > 10) {
        this.logSecurityEvent({
          type: 'suspicious_activity',
          timestamp: new Date().toISOString(),
          details: `Suspicious activity detected: ${recentLogs.length} attempts in last minute`,
          userAgent: navigator.userAgent,
          severity: 'high'
        });
        return true;
      }
      
      // Check for multiple failed attempts from same source
      const failedAttempts = Array.from(this.loginAttempts.values())
        .filter(attempt => attempt.count >= 3);
      
      if (failedAttempts.length > 0) {
        this.logSecurityEvent({
          type: 'suspicious_activity',
          timestamp: new Date().toISOString(),
          details: `Multiple failed login attempts detected`,
          userAgent: navigator.userAgent,
          severity: 'medium'
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error detecting suspicious activity:', error);
      return false;
    }
  }

  // Enhanced security event logging
  logSecurityEvent(event: SecurityEvent): void {
    try {
      // Log to console for debugging
      console.log(`[SECURITY] ${event.type}: ${event.details}`);
      
      // Store in local storage for audit trail
      const existingLogs = JSON.parse(localStorage.getItem('security_logs') || '[]');
      existingLogs.push(event);
      
      // Keep only last 100 events
      if (existingLogs.length > 100) {
        existingLogs.splice(0, existingLogs.length - 100);
      }
      
      localStorage.setItem('security_logs', JSON.stringify(existingLogs));
      
      // Log to Supabase for server-side tracking
      if (event.severity === 'high' || event.severity === 'critical') {
        supabase.rpc('log_security_event', {
          event_type: event.type,
          user_id: event.userId || null,
          details: event.details,
          severity: event.severity
        }).catch(error => {
          console.error('Failed to log security event to server:', error);
        });
      }
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  // Get security metrics for monitoring
  getSecurityMetrics(): { failedLogins: number; blockedIPs: number; suspiciousActivity: number } {
    const failedLogins = Array.from(this.loginAttempts.values())
      .reduce((sum, attempt) => sum + attempt.count, 0);
    
    const blockedIPs = Array.from(this.loginAttempts.values())
      .filter(attempt => attempt.blocked).length;
    
    const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
    const suspiciousActivity = logs.filter((log: SecurityEvent) => 
      log.type === 'suspicious_activity' && 
      new Date(log.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000
    ).length;
    
    return { failedLogins, blockedIPs, suspiciousActivity };
  }
}

export const enhancedSecurityService = new EnhancedSecurityService();
