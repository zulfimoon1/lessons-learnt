
import { supabase } from '@/integrations/supabase/client';

interface LessonRecommendation {
  subject: string;
  topic: string;
  reason: string;
  confidence: number;
  metadata: {
    previousPerformance?: number;
    relatedTopics?: string[];
    difficulty?: 'basic' | 'intermediate' | 'advanced';
  };
}

interface StudentEngagementPrediction {
  studentId: string;
  studentName: string;
  riskLevel: 'low' | 'medium' | 'high';
  predictedEngagement: number;
  factors: string[];
  recommendations: string[];
}

class AIRecommendationService {
  // Analyze student feedback patterns to recommend lesson improvements
  async generateLessonRecommendations(teacherId: string, subject?: string): Promise<LessonRecommendation[]> {
    try {
      const { data: feedbackData } = await supabase
        .from('feedback')
        .select(`
          *,
          class_schedules!inner(*)
        `)
        .eq('class_schedules.teacher_id', teacherId)
        .eq('class_schedules.subject', subject || '')
        .order('submitted_at', { ascending: false })
        .limit(50);

      if (!feedbackData || feedbackData.length === 0) {
        return this.getDefaultRecommendations();
      }

      const recommendations: LessonRecommendation[] = [];

      // Analyze understanding patterns
      const lowUnderstandingTopics = this.identifyLowPerformanceTopics(feedbackData);
      lowUnderstandingTopics.forEach(topic => {
        recommendations.push({
          subject: topic.subject,
          topic: topic.topic,
          reason: `Students showing difficulty with ${topic.topic}. Average understanding: ${topic.avgUnderstanding}/5`,
          confidence: 0.8,
          metadata: {
            previousPerformance: topic.avgUnderstanding,
            difficulty: topic.avgUnderstanding < 3 ? 'basic' : 'intermediate'
          }
        });
      });

      // Analyze interest patterns
      const lowInterestTopics = this.identifyLowInterestTopics(feedbackData);
      lowInterestTopics.forEach(topic => {
        recommendations.push({
          subject: topic.subject,
          topic: topic.topic,
          reason: `Students showing low interest in ${topic.topic}. Consider more engaging approaches.`,
          confidence: 0.7,
          metadata: {
            previousPerformance: topic.avgInterest,
            relatedTopics: this.getRelatedTopics(topic.topic)
          }
        });
      });

      return recommendations.slice(0, 10); // Limit to top 10 recommendations
    } catch (error) {
      console.error('Error generating lesson recommendations:', error);
      return this.getDefaultRecommendations();
    }
  }

  // Predict student engagement based on historical patterns
  async predictStudentEngagement(school: string, grade?: string): Promise<StudentEngagementPrediction[]> {
    try {
      const { data: studentsData } = await supabase
        .from('students')
        .select('*')
        .eq('school', school)
        .eq('grade', grade || '');

      if (!studentsData) return [];

      const predictions: StudentEngagementPrediction[] = [];

      for (const student of studentsData) {
        // Get student's recent feedback
        const { data: feedbackData } = await supabase
          .from('feedback')
          .select('*')
          .eq('student_id', student.id)
          .order('submitted_at', { ascending: false })
          .limit(10);

        const prediction = this.calculateEngagementPrediction(student, feedbackData || []);
        predictions.push(prediction);
      }

      return predictions.sort((a, b) => b.riskLevel === 'high' ? 1 : -1);
    } catch (error) {
      console.error('Error predicting student engagement:', error);
      return [];
    }
  }

  // Detect patterns in mental health feedback
  async analyzeMentalHealthPatterns(school: string): Promise<{
    riskLevel: 'low' | 'medium' | 'high';
    trends: string[];
    recommendations: string[];
  }> {
    try {
      const { data: alertsData } = await supabase
        .from('mental_health_alerts')
        .select('*')
        .eq('school', school)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const recentAlerts = alertsData || [];
      const highSeverityCount = recentAlerts.filter(alert => alert.severity_level >= 4).length;
      const totalAlerts = recentAlerts.length;

      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      if (highSeverityCount > 3) riskLevel = 'high';
      else if (totalAlerts > 5) riskLevel = 'medium';

      const trends = this.identifyMentalHealthTrends(recentAlerts);
      const recommendations = this.generateMentalHealthRecommendations(riskLevel, trends);

      return { riskLevel, trends, recommendations };
    } catch (error) {
      console.error('Error analyzing mental health patterns:', error);
      return {
        riskLevel: 'low',
        trends: [],
        recommendations: ['Regular monitoring recommended']
      };
    }
  }

  private identifyLowPerformanceTopics(feedbackData: any[]) {
    const topicMap = new Map();
    
    feedbackData.forEach(feedback => {
      const topic = feedback.class_schedules.lesson_topic;
      const subject = feedback.class_schedules.subject;
      const understanding = feedback.understanding || 0;

      if (!topicMap.has(topic)) {
        topicMap.set(topic, {
          topic,
          subject,
          totalUnderstanding: 0,
          count: 0
        });
      }

      const topicData = topicMap.get(topic);
      topicData.totalUnderstanding += understanding;
      topicData.count++;
    });

    return Array.from(topicMap.values())
      .map(topic => ({
        ...topic,
        avgUnderstanding: topic.totalUnderstanding / topic.count
      }))
      .filter(topic => topic.avgUnderstanding < 3.5)
      .sort((a, b) => a.avgUnderstanding - b.avgUnderstanding);
  }

  private identifyLowInterestTopics(feedbackData: any[]) {
    const topicMap = new Map();
    
    feedbackData.forEach(feedback => {
      const topic = feedback.class_schedules.lesson_topic;
      const subject = feedback.class_schedules.subject;
      const interest = feedback.interest || 0;

      if (!topicMap.has(topic)) {
        topicMap.set(topic, {
          topic,
          subject,
          totalInterest: 0,
          count: 0
        });
      }

      const topicData = topicMap.get(topic);
      topicData.totalInterest += interest;
      topicData.count++;
    });

    return Array.from(topicMap.values())
      .map(topic => ({
        ...topic,
        avgInterest: topic.totalInterest / topic.count
      }))
      .filter(topic => topic.avgInterest < 3.0)
      .sort((a, b) => a.avgInterest - b.avgInterest);
  }

  private calculateEngagementPrediction(student: any, feedbackData: any[]): StudentEngagementPrediction {
    if (feedbackData.length === 0) {
      return {
        studentId: student.id,
        studentName: student.full_name,
        riskLevel: 'medium',
        predictedEngagement: 0.5,
        factors: ['Insufficient data'],
        recommendations: ['Encourage feedback submission']
      };
    }

    const avgUnderstanding = feedbackData.reduce((sum, f) => sum + (f.understanding || 0), 0) / feedbackData.length;
    const avgInterest = feedbackData.reduce((sum, f) => sum + (f.interest || 0), 0) / feedbackData.length;
    const feedbackFrequency = feedbackData.length / 10; // Out of last 10 possible submissions

    const engagementScore = (avgUnderstanding + avgInterest + (feedbackFrequency * 5)) / 3;
    
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (engagementScore < 2.5) riskLevel = 'high';
    else if (engagementScore < 3.5) riskLevel = 'medium';

    const factors = [];
    const recommendations = [];

    if (avgUnderstanding < 3) {
      factors.push('Low understanding scores');
      recommendations.push('Provide additional learning support');
    }
    if (avgInterest < 3) {
      factors.push('Low interest levels');
      recommendations.push('Try more engaging teaching methods');
    }
    if (feedbackFrequency < 0.5) {
      factors.push('Infrequent feedback submission');
      recommendations.push('Encourage regular participation');
    }

    return {
      studentId: student.id,
      studentName: student.full_name,
      riskLevel,
      predictedEngagement: engagementScore / 5,
      factors,
      recommendations
    };
  }

  private identifyMentalHealthTrends(alerts: any[]): string[] {
    const trends = [];
    
    if (alerts.length > 10) {
      trends.push('Increasing frequency of mental health concerns');
    }
    
    const severityDistribution = alerts.reduce((acc, alert) => {
      acc[alert.severity_level] = (acc[alert.severity_level] || 0) + 1;
      return acc;
    }, {});

    if (severityDistribution[5] > 2) {
      trends.push('High-severity alerts detected');
    }

    return trends;
  }

  private generateMentalHealthRecommendations(riskLevel: string, trends: string[]): string[] {
    const recommendations = [];

    if (riskLevel === 'high') {
      recommendations.push('Immediate intervention recommended');
      recommendations.push('Contact school counselor');
    } else if (riskLevel === 'medium') {
      recommendations.push('Increased monitoring needed');
      recommendations.push('Consider preventive measures');
    }

    if (trends.includes('High-severity alerts detected')) {
      recommendations.push('Review crisis intervention protocols');
    }

    return recommendations;
  }

  private getRelatedTopics(topic: string): string[] {
    // Simple topic relationship mapping
    const relationships: { [key: string]: string[] } = {
      'mathematics': ['algebra', 'geometry', 'statistics'],
      'science': ['physics', 'chemistry', 'biology'],
      'english': ['literature', 'grammar', 'writing'],
      'history': ['world history', 'local history', 'geography']
    };

    for (const [subject, topics] of Object.entries(relationships)) {
      if (topic.toLowerCase().includes(subject)) {
        return topics;
      }
    }

    return [];
  }

  private getDefaultRecommendations(): LessonRecommendation[] {
    return [
      {
        subject: 'General',
        topic: 'Interactive Learning',
        reason: 'Consider incorporating more interactive elements in lessons',
        confidence: 0.6,
        metadata: { difficulty: 'intermediate' }
      },
      {
        subject: 'General',
        topic: 'Student Engagement',
        reason: 'Focus on improving student engagement strategies',
        confidence: 0.6,
        metadata: { difficulty: 'basic' }
      }
    ];
  }
}

export const aiRecommendationService = new AIRecommendationService();
