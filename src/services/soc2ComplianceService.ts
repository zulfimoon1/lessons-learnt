
import { supabase } from '@/integrations/supabase/client';

export interface SOC2AuditEvent {
  event_type: string;
  user_id?: string;
  source_ip?: string;
  user_agent?: string;
  resource_accessed?: string;
  action_performed?: string;
  result?: 'success' | 'failure' | 'unauthorized';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  details?: Record<string, any>;
  control_category?: 'security' | 'availability' | 'processing_integrity' | 'confidentiality';
}

export interface SOC2SecurityEvent {
  event_category: 'access_control' | 'authentication' | 'authorization' | 'data_integrity';
  event_description: string;
  affected_resource?: string;
  user_id?: string;
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

export interface SOC2DashboardData {
  auditEvents24h: number;
  openSecurityEvents: number;
  criticalSecurityEvents: number;
  avgUptime24h: number;
  failedIntegrityChecks24h: number;
  overdueAccessReviews: number;
}

class SOC2ComplianceService {
  async logAuditEvent(event: SOC2AuditEvent): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('log_soc2_event', {
        event_type_param: event.event_type,
        user_id_param: event.user_id || null,
        source_ip_param: event.source_ip || null,
        user_agent_param: event.user_agent || navigator.userAgent,
        resource_accessed_param: event.resource_accessed || null,
        action_performed_param: event.action_performed || null,
        result_param: event.result || 'success',
        severity_param: event.severity || 'medium',
        details_param: event.details || {},
        control_category_param: event.control_category || 'security'
      });

      if (error) {
        console.error('SOC 2 audit logging error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to log SOC 2 audit event:', error);
      return null;
    }
  }

  async logSecurityEvent(event: SOC2SecurityEvent): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('log_soc2_security_event', {
        event_category_param: event.event_category,
        event_description_param: event.event_description,
        affected_resource_param: event.affected_resource || null,
        user_id_param: event.user_id || null,
        risk_level_param: event.risk_level || 'medium',
        metadata_param: event.metadata || {}
      });

      if (error) {
        console.error('SOC 2 security event logging error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to log SOC 2 security event:', error);
      return null;
    }
  }

  async recordAvailabilityMetric(
    serviceName: string,
    status: 'up' | 'down' | 'degraded',
    responseTimeMs?: number,
    uptimePercentage?: number,
    errorCount?: number,
    totalRequests?: number,
    metadata?: Record<string, any>
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('record_availability_metric', {
        service_name_param: serviceName,
        status_param: status,
        response_time_ms_param: responseTimeMs || null,
        uptime_percentage_param: uptimePercentage || null,
        error_count_param: errorCount || 0,
        total_requests_param: totalRequests || 0,
        metadata_param: metadata || {}
      });

      if (error) {
        console.error('SOC 2 availability metric error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to record availability metric:', error);
      return null;
    }
  }

  async performDataIntegrityCheck(tableName: string, checkType: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('perform_data_integrity_check', {
        table_name_param: tableName,
        check_type_param: checkType
      });

      if (error) {
        console.error('SOC 2 data integrity check error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to perform data integrity check:', error);
      return null;
    }
  }

  async getDashboardSummary(): Promise<SOC2DashboardData | null> {
    try {
      const { data, error } = await supabase
        .from('soc2_dashboard_summary')
        .select('*')
        .single();

      if (error) {
        console.error('SOC 2 dashboard data error:', error);
        return null;
      }

      return {
        auditEvents24h: data.audit_events_24h || 0,
        openSecurityEvents: data.open_security_events || 0,
        criticalSecurityEvents: data.critical_security_events || 0,
        avgUptime24h: data.avg_uptime_24h || 0,
        failedIntegrityChecks24h: data.failed_integrity_checks_24h || 0,
        overdueAccessReviews: data.overdue_access_reviews || 0
      };
    } catch (error) {
      console.error('Failed to get SOC 2 dashboard data:', error);
      return null;
    }
  }

  async getRecentAuditEvents(limit: number = 50) {
    try {
      const { data, error } = await supabase
        .from('soc2_audit_log')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('SOC 2 audit events error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get recent audit events:', error);
      return [];
    }
  }

  async getSecurityEvents(status?: string, riskLevel?: string) {
    try {
      let query = supabase
        .from('soc2_security_events')
        .select('*')
        .order('timestamp', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      if (riskLevel) {
        query = query.eq('risk_level', riskLevel);
      }

      const { data, error } = await query;

      if (error) {
        console.error('SOC 2 security events error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get security events:', error);
      return [];
    }
  }

  // Auto-monitor page access
  monitorPageAccess(pageName: string, userId?: string) {
    this.logAuditEvent({
      event_type: 'page_access',
      user_id: userId,
      resource_accessed: pageName,
      action_performed: 'view',
      result: 'success',
      severity: 'low',
      control_category: 'security',
      details: {
        timestamp: new Date().toISOString(),
        page: pageName
      }
    });
  }

  // Auto-monitor API calls
  monitorAPICall(endpoint: string, method: string, userId?: string, result: 'success' | 'failure' = 'success') {
    this.logAuditEvent({
      event_type: 'api_call',
      user_id: userId,
      resource_accessed: endpoint,
      action_performed: method,
      result,
      severity: result === 'failure' ? 'medium' : 'low',
      control_category: 'security',
      details: {
        timestamp: new Date().toISOString(),
        endpoint,
        method
      }
    });
  }

  // Auto-monitor data access
  monitorDataAccess(tableName: string, operation: string, recordCount?: number, userId?: string) {
    this.logAuditEvent({
      event_type: 'data_access',
      user_id: userId,
      resource_accessed: tableName,
      action_performed: operation,
      result: 'success',
      severity: ['mental_health_alerts', 'students', 'teachers'].includes(tableName) ? 'high' : 'medium',
      control_category: 'confidentiality',
      details: {
        timestamp: new Date().toISOString(),
        table: tableName,
        operation,
        record_count: recordCount
      }
    });
  }
}

export const soc2ComplianceService = new SOC2ComplianceService();
