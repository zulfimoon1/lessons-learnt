export class SecurityMonitoringService {
  async getSecurityMetrics(): Promise<{
    recentAttempts: number;
    blockedIPs: string[];
    suspiciousPatterns: string[];
    lastScan: string;
  }> {
    try {
      // Get security events from localStorage
      const securityLogs = JSON.parse(localStorage.getItem('security_logs') || '[]');
      
      // Filter recent events (last 24 hours)
      const recentEvents = securityLogs.filter((event: any) => 
        new Date(event.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000
      );

      // Count failed login attempts
      const recentAttempts = recentEvents.filter((event: any) => 
        event.type === 'failed_login_attempt'
      ).length;

      // Mock blocked IPs and suspicious patterns for now
      const blockedIPs: string[] = [];
      const suspiciousPatterns: string[] = [];

      return {
        recentAttempts,
        blockedIPs,
        suspiciousPatterns,
        lastScan: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting security metrics:', error);
      return {
        recentAttempts: 0,
        blockedIPs: [],
        suspiciousPatterns: [],
        lastScan: new Date().toISOString()
      };
    }
  }

  async logSecurityEvent(eventType: string, details: string, severity: string = 'medium'): Promise<void> {
    try {
      const existingLogs = JSON.parse(localStorage.getItem('security_logs') || '[]');
      const newEvent = {
        type: eventType,
        timestamp: new Date().toISOString(),
        details,
        severity
      };
      existingLogs.push(newEvent);
      
      // Keep only last 1000 events
      if (existingLogs.length > 1000) {
        existingLogs.splice(0, existingLogs.length - 1000);
      }
      
      localStorage.setItem('security_logs', JSON.stringify(existingLogs));
      console.log(`🔒 Security event: ${eventType} - ${severity}`);
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }
}

export const securityMonitoringService = new SecurityMonitoringService();
