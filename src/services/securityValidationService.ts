interface SecurityEvent {
  type: string;
  userId?: string;
  details: string;
  severity: 'low' | 'medium' | 'high';
  timestamp?: number;
}

class SecurityValidationService {
  private eventLog: SecurityEvent[] = [];
  private readonly MAX_LOG_SIZE = 1000;

  // Log security events (now using in-memory storage instead of localStorage)
  logSecurityEvent(event: SecurityEvent): void {
    try {
      const logEvent = {
        ...event,
        timestamp: event.timestamp || Date.now()
      };

      this.eventLog.push(logEvent);
      
      // Keep log size manageable
      if (this.eventLog.length > this.MAX_LOG_SIZE) {
        this.eventLog = this.eventLog.slice(-this.MAX_LOG_SIZE);
      }

      // Log to console for development
      console.log('Security Event:', logEvent);

      // In production, you would send high-severity events to your logging service
      if (event.severity === 'high') {
        console.error('HIGH SEVERITY SECURITY EVENT:', logEvent);
      }
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  // Get recent security events
  getRecentEvents(limit: number = 50): SecurityEvent[] {
    return this.eventLog.slice(-limit);
  }

  // Rate limiting implementation
  private rateLimitStore = new Map<string, { count: number; firstAttempt: number }>();

  checkRateLimit(
    identifier: string, 
    maxAttempts: number = 10, 
    windowMs: number = 60000
  ): boolean {
    const now = Date.now();
    const record = this.rateLimitStore.get(identifier);

    if (!record) {
      this.rateLimitStore.set(identifier, { count: 1, firstAttempt: now });
      return true;
    }

    // Reset if window has passed
    if (now - record.firstAttempt > windowMs) {
      this.rateLimitStore.set(identifier, { count: 1, firstAttempt: now });
      return true;
    }

    // Check if limit exceeded
    if (record.count >= maxAttempts) {
      this.logSecurityEvent({
        type: 'rate_limit_exceeded',
        details: `Rate limit exceeded for ${identifier}`,
        severity: 'medium'
      });
      return false;
    }

    // Increment counter
    record.count++;
    return true;
  }

  // Validate session security
  validateSessionSecurity(): boolean {
    try {
      // Check if running in secure context (HTTPS in production)
      if (typeof window !== 'undefined') {
        const isSecure = window.location.protocol === 'https:' || 
                        window.location.hostname === 'localhost';
        
        if (!isSecure) {
          this.logSecurityEvent({
            type: 'insecure_context',
            details: 'Application not running in secure context',
            severity: 'high'
          });
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Session security validation failed:', error);
      return false;
    }
  }

  // Input validation
  validateInput(input: string, maxLength: number = 1000): boolean {
    if (!input || typeof input !== 'string') {
      return false;
    }

    if (input.length > maxLength) {
      this.logSecurityEvent({
        type: 'input_too_long',
        details: `Input exceeds maximum length: ${input.length}/${maxLength}`,
        severity: 'medium'
      });
      return false;
    }

    // Check for potentially malicious patterns
    const maliciousPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /data:text\/html/gi
    ];

    for (const pattern of maliciousPatterns) {
      if (pattern.test(input)) {
        this.logSecurityEvent({
          type: 'malicious_input_detected',
          details: `Potentially malicious input pattern detected`,
          severity: 'high'
        });
        return false;
      }
    }

    return true;
  }

  // Clear rate limiting for specific identifier
  clearRateLimit(identifier: string): void {
    this.rateLimitStore.delete(identifier);
  }

  // Get security statistics
  getSecurityStats(): {
    totalEvents: number;
    highSeverityEvents: number;
    recentEvents: number;
  } {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);

    return {
      totalEvents: this.eventLog.length,
      highSeverityEvents: this.eventLog.filter(e => e.severity === 'high').length,
      recentEvents: this.eventLog.filter(e => (e.timestamp || 0) > oneHourAgo).length
    };
  }
}

export const securityValidationService = new SecurityValidationService();
