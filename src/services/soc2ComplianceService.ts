import { supabase } from '@/integrations/supabase/client';

interface AuditEvent {
  event_type: string;
  user_id?: string;
  resource_accessed: string;
  action_performed: string;
  result: 'success' | 'failure' | 'denied';
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  control_category: 'security' | 'availability' | 'integrity' | 'confidentiality' | 'privacy';
  details?: Record<string, any>;
}

interface SecurityEvent {
  event_category: 'access_control' | 'authentication' | 'authorization' | 'data_integrity';
  event_description: string;
  affected_resource: string;
  user_id?: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

interface ComplianceMetrics {
  auditEvents: number;
  securityEvents: number;
  dataAccessEvents: number;
  failedAuthentications: number;
  privilegedAccess: number;
  lastAuditDate: string;
  complianceScore: number;
}

class SOC2ComplianceService {
  async logAuditEvent(event: AuditEvent): Promise<void> {
    try {
      console.log('SOC2 Audit Event:', event);
      
      // Store audit event locally for demo purposes
      const existingEvents = this.getStoredAuditEvents();
      existingEvents.push({
        ...event,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString()
      });
      
      // Keep only recent events to prevent storage overflow
      const recentEvents = existingEvents.slice(-1000);
      localStorage.setItem('soc2_audit_events', JSON.stringify(recentEvents));
      
      // In production, this would send to secure audit logging service
      await this.sendToAuditService(event);
    } catch (error) {
      console.error('Failed to log SOC2 audit event:', error);
    }
  }

  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      console.log('SOC2 Security Event:', event);
      
      // Store security event locally
      const existingEvents = this.getStoredSecurityEvents();
      existingEvents.push({
        ...event,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString()
      });
      
      const recentEvents = existingEvents.slice(-1000);
      localStorage.setItem('soc2_security_events', JSON.stringify(recentEvents));
      
      // Send to security monitoring system
      await this.sendToSecurityService(event);
    } catch (error) {
      console.error('Failed to log SOC2 security event:', error);
    }
  }

  async getComplianceMetrics(): Promise<ComplianceMetrics> {
    try {
      const auditEvents = this.getStoredAuditEvents();
      const securityEvents = this.getStoredSecurityEvents();
      
      const now = Date.now();
      const oneDayAgo = now - 24 * 60 * 60 * 1000;
      
      const recentAuditEvents = auditEvents.filter(e => 
        new Date(e.timestamp).getTime() > oneDayAgo
      );
      
      const recentSecurityEvents = securityEvents.filter(e => 
        new Date(e.timestamp).getTime() > oneDayAgo
      );
      
      const failedAuthentications = recentAuditEvents.filter(e => 
        e.event_type.includes('authentication') && e.result === 'failure'
      ).length;
      
      const privilegedAccess = recentAuditEvents.filter(e => 
        e.action_performed.includes('admin') || e.control_category === 'security'
      ).length;
      
      // Calculate compliance score based on events and adherence to controls
      const baseScore = 85;
      const securityIncidents = recentSecurityEvents.filter(e => e.risk_level === 'high' || e.risk_level === 'critical').length;
      const authFailures = Math.min(failedAuthentications, 10); // Cap impact
      
      const complianceScore = Math.max(0, baseScore - (securityIncidents * 5) - (authFailures * 2));
      
      return {
        auditEvents: recentAuditEvents.length,
        securityEvents: recentSecurityEvents.length,
        dataAccessEvents: recentAuditEvents.filter(e => e.resource_accessed.includes('data')).length,
        failedAuthentications,
        privilegedAccess,
        lastAuditDate: new Date().toISOString(),
        complianceScore
      };
    } catch (error) {
      console.error('Failed to get compliance metrics:', error);
      return {
        auditEvents: 0,
        securityEvents: 0,
        dataAccessEvents: 0,
        failedAuthentications: 0,
        privilegedAccess: 0,
        lastAuditDate: new Date().toISOString(),
        complianceScore: 0
      };
    }
  }

  monitorPageAccess(page: string, userId?: string): void {
    this.logAuditEvent({
      event_type: 'page_access',
      user_id: userId,
      resource_accessed: page,
      action_performed: 'view',
      result: 'success',
      timestamp: new Date().toISOString(),
      severity: 'low',
      control_category: 'security'
    });
  }

  monitorDataAccess(tableName: string, operation: string, recordCount?: number, userId?: string): void {
    this.logAuditEvent({
      event_type: 'data_access',
      user_id: userId,
      resource_accessed: tableName,
      action_performed: operation,
      result: 'success',
      timestamp: new Date().toISOString(),
      severity: recordCount && recordCount > 100 ? 'medium' : 'low',
      control_category: 'confidentiality',
      details: { recordCount }
    });
  }

  private getStoredAuditEvents(): any[] {
    try {
      const stored = localStorage.getItem('soc2_audit_events');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get stored audit events:', error);
      return [];
    }
  }

  private getStoredSecurityEvents(): any[] {
    try {
      const stored = localStorage.getItem('soc2_security_events');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get stored security events:', error);
      return [];
    }
  }

  private async sendToAuditService(event: AuditEvent): Promise<void> {
    try {
      // In production, this would send to a dedicated audit logging service
      // For now, we'll use Supabase's audit capabilities
      await supabase.rpc('log_audit_event_safe', {
        event_type: event.event_type,
        user_id: event.user_id,
        resource_accessed: event.resource_accessed,
        action_performed: event.action_performed,
        result: event.result,
        severity: event.severity,
        control_category: event.control_category,
        details: event.details
      });
    } catch (error) {
      // Fail silently to prevent disrupting user experience
      console.debug('Audit service unavailable:', error);
    }
  }

  private async sendToSecurityService(event: SecurityEvent): Promise<void> {
    try {
      // Send to security monitoring system
      await supabase.rpc('log_security_event_safe', {
        event_type: event.event_category,
        user_id: event.user_id,
        details: event.event_description,
        severity: event.risk_level === 'critical' ? 'high' : event.risk_level
      });
    } catch (error) {
      console.debug('Security service unavailable:', error);
    }
  }

  clearComplianceData(): void {
    localStorage.removeItem('soc2_audit_events');
    localStorage.removeItem('soc2_security_events');
  }
}

export const soc2ComplianceService = new SOC2ComplianceService();
