interface SystemMetrics {
  availability: number;
  responseTime: number;
  errorRate: number;
  uptime: number;
  lastChecked: Date;
}

interface PerformanceAlert {
  id: string;
  type: 'availability' | 'performance' | 'error_rate';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  threshold: number;
  currentValue: number;
  timestamp: Date;
}

class SystemMonitoringService {
  private readonly AVAILABILITY_THRESHOLD = 99.9;
  private readonly RESPONSE_TIME_THRESHOLD = 2000; // 2 seconds
  private readonly ERROR_RATE_THRESHOLD = 5; // 5%

  getSystemMetrics(): SystemMetrics {
    // Simulate real metrics - in production this would connect to actual monitoring
    const now = new Date();
    const availability = Math.random() * 2 + 98; // 98-100%
    const responseTime = Math.random() * 1000 + 500; // 500-1500ms
    const errorRate = Math.random() * 3; // 0-3%
    const uptime = Math.random() * 24 + 720; // 720-744 hours (30+ days)

    return {
      availability: Number(availability.toFixed(2)),
      responseTime: Number(responseTime.toFixed(0)),
      errorRate: Number(errorRate.toFixed(2)),
      uptime: Number(uptime.toFixed(1)),
      lastChecked: now
    };
  }

  checkThresholds(metrics: SystemMetrics): PerformanceAlert[] {
    const alerts: PerformanceAlert[] = [];

    // Availability check
    if (metrics.availability < this.AVAILABILITY_THRESHOLD) {
      alerts.push({
        id: crypto.randomUUID(),
        type: 'availability',
        severity: metrics.availability < 95 ? 'critical' : 'high',
        message: `System availability is ${metrics.availability}%, below threshold of ${this.AVAILABILITY_THRESHOLD}%`,
        threshold: this.AVAILABILITY_THRESHOLD,
        currentValue: metrics.availability,
        timestamp: new Date()
      });
    }

    // Response time check
    if (metrics.responseTime > this.RESPONSE_TIME_THRESHOLD) {
      alerts.push({
        id: crypto.randomUUID(),
        type: 'performance',
        severity: metrics.responseTime > 5000 ? 'critical' : 'medium',
        message: `Response time is ${metrics.responseTime}ms, above threshold of ${this.RESPONSE_TIME_THRESHOLD}ms`,
        threshold: this.RESPONSE_TIME_THRESHOLD,
        currentValue: metrics.responseTime,
        timestamp: new Date()
      });
    }

    // Error rate check
    if (metrics.errorRate > this.ERROR_RATE_THRESHOLD) {
      alerts.push({
        id: crypto.randomUUID(),
        type: 'error_rate',
        severity: metrics.errorRate > 10 ? 'critical' : 'high',
        message: `Error rate is ${metrics.errorRate}%, above threshold of ${this.ERROR_RATE_THRESHOLD}%`,
        threshold: this.ERROR_RATE_THRESHOLD,
        currentValue: metrics.errorRate,
        timestamp: new Date()
      });
    }

    return alerts;
  }

  logPerformanceAlert(alert: PerformanceAlert): void {
    try {
      const existingAlerts = this.getStoredAlerts();
      existingAlerts.push(alert);
      
      // Keep only recent alerts
      const recentAlerts = existingAlerts.slice(-100);
      localStorage.setItem('performance_alerts', JSON.stringify(recentAlerts));
      
      console.log('Performance Alert:', alert);
    } catch (error) {
      console.error('Failed to log performance alert:', error);
    }
  }

  getPerformanceAlerts(limit: number = 10): PerformanceAlert[] {
    try {
      const alerts = this.getStoredAlerts();
      return alerts.slice(-limit).reverse();
    } catch (error) {
      console.error('Failed to get performance alerts:', error);
      return [];
    }
  }

  private getStoredAlerts(): PerformanceAlert[] {
    try {
      const stored = localStorage.getItem('performance_alerts');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  }

  getAvailabilityReport(days: number = 30): {
    averageAvailability: number;
    incidents: number;
    totalDowntime: number;
  } {
    // Simulate availability report
    const averageAvailability = 99.2 + Math.random() * 0.7;
    const incidents = Math.floor(Math.random() * 3);
    const totalDowntime = Math.random() * 120; // minutes

    return {
      averageAvailability: Number(averageAvailability.toFixed(2)),
      incidents,
      totalDowntime: Number(totalDowntime.toFixed(1))
    };
  }
}

export const systemMonitoringService = new SystemMonitoringService();
