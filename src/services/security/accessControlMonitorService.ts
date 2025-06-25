import { soc2ComplianceService } from '@/services/soc2ComplianceService';
import { mfaEnforcementService } from './mfaEnforcementService';

interface AccessAttempt {
  userId: string;
  userRole: string;
  resource: string;
  action: string;
  timestamp: Date;
  success: boolean;
  mfaStatus: boolean;
}

interface RoleAccessPattern {
  role: string;
  resources: string[];
  timePatterns: Record<string, number>;
  failures: number;
  successes: number;
}

class AccessControlMonitorService {
  private readonly SUSPICIOUS_FAILURE_THRESHOLD = 5;
  private readonly TIME_WINDOW = 15 * 60 * 1000; // 15 minutes

  monitorAccess(
    userId: string, 
    userRole: string, 
    resource: string, 
    action: string, 
    success: boolean
  ): void {
    const mfaStatus = mfaEnforcementService.validateMFAStatus(userId, userRole);
    
    const attempt: AccessAttempt = {
      userId,
      userRole,
      resource,
      action,
      timestamp: new Date(),
      success,
      mfaStatus: mfaStatus.isValid
    };

    this.recordAccessAttempt(attempt);
    
    if (!success) {
      this.checkForSuspiciousActivity(userId, userRole);
    }

    // Log to SOC 2 audit trail
    soc2ComplianceService.logAuditEvent({
      event_type: 'resource_access',
      user_id: userId,
      resource_accessed: resource,
      action_performed: action,
      result: success ? 'success' : 'failure',
      timestamp: new Date().toISOString(),
      severity: success ? 'low' : 'medium',
      control_category: 'security',
      details: {
        userRole,
        mfaValid: mfaStatus.isValid,
        requiresMFA: mfaStatus.requiresSetup
      }
    });
  }

  validateRoleBasedAccess(
    userRole: string, 
    resource: string, 
    action: string
  ): boolean {
    const rolePermissions = this.getRolePermissions(userRole);
    const resourceKey = `${resource}:${action}`;
    
    return rolePermissions.includes(resourceKey) || 
           rolePermissions.includes(`${resource}:*`) ||
           rolePermissions.includes('*:*');
  }

  getAccessPatterns(timeRange: number = 24 * 60 * 60 * 1000): RoleAccessPattern[] {
    try {
      const attempts = this.getStoredAccessAttempts();
      const cutoff = Date.now() - timeRange;
      
      const recentAttempts = attempts.filter(a => 
        new Date(a.timestamp).getTime() > cutoff
      );

      const patterns: Record<string, RoleAccessPattern> = {};
      
      recentAttempts.forEach(attempt => {
        if (!patterns[attempt.userRole]) {
          patterns[attempt.userRole] = {
            role: attempt.userRole,
            resources: [],
            timePatterns: {},
            failures: 0,
            successes: 0
          };
        }

        const pattern = patterns[attempt.userRole];
        
        if (!pattern.resources.includes(attempt.resource)) {
          pattern.resources.push(attempt.resource);
        }

        const hour = new Date(attempt.timestamp).getHours();
        pattern.timePatterns[hour] = (pattern.timePatterns[hour] || 0) + 1;
        
        if (attempt.success) {
          pattern.successes++;
        } else {
          pattern.failures++;
        }
      });

      return Object.values(patterns);
    } catch (error) {
      console.error('Failed to get access patterns:', error);
      return [];
    }
  }

  getPrivilegedAccessSummary(): {
    totalPrivilegedUsers: number;
    activePrivilegedSessions: number;
    failedPrivilegedAttempts: number;
    mfaCompliance: number;
  } {
    const attempts = this.getStoredAccessAttempts();
    const privilegedRoles = ['admin', 'doctor', 'platform_admin'];
    const now = Date.now();
    const recentWindow = 60 * 60 * 1000; // 1 hour

    const recentPrivileged = attempts.filter(a => 
      privilegedRoles.includes(a.userRole) &&
      (now - new Date(a.timestamp).getTime()) < recentWindow
    );

    const uniqueUsers = new Set(recentPrivileged.map(a => a.userId));
    const activeSessions = recentPrivileged.filter(a => a.success).length;
    const failedAttempts = recentPrivileged.filter(a => !a.success).length;
    const mfaCompliant = recentPrivileged.filter(a => a.mfaStatus).length;

    return {
      totalPrivilegedUsers: uniqueUsers.size,
      activePrivilegedSessions: activeSessions,
      failedPrivilegedAttempts: failedAttempts,
      mfaCompliance: recentPrivileged.length > 0 ? 
        (mfaCompliant / recentPrivileged.length) * 100 : 100
    };
  }

  private recordAccessAttempt(attempt: AccessAttempt): void {
    try {
      const stored = this.getStoredAccessAttempts();
      stored.push(attempt);
      
      // Keep only recent attempts
      const recent = stored.slice(-5000);
      localStorage.setItem('access_attempts', JSON.stringify(recent));
    } catch (error) {
      console.error('Failed to record access attempt:', error);
    }
  }

  private getStoredAccessAttempts(): AccessAttempt[] {
    try {
      const stored = localStorage.getItem('access_attempts');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  }

  private checkForSuspiciousActivity(userId: string, userRole: string): void {
    const attempts = this.getStoredAccessAttempts();
    const now = Date.now();
    
    const recentFailures = attempts.filter(a => 
      a.userId === userId &&
      !a.success &&
      (now - new Date(a.timestamp).getTime()) < this.TIME_WINDOW
    );

    if (recentFailures.length >= this.SUSPICIOUS_FAILURE_THRESHOLD) {
      soc2ComplianceService.logSecurityEvent({
        event_category: 'access_control',
        event_description: `Suspicious access activity detected: ${recentFailures.length} failed attempts`,
        affected_resource: 'authentication',
        user_id: userId,
        risk_level: 'high',
        metadata: {
          userRole,
          failureCount: recentFailures.length,
          timeWindow: this.TIME_WINDOW
        }
      });
    }
  }

  private getRolePermissions(role: string): string[] {
    const permissions: Record<string, string[]> = {
      'student': [
        'feedback:create',
        'feedback:read',
        'chat:create',
        'profile:read',
        'profile:update'
      ],
      'teacher': [
        'feedback:*',
        'students:read',
        'class_schedules:*',
        'chat:*',
        'profile:*'
      ],
      'admin': [
        '*:*'
      ],
      'doctor': [
        'mental_health_alerts:*',
        'chat:*',
        'students:read',
        'feedback:read'
      ],
      'platform_admin': [
        '*:*'
      ]
    };

    return permissions[role] || [];
  }
}

export const accessControlMonitorService = new AccessControlMonitorService();
