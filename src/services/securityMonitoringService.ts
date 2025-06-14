import { supabase } from '@/integrations/supabase/client';
import { securityValidationService } from './securityValidationService';

interface SecurityMetrics {
  totalViolations: number;
  criticalViolations: number;
  recentAttempts: number;
  blockedIPs: string[];
  suspiciousPatterns: string[];
}

interface SecurityAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
  resolved: boolean;
}

class SecurityMonitoringService {
  private alerts: SecurityAlert[] = [];
  private blockedIPs = new Set<string>();
  private suspiciousActivities = new Map<string, number>();

  async getSecurityMetrics(): Promise<SecurityMetrics> {
    try {
      // Get security violations from audit log
      const { data: violations } = await supabase
        .from('audit_log')
        .select('*')
        .eq('table_name', 'security_violations')
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const totalViolations = violations?.length || 0;
      const criticalViolations = violations?.filter(v => 
        v.new_data?.severity === 'high'
      ).length || 0;

      const recentAttempts = violations?.filter(v => 
        new Date(v.timestamp) > new Date(Date.now() - 60 * 60 * 1000)
      ).length || 0;

      return {
        totalViolations,
        criticalViolations,
        recentAttempts,
        blockedIPs: Array.from(this.blockedIPs),
        suspiciousPatterns: Array.from(this.suspiciousActivities.keys())
      };
    } catch (error) {
      console.error('Error fetching security metrics:', error);
      return {
        totalViolations: 0,
        criticalViolations: 0,
        recentAttempts: 0,
        blockedIPs: [],
        suspiciousPatterns: []
      };
    }
  }

  async detectAnomalousActivity(userId: string, activity: string): Promise<boolean> {
    const key = `${userId}:${activity}`;
    const count = this.suspiciousActivities.get(key) || 0;
    
    this.suspiciousActivities.set(key, count + 1);
    
    // Flag as suspicious if more than 10 identical activities in short time
    if (count > 10) {
      await securityValidationService.logSecurityEvent(
        'suspicious_activity',
        userId,
        `Anomalous activity detected: ${activity} repeated ${count} times`,
        'high'
      );
      return true;
    }
    
    return false;
  }

  createSecurityAlert(type: SecurityAlert['type'], message: string): void {
    const alert: SecurityAlert = {
      id: crypto.randomUUID(),
      type,
      message,
      timestamp: new Date().toISOString(),
      resolved: false
    };
    
    this.alerts.unshift(alert);
    
    // Keep only last 50 alerts
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(0, 50);
    }
    
    console.warn(`Security Alert [${type.toUpperCase()}]: ${message}`);
  }

  getActiveAlerts(): SecurityAlert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
    }
  }

  // Monitor for specific security threats
  async monitorForThreats(): Promise<void> {
    try {
      // Check for unusual login patterns
      const { data: recentLogins } = await supabase
        .from('audit_log')
        .select('*')
        .in('operation', ['student_login', 'teacher_login'])
        .gte('timestamp', new Date(Date.now() - 60 * 60 * 1000).toISOString());

      if (recentLogins && recentLogins.length > 100) {
        this.createSecurityAlert('warning', 
          `Unusual login activity detected: ${recentLogins.length} logins in the last hour`);
      }

      // Check for mental health alert spikes
      const { data: mentalHealthAlerts } = await supabase
        .from('mental_health_alerts')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const criticalAlerts = mentalHealthAlerts?.filter(alert => 
        alert.severity_level >= 4
      ).length || 0;

      if (criticalAlerts > 5) {
        this.createSecurityAlert('critical', 
          `High number of critical mental health alerts: ${criticalAlerts} in last 24 hours`);
      }

    } catch (error) {
      console.error('Error monitoring for threats:', error);
    }
  }

  // Real-time security monitoring
  startRealTimeMonitoring(): void {
    // Monitor every 5 minutes
    setInterval(() => {
      this.monitorForThreats();
    }, 5 * 60 * 1000);

    // Clear old suspicious activities every hour
    setInterval(() => {
      this.suspiciousActivities.clear();
    }, 60 * 60 * 1000);
  }

  // Compliance monitoring for FERPA/student privacy
  async auditDataAccess(operation: string, tableName: string, recordCount: number): Promise<void> {
    if (['students', 'mental_health_alerts', 'weekly_summaries'].includes(tableName)) {
      await securityValidationService.logSecurityEvent(
        'unauthorized_access',
        undefined,
        `Accessed ${recordCount} records from ${tableName} via ${operation}`,
        'low'
      );

      // Flag large data exports
      if (recordCount > 100) {
        this.createSecurityAlert('warning', 
          `Large data export detected: ${recordCount} ${tableName} records`);
      }
    }
  }

  // Security headers validation
  validateSecurityHeaders(): boolean {
    const hasCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]') !== null;
    const hasXFrameOptions = true; // Would check actual headers in real implementation
    
    if (!hasCSP) {
      this.createSecurityAlert('warning', 'Content Security Policy not detected');
      return false;
    }
    
    return true;
  }
}

export const securityMonitoringService = new SecurityMonitoringService();

// Start monitoring when service is imported
securityMonitoringService.startRealTimeMonitoring();
