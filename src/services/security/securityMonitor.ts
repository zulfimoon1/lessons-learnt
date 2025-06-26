import { securityService } from '../securityService';
import { supabase } from '@/integrations/supabase/client';

interface SecurityEvent {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  details: string;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  fingerprint?: string;
}

interface ThreatPattern {
  pattern: RegExp | string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

class SecurityMonitor {
  private events: SecurityEvent[] = [];
  private readonly MAX_EVENTS = 1000;
  private readonly ALERT_THRESHOLDS = {
    high: 5, // 5 high severity events in 10 minutes
    critical: 1 // 1 critical event triggers immediate alert
  };

  private readonly THREAT_PATTERNS: ThreatPattern[] = [
    {
      pattern: /multiple\s+failed\s+login/i,
      severity: 'medium',
      description: 'Multiple failed login attempts detected'
    },
    {
      pattern: /sql\s+injection/i,
      severity: 'high',
      description: 'SQL injection attempt detected'
    },
    {
      pattern: /xss|cross.site.scripting/i,
      severity: 'high',
      description: 'XSS attack attempt detected'
    },
    {
      pattern: /session\s+hijack/i,
      severity: 'critical',
      description: 'Session hijacking attempt detected'
    },
    {
      pattern: /brute\s+force/i,
      severity: 'high',
      description: 'Brute force attack detected'
    }
  ];

  constructor() {
    // Start monitoring
    this.startMonitoring();
    
    // Cleanup old events periodically
    setInterval(() => this.cleanupOldEvents(), 5 * 60 * 1000);
  }

  private startMonitoring(): void {
    // Monitor console errors for security issues
    const originalError = console.error;
    console.error = (...args) => {
      this.analyzeConsoleOutput(args.join(' '));
      originalError.apply(console, args);
    };

    // Monitor unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logSecurityEvent({
        type: 'unhandled_rejection',
        severity: 'medium',
        timestamp: Date.now(),
        details: `Unhandled promise rejection: ${event.reason}`,
        userAgent: navigator.userAgent
      });
    });

    // Monitor visibility changes for potential session hijacking
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.logSecurityEvent({
          type: 'session_visibility_change',
          severity: 'low',
          timestamp: Date.now(),
          details: 'Session became hidden',
          userAgent: navigator.userAgent
        });
      }
    });
  }

  private analyzeConsoleOutput(message: string): void {
    for (const pattern of this.THREAT_PATTERNS) {
      const regex = typeof pattern.pattern === 'string' ? 
        new RegExp(pattern.pattern, 'i') : pattern.pattern;
      
      if (regex.test(message)) {
        this.logSecurityEvent({
          type: 'threat_pattern_detected',
          severity: pattern.severity,
          timestamp: Date.now(),
          details: `${pattern.description}: ${message}`,
          userAgent: navigator.userAgent
        });
      }
    }
  }

  logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'> & { timestamp?: number }): void {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: event.timestamp || Date.now()
    };

    this.events.push(securityEvent);

    // Keep only recent events
    if (this.events.length > this.MAX_EVENTS) {
      this.events = this.events.slice(-this.MAX_EVENTS);
    }

    // Check for alert conditions
    this.checkAlertConditions(securityEvent);

    // Log to external service (Supabase)
    this.logToExternalService(securityEvent);

    // Log critical events immediately
    if (securityEvent.severity === 'critical') {
      console.error('CRITICAL SECURITY EVENT:', securityEvent);
    }
  }

  private checkAlertConditions(event: SecurityEvent): void {
    const now = Date.now();
    const tenMinutesAgo = now - (10 * 60 * 1000);

    // Check for high severity events in last 10 minutes
    const recentHighEvents = this.events.filter(e => 
      e.severity === 'high' && e.timestamp > tenMinutesAgo
    );

    if (recentHighEvents.length >= this.ALERT_THRESHOLDS.high) {
      this.triggerSecurityAlert('multiple_high_severity_events', recentHighEvents);
    }

    // Immediate alert for critical events
    if (event.severity === 'critical') {
      this.triggerSecurityAlert('critical_security_event', [event]);
    }
  }

  private triggerSecurityAlert(alertType: string, events: SecurityEvent[]): void {
    console.warn(`SECURITY ALERT: ${alertType}`, events);
    
    // Here you would normally send alerts to administrators
    // For now, we'll log it through the security service
    securityService.logSecurityEvent({
      type: 'security_alert',
      timestamp: new Date().toISOString(),
      details: `Security alert triggered: ${alertType}. Events: ${events.length}`,
      userAgent: navigator.userAgent
    });
  }

  private async logToExternalService(event: SecurityEvent): Promise<void> {
    try {
      await supabase.from('audit_log').insert({
        table_name: 'security_monitor',
        operation: event.type,
        user_id: event.userId || null,
        new_data: {
          severity: event.severity,
          details: event.details,
          timestamp: new Date(event.timestamp).toISOString(),
          user_agent: event.userAgent,
          session_id: event.sessionId,
          fingerprint: event.fingerprint
        }
      });
    } catch (error) {
      console.warn('Failed to log security event to external service:', error);
    }
  }

  private cleanupOldEvents(): void {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    this.events = this.events.filter(event => event.timestamp > oneHourAgo);
  }

  getSecuritySummary(): {
    totalEvents: number;
    eventsBySeverity: Record<string, number>;
    recentCriticalEvents: SecurityEvent[];
    threatAnalysis: string[];
  } {
    const eventsBySeverity = this.events.reduce((acc, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    const recentCriticalEvents = this.events.filter(e => 
      e.severity === 'critical' && e.timestamp > oneHourAgo
    );

    const threatAnalysis = this.analyzeThreatPatterns();

    return {
      totalEvents: this.events.length,
      eventsBySeverity,
      recentCriticalEvents,
      threatAnalysis
    };
  }

  private analyzeThreatPatterns(): string[] {
    const analysis: string[] = [];
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    const recentEvents = this.events.filter(e => e.timestamp > oneHourAgo);
    
    // Analyze patterns
    const eventsByType = recentEvents.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Identify concerning patterns
    for (const [type, count] of Object.entries(eventsByType)) {
      if (count > 10) {
        analysis.push(`High frequency of ${type} events: ${count} in last hour`);
      }
    }

    if (recentEvents.filter(e => e.severity === 'high').length > 5) {
      analysis.push('Multiple high-severity security events detected');
    }

    return analysis;
  }

  // Method to manually trigger security checks
  runSecurityScan(): Promise<{
    vulnerabilities: string[];
    recommendations: string[];
    riskScore: number;
  }> {
    return new Promise((resolve) => {
      const vulnerabilities: string[] = [];
      const recommendations: string[] = [];
      let riskScore = 0;

      // Check session security
      const sessionInfo = sessionStorage.getItem('secure_session_v2');
      if (!sessionInfo) {
        vulnerabilities.push('No secure session found');
        recommendations.push('Implement secure session management');
        riskScore += 20;
      }

      // Check for stored sensitive data
      const sensitiveKeys = ['password', 'token', 'secret', 'key'];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
          vulnerabilities.push('Sensitive data found in localStorage');
          recommendations.push('Move sensitive data to secure storage');
          riskScore += 15;
          break;
        }
      }

      // Check console for exposed data
      if (typeof window !== 'undefined' && (window as any).DEBUG) {
        vulnerabilities.push('Debug mode enabled in production');
        recommendations.push('Disable debug mode in production');
        riskScore += 10;
      }

      resolve({
        vulnerabilities,
        recommendations,
        riskScore: Math.min(riskScore, 100)
      });
    });
  }
}

export const securityMonitor = new SecurityMonitor();
