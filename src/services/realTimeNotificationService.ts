
import { supabase } from '@/integrations/supabase/client';
import { DistressAnalysis } from './multiLanguageDistressService';

export interface NotificationSubscription {
  id: string;
  userId: string;
  role: 'teacher' | 'admin' | 'counselor';
  school: string;
  alertTypes: string[];
  isActive: boolean;
}

export interface RealTimeAlert {
  id: string;
  type: 'distress' | 'engagement' | 'system' | 'crisis';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  studentId?: string;
  studentName?: string;
  school: string;
  analysis?: DistressAnalysis;
  timestamp: string;
  acknowledged: boolean;
}

class RealTimeNotificationService {
  private subscriptions: NotificationSubscription[] = [];
  private activeChannel: any = null;

  async initializeNotifications(userId: string, role: string, school: string) {
    try {
      // Subscribe to real-time notifications
      this.activeChannel = supabase
        .channel(`notifications_${school}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'mental_health_alerts',
            filter: `school=eq.${school}`
          },
          this.handleNewAlert.bind(this)
        )
        .subscribe();

      // Load user notification preferences
      await this.loadNotificationPreferences(userId, role, school);
      
      console.log('🔔 Real-time notifications initialized for:', { userId, role, school });
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  }

  async sendInstantAlert(alert: RealTimeAlert) {
    try {
      // Send to subscribed users
      const relevantSubscriptions = this.subscriptions.filter(sub => 
        sub.school === alert.school && 
        sub.isActive &&
        sub.alertTypes.includes(alert.type)
      );

      for (const subscription of relevantSubscriptions) {
        await this.deliverAlert(alert, subscription);
      }

      // Store alert in database for persistence
      await this.storeAlert(alert);
      
      console.log('📧 Instant alert sent:', alert.title);
    } catch (error) {
      console.error('Failed to send instant alert:', error);
    }
  }

  async processDistressAlert(
    studentId: string,
    studentName: string,
    school: string,
    analysis: DistressAnalysis
  ) {
    const alert: RealTimeAlert = {
      id: crypto.randomUUID(),
      type: 'distress',
      priority: this.mapRiskToPriority(analysis.riskLevel),
      title: `Mental Health Alert - ${studentName}`,
      message: this.generateAlertMessage(analysis),
      studentId,
      studentName,
      school,
      analysis,
      timestamp: new Date().toISOString(),
      acknowledged: false
    };

    await this.sendInstantAlert(alert);
  }

  async acknowledgeAlert(alertId: string, userId: string) {
    try {
      await supabase
        .from('notification_alerts')
        .update({ 
          acknowledged: true,
          acknowledged_by: userId,
          acknowledged_at: new Date().toISOString()
        })
        .eq('id', alertId);
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  }

  async updateNotificationPreferences(
    userId: string,
    preferences: Partial<NotificationSubscription>
  ) {
    try {
      const existingIndex = this.subscriptions.findIndex(sub => sub.userId === userId);
      
      if (existingIndex >= 0) {
        this.subscriptions[existingIndex] = {
          ...this.subscriptions[existingIndex],
          ...preferences
        };
      } else {
        this.subscriptions.push({
          id: crypto.randomUUID(),
          userId,
          role: preferences.role || 'teacher',
          school: preferences.school || '',
          alertTypes: preferences.alertTypes || ['distress', 'crisis'],
          isActive: preferences.isActive ?? true
        });
      }

      // Save to database
      await this.saveNotificationPreferences(userId);
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
    }
  }

  private async handleNewAlert(payload: any) {
    const alertData = payload.new;
    
    if (alertData.severity_level >= 4) { // High or critical
      const alert: RealTimeAlert = {
        id: crypto.randomUUID(),
        type: 'distress',
        priority: alertData.severity_level === 5 ? 'critical' : 'high',
        title: `Urgent: Mental Health Alert`,
        message: `High priority alert detected for ${alertData.student_name}`,
        studentId: alertData.student_id,
        studentName: alertData.student_name,
        school: alertData.school,
        timestamp: alertData.created_at,
        acknowledged: false
      };

      await this.sendInstantAlert(alert);
    }
  }

  private async deliverAlert(alert: RealTimeAlert, subscription: NotificationSubscription) {
    // In-app notification (using toast or notification component)
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('realTimeAlert', { 
        detail: { alert, subscription } 
      });
      window.dispatchEvent(event);
    }

    // For critical alerts, also attempt browser notification
    if (alert.priority === 'critical' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(alert.title, {
          body: alert.message,
          icon: '/favicon.ico',
          requireInteraction: true
        });
      }
    }
  }

  private async storeAlert(alert: RealTimeAlert) {
    try {
      await supabase
        .from('notification_alerts')
        .insert({
          id: alert.id,
          type: alert.type,
          priority: alert.priority,
          title: alert.title,
          message: alert.message,
          student_id: alert.studentId,
          student_name: alert.studentName,
          school: alert.school,
          analysis_data: alert.analysis,
          acknowledged: alert.acknowledged
        });
    } catch (error) {
      console.error('Failed to store alert:', error);
    }
  }

  private mapRiskToPriority(riskLevel: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (riskLevel) {
      case 'critical': return 'critical';
      case 'high': return 'high';
      case 'medium': return 'medium';
      case 'low': return 'low';
      default: return 'low';
    }
  }

  private generateAlertMessage(analysis: DistressAnalysis): string {
    const confidence = Math.round(analysis.confidence * 100);
    const language = analysis.detectedLanguage === 'lt' ? 'Lithuanian' : 'English';
    
    let message = `${analysis.riskLevel.toUpperCase()} risk level detected (${confidence}% confidence) in ${language} feedback.`;
    
    if (analysis.indicators.length > 0) {
      message += ` Key indicators: ${analysis.indicators.slice(0, 2).join(', ')}.`;
    }
    
    if (analysis.riskLevel === 'critical') {
      message += ' Immediate intervention recommended.';
    }
    
    return message;
  }

  private async loadNotificationPreferences(userId: string, role: string, school: string) {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (data && !error) {
        this.subscriptions.push({
          id: data.id,
          userId,
          role: data.role || role,
          school: data.school || school,
          alertTypes: data.alert_types || ['distress', 'crisis'],
          isActive: data.is_active ?? true
        });
      } else {
        // Create default subscription
        this.subscriptions.push({
          id: crypto.randomUUID(),
          userId,
          role,
          school,
          alertTypes: ['distress', 'crisis'],
          isActive: true
        });
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    }
  }

  private async saveNotificationPreferences(userId: string) {
    const subscription = this.subscriptions.find(sub => sub.userId === userId);
    if (!subscription) return;

    try {
      await supabase
        .from('notification_preferences')
        .upsert({
          user_id: userId,
          role: subscription.role,
          school: subscription.school,
          alert_types: subscription.alertTypes,
          is_active: subscription.isActive
        });
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
    }
  }

  cleanup() {
    if (this.activeChannel) {
      supabase.removeChannel(this.activeChannel);
      this.activeChannel = null;
    }
  }
}

export const realTimeNotificationService = new RealTimeNotificationService();
