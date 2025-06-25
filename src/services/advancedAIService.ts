
import { supabase } from '@/integrations/supabase/client';

export interface PersonalizationProfile {
  studentId: string;
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  preferredLanguage: 'en' | 'lt';
  difficultyPreference: 'easy' | 'medium' | 'hard' | 'adaptive';
  interactionPatterns: {
    avgSessionDuration: number;
    preferredTimeOfDay: string;
    responseSpeed: 'fast' | 'medium' | 'slow';
  };
  strengthAreas: string[];
  improvementAreas: string[];
  emotionalPatterns: {
    positiveIndicators: string[];
    stressIndicators: string[];
    engagementLevel: number;
  };
  lastUpdated: string;
}

export interface PredictiveInsight {
  id: string;
  type: 'performance' | 'engagement' | 'wellbeing' | 'learning_path';
  confidence: number;
  timeframe: 'immediate' | 'short_term' | 'long_term';
  prediction: string;
  recommendedActions: string[];
  impactLevel: 'low' | 'medium' | 'high';
  metadata: Record<string, any>;
}

export interface ContentRecommendation {
  id: string;
  type: 'lesson' | 'exercise' | 'resource' | 'support';
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedDuration: number;
  language: 'en' | 'lt';
  relevanceScore: number;
  tags: string[];
  adaptationReason: string;
}

class AdvancedAIService {
  
  async generatePersonalizationProfile(studentId: string): Promise<PersonalizationProfile> {
    try {
      // Get student's feedback history
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedback')
        .select('*')
        .eq('student_id', studentId)
        .order('submitted_at', { ascending: false })
        .limit(50);

      if (feedbackError) throw feedbackError;

      // Get student's weekly summaries
      const { data: summaryData, error: summaryError } = await supabase
        .from('weekly_summaries')
        .select('*')
        .eq('student_id', studentId)
        .order('submitted_at', { ascending: false })
        .limit(20);

      if (summaryError) throw summaryError;

      // Analyze patterns to build profile
      const profile = this.buildPersonalizationProfile(studentId, feedbackData || [], summaryData || []);
      
      console.log('🎯 Generated personalization profile for student:', studentId);
      return profile;
    } catch (error) {
      console.error('Error generating personalization profile:', error);
      throw new Error('Failed to generate personalization profile');
    }
  }

  async generatePredictiveInsights(
    studentId: string, 
    timeframe: 'week' | 'month' | 'semester' = 'week'
  ): Promise<PredictiveInsight[]> {
    try {
      const insights: PredictiveInsight[] = [];

      // Get recent data for analysis
      const [feedbackData, summaryData, alertData] = await Promise.all([
        supabase.from('feedback').select('*').eq('student_id', studentId).order('submitted_at', { ascending: false }).limit(30),
        supabase.from('weekly_summaries').select('*').eq('student_id', studentId).order('submitted_at', { ascending: false }).limit(10),
        supabase.from('mental_health_alerts').select('*').eq('student_id', studentId).order('created_at', { ascending: false }).limit(20)
      ]);

      // Generate performance predictions
      const performanceInsight = this.predictPerformance(feedbackData.data || [], timeframe);
      if (performanceInsight) insights.push(performanceInsight);

      // Generate engagement predictions
      const engagementInsight = this.predictEngagement(feedbackData.data || [], timeframe);
      if (engagementInsight) insights.push(engagementInsight);

      // Generate wellbeing predictions
      const wellbeingInsight = this.predictWellbeing(summaryData.data || [], alertData.data || [], timeframe);
      if (wellbeingInsight) insights.push(wellbeingInsight);

      console.log('🔮 Generated predictive insights for student:', studentId);
      return insights;
    } catch (error) {
      console.error('Error generating predictive insights:', error);
      throw new Error('Failed to generate predictive insights');
    }
  }

  async generateContentRecommendations(
    studentId: string, 
    subject?: string
  ): Promise<ContentRecommendation[]> {
    try {
      // Get personalization profile first
      const profile = await this.generatePersonalizationProfile(studentId);
      
      // Generate recommendations based on profile
      const recommendations = this.buildContentRecommendations(profile, subject);
      
      console.log('📚 Generated content recommendations for student:', studentId);
      return recommendations;
    } catch (error) {
      console.error('Error generating content recommendations:', error);
      throw new Error('Failed to generate content recommendations');
    }
  }

  async analyzeTextFeedback(text: string): Promise<any> {
    try {
      const analysis = {
        sentiment: this.analyzeSentiment(text),
        emotionalState: this.detectEmotionalState(text),
        learningIndicators: this.extractLearningIndicators(text),
        language: this.detectLanguage(text),
        keyTopics: this.extractKeyTopics(text),
        riskFactors: this.assessRiskFactors(text),
        confidence: this.calculateAnalysisConfidence(text)
      };

      console.log('📝 Analyzed text feedback');
      return analysis;
    } catch (error) {
      console.error('Error analyzing text feedback:', error);
      throw new Error('Failed to analyze text feedback');
    }
  }

  private buildPersonalizationProfile(
    studentId: string, 
    feedbackData: any[], 
    summaryData: any[]
  ): PersonalizationProfile {
    // Analyze learning style from feedback patterns
    const learningStyle = this.determineLearningStyle(feedbackData);
    
    // Determine preferred language
    const preferredLanguage = this.determinePreferredLanguage(feedbackData, summaryData);
    
    // Calculate interaction patterns
    const interactionPatterns = this.analyzeInteractionPatterns(feedbackData);
    
    // Identify strength and improvement areas
    const { strengthAreas, improvementAreas } = this.identifyLearningAreas(feedbackData);
    
    // Analyze emotional patterns
    const emotionalPatterns = this.analyzeEmotionalPatterns(feedbackData, summaryData);

    return {
      studentId,
      learningStyle,
      preferredLanguage,
      difficultyPreference: 'adaptive',
      interactionPatterns,
      strengthAreas,
      improvementAreas,
      emotionalPatterns,
      lastUpdated: new Date().toISOString()
    };
  }

  private determineLearningStyle(feedbackData: any[]): 'visual' | 'auditory' | 'kinesthetic' | 'reading' {
    // Simple heuristic based on feedback patterns
    const avgUnderstanding = feedbackData.length > 0 
      ? feedbackData.reduce((sum, f) => sum + f.understanding, 0) / feedbackData.length 
      : 3;
    
    if (avgUnderstanding >= 4) return 'visual';
    if (avgUnderstanding >= 3) return 'reading';
    return 'kinesthetic';
  }

  private determinePreferredLanguage(feedbackData: any[], summaryData: any[]): 'en' | 'lt' {
    // Check for Lithuanian characters in recent feedback
    const allText = [...feedbackData, ...summaryData]
      .map(item => (item.what_went_well || '') + (item.suggestions || '') + (item.emotional_concerns || '') + (item.academic_concerns || ''))
      .join(' ');
    
    const lithuanianChars = /[ąčęėįšųūž]/i;
    return lithuanianChars.test(allText) ? 'lt' : 'en';
  }

  private analyzeInteractionPatterns(feedbackData: any[]) {
    const recentFeedback = feedbackData.slice(0, 10);
    
    return {
      avgSessionDuration: 15, // minutes - placeholder
      preferredTimeOfDay: 'morning', // placeholder
      responseSpeed: 'medium' as const
    };
  }

  private identifyLearningAreas(feedbackData: any[]) {
    const strengthAreas: string[] = [];
    const improvementAreas: string[] = [];
    
    // Analyze subject performance patterns
    if (feedbackData.length > 0) {
      const avgGrowth = feedbackData.reduce((sum, f) => sum + f.educational_growth, 0) / feedbackData.length;
      const avgInterest = feedbackData.reduce((sum, f) => sum + f.interest, 0) / feedbackData.length;
      
      if (avgGrowth >= 4) strengthAreas.push('Fast Learning');
      if (avgInterest >= 4) strengthAreas.push('High Engagement');
      if (avgGrowth < 3) improvementAreas.push('Learning Speed');
      if (avgInterest < 3) improvementAreas.push('Subject Interest');
    }
    
    return { strengthAreas, improvementAreas };
  }

  private analyzeEmotionalPatterns(feedbackData: any[], summaryData: any[]) {
    const positiveIndicators: string[] = [];
    const stressIndicators: string[] = [];
    
    // Analyze emotional states from feedback
    const positiveStates = feedbackData.filter(f => 
      ['excited', 'focused', 'happy', 'calm'].includes(f.emotional_state)
    );
    
    const stressStates = feedbackData.filter(f => 
      ['stressed', 'frustrated', 'confused'].includes(f.emotional_state)
    );
    
    if (positiveStates.length > stressStates.length) {
      positiveIndicators.push('Generally Positive');
    }
    
    if (stressStates.length > positiveStates.length) {
      stressIndicators.push('Frequent Stress');
    }
    
    const engagementLevel = feedbackData.length > 0 
      ? feedbackData.reduce((sum, f) => sum + f.interest, 0) / feedbackData.length / 5
      : 0.5;
    
    return {
      positiveIndicators,
      stressIndicators,
      engagementLevel
    };
  }

  private predictPerformance(feedbackData: any[], timeframe: string): PredictiveInsight | null {
    if (feedbackData.length < 3) return null;
    
    const recentPerformance = feedbackData.slice(0, 5);
    const avgGrowth = recentPerformance.reduce((sum, f) => sum + f.educational_growth, 0) / recentPerformance.length;
    const trend = this.calculateTrend(recentPerformance.map(f => f.educational_growth));
    
    return {
      id: crypto.randomUUID(),
      type: 'performance',
      confidence: 0.75,
      timeframe: timeframe === 'week' ? 'short_term' : 'long_term',
      prediction: trend > 0 
        ? `Performance trending upward - expect ${Math.round(trend * 20)}% improvement`
        : `Performance needs attention - risk of ${Math.round(Math.abs(trend) * 20)}% decline`,
      recommendedActions: trend > 0 
        ? ['Continue current learning approach', 'Consider advanced materials']
        : ['Provide additional support', 'Review learning strategy'],
      impactLevel: Math.abs(trend) > 0.5 ? 'high' : 'medium',
      metadata: { avgGrowth, trend }
    };
  }

  private predictEngagement(feedbackData: any[], timeframe: string): PredictiveInsight | null {
    if (feedbackData.length < 3) return null;
    
    const recentEngagement = feedbackData.slice(0, 5);
    const avgInterest = recentEngagement.reduce((sum, f) => sum + f.interest, 0) / recentEngagement.length;
    
    return {
      id: crypto.randomUUID(),
      type: 'engagement',
      confidence: 0.7,
      timeframe: 'short_term',
      prediction: avgInterest >= 4 
        ? 'High engagement likely to continue'
        : 'Engagement may decline without intervention',
      recommendedActions: avgInterest >= 4 
        ? ['Maintain current teaching style', 'Introduce challenges']
        : ['Vary teaching methods', 'Increase interactive elements'],
      impactLevel: avgInterest < 3 ? 'high' : 'medium',
      metadata: { avgInterest }
    };
  }

  private predictWellbeing(summaryData: any[], alertData: any[], timeframe: string): PredictiveInsight | null {
    const recentConcerns = summaryData.filter(s => s.emotional_concerns && s.emotional_concerns.trim().length > 0);
    const recentAlerts = alertData.filter(a => new Date(a.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    
    const riskLevel = recentAlerts.length > 0 ? 'high' : recentConcerns.length > 2 ? 'medium' : 'low';
    
    return {
      id: crypto.randomUUID(),
      type: 'wellbeing',
      confidence: 0.8,
      timeframe: 'immediate',
      prediction: riskLevel === 'high' 
        ? 'Mental health support needed immediately'
        : riskLevel === 'medium'
        ? 'Monitor emotional wellbeing closely'
        : 'Emotional wellbeing appears stable',
      recommendedActions: riskLevel === 'high'
        ? ['Contact school counselor', 'Immediate check-in required']
        : riskLevel === 'medium'
        ? ['Schedule wellness check', 'Provide emotional support resources']
        : ['Continue positive reinforcement'],
      impactLevel: riskLevel === 'high' ? 'high' : riskLevel === 'medium' ? 'medium' : 'low',
      metadata: { riskLevel, recentConcerns: recentConcerns.length, recentAlerts: recentAlerts.length }
    };
  }

  private buildContentRecommendations(profile: PersonalizationProfile, subject?: string): ContentRecommendation[] {
    const recommendations: ContentRecommendation[] = [];
    
    // Base recommendations on learning style
    if (profile.learningStyle === 'visual') {
      recommendations.push({
        id: crypto.randomUUID(),
        type: 'lesson',
        title: 'Visual Learning Materials',
        description: 'Interactive diagrams and visual presentations',
        difficulty: 'medium',
        estimatedDuration: 30,
        language: profile.preferredLanguage,
        relevanceScore: 0.9,
        tags: ['visual', 'interactive'],
        adaptationReason: 'Matches visual learning style preference'
      });
    }
    
    // Add wellbeing-focused content if needed
    if (profile.emotionalPatterns.stressIndicators.length > 0) {
      recommendations.push({
        id: crypto.randomUUID(),
        type: 'support',
        title: 'Stress Management Techniques',
        description: 'Helpful strategies for managing academic stress',
        difficulty: 'easy',
        estimatedDuration: 15,
        language: profile.preferredLanguage,
        relevanceScore: 0.8,
        tags: ['wellbeing', 'stress'],
        adaptationReason: 'Addresses detected stress indicators'
      });
    }
    
    // Add content for improvement areas
    profile.improvementAreas.forEach(area => {
      recommendations.push({
        id: crypto.randomUUID(),
        type: 'exercise',
        title: `${area} Practice Exercises`,
        description: `Targeted exercises to improve ${area.toLowerCase()}`,
        difficulty: 'medium',
        estimatedDuration: 25,
        language: profile.preferredLanguage,
        relevanceScore: 0.75,
        tags: [area.toLowerCase().replace(' ', '_'), 'practice'],
        adaptationReason: `Targets improvement area: ${area}`
      });
    });
    
    return recommendations;
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    const recent = values.slice(0, Math.ceil(values.length / 2));
    const older = values.slice(Math.ceil(values.length / 2));
    
    const recentAvg = recent.reduce((sum, v) => sum + v, 0) / recent.length;
    const olderAvg = older.reduce((sum, v) => sum + v, 0) / older.length;
    
    return (recentAvg - olderAvg) / olderAvg;
  }

  private analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['good', 'great', 'excellent', 'love', 'enjoy', 'fun', 'happy', 'geras', 'puikus', 'smagu'];
    const negativeWords = ['bad', 'terrible', 'hate', 'difficult', 'boring', 'sad', 'blogas', 'sunkus', 'nuobodus'];
    
    const words = text.toLowerCase().split(/\s+/);
    const positiveCount = words.filter(word => positiveWords.includes(word)).length;
    const negativeCount = words.filter(word => negativeWords.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private detectEmotionalState(text: string): string {
    const emotionKeywords = {
      excited: ['excited', 'thrilled', 'enthusiastic', 'susijaudinęs'],
      stressed: ['stressed', 'overwhelmed', 'anxious', 'įtemptas'],
      confused: ['confused', 'lost', 'unclear', 'sumišęs'],
      happy: ['happy', 'joyful', 'pleased', 'laimingas'],
      frustrated: ['frustrated', 'annoyed', 'irritated', 'frustrated']
    };
    
    const lowerText = text.toLowerCase();
    
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return emotion;
      }
    }
    
    return 'neutral';
  }

  private extractLearningIndicators(text: string): string[] {
    const indicators: string[] = [];
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('understand') || lowerText.includes('suprantu')) {
      indicators.push('comprehension');
    }
    if (lowerText.includes('practice') || lowerText.includes('praktika')) {
      indicators.push('practice_need');
    }
    if (lowerText.includes('help') || lowerText.includes('pagalba')) {
      indicators.push('support_request');
    }
    
    return indicators;
  }

  private detectLanguage(text: string): 'en' | 'lt' | 'unknown' {
    const lithuanianChars = /[ąčęėįšųūž]/i;
    const englishWords = /\b(the|and|that|have|for|not|with|you|this|but|his|from|they)\b/i;
    
    if (lithuanianChars.test(text)) return 'lt';
    if (englishWords.test(text)) return 'en';
    return 'unknown';
  }

  private extractKeyTopics(text: string): string[] {
    const topics: string[] = [];
    const lowerText = text.toLowerCase();
    
    const topicKeywords = {
      mathematics: ['math', 'algebra', 'geometry', 'matematika'],
      science: ['science', 'physics', 'chemistry', 'gamtos'],
      language: ['english', 'lithuanian', 'kalba', 'anglų'],
      history: ['history', 'istorija'],
      art: ['art', 'drawing', 'menas']
    };
    
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        topics.push(topic);
      }
    }
    
    return topics;
  }

  private assessRiskFactors(text: string): string[] {
    const riskFactors: string[] = [];
    const lowerText = text.toLowerCase();
    
    const riskKeywords = {
      'academic_struggle': ['difficult', 'hard', 'cannot understand', 'sunku', 'nesuprantu'],
      'emotional_distress': ['sad', 'depressed', 'alone', 'liūdnas', 'vienas'],
      'social_issues': ['bullying', 'friends', 'lonely', 'patyčios', 'draugų'],
      'family_stress': ['home', 'family', 'parents', 'namie', 'šeima']
    };
    
    for (const [risk, keywords] of Object.entries(riskKeywords)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        riskFactors.push(risk);
      }
    }
    
    return riskFactors;
  }

  private calculateAnalysisConfidence(text: string): number {
    const wordCount = text.split(/\s+/).length;
    const baseConfidence = Math.min(0.9, wordCount / 50); // More words = higher confidence
    
    return Math.max(0.3, baseConfidence); // Minimum 30% confidence
  }
}

export const advancedAIService = new AdvancedAIService();
