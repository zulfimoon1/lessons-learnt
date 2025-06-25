import { supabase } from '@/integrations/supabase/client';

interface PHIAccessEvent {
  event_type: 'phi_access' | 'phi_modify' | 'phi_export' | 'phi_delete';
  user_id?: string;
  patient_identifier?: string;
  resource_accessed: string;
  action_performed: string;
  result: 'success' | 'failure' | 'denied';
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  minimum_necessary: boolean;
  purpose_of_use: 'treatment' | 'payment' | 'operations' | 'disclosure';
  details?: Record<string, any>;
}

interface HIPAAMetrics {
  phiAccessEvents24h: number;
  unauthorizedAccess: number;
  breachIncidents: number;
  complianceScore: number;
  pendingRiskAssessments: number;
  activeBAACount: number;
  patientRequestsPending: number;
}

interface BreachIncident {
  id: string;
  incident_date: Date;
  discovery_date: Date;
  incident_type: 'unauthorized_access' | 'data_theft' | 'improper_disposal' | 'lost_device' | 'hacking';
  affected_individuals: number;
  phi_involved: string[];
  risk_assessment: 'low' | 'medium' | 'high';
  notification_required: boolean;
  reported_to_hhs: boolean;
  mitigation_steps: string[];
  status: 'investigating' | 'contained' | 'resolved';
}

class HIPAAComplianceService {
  async logPHIAccess(event: PHIAccessEvent): Promise<void> {
    try {
      console.log('HIPAA PHI Access Event:', event);
      
      // Store PHI access event locally with enhanced tracking
      const existingEvents = this.getStoredPHIEvents();
      existingEvents.push({
        ...event,
        id: crypto.randomUUID(),
        timestamp: event.timestamp || new Date().toISOString(),
        session_id: sessionStorage.getItem('session_id') || 'unknown',
        ip_address: 'logged_separately', // In production, get from server
        user_agent: navigator.userAgent
      });
      
      // Keep only recent events
      const recentEvents = existingEvents.slice(-2000);
      localStorage.setItem('hipaa_phi_events', JSON.stringify(recentEvents));
      
      // Alert on unauthorized access
      if (event.result === 'denied' || event.severity === 'critical') {
        this.createBreachAlert(event);
      }
      
      // In production, send to secure HIPAA audit logging service
      await this.sendToHIPAAAuditService(event);
    } catch (error) {
      console.error('Failed to log HIPAA PHI access event:', error);
    }
  }

  async getHIPAAMetrics(): Promise<HIPAAMetrics> {
    try {
      const phiEvents = this.getStoredPHIEvents();
      const breachIncidents = this.getStoredBreachIncidents();
      
      const now = Date.now();
      const oneDayAgo = now - 24 * 60 * 60 * 1000;
      
      const recentPHIEvents = phiEvents.filter(e => 
        new Date(e.timestamp).getTime() > oneDayAgo
      );
      
      const unauthorizedAccess = recentPHIEvents.filter(e => 
        e.result === 'denied' || e.event_type === 'phi_access' && e.severity === 'high'
      ).length;
      
      const activeBreaches = breachIncidents.filter(b => 
        b.status !== 'resolved'
      ).length;
      
      // Calculate HIPAA compliance score
      const baseScore = 90;
      const breachPenalty = activeBreaches * 10;
      const unauthorizedPenalty = Math.min(unauthorizedAccess * 2, 20);
      
      const complianceScore = Math.max(0, baseScore - breachPenalty - unauthorizedPenalty);
      
      return {
        phiAccessEvents24h: recentPHIEvents.length,
        unauthorizedAccess,
        breachIncidents: activeBreaches,
        complianceScore,
        pendingRiskAssessments: this.getPendingRiskAssessments(),
        activeBAACount: this.getActiveBAACount(),
        patientRequestsPending: this.getPendingPatientRequests()
      };
    } catch (error) {
      console.error('Failed to get HIPAA metrics:', error);
      return {
        phiAccessEvents24h: 0,
        unauthorizedAccess: 0,
        breachIncidents: 0,
        complianceScore: 0,
        pendingRiskAssessments: 0,
        activeBAACount: 0,
        patientRequestsPending: 0
      };
    }
  }

  classifyPHI(data: any): boolean {
    // Identify Protected Health Information
    const phiIndicators = [
      'mental_health', 'psychological', 'therapy', 'counseling',
      'medical', 'health', 'diagnosis', 'treatment', 'medication',
      'patient', 'emotional_state', 'distress', 'anxiety', 'depression'
    ];
    
    const dataString = JSON.stringify(data).toLowerCase();
    return phiIndicators.some(indicator => dataString.includes(indicator));
  }

  async createBreachIncident(
    incidentType: string,
    affectedIndividuals: number,
    phiInvolved: string[],
    description: string
  ): Promise<string> {
    const incident: BreachIncident = {
      id: crypto.randomUUID(),
      incident_date: new Date(),
      discovery_date: new Date(),
      incident_type: incidentType as any,
      affected_individuals: affectedIndividuals,
      phi_involved: phiInvolved,
      risk_assessment: affectedIndividuals > 500 ? 'high' : affectedIndividuals > 100 ? 'medium' : 'low',
      notification_required: affectedIndividuals >= 500, // HHS notification threshold
      reported_to_hhs: false,
      mitigation_steps: [],
      status: 'investigating'
    };
    
    const incidents = this.getStoredBreachIncidents();
    incidents.push(incident);
    localStorage.setItem('hipaa_breach_incidents', JSON.stringify(incidents.slice(-100)));
    
    console.log('HIPAA Breach Incident Created:', incident);
    return incident.id;
  }

  private createBreachAlert(event: PHIAccessEvent): void {
    if (event.result === 'denied' || event.severity === 'critical') {
      this.createBreachIncident(
        'unauthorized_access',
        1,
        [event.resource_accessed],
        `Unauthorized PHI access attempt: ${event.action_performed}`
      );
    }
  }

  private getPendingRiskAssessments(): number {
    // Simulate pending risk assessments
    return Math.floor(Math.random() * 3);
  }

  private getActiveBAACount(): number {
    // Simulate active Business Associate Agreements
    return 5 + Math.floor(Math.random() * 3);
  }

  private getPendingPatientRequests(): number {
    // Simulate pending patient access requests
    return Math.floor(Math.random() * 2);
  }

  private getStoredPHIEvents(): any[] {
    try {
      const stored = localStorage.getItem('hipaa_phi_events');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  }

  private getStoredBreachIncidents(): BreachIncident[] {
    try {
      const stored = localStorage.getItem('hipaa_breach_incidents');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  }

  private async sendToHIPAAAuditService(event: PHIAccessEvent): Promise<void> {
    try {
      // In production, send to HIPAA-compliant audit service
      await supabase.rpc('log_security_event_safe', {
        event_type: event.event_type,
        user_id: event.user_id,
        details: `PHI ${event.action_performed} on ${event.resource_accessed}`,
        severity: event.severity
      });
    } catch (error) {
      console.debug('HIPAA audit service unavailable:', error);
    }
  }

  monitorPHIAccess(tableName: string, operation: string, userId?: string, patientId?: string): void {
    this.logPHIAccess({
      event_type: 'phi_access',
      user_id: userId,
      patient_identifier: patientId,
      resource_accessed: tableName,
      action_performed: operation,
      result: 'success',
      timestamp: new Date().toISOString(),
      severity: 'medium',
      minimum_necessary: true,
      purpose_of_use: 'treatment'
    });
  }

  clearHIPAAData(): void {
    localStorage.removeItem('hipaa_phi_events');
    localStorage.removeItem('hipaa_breach_incidents');
  }
}

export const hipaaComplianceService = new HIPAAComplianceService();
