
import { supabase } from '@/integrations/supabase/client';
import { multiLanguageDistressService, DistressAnalysis } from './multiLanguageDistressService';

export interface AnalyticsInsight {
  id: string;
  type: 'trend' | 'pattern' | 'anomaly' | 'prediction';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  confidence: number;
  affectedStudents: string[];
  recommendedActions: string[];
  timestamp: string;
  metadata: Record<string, any>;
}

export interface TrendAnalysis {
  period: 'daily' | 'weekly' | 'monthly';
  distressLevels: Array<{
    date: string;
    low: number;
    medium: number;
    high: number;
    critical: number;
  }>;
  languageDistribution: Record<string, number>;
  topIndicators: Array<{
    indicator: string;
    frequency: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }>;
  schoolComparison?: Array<{
    school: string;
    avgRiskLevel: number;
    totalAlerts: number;
  }>;
}

class AdvancedAIAnalyticsService {
  
  async generateInsights(
    school: string, 
    timeframe: 'week' | 'month' | 'semester' = 'week'
  ): Promise<AnalyticsInsight[]> {
    const insights: AnalyticsInsight[] = [];
    
    try {
      // Get recent mental health alerts for analysis
      const { data: alerts, error } = await supabase
        .from('mental_health_alerts')
        .select('*')
        .eq('school', school)
        .gte('created_at', this.getTimeframeStart(timeframe))
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (alerts && alerts.length > 0) {
        // Generate trend insights
        const trendInsights = await this.analyzeTrends(alerts, school);
        insights.push(...trendInsights);

        // Generate pattern insights
        const patternInsights = await this.analyzePatterns(alerts, school);
        insights.push(...patternInsights);

        // Generate predictive insights
        const predictiveInsights = await this.generatePredictions(alerts, school);
        insights.push(...predictiveInsights);
      }

      return insights;
    } catch (error) {
      console.error('Error generating AI insights:', error);
      return [];
    }
  }

  async analyzeTrends(alerts: any[], school: string): Promise<AnalyticsInsight[]> {
    const insights: AnalyticsInsight[] = [];
    
    // Analyze severity trends
    const severityTrend = this.calculateSeverityTrend(alerts);
    if (severityTrend.trend === 'increasing' && severityTrend.confidence > 0.7) {
      insights.push({
        id: crypto.randomUUID(),
        type: 'trend',
        severity: 'warning',
        title: 'Increasing Mental Health Concerns',
        description: `Mental health alert severity has increased by ${Math.round(severityTrend.increase * 100)}% over the past period.`,
        confidence: severityTrend.confidence,
        affectedStudents: severityTrend.affectedStudents,
        recommendedActions: [
          'Schedule additional counseling sessions',
          'Review current stress factors in curriculum',
          'Consider implementing wellness initiatives'
        ],
        timestamp: new Date().toISOString(),
        metadata: { trend: severityTrend }
      });
    }

    // Analyze language-specific trends
    const languageTrends = this.analyzeLanguageSpecificTrends(alerts);
    if (languageTrends.significantFindings.length > 0) {
      insights.push({
        id: crypto.randomUUID(),
        type: 'pattern',
        severity: 'info',
        title: 'Language-Specific Mental Health Patterns',
        description: 'Different mental health expression patterns detected across languages.',
        confidence: 0.8,
        affectedStudents: languageTrends.affectedStudents,
        recommendedActions: [
          'Provide culturally sensitive support resources',
          'Train staff on language-specific indicators',
          'Customize intervention approaches by language'
        ],
        timestamp: new Date().toISOString(),
        metadata: { languageTrends }
      });
    }

    return insights;
  }

  async analyzePatterns(alerts: any[], school: string): Promise<AnalyticsInsight[]> {
    const insights: AnalyticsInsight[] = [];
    
    // Time-based pattern analysis
    const timePatterns = this.analyzeTimePatterns(alerts);
    if (timePatterns.peakHours.length > 0) {
      insights.push({
        id: crypto.randomUUID(),
        type: 'pattern',
        severity: 'info',
        title: 'Peak Distress Time Patterns',
        description: `Mental health alerts peak during ${timePatterns.peakHours.join(', ')}`,
        confidence: timePatterns.confidence,
        affectedStudents: [],
        recommendedActions: [
          'Schedule support resources during peak times',
          'Investigate stress factors during these periods',
          'Implement preventive measures before peak times'
        ],
        timestamp: new Date().toISOString(),
        metadata: { timePatterns }
      });
    }

    return insights;
  }

  async generatePredictions(alerts: any[], school: string): Promise<AnalyticsInsight[]> {
    const insights: AnalyticsInsight[] = [];
    
    // Predict potential risk escalation
    const riskPrediction = this.predictRiskEscalation(alerts);
    if (riskPrediction.probability > 0.6) {
      insights.push({
        id: crypto.randomUUID(),
        type: 'prediction',
        severity: riskPrediction.severity,
        title: 'Risk Escalation Prediction',
        description: `${Math.round(riskPrediction.probability * 100)}% probability of increased mental health concerns in the next week.`,
        confidence: riskPrediction.confidence,
        affectedStudents: riskPrediction.atRiskStudents,
        recommendedActions: [
          'Proactively reach out to at-risk students',
          'Increase monitoring and support availability',
          'Prepare crisis intervention resources'
        ],
        timestamp: new Date().toISOString(),
        metadata: { riskPrediction }
      });
    }

    return insights;
  }

  private calculateSeverityTrend(alerts: any[]) {
    const recent = alerts.slice(0, Math.floor(alerts.length / 2));
    const older = alerts.slice(Math.floor(alerts.length / 2));
    
    const recentAvgSeverity = recent.reduce((sum, alert) => sum + alert.severity_level, 0) / recent.length;
    const olderAvgSeverity = older.reduce((sum, alert) => sum + alert.severity_level, 0) / older.length;
    
    const increase = (recentAvgSeverity - olderAvgSeverity) / olderAvgSeverity;
    const confidence = Math.min(0.9, alerts.length / 20); // Higher confidence with more data
    
    return {
      trend: increase > 0.1 ? 'increasing' : increase < -0.1 ? 'decreasing' : 'stable',
      increase,
      confidence,
      affectedStudents: recent.map(a => a.student_id).filter(Boolean)
    };
  }

  private analyzeLanguageSpecificTrends(alerts: any[]) {
    // Simulate language detection from alert content
    const languagePatterns = alerts.reduce((acc, alert) => {
      const language = this.detectLanguageFromContent(alert.content);
      if (!acc[language]) acc[language] = [];
      acc[language].push(alert);
      return acc;
    }, {} as Record<string, any[]>);
    
    const significantFindings = Object.entries(languagePatterns)
      .filter(([_, alerts]) => alerts.length >= 3)
      .map(([lang, alerts]) => ({
        language: lang,
        avgSeverity: alerts.reduce((sum, a) => sum + a.severity_level, 0) / alerts.length,
        count: alerts.length
      }));
    
    return {
      significantFindings,
      affectedStudents: alerts.map(a => a.student_id).filter(Boolean)
    };
  }

  private analyzeTimePatterns(alerts: any[]) {
    const hourCounts = alerts.reduce((acc, alert) => {
      const hour = new Date(alert.created_at).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    const avgCount = Object.values(hourCounts).reduce((sum, count) => sum + count, 0) / 24;
    const peakHours = Object.entries(hourCounts)
      .filter(([_, count]) => count > avgCount * 1.5)
      .map(([hour, _]) => `${hour}:00`);
    
    return {
      peakHours,
      confidence: Math.min(0.9, alerts.length / 50),
      hourlyDistribution: hourCounts
    };
  }

  private predictRiskEscalation(alerts: any[]) {
    const recentWeek = alerts.filter(alert => 
      new Date(alert.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
    
    const previousWeek = alerts.filter(alert => {
      const date = new Date(alert.created_at);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      return date <= weekAgo && date > twoWeeksAgo;
    });
    
    const recentHighRisk = recentWeek.filter(a => a.severity_level >= 4).length;
    const previousHighRisk = previousWeek.filter(a => a.severity_level >= 4).length;
    
    const riskIncrease = previousHighRisk > 0 ? (recentHighRisk - previousHighRisk) / previousHighRisk : 0;
    const probability = Math.min(0.9, Math.max(0.1, 0.5 + riskIncrease));
    
    return {
      probability,
      severity: probability > 0.8 ? 'critical' : probability > 0.6 ? 'warning' : 'info',
      confidence: Math.min(0.9, alerts.length / 30),
      atRiskStudents: recentWeek
        .filter(a => a.severity_level >= 4)
        .map(a => a.student_id)
        .filter(Boolean)
    };
  }

  private detectLanguageFromContent(content: string): string {
    if (!content) return 'unknown';
    
    // Simple language detection based on character patterns
    const lithuanianChars = /[ąčęėįšųūž]/i;
    const englishWords = /\b(the|and|that|have|for|not|with|you|this|but|his|from|they)\b/i;
    
    if (lithuanianChars.test(content)) return 'lt';
    if (englishWords.test(content)) return 'en';
    return 'unknown';
  }

  private getTimeframeStart(timeframe: 'week' | 'month' | 'semester'): string {
    const now = new Date();
    switch (timeframe) {
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      case 'semester':
        return new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    }
  }
}

export const advancedAIAnalyticsService = new AdvancedAIAnalyticsService();
