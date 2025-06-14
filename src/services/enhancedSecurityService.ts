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
  type: 'login_attempt' | 'password_change' | 'suspicious_activity' | 'account_lockout';
  userId?: string;
  email?: string;
  timestamp: number;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userAgent: string;
  ipAddress?: string;
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

  checkRateLimit(email: string): { allowed: boolean; remainingAttempts: number; lockoutUntil?: number } {
    const now = Date.now();
    const config = SECURITY_CONFIG.rateLimiting;
    
    // Check if account is locked
    const lockoutUntil = this.lockedAccounts.get(email);
    if (lockoutUntil && now < lockoutUntil) {
      return {
        allowed: false,
        remainingAttempts: 0,
        lockoutUntil,
      };
    }

    // Clean old attempts
    const attempts = this.loginAttempts.get(email) || [];
    const windowStart = now - (config.windowMinutes * 60 * 1000);
    const recentAttempts = attempts.filter(attempt => attempt.timestamp > windowStart);
    
    this.loginAttempts.set(email, recentAttempts);

    // Count failed attempts
    const failedAttempts = recentAttempts.filter(attempt => !attempt.success).length;
    const remainingAttempts = Math.max(0, config.maxAttempts - failedAttempts);

    return {
      allowed: failedAttempts < config.maxAttempts,
      remainingAttempts,
    };
  }

  recordLoginAttempt(email: string, success: boolean, userAgent: string): void {
    const now = Date.now();
    const attempt: LoginAttempt = {
      email,
      timestamp: now,
      success,
      userAgent,
    };

    const attempts = this.loginAttempts.get(email) || [];
    attempts.push(attempt);
    this.loginAttempts.set(email, attempts);

    // If failed attempt exceeds limit, lock account
    if (!success) {
      const rateLimit = this.checkRateLimit(email);
      if (!rateLimit.allowed) {
        const lockoutUntil = now + (SECURITY_CONFIG.rateLimiting.lockoutMinutes * 60 * 1000);
        this.lockedAccounts.set(email, lockoutUntil);
        
        this.logSecurityEvent({
          type: 'account_lockout',
          email,
          timestamp: now,
          details: `Account locked due to ${SECURITY_CONFIG.rateLimiting.maxAttempts} failed login attempts`,
          severity: 'high',
          userAgent,
        });
      }
    } else {
      // Clear lockout on successful login
      this.lockedAccounts.delete(email);
    }

    this.logSecurityEvent({
      type: 'login_attempt',
      email,
      timestamp: now,
      details: success ? 'Successful login' : 'Failed login attempt',
      severity: success ? 'low' : 'medium',
      userAgent,
    });
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
