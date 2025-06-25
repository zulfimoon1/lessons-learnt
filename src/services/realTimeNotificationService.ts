
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
      // Store acknowledgment in mental_health_alerts table instead
      await supabase
        .from('mental_health_alerts')
        .update({ 
          is_reviewed: true,
          reviewed_by: userId,
          reviewed_at: new Date().toISOString()
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
          role: (preferences.role || 'teacher') as 'teacher' | 'admin' | 'counselor',
          school: preferences.school || '',
          alertTypes: preferences.alertTypes || ['distress', 'crisis'],
          isActive: preferences.isActive ?? true
        });
      }

      // Save to local storage for persistence
      this.saveToLocalStorage(userId);
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
      // Store in mental_health_alerts table instead
      await supabase
        .from('mental_health_alerts')
        .insert({
          student_id: alert.studentId,
          student_name: alert.studentName || 'Unknown',
          school: alert.school,
          grade: 'Unknown',
          content: alert.message,
          source_table: 'real_time_alerts',
          source_id: crypto.randomUUID(),
          severity_level: alert.priority === 'critical' ? 5 : 
                         alert.priority === 'high' ? 4 : 
                         alert.priority === 'medium' ? 3 : 2,
          alert_type: alert.type
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
      // Load from local storage for now
      const stored = localStorage.getItem(`notification_preferences_${userId}`);
      if (stored) {
        const preferences = JSON.parse(stored);
        this.subscriptions.push(preferences);
      } else {
        // Create default subscription
        this.subscriptions.push({
          id: crypto.randomUUID(),
          userId,
          role: role as 'teacher' | 'admin' | 'counselor',
          school,
          alertTypes: ['distress', 'crisis'],
          isActive: true
        });
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    }
  }

  private saveToLocalStorage(userId: string) {
    const subscription = this.subscriptions.find(sub => sub.userId === userId);
    if (subscription) {
      localStorage.setItem(`notification_preferences_${userId}`, JSON.stringify(subscription));
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
