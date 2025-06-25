
interface MFARequirement {
  userId: string;
  userRole: string;
  isRequired: boolean;
  lastVerified: Date | null;
  verificationMethod: 'totp' | 'sms' | 'email' | null;
}

interface MFAValidationResult {
  isValid: boolean;
  requiresSetup: boolean;
  lastVerified: Date | null;
  nextVerificationRequired: Date | null;
}

class MFAEnforcementService {
  private readonly MFA_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
  private readonly PRIVILEGED_ROLES = ['admin', 'doctor', 'platform_admin'];

  checkMFARequirement(userId: string, userRole: string, userType: 'teacher' | 'student' | 'admin'): MFARequirement {
    // MFA required for privileged roles
    const isRequired = this.PRIVILEGED_ROLES.includes(userRole) || userType === 'admin';
    
    const storedMFA = this.getStoredMFAStatus(userId);
    
    return {
      userId,
      userRole,
      isRequired,
      lastVerified: storedMFA?.lastVerified || null,
      verificationMethod: storedMFA?.method || null
    };
  }

  validateMFAStatus(userId: string, userRole: string): MFAValidationResult {
    const requirement = this.checkMFARequirement(userId, userRole, 'teacher');
    
    if (!requirement.isRequired) {
      return {
        isValid: true,
        requiresSetup: false,
        lastVerified: null,
        nextVerificationRequired: null
      };
    }

    const now = new Date();
    const lastVerified = requirement.lastVerified;
    
    if (!lastVerified) {
      return {
        isValid: false,
        requiresSetup: true,
        lastVerified: null,
        nextVerificationRequired: now
      };
    }

    const timeSinceVerification = now.getTime() - lastVerified.getTime();
    const isStillValid = timeSinceVerification < this.MFA_TIMEOUT;
    
    return {
      isValid: isStillValid,
      requiresSetup: false,
      lastVerified,
      nextVerificationRequired: isStillValid ? 
        new Date(lastVerified.getTime() + this.MFA_TIMEOUT) : 
        now
    };
  }

  enforceSessionSecurity(userId: string, userRole: string, sessionData: any): boolean {
    const mfaStatus = this.validateMFAStatus(userId, userRole);
    
    // Log MFA enforcement check
    this.logMFAEvent(userId, 'mfa_check', {
      required: this.PRIVILEGED_ROLES.includes(userRole),
      valid: mfaStatus.isValid,
      role: userRole
    });

    // Allow access for non-privileged users
    if (!this.PRIVILEGED_ROLES.includes(userRole)) {
      return true;
    }

    // Enforce MFA for privileged users
    return mfaStatus.isValid;
  }

  recordMFAVerification(userId: string, method: 'totp' | 'sms' | 'email'): void {
    const mfaData = {
      userId,
      lastVerified: new Date(),
      method,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem(`mfa_${userId}`, JSON.stringify(mfaData));
    
    this.logMFAEvent(userId, 'mfa_verified', { method });
  }

  getPrivilegedUserActivity(timeRange: number = 24 * 60 * 60 * 1000): any[] {
    try {
      const events = JSON.parse(localStorage.getItem('soc2_audit_events') || '[]');
      const cutoff = Date.now() - timeRange;
      
      return events.filter((event: any) => {
        const eventTime = new Date(event.timestamp).getTime();
        return eventTime > cutoff && 
               event.details?.role && 
               this.PRIVILEGED_ROLES.includes(event.details.role);
      });
    } catch (error) {
      console.error('Failed to get privileged user activity:', error);
      return [];
    }
  }

  private getStoredMFAStatus(userId: string): { lastVerified: Date; method: string } | null {
    try {
      const stored = localStorage.getItem(`mfa_${userId}`);
      if (!stored) return null;
      
      const data = JSON.parse(stored);
      return {
        lastVerified: new Date(data.lastVerified),
        method: data.method
      };
    } catch (error) {
      return null;
    }
  }

  private logMFAEvent(userId: string, eventType: string, details: any): void {
    try {
      const event = {
        id: crypto.randomUUID(),
        event_type: 'mfa_enforcement',
        user_id: userId,
        resource_accessed: 'authentication',
        action_performed: eventType,
        result: 'success',
        timestamp: new Date().toISOString(),
        severity: 'medium' as const,
        control_category: 'security' as const,
        details
      };

      const existingEvents = JSON.parse(localStorage.getItem('soc2_audit_events') || '[]');
      existingEvents.push(event);
      
      localStorage.setItem('soc2_audit_events', JSON.stringify(existingEvents.slice(-1000)));
    } catch (error) {
      console.error('Failed to log MFA event:', error);
    }
  }

  clearMFAData(userId: string): void {
    localStorage.removeItem(`mfa_${userId}`);
    this.logMFAEvent(userId, 'mfa_cleared', {});
  }
}

export const mfaEnforcementService = new MFAEnforcementService();
