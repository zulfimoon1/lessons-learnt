
export interface SecurityConfig {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
  rateLimiting: {
    maxAttempts: number;
    windowMinutes: number;
    lockoutMinutes: number;
  };
  session: {
    maxIdleMinutes: number;
    maxSessionMinutes: number;
    rotationIntervalMinutes: number;
  };
}

const SECURITY_CONFIG: SecurityConfig = {
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  },
  rateLimiting: {
    maxAttempts: 5,
    windowMinutes: 15,
    lockoutMinutes: 30,
  },
  session: {
    maxIdleMinutes: 30,
    maxSessionMinutes: 480, // 8 hours
    rotationIntervalMinutes: 60,
  },
};

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

export interface LoginAttempt {
  email: string;
  timestamp: number;
  success: boolean;
  userAgent: string;
  ipAddress?: string;
}

export interface SecurityEvent {
  type: 'login_attempt' | 'password_change' | 'suspicious_activity' | 'account_lockout' | 'login_success' | 'user_created';
  userId?: string;
  email?: string;
  timestamp: number;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userAgent: string;
  ipAddress?: string;
}

export interface ValidationResult {
  isValid: boolean;
  sanitized: string;
  message?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remainingAttempts: number;
  lockoutUntil?: number;
  message?: string;
  delay?: number;
}

class EnhancedSecurityService {
  private loginAttempts: Map<string, LoginAttempt[]> = new Map();
  private lockedAccounts: Map<string, number> = new Map();
  private securityEvents: SecurityEvent[] = [];

  validatePassword(password: string): PasswordValidationResult {
    const errors: string[] = [];
    const config = SECURITY_CONFIG.passwordPolicy;

    // Length check
    if (password.length < config.minLength) {
      errors.push(`Password must be at least ${config.minLength} characters long`);
    }

    // Uppercase check
    if (config.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    // Lowercase check
    if (config.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    // Numbers check
    if (config.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    // Special characters check
    if (config.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Calculate strength
    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    if (errors.length === 0) {
      if (password.length >= 12 && /[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        strength = 'strong';
      } else {
        strength = 'medium';
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      strength,
    };
  }

  checkRateLimit(identifier: string, context?: string): RateLimitResult {
    const now = Date.now();
    const config = SECURITY_CONFIG.rateLimiting;
    
    // Check if account is locked
    const lockoutUntil = this.lockedAccounts.get(identifier);
    if (lockoutUntil && now < lockoutUntil) {
      const minutes = Math.ceil((lockoutUntil - now) / (1000 * 60));
      return {
        allowed: false,
        remainingAttempts: 0,
        lockoutUntil,
        message: `Account locked. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`
      };
    }

    // Clean old attempts
    const attempts = this.loginAttempts.get(identifier) || [];
    const windowStart = now - (config.windowMinutes * 60 * 1000);
    const recentAttempts = attempts.filter(attempt => attempt.timestamp > windowStart);
    
    this.loginAttempts.set(identifier, recentAttempts);

    // Count failed attempts
    const failedAttempts = recentAttempts.filter(attempt => !attempt.success).length;
    const remainingAttempts = Math.max(0, config.maxAttempts - failedAttempts);

    // Calculate progressive delay
    let delay = 0;
    if (failedAttempts > 0) {
      delay = Math.min(1000 * Math.pow(2, failedAttempts - 1), 30000); // Max 30 seconds
    }

    return {
      allowed: failedAttempts < config.maxAttempts,
      remainingAttempts,
      delay,
      message: remainingAttempts <= 2 ? `${remainingAttempts} attempts remaining` : undefined
    };
  }

  recordLoginAttempt(identifier: string, success: boolean, userAgent: string): void {
    const now = Date.now();
    const attempt: LoginAttempt = {
      email: identifier,
      timestamp: now,
      success,
      userAgent,
    };

    const attempts = this.loginAttempts.get(identifier) || [];
    attempts.push(attempt);
    this.loginAttempts.set(identifier, attempts);

    // If failed attempt exceeds limit, lock account
    if (!success) {
      const rateLimit = this.checkRateLimit(identifier);
      if (!rateLimit.allowed) {
        const lockoutUntil = now + (SECURITY_CONFIG.rateLimiting.lockoutMinutes * 60 * 1000);
        this.lockedAccounts.set(identifier, lockoutUntil);
        
        this.logSecurityEvent({
          type: 'account_lockout',
          email: identifier,
          timestamp: now,
          details: `Account locked due to ${SECURITY_CONFIG.rateLimiting.maxAttempts} failed login attempts`,
          severity: 'high',
          userAgent,
        });
      }
    } else {
      // Clear lockout on successful login
      this.lockedAccounts.delete(identifier);
    }

    this.logSecurityEvent({
      type: 'login_attempt',
      email: identifier,
      timestamp: now,
      details: success ? 'Successful login' : 'Failed login attempt',
      severity: success ? 'low' : 'medium',
      userAgent,
    });
  }

  recordAttempt(identifier: string, context: string, success: boolean): void {
    this.recordLoginAttempt(identifier, success, navigator.userAgent);
  }

  validateAndSanitizeInput(input: string, type: 'name' | 'email' | 'school' | 'grade' | 'password'): ValidationResult {
    if (!input || typeof input !== 'string') {
      return {
        isValid: false,
        sanitized: '',
        message: `${type} is required`
      };
    }

    const sanitized = this.sanitizeInput(input);

    switch (type) {
      case 'email':
        if (!this.validateEmail(sanitized)) {
          return {
            isValid: false,
            sanitized,
            message: 'Invalid email format'
          };
        }
        break;
      case 'name':
        if (sanitized.length < 2 || sanitized.length > 100) {
          return {
            isValid: false,
            sanitized,
            message: 'Name must be 2-100 characters'
          };
        }
        break;
      case 'school':
        if (sanitized.length < 2 || sanitized.length > 200) {
          return {
            isValid: false,
            sanitized,
            message: 'School name must be 2-200 characters'
          };
        }
        break;
      case 'grade':
        if (sanitized.length < 1 || sanitized.length > 20) {
          return {
            isValid: false,
            sanitized,
            message: 'Grade must be 1-20 characters'
          };
        }
        break;
      case 'password':
        const passwordValidation = this.validatePassword(input);
        if (!passwordValidation.isValid) {
          return {
            isValid: false,
            sanitized,
            message: passwordValidation.errors.join(', ')
          };
        }
        break;
    }

    return {
      isValid: true,
      sanitized
    };
  }

  logSecurityEvent(event: SecurityEvent): void {
    this.securityEvents.push(event);
    
    // Log to console for monitoring
    console.warn('Security Event:', {
      type: event.type,
      severity: event.severity,
      details: event.details,
      timestamp: new Date(event.timestamp).toISOString(),
    });

    // Keep only recent events (last 1000)
    if (this.securityEvents.length > 1000) {
      this.securityEvents = this.securityEvents.slice(-1000);
    }
  }

  getSecurityEvents(email?: string): SecurityEvent[] {
    if (email) {
      return this.securityEvents.filter(event => event.email === email);
    }
    return [...this.securityEvents];
  }

  getSecurityMetrics() {
    const now = Date.now();
    const last24Hours = now - (24 * 60 * 60 * 1000);
    
    const recentEvents = this.securityEvents.filter(event => event.timestamp > last24Hours);
    
    return {
      totalEvents: recentEvents.length,
      loginAttempts: recentEvents.filter(e => e.type === 'login_attempt').length,
      failedLogins: recentEvents.filter(e => e.type === 'login_attempt' && e.details.includes('Failed')).length,
      accountLockouts: recentEvents.filter(e => e.type === 'account_lockout').length,
      suspiciousActivity: recentEvents.filter(e => e.type === 'suspicious_activity').length,
      criticalEvents: recentEvents.filter(e => e.severity === 'critical').length,
    };
  }

  sanitizeInput(input: string): string {
    // Remove potentially dangerous characters
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  encryptSensitiveData(data: string, key?: string): string {
    // Simple encryption for localStorage - in production use proper encryption
    try {
      const encodedData = btoa(data);
      return encodedData;
    } catch (error) {
      console.error('Encryption failed:', error);
      return data;
    }
  }

  decryptSensitiveData(encryptedData: string, key?: string): string {
    // Simple decryption for localStorage - in production use proper decryption
    try {
      const decodedData = atob(encryptedData);
      return decodedData;
    } catch (error) {
      console.error('Decryption failed:', error);
      return encryptedData;
    }
  }

  checkSessionSecurity(): { valid: boolean; reason?: string } {
    const lastActivity = localStorage.getItem('lastActivity');
    const sessionStart = localStorage.getItem('sessionStart');
    
    if (!lastActivity || !sessionStart) {
      return { valid: false, reason: 'No session found' };
    }

    const now = Date.now();
    const lastActivityTime = parseInt(lastActivity);
    const sessionStartTime = parseInt(sessionStart);
    
    const config = SECURITY_CONFIG.session;
    
    // Check idle timeout
    if (now - lastActivityTime > config.maxIdleMinutes * 60 * 1000) {
      return { valid: false, reason: 'Session idle timeout' };
    }
    
    // Check max session duration
    if (now - sessionStartTime > config.maxSessionMinutes * 60 * 1000) {
      return { valid: false, reason: 'Maximum session duration exceeded' };
    }
    
    return { valid: true };
  }

  updateSessionActivity(): void {
    localStorage.setItem('lastActivity', Date.now().toString());
  }

  startSession(): void {
    const now = Date.now();
    localStorage.setItem('sessionStart', now.toString());
    localStorage.setItem('lastActivity', now.toString());
  }

  endSession(): void {
    localStorage.removeItem('sessionStart');
    localStorage.removeItem('lastActivity');
    localStorage.removeItem('user');
    localStorage.removeItem('teacher');
    localStorage.removeItem('student');
  }
}

export const enhancedSecurityService = new EnhancedSecurityService();
