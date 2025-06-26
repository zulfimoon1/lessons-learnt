
import { enhancedSecurityValidationService } from './enhancedSecurityValidationService';

interface SecurityMetrics {
  recentAttempts: number;
  blockedIPs: string[];
  suspiciousPatterns: string[];
}

class SecurityMonitoringService {
  private blockedIPs = new Set<string>();
  private suspiciousPatterns = new Set<string>();

  async getSecurityMetrics(): Promise<SecurityMetrics> {
    try {
      // Get security stats from the validation service
      const stats = enhancedSecurityValidationService.getSecurityStats();
      
      return {
        recentAttempts: stats.activeRateLimits,
        blockedIPs: Array.from(this.blockedIPs),
        suspiciousPatterns: Array.from(this.suspiciousPatterns)
      };
    } catch (error) {
      console.error('Failed to get security metrics:', error);
      return {
        recentAttempts: 0,
        blockedIPs: [],
        suspiciousPatterns: []
      };
    }
  }

  async detectAnomalousActivity(): Promise<boolean> {
    try {
      // Check for suspicious activity patterns
      const isSuspicious = enhancedSecurityValidationService.detectSuspiciousActivity();
      
      if (isSuspicious) {
        await enhancedSecurityValidationService.logSecurityEvent({
          type: 'suspicious_activity',
          details: 'Anomalous activity pattern detected',
          severity: 'medium'
        });
      }
      
      return isSuspicious;
    } catch (error) {
      console.error('Failed to detect anomalous activity:', error);
      return false;
    }
  }

  blockIP(ip: string): void {
    this.blockedIPs.add(ip);
    console.log(`IP ${ip} has been blocked for suspicious activity`);
  }

  addSuspiciousPattern(pattern: string): void {
    this.suspiciousPatterns.add(pattern);
    console.log(`Suspicious pattern detected: ${pattern}`);
  }

  isIPBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip);
  }

  clearBlocks(): void {
    this.blockedIPs.clear();
    this.suspiciousPatterns.clear();
    console.log('All security blocks have been cleared');
  }
}

export const securityMonitoringService = new SecurityMonitoringService();
