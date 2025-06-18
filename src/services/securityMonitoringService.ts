
import { supabase } from '@/integrations/supabase/client';

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
      const { data: violations } = await supabase
        .from('audit_log')
        .select('*')
        .eq('table_name', 'security_violations')
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const totalViolations = violations?.length || 0;
      
      const criticalViolations = violations?.filter(v => {
        if (v.new_data && typeof v.new_data === 'object' && v.new_data !== null) {
          const data = v.new_data as Record<string, any>;
          return data.severity === 'high';
        }
        return false;
      }).length || 0;

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
    
    if (count > 10) {
      console.warn(`Anomalous activity detected: ${activity} repeated ${count} times for user ${userId}`);
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

  validateSecurityHeaders(): boolean {
    const hasCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]') !== null;
    
    if (!hasCSP) {
      this.createSecurityAlert('warning', 'Content Security Policy not detected');
      return false;
    }
    
    return true;
  }
}

export const securityMonitoringService = new SecurityMonitoringService();
