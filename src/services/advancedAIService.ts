
import { supabase } from '@/integrations/supabase/client';
import { aiRecommendationService } from './aiRecommendationService';

interface PersonalizationProfile {
  studentId: string;
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  preferredDifficulty: 'basic' | 'intermediate' | 'advanced';
  interestAreas: string[];
  strengths: string[];
  improvementAreas: string[];
  engagementPatterns: {
    timeOfDay: string;
    subjectPreferences: Record<string, number>;
    feedbackFrequency: number;
  };
}

interface PredictiveInsight {
  type: 'performance' | 'engagement' | 'wellbeing' | 'learning_path';
  confidence: number;
  prediction: string;
  reasoning: string;
  recommendations: string[];
  timeframe: 'immediate' | 'short_term' | 'long_term';
}

interface LearningPathStep {
  id: string;
  subject: string;
  topic: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  estimatedDuration: number;
  prerequisites: string[];
  resources: {
    type: 'video' | 'reading' | 'exercise' | 'interactive';
    url?: string;
    description: string;
  }[];
}

class AdvancedAIService {
  // Enhanced personalization based on learning patterns
  async generatePersonalizationProfile(studentId: string): Promise<PersonalizationProfile> {
    try {
      console.log('🤖 Generating personalization profile for student:', studentId);
      
      // Get comprehensive student data
      const { data: feedbackData } = await supabase
        .from('feedback')
        .select(`
          *,
          class_schedules!inner(subject, lesson_topic, class_date)
        `)
        .eq('student_id', studentId)
        .order('submitted_at', { ascending: false })
        .limit(50);

      if (!feedbackData || feedbackData.length === 0) {
        return this.getDefaultProfile(studentId);
      }

      // Analyze learning patterns
      const learningStyle = this.detectLearningStyle(feedbackData);
      const preferredDifficulty = this.analyzeDifficultyPreference(feedbackData);
      const interestAreas = this.identifyInterestAreas(feedbackData);
      const strengths = this.identifyStrengths(feedbackData);
      const improvementAreas = this.identifyImprovementAreas(feedbackData);
      const engagementPatterns = this.analyzeEngagementPatterns(feedbackData);

      const profile: PersonalizationProfile = {
        studentId,
        learningStyle,
        preferredDifficulty,
        interestAreas,
        strengths,
        improvementAreas,
        engagementPatterns
      };

      // Store profile for future use
      await this.storePersonalizationProfile(profile);
      
      return profile;
    } catch (error) {
      console.error('Error generating personalization profile:', error);
      return this.getDefaultProfile(studentId);
    }
  }

  // Advanced predictive analytics
  async generatePredictiveInsights(studentId: string, timeframe: 'week' | 'month' | 'semester' = 'week'): Promise<PredictiveInsight[]> {
    try {
      console.log('🔮 Generating predictive insights for student:', studentId);
      
      const profile = await this.generatePersonalizationProfile(studentId);
      const insights: PredictiveInsight[] = [];

      // Performance prediction
      const performanceInsight = await this.predictPerformance(studentId, profile, timeframe);
      if (performanceInsight) insights.push(performanceInsight);

      // Engagement prediction
      const engagementInsight = await this.predictEngagement(studentId, profile, timeframe);
      if (engagementInsight) insights.push(engagementInsight);

      // Wellbeing prediction
      const wellbeingInsight = await this.predictWellbeing(studentId, profile, timeframe);
      if (wellbeingInsight) insights.push(wellbeingInsight);

      // Learning path recommendation
      const learningPathInsight = await this.recommendLearningPath(studentId, profile);
      if (learningPathInsight) insights.push(learningPathInsight);

      return insights.sort((a, b) => b.confidence - a.confidence);
    } catch (error) {
      console.error('Error generating predictive insights:', error);
      return [];
    }
  }

  // Intelligent content recommendation
  async generateContentRecommendations(studentId: string, subject?: string): Promise<LearningPathStep[]> {
    try {
      console.log('📚 Generating content recommendations for student:', studentId);
      
      const profile = await this.generatePersonalizationProfile(studentId);
      const recommendations: LearningPathStep[] = [];

      // Get recent performance data
      const { data: recentFeedback } = await supabase
        .from('feedback')
        .select(`
          *,
          class_schedules!inner(subject, lesson_topic)
        `)
        .eq('student_id', studentId)
        .eq('class_schedules.subject', subject || '')
        .order('submitted_at', { ascending: false })
        .limit(10);

      // Generate personalized learning path
      const learningPath = this.createPersonalizedLearningPath(
        profile,
        recentFeedback || [],
        subject
      );

      return learningPath;
    } catch (error) {
      console.error('Error generating content recommendations:', error);
      return [];
    }
  }

  // Natural language processing for feedback analysis
  async analyzeTextFeedback(textFeedback: string): Promise<{
    sentiment: 'positive' | 'neutral' | 'negative';
    emotions: string[];
    topics: string[];
    concerns: string[];
    suggestions: string[];
  }> {
    try {
      console.log('📝 Analyzing text feedback with NLP');
      
      // Simple NLP analysis (in production, would use proper NLP service)
      const sentiment = this.analyzeSentiment(textFeedback);
      const emotions = this.extractEmotions(textFeedback);
      const topics = this.extractTopics(textFeedback);
      const concerns = this.extractConcerns(textFeedback);
      const suggestions = this.generateSuggestions(textFeedback, sentiment);

      return {
        sentiment,
        emotions,
        topics,
        concerns,
        suggestions
      };
    } catch (error) {
      console.error('Error analyzing text feedback:', error);
      return {
        sentiment: 'neutral',
        emotions: [],
        topics: [],
        concerns: [],
        suggestions: []
      };
    }
  }

  // Private helper methods
  private detectLearningStyle(feedbackData: any[]): 'visual' | 'auditory' | 'kinesthetic' | 'reading' {
    // Analyze patterns in feedback to detect learning style
    const interestByType = feedbackData.reduce((acc, feedback) => {
      // Simple heuristic based on lesson topics and interest levels
      const topic = feedback.class_schedules?.lesson_topic?.toLowerCase() || '';
      if (topic.includes('visual') || topic.includes('diagram') || topic.includes('chart')) {
        acc.visual += feedback.interest || 0;
      } else if (topic.includes('discussion') || topic.includes('presentation')) {
        acc.auditory += feedback.interest || 0;
      } else if (topic.includes('hands-on') || topic.includes('experiment')) {
        acc.kinesthetic += feedback.interest || 0;
      } else {
        acc.reading += feedback.interest || 0;
      }
      return acc;
    }, { visual: 0, auditory: 0, kinesthetic: 0, reading: 0 });

    const maxStyle = Object.entries(interestByType).reduce((a, b) => 
      interestByType[a[0] as keyof typeof interestByType] > interestByType[b[0] as keyof typeof interestByType] ? a : b
    );

    return maxStyle[0] as 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  }

  private analyzeDifficultyPreference(feedbackData: any[]): 'basic' | 'intermediate' | 'advanced' {
    const avgUnderstanding = feedbackData.reduce((sum, f) => sum + (f.understanding || 0), 0) / feedbackData.length;
    const avgInterest = feedbackData.reduce((sum, f) => sum + (f.interest || 0), 0) / feedbackData.length;
    
    const combinedScore = (avgUnderstanding + avgInterest) / 2;
    
    if (combinedScore >= 4.5) return 'advanced';
    if (combinedScore >= 3.5) return 'intermediate';
    return 'basic';
  }

  private identifyInterestAreas(feedbackData: any[]): string[] {
    const subjectInterest = new Map();
    
    feedbackData.forEach(feedback => {
      const subject = feedback.class_schedules?.subject;
      if (subject) {
        const currentInterest = subjectInterest.get(subject) || { total: 0, count: 0 };
        currentInterest.total += feedback.interest || 0;
        currentInterest.count += 1;
        subjectInterest.set(subject, currentInterest);
      }
    });

    return Array.from(subjectInterest.entries())
      .map(([subject, data]) => ({ subject, avg: data.total / data.count }))
      .filter(item => item.avg >= 4.0)
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 3)
      .map(item => item.subject);
  }

  private identifyStrengths(feedbackData: any[]): string[] {
    const subjectPerformance = new Map();
    
    feedbackData.forEach(feedback => {
      const subject = feedback.class_schedules?.subject;
      if (subject) {
        const current = subjectPerformance.get(subject) || { total: 0, count: 0 };
        current.total += feedback.understanding || 0;
        current.count += 1;
        subjectPerformance.set(subject, current);
      }
    });

    return Array.from(subjectPerformance.entries())
      .map(([subject, data]) => ({ subject, avg: data.total / data.count }))
      .filter(item => item.avg >= 4.0)
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 2)
      .map(item => item.subject);
  }

  private identifyImprovementAreas(feedbackData: any[]): string[] {
    const subjectPerformance = new Map();
    
    feedbackData.forEach(feedback => {
      const subject = feedback.class_schedules?.subject;
      if (subject) {
        const current = subjectPerformance.get(subject) || { total: 0, count: 0 };
        current.total += feedback.understanding || 0;
        current.count += 1;
        subjectPerformance.set(subject, current);
      }
    });

    return Array.from(subjectPerformance.entries())
      .map(([subject, data]) => ({ subject, avg: data.total / data.count }))
      .filter(item => item.avg < 3.5)
      .sort((a, b) => a.avg - b.avg)
      .slice(0, 2)
      .map(item => item.subject);
  }

  private analyzeEngagementPatterns(feedbackData: any[]): PersonalizationProfile['engagementPatterns'] {
    const timePattern = this.analyzeTimePatterns(feedbackData);
    const subjectPreferences = this.analyzeSubjectPreferences(feedbackData);
    const feedbackFrequency = feedbackData.length / 30; // Feedback per month estimate

    return {
      timeOfDay: timePattern,
      subjectPreferences,
      feedbackFrequency
    };
  }

  private analyzeTimePatterns(feedbackData: any[]): string {
    // Simple time analysis - in production would be more sophisticated
    const hours = feedbackData.map(f => new Date(f.submitted_at).getHours());
    const avgHour = hours.reduce((sum, h) => sum + h, 0) / hours.length;
    
    if (avgHour < 12) return 'morning';
    if (avgHour < 17) return 'afternoon';
    return 'evening';
  }

  private analyzeSubjectPreferences(feedbackData: any[]): Record<string, number> {
    const preferences: Record<string, number> = {};
    
    feedbackData.forEach(feedback => {
      const subject = feedback.class_schedules?.subject;
      if (subject) {
        const score = ((feedback.understanding || 0) + (feedback.interest || 0)) / 2;
        preferences[subject] = (preferences[subject] || 0) + score;
      }
    });

    // Normalize scores
    const maxScore = Math.max(...Object.values(preferences));
    Object.keys(preferences).forEach(subject => {
      preferences[subject] = preferences[subject] / maxScore;
    });

    return preferences;
  }

  private async predictPerformance(studentId: string, profile: PersonalizationProfile, timeframe: string): Promise<PredictiveInsight | null> {
    // Simple performance prediction logic
    const avgStrengthScore = 4.2; // Would calculate from actual data
    const improvementFactor = profile.improvementAreas.length > 0 ? 0.8 : 1.0;
    const engagementFactor = profile.engagementPatterns.feedbackFrequency > 0.5 ? 1.1 : 0.9;
    
    const predictedScore = avgStrengthScore * improvementFactor * engagementFactor;
    
    return {
      type: 'performance',
      confidence: 0.75,
      prediction: `Predicted academic performance: ${predictedScore.toFixed(1)}/5.0`,
      reasoning: `Based on current strengths in ${profile.strengths.join(', ')} and consistent engagement patterns`,
      recommendations: [
        'Continue focusing on strength areas',
        'Allocate extra time for improvement areas',
        'Maintain regular feedback submission'
      ],
      timeframe: timeframe === 'week' ? 'short_term' : 'long_term'
    };
  }

  private async predictEngagement(studentId: string, profile: PersonalizationProfile, timeframe: string): Promise<PredictiveInsight | null> {
    const engagementScore = Math.min(5.0, profile.engagementPatterns.feedbackFrequency * 5);
    
    return {
      type: 'engagement',
      confidence: 0.68,
      prediction: `Predicted engagement level: ${engagementScore.toFixed(1)}/5.0`,
      reasoning: `Based on feedback frequency and subject preferences`,
      recommendations: [
        'Focus on high-interest subjects during optimal times',
        'Introduce variety in learning methods',
        'Set small, achievable goals'
      ],
      timeframe: 'short_term'
    };
  }

  private async predictWellbeing(studentId: string, profile: PersonalizationProfile, timeframe: string): Promise<PredictiveInsight | null> {
    // Check for mental health indicators
    const { data: alertsData } = await supabase
      .from('mental_health_alerts')
      .select('*')
      .eq('student_id', studentId)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    const recentAlerts = alertsData?.length || 0;
    const wellbeingScore = Math.max(1.0, 5.0 - (recentAlerts * 0.5));
    
    return {
      type: 'wellbeing',
      confidence: 0.65,
      prediction: `Predicted wellbeing level: ${wellbeingScore.toFixed(1)}/5.0`,
      reasoning: `Based on recent mental health indicators and engagement patterns`,
      recommendations: [
        'Monitor stress levels during peak study times',
        'Encourage regular breaks and physical activity',
        'Provide access to support resources'
      ],
      timeframe: 'immediate'
    };
  }

  private async recommendLearningPath(studentId: string, profile: PersonalizationProfile): Promise<PredictiveInsight | null> {
    const nextSteps = profile.improvementAreas.slice(0, 2);
    
    return {
      type: 'learning_path',
      confidence: 0.82,
      prediction: `Recommended focus areas: ${nextSteps.join(', ')}`,
      reasoning: `Tailored to learning style (${profile.learningStyle}) and current performance gaps`,
      recommendations: [
        `Start with ${profile.preferredDifficulty} level content`,
        `Use ${profile.learningStyle} learning methods`,
        'Build on existing strengths while addressing gaps'
      ],
      timeframe: 'long_term'
    };
  }

  private createPersonalizedLearningPath(profile: PersonalizationProfile, recentFeedback: any[], subject?: string): LearningPathStep[] {
    // Create a basic learning path based on profile
    const steps: LearningPathStep[] = [];
    
    // Add steps based on improvement areas and learning style
    profile.improvementAreas.forEach((area, index) => {
      steps.push({
        id: `step-${index + 1}`,
        subject: area,
        topic: `Foundation concepts in ${area}`,
        difficulty: profile.preferredDifficulty,
        estimatedDuration: 30,
        prerequisites: index > 0 ? [`step-${index}`] : [],
        resources: this.generateResourcesForLearningStyle(profile.learningStyle, area)
      });
    });

    return steps;
  }

  private generateResourcesForLearningStyle(learningStyle: string, subject: string): LearningPathStep['resources'] {
    const baseResources = [
      {
        type: 'reading' as const,
        description: `Introduction to ${subject} concepts`
      },
      {
        type: 'exercise' as const,
        description: `Practice exercises for ${subject}`
      }
    ];

    switch (learningStyle) {
      case 'visual':
        return [
          {
            type: 'interactive' as const,
            description: `Visual diagrams and charts for ${subject}`
          },
          ...baseResources
        ];
      case 'auditory':
        return [
          {
            type: 'video' as const,
            description: `Audio lectures on ${subject}`
          },
          ...baseResources
        ];
      case 'kinesthetic':
        return [
          {
            type: 'interactive' as const,
            description: `Hands-on activities for ${subject}`
          },
          ...baseResources
        ];
      default:
        return baseResources;
    }
  }

  private analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['good', 'great', 'excellent', 'love', 'like', 'enjoy', 'fun', 'interesting', 'helpful'];
    const negativeWords = ['bad', 'terrible', 'hate', 'dislike', 'boring', 'difficult', 'confusing', 'hard'];
    
    const words = text.toLowerCase().split(/\s+/);
    const positiveCount = words.filter(word => positiveWords.includes(word)).length;
    const negativeCount = words.filter(word => negativeWords.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private extractEmotions(text: string): string[] {
    const emotionWords = {
      'happy': ['happy', 'joy', 'excited', 'pleased'],
      'frustrated': ['frustrated', 'annoyed', 'irritated'],
      'confused': ['confused', 'puzzled', 'lost'],
      'motivated': ['motivated', 'inspired', 'encouraged'],
      'anxious': ['anxious', 'worried', 'nervous']
    };

    const emotions: string[] = [];
    const words = text.toLowerCase().split(/\s+/);
    
    Object.entries(emotionWords).forEach(([emotion, keywords]) => {
      if (keywords.some(keyword => words.includes(keyword))) {
        emotions.push(emotion);
      }
    });

    return emotions;
  }

  private extractTopics(text: string): string[] {
    const topicWords = ['math', 'science', 'english', 'history', 'assignment', 'test', 'homework', 'project'];
    const words = text.toLowerCase().split(/\s+/);
    return topicWords.filter(topic => words.some(word => word.includes(topic)));
  }

  private extractConcerns(text: string): string[] {
    const concernIndicators = ['too hard', 'too fast', 'dont understand', 'need help', 'struggling'];
    const concerns: string[] = [];
    const lowerText = text.toLowerCase();
    
    concernIndicators.forEach(indicator => {
      if (lowerText.includes(indicator)) {
        concerns.push(`Student mentions: "${indicator}"`);
      }
    });

    return concerns;
  }

  private generateSuggestions(text: string, sentiment: string): string[] {
    const suggestions: string[] = [];
    
    if (sentiment === 'negative') {
      suggestions.push('Consider additional support resources');
      suggestions.push('Schedule one-on-one discussion');
    } else if (sentiment === 'positive') {
      suggestions.push('Continue with current teaching approach');
      suggestions.push('Consider introducing more advanced concepts');
    }
    
    suggestions.push('Monitor progress in upcoming lessons');
    return suggestions;
  }

  private async storePersonalizationProfile(profile: PersonalizationProfile): Promise<void> {
    try {
      // Store in localStorage for now (in production, would use database)
      localStorage.setItem(`ai_profile_${profile.studentId}`, JSON.stringify(profile));
    } catch (error) {
      console.error('Error storing personalization profile:', error);
    }
  }

  private getDefaultProfile(studentId: string): PersonalizationProfile {
    return {
      studentId,
      learningStyle: 'reading',
      preferredDifficulty: 'intermediate',
      interestAreas: [],
      strengths: [],
      improvementAreas: [],
      engagementPatterns: {
        timeOfDay: 'morning',
        subjectPreferences: {},
        feedbackFrequency: 0.5
      }
    };
  }
}

export const advancedAIService = new AdvancedAIService();
