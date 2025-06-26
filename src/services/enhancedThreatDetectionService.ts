
import { supabase } from '@/integrations/supabase/client';

interface ThreatPattern {
  id: string;
  pattern: string;
  category: 'self_harm' | 'violence' | 'depression' | 'anxiety' | 'suicidal' | 'abuse';
  severity: 'low' | 'medium' | 'high' | 'critical';
  language: 'en' | 'lt' | 'universal';
  culturalContext?: string[];
}

interface StudentBaseline {
  studentId: string;
  typicalSentiment: number;
  typicalEngagement: number;
  typicalResponseLength: number;
  lastUpdated: Date;
}

interface ThreatAnalysisResult {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  detectedPatterns: string[];
  culturalFactors: string[];
  interventionRecommendations: string[];
  requiresImmediateAction: boolean;
  predictiveRiskScore: number;
  semanticAnalysis: {
    sentiment: number;
    emotion: string;
    tone: string;
    urgency: number;
  };
}

class EnhancedThreatDetectionService {
  private threatPatterns: Map<string, ThreatPattern[]> = new Map();
  private studentBaselines: Map<string, StudentBaseline> = new Map();
  private culturalContexts: Map<string, string[]> = new Map();

  constructor() {
    this.initializeThreatPatterns();
    this.initializeCulturalContexts();
  }

  private initializeThreatPatterns() {
    const patterns: ThreatPattern[] = [
      // English patterns
      { id: 'en_self_harm_1', pattern: 'want to hurt myself', category: 'self_harm', severity: 'critical', language: 'en' },
      { id: 'en_self_harm_2', pattern: 'cutting myself', category: 'self_harm', severity: 'critical', language: 'en' },
      { id: 'en_suicidal_1', pattern: 'want to die', category: 'suicidal', severity: 'critical', language: 'en' },
      { id: 'en_suicidal_2', pattern: 'end my life', category: 'suicidal', severity: 'critical', language: 'en' },
      { id: 'en_suicidal_3', pattern: 'kill myself', category: 'suicidal', severity: 'critical', language: 'en' },
      { id: 'en_depression_1', pattern: 'everything is hopeless', category: 'depression', severity: 'high', language: 'en' },
      { id: 'en_depression_2', pattern: 'nothing matters anymore', category: 'depression', severity: 'high', language: 'en' },
      { id: 'en_violence_1', pattern: 'want to hurt someone', category: 'violence', severity: 'high', language: 'en' },
      { id: 'en_abuse_1', pattern: 'someone is hurting me', category: 'abuse', severity: 'high', language: 'en' },
      
      // Lithuanian patterns
      { id: 'lt_self_harm_1', pattern: 'noriu sau skaudinti', category: 'self_harm', severity: 'critical', language: 'lt' },
      { id: 'lt_suicidal_1', pattern: 'noriu mirti', category: 'suicidal', severity: 'critical', language: 'lt' },
      { id: 'lt_suicidal_2', pattern: 'baigti gyvenimą', category: 'suicidal', severity: 'critical', language: 'lt' },
      { id: 'lt_depression_1', pattern: 'viskas beviltiškai', category: 'depression', severity: 'high', language: 'lt' },
      { id: 'lt_depression_2', pattern: 'nieko nebereikšminga', category: 'depression', severity: 'high', language: 'lt' },
      
      // Universal patterns (slang, internet language, code words)
      { id: 'universal_coded_1', pattern: 'going to sleep forever', category: 'suicidal', severity: 'critical', language: 'universal' },
      { id: 'universal_coded_2', pattern: 'tired of everything', category: 'depression', severity: 'medium', language: 'universal' },
      { id: 'universal_coded_3', pattern: 'unalive', category: 'suicidal', severity: 'critical', language: 'universal' },
    ];

    patterns.forEach(pattern => {
      if (!this.threatPatterns.has(pattern.language)) {
        this.threatPatterns.set(pattern.language, []);
      }
      this.threatPatterns.get(pattern.language)!.push(pattern);
    });
  }

  private initializeCulturalContexts() {
    // Lithuanian cultural context
    this.culturalContexts.set('lt', [
      'family_expectations',
      'academic_pressure',
      'social_isolation',
      'traditional_gender_roles',
      'economic_stress'
    ]);

    // English cultural context
    this.culturalContexts.set('en', [
      'social_media_pressure',
      'bullying',
      'identity_crisis',
      'peer_pressure',
      'family_conflict'
    ]);
  }

  async analyzeText(
    text: string, 
    studentId: string, 
    metadata?: {
      timestamp?: Date;
      typingSpeed?: number;
      deletionCount?: number;
      pauseDuration?: number;
    }
  ): Promise<ThreatAnalysisResult> {
    console.log('🔍 Enhanced threat detection analyzing text:', text.substring(0, 50) + '...');

    try {
      // Detect language
      const detectedLanguage = this.detectLanguage(text);
      
      // Get student baseline
      const baseline = await this.getOrCreateStudentBaseline(studentId);
      
      // Pattern matching analysis
      const patternResults = this.analyzePatterns(text, detectedLanguage);
      
      // Semantic analysis
      const semanticAnalysis = await this.performSemanticAnalysis(text);
      
      // Behavioral analysis
      const behavioralRisk = this.analyzeBehavioralPatterns(metadata, baseline);
      
      // Cultural context analysis
      const culturalFactors = this.analyzeCulturalContext(text, detectedLanguage);
      
      // Predictive risk scoring
      const predictiveRiskScore = this.calculatePredictiveRisk(
        patternResults,
        semanticAnalysis,
        behavioralRisk,
        baseline
      );
      
      // Determine overall risk level
      const riskLevel = this.determineRiskLevel(
        patternResults.maxSeverity,
        semanticAnalysis.urgency,
        predictiveRiskScore
      );
      
      // Generate intervention recommendations
      const interventionRecommendations = this.generateInterventionRecommendations(
        riskLevel,
        patternResults.categories,
        culturalFactors
      );

      const result: ThreatAnalysisResult = {
        riskLevel,
        confidence: Math.min(0.95, patternResults.confidence + semanticAnalysis.sentiment * 0.2),
        detectedPatterns: patternResults.patterns,
        culturalFactors,
        interventionRecommendations,
        requiresImmediateAction: riskLevel === 'critical' || 
          (riskLevel === 'high' && semanticAnalysis.urgency > 0.8),
        predictiveRiskScore,
        semanticAnalysis
      };

      // Log the analysis
      await this.logThreatAnalysis(studentId, text, result);
      
      // Trigger real-time intervention if needed
      if (result.requiresImmediateAction) {
        await this.triggerImmediateIntervention(studentId, result);
      }

      console.log('✅ Enhanced threat analysis completed:', {
        riskLevel: result.riskLevel,
        confidence: result.confidence,
        requiresAction: result.requiresImmediateAction
      });

      return result;
    } catch (error) {
      console.error('❌ Enhanced threat detection error:', error);
      // Return safe fallback
      return {
        riskLevel: 'medium',
        confidence: 0.5,
        detectedPatterns: [],
        culturalFactors: [],
        interventionRecommendations: ['Monitor student for additional signs'],
        requiresImmediateAction: false,
        predictiveRiskScore: 0.5,
        semanticAnalysis: {
          sentiment: 0,
          emotion: 'neutral',
          tone: 'neutral',
          urgency: 0.5
        }
      };
    }
  }

  private detectLanguage(text: string): 'en' | 'lt' | 'universal' {
    const ltPatterns = /[ąčęėįšųūž]/g;
    const ltWords = ['ir', 'yra', 'kad', 'bet', 'tai', 'su', 'be', 'per', 'už'];
    
    if (ltPatterns.test(text) || ltWords.some(word => text.toLowerCase().includes(word))) {
      return 'lt';
    }
    return 'en';
  }

  private analyzePatterns(text: string, language: 'en' | 'lt' | 'universal') {
    const lowerText = text.toLowerCase();
    const detectedPatterns: string[] = [];
    const categories: Set<string> = new Set();
    let maxSeverity: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let confidence = 0;

    // Check language-specific patterns
    const patterns = this.threatPatterns.get(language) || [];
    const universalPatterns = this.threatPatterns.get('universal') || [];
    
    [...patterns, ...universalPatterns].forEach(pattern => {
      if (lowerText.includes(pattern.pattern.toLowerCase())) {
        detectedPatterns.push(pattern.pattern);
        categories.add(pattern.category);
        
        // Update max severity
        const severityLevels = { low: 1, medium: 2, high: 3, critical: 4 };
        if (severityLevels[pattern.severity] > severityLevels[maxSeverity]) {
          maxSeverity = pattern.severity;
        }
        
        // Increase confidence
        confidence += pattern.severity === 'critical' ? 0.4 : 
                     pattern.severity === 'high' ? 0.3 :
                     pattern.severity === 'medium' ? 0.2 : 0.1;
      }
    });

    return {
      patterns: detectedPatterns,
      categories: Array.from(categories),
      maxSeverity,
      confidence: Math.min(confidence, 1.0)
    };
  }

  private async performSemanticAnalysis(text: string) {
    // Simple sentiment analysis (in production, use AI API)
    const negativeWords = ['sad', 'angry', 'hopeless', 'alone', 'scared', 'hurt', 'liūdnas', 'piktas', 'beviltiškas'];
    const urgentWords = ['now', 'today', 'tonight', 'can\'t wait', 'dabar', 'šiandien'];
    
    const words = text.toLowerCase().split(/\s+/);
    const negativeCount = words.filter(word => negativeWords.some(neg => word.includes(neg))).length;
    const urgentCount = words.filter(word => urgentWords.some(urg => word.includes(urg))).length;
    
    const sentiment = Math.max(-1, -negativeCount / words.length * 10);
    const urgency = Math.min(1, urgentCount / words.length * 20);
    
    // Determine emotion and tone
    const emotion = sentiment < -0.5 ? 'distressed' : sentiment < 0 ? 'negative' : 'neutral';
    const tone = urgency > 0.5 ? 'urgent' : sentiment < -0.3 ? 'concerning' : 'calm';

    return {
      sentiment,
      emotion,
      tone,
      urgency
    };
  }

  private analyzeBehavioralPatterns(
    metadata?: {
      timestamp?: Date;
      typingSpeed?: number;
      deletionCount?: number;
      pauseDuration?: number;
    },
    baseline?: StudentBaseline
  ): number {
    if (!metadata || !baseline) return 0.5;

    let riskScore = 0;

    // Analyze typing patterns
    if (metadata.typingSpeed && metadata.typingSpeed < 10) {
      riskScore += 0.2; // Very slow typing might indicate distress
    }

    if (metadata.deletionCount && metadata.deletionCount > 10) {
      riskScore += 0.3; // Many deletions might indicate difficulty expressing thoughts
    }

    if (metadata.pauseDuration && metadata.pauseDuration > 30000) {
      riskScore += 0.2; // Long pauses might indicate emotional difficulty
    }

    return Math.min(riskScore, 1.0);
  }

  private analyzeCulturalContext(text: string, language: 'en' | 'lt' | 'universal'): string[] {
    const factors: string[] = [];
    const contexts = this.culturalContexts.get(language) || [];
    
    const lowerText = text.toLowerCase();
    
    // Check for cultural stress indicators
    if (language === 'lt') {
      if (lowerText.includes('šeim') || lowerText.includes('tėv')) {
        factors.push('family_expectations');
      }
      if (lowerText.includes('moky') || lowerText.includes('egzamin')) {
        factors.push('academic_pressure');
      }
    } else {
      if (lowerText.includes('social media') || lowerText.includes('instagram')) {
        factors.push('social_media_pressure');
      }
      if (lowerText.includes('bully') || lowerText.includes('picked on')) {
        factors.push('bullying');
      }
    }

    return factors;
  }

  private calculatePredictiveRisk(
    patternResults: any,
    semanticAnalysis: any,
    behavioralRisk: number,
    baseline?: StudentBaseline
  ): number {
    let risk = 0;

    // Pattern-based risk
    const severityWeights = { low: 0.1, medium: 0.3, high: 0.6, critical: 1.0 };
    risk += severityWeights[patternResults.maxSeverity as keyof typeof severityWeights] * 0.4;

    // Semantic risk
    risk += Math.abs(semanticAnalysis.sentiment) * 0.2;
    risk += semanticAnalysis.urgency * 0.2;

    // Behavioral risk
    risk += behavioralRisk * 0.2;

    return Math.min(risk, 1.0);
  }

  private determineRiskLevel(
    patternSeverity: string,
    urgency: number,
    predictiveScore: number
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (patternSeverity === 'critical' || (urgency > 0.8 && predictiveScore > 0.7)) {
      return 'critical';
    }
    if (patternSeverity === 'high' || predictiveScore > 0.6) {
      return 'high';
    }
    if (patternSeverity === 'medium' || predictiveScore > 0.4) {
      return 'medium';
    }
    return 'low';
  }

  private generateInterventionRecommendations(
    riskLevel: string,
    categories: string[],
    culturalFactors: string[]
  ): string[] {
    const recommendations: string[] = [];

    switch (riskLevel) {
      case 'critical':
        recommendations.push('Contact crisis intervention team immediately');
        recommendations.push('Do not leave student alone');
        recommendations.push('Contact parents/guardians');
        recommendations.push('Involve school mental health professional');
        break;
      case 'high':
        recommendations.push('Schedule immediate meeting with school counselor');
        recommendations.push('Increase monitoring and check-ins');
        recommendations.push('Consider parental notification');
        break;
      case 'medium':
        recommendations.push('Schedule follow-up within 24-48 hours');
        recommendations.push('Provide additional support resources');
        break;
      default:
        recommendations.push('Continue regular monitoring');
    }

    // Category-specific recommendations
    if (categories.includes('self_harm')) {
      recommendations.push('Assess for self-harm tools/access');
    }
    if (categories.includes('depression')) {
      recommendations.push('Screen for depression using validated tools');
    }

    // Cultural considerations
    if (culturalFactors.includes('family_expectations')) {
      recommendations.push('Consider family dynamics in intervention approach');
    }

    return recommendations;
  }

  private async getOrCreateStudentBaseline(studentId: string): Promise<StudentBaseline> {
    if (this.studentBaselines.has(studentId)) {
      return this.studentBaselines.get(studentId)!;
    }

    // In production, this would fetch from database
    const baseline: StudentBaseline = {
      studentId,
      typicalSentiment: 0,
      typicalEngagement: 0.5,
      typicalResponseLength: 50,
      lastUpdated: new Date()
    };

    this.studentBaselines.set(studentId, baseline);
    return baseline;
  }

  private async logThreatAnalysis(studentId: string, text: string, result: ThreatAnalysisResult) {
    try {
      // Log to mental health alerts if risk is medium or higher
      if (['medium', 'high', 'critical'].includes(result.riskLevel)) {
        await supabase.from('mental_health_alerts').insert({
          student_id: studentId,
          content: text.substring(0, 500), // Limit content length
          severity_level: result.riskLevel === 'critical' ? 5 : 
                         result.riskLevel === 'high' ? 4 : 3,
          alert_type: 'enhanced_threat_detection',
          student_name: 'Student',
          school: 'Unknown',
          grade: 'Unknown',
          source_table: 'enhanced_threat_detection',
          source_id: crypto.randomUUID()
        });
      }
    } catch (error) {
      console.error('Error logging threat analysis:', error);
    }
  }

  private async triggerImmediateIntervention(studentId: string, result: ThreatAnalysisResult) {
    console.log('🚨 IMMEDIATE INTERVENTION TRIGGERED for student:', studentId);
    console.log('Risk level:', result.riskLevel);
    console.log('Detected patterns:', result.detectedPatterns);
    
    // In production, this would:
    // - Send notifications to counselors
    // - Trigger crisis response protocols
    // - Send alerts to admin dashboard
    // - Potentially contact emergency services for critical threats
  }

  // Public method for getting real-time insights
  async getStudentRiskTrends(studentId: string, days: number = 30) {
    try {
      const { data, error } = await supabase
        .from('mental_health_alerts')
        .select('*')
        .eq('student_id', studentId)
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        totalAlerts: data?.length || 0,
        criticalAlerts: data?.filter(alert => alert.severity_level >= 5).length || 0,
        trendDirection: this.calculateTrendDirection(data || []),
        lastAlert: data?.[0] || null
      };
    } catch (error) {
      console.error('Error getting student risk trends:', error);
      return {
        totalAlerts: 0,
        criticalAlerts: 0,
        trendDirection: 'stable',
        lastAlert: null
      };
    }
  }

  private calculateTrendDirection(alerts: any[]): 'increasing' | 'decreasing' | 'stable' {
    if (alerts.length < 2) return 'stable';
    
    const recent = alerts.slice(0, Math.ceil(alerts.length / 2));
    const older = alerts.slice(Math.ceil(alerts.length / 2));
    
    const recentAvgSeverity = recent.reduce((sum, alert) => sum + alert.severity_level, 0) / recent.length;
    const olderAvgSeverity = older.reduce((sum, alert) => sum + alert.severity_level, 0) / older.length;
    
    if (recentAvgSeverity > olderAvgSeverity + 0.5) return 'increasing';
    if (recentAvgSeverity < olderAvgSeverity - 0.5) return 'decreasing';
    return 'stable';
  }
}

export const enhancedThreatDetectionService = new EnhancedThreatDetectionService();
