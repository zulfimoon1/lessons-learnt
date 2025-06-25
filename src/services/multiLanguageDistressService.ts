
import { useLanguage } from '@/contexts/LanguageContext';

export interface DistressAnalysis {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  detectedLanguage: 'en' | 'lt' | 'unknown';
  indicators: string[];
  culturalContext: string[];
  recommendations: string[];
  emotionalMarkers: {
    sentiment: 'positive' | 'negative' | 'neutral';
    emotions: string[];
    intensity: number;
  };
}

interface LanguageKeywords {
  distress: string[];
  emergency: string[];
  depression: string[];
  anxiety: string[];
  isolation: string[];
  academic: string[];
  positive: string[];
}

// Language-specific distress keywords and patterns
const LANGUAGE_KEYWORDS: Record<'en' | 'lt', LanguageKeywords> = {
  en: {
    distress: [
      'hopeless', 'helpless', 'worthless', 'useless', 'terrible', 'awful',
      'miserable', 'depressed', 'sad', 'upset', 'frustrated', 'angry',
      'hate myself', 'can\'t do this', 'give up', 'want to quit'
    ],
    emergency: [
      'want to die', 'kill myself', 'end it all', 'suicide', 'hurt myself',
      'self-harm', 'cutting', 'no point living', 'better off dead'
    ],
    depression: [
      'empty', 'numb', 'nothing matters', 'pointless', 'tired all the time',
      'can\'t sleep', 'no energy', 'lost interest', 'don\'t care anymore'
    ],
    anxiety: [
      'panic', 'worried', 'scared', 'afraid', 'nervous', 'anxious',
      'can\'t breathe', 'heart racing', 'overwhelming', 'stressed out'
    ],
    isolation: [
      'alone', 'lonely', 'no friends', 'nobody cares', 'isolated',
      'left out', 'don\'t belong', 'no one understands'
    ],
    academic: [
      'failing', 'can\'t understand', 'too hard', 'stupid', 'behind everyone',
      'not smart enough', 'going to fail', 'disappointed parents'
    ],
    positive: [
      'good', 'great', 'happy', 'excited', 'love', 'enjoy', 'fun',
      'better', 'improving', 'confident', 'proud', 'successful'
    ]
  },
  lt: {
    distress: [
      'beviltiškas', 'bejėgis', 'bevertas', 'nenaudingas', 'baisus', 'siaubingas',
      'nelaimingas', 'prislėgtas', 'liūdnas', 'supykęs', 'pykstu', 'nekenčiu savęs',
      'negaliu to padaryti', 'pasiduodu', 'noriu mesti'
    ],
    emergency: [
      'noriu mirti', 'nusižudyti', 'baigti viską', 'savižudybė', 'susižaloti',
      'save žalojimas', 'pjaustymas', 'nėra prasmės gyventi', 'geriau būčiau miręs'
    ],
    depression: [
      'tuščias', 'nejuntu nieko', 'nieko nerūpi', 'beprasmis', 'visada pavargęs',
      'negaliu miegoti', 'nėra energijos', 'praradau susidomėjimą', 'daugiau nerūpi'
    ],
    anxiety: [
      'panika', 'nerimas', 'bijau', 'baisu', 'nervuojuosi', 'nervingas',
      'negaliu kvėpuoti', 'širdis plaka', 'perdaug', 'įtemptas'
    ],
    isolation: [
      'vienas', 'vienišas', 'nėra draugų', 'niekas nesirūpina', 'izoliuotas',
      'paliktas nuošalyje', 'nepriklausau', 'niekas nesupranta'
    ],
    academic: [
      'nepavyksta', 'nesuprantu', 'per sunku', 'kvailas', 'atsilieku nuo visų',
      'nepakankamai protingas', 'nepavyks', 'nuvyliau tėvus'
    ],
    positive: [
      'gerai', 'puiku', 'laimingas', 'džiaugiuosi', 'mėgstu', 'smagu',
      'geriau', 'gerėju', 'pasitikiu savimi', 'didžiuojuosi', 'sėkmingas'
    ]
  }
};

// Cultural context patterns
const CULTURAL_CONTEXTS = {
  lt: {
    familyPressure: ['tėvai nusivylė', 'šeimos lūkesčiai', 'gėda šeimai'],
    academicCulture: ['reikia būti geriausiam', 'visi geriau moka', 'nesėkmė'],
    socialExpectations: ['kas pagalvos', 'turėčiau', 'privalau']
  },
  en: {
    familyPressure: ['parents disappointed', 'family expectations', 'shame family'],
    academicCulture: ['need to be perfect', 'everyone else better', 'failure'],
    socialExpectations: ['what will people think', 'should be', 'have to']
  }
};

class MultiLanguageDistressService {
  private detectLanguage(text: string): 'en' | 'lt' | 'unknown' {
    const lowerText = text.toLowerCase();
    
    // Lithuanian specific characters and words
    const lithuanianMarkers = ['ą', 'č', 'ę', 'ė', 'į', 'š', 'ų', 'ū', 'ž', 'kad', 'ir', 'bet', 'tai', 'yra'];
    const englishMarkers = ['the', 'and', 'but', 'that', 'this', 'with', 'for', 'are', 'was'];
    
    let ltScore = 0;
    let enScore = 0;
    
    lithuanianMarkers.forEach(marker => {
      if (lowerText.includes(marker)) ltScore++;
    });
    
    englishMarkers.forEach(marker => {
      if (lowerText.includes(marker)) enScore++;
    });
    
    if (ltScore > enScore && ltScore > 0) return 'lt';
    if (enScore > ltScore && enScore > 0) return 'en';
    
    // Fallback: if text contains any Lithuanian characters, assume Lithuanian
    if (/[ąčęėįšųūž]/i.test(text)) return 'lt';
    
    return enScore > 0 ? 'en' : 'unknown';
  }

  private analyzeKeywordMatches(text: string, language: 'en' | 'lt'): {
    matches: Record<string, string[]>;
    totalScore: number;
  } {
    const lowerText = text.toLowerCase();
    const keywords = LANGUAGE_KEYWORDS[language];
    const matches: Record<string, string[]> = {};
    let totalScore = 0;

    Object.entries(keywords).forEach(([category, words]) => {
      const foundWords = words.filter(word => lowerText.includes(word.toLowerCase()));
      if (foundWords.length > 0) {
        matches[category] = foundWords;
        
        // Weight emergency and distress keywords more heavily
        if (category === 'emergency') totalScore += foundWords.length * 10;
        else if (category === 'distress') totalScore += foundWords.length * 5;
        else if (category === 'depression' || category === 'anxiety') totalScore += foundWords.length * 3;
        else if (category === 'positive') totalScore -= foundWords.length * 2; // Positive words reduce risk
        else totalScore += foundWords.length * 2;
      }
    });

    return { matches, totalScore };
  }

  private analyzeCulturalContext(text: string, language: 'en' | 'lt'): string[] {
    const lowerText = text.toLowerCase();
    const contexts = CULTURAL_CONTEXTS[language];
    const foundContexts: string[] = [];

    Object.entries(contexts).forEach(([contextType, patterns]) => {
      patterns.forEach(pattern => {
        if (lowerText.includes(pattern.toLowerCase())) {
          foundContexts.push(contextType);
        }
      });
    });

    return Array.from(new Set(foundContexts));
  }

  private calculateRiskLevel(score: number, hasEmergencyKeywords: boolean): 'low' | 'medium' | 'high' | 'critical' {
    if (hasEmergencyKeywords) return 'critical';
    if (score >= 15) return 'high';
    if (score >= 8) return 'medium';
    return 'low';
  }

  private generateRecommendations(
    riskLevel: string, 
    language: 'en' | 'lt', 
    culturalContext: string[]
  ): string[] {
    const recommendations: string[] = [];

    if (language === 'lt') {
      switch (riskLevel) {
        case 'critical':
          recommendations.push(
            'Nedelsiant kreipkitės į artimą asmenį arba psichikos sveikatos specialistą',
            'Skambinkite pagalbos telefonu: 8 800 28 888 (nemokamas)',
            'Kreipkitės į artimiausią psichikos sveikatos centrą'
          );
          break;
        case 'high':
          recommendations.push(
            'Rekomenduojama pasitarti su mokyklos psichologu',
            'Aptarkite savo jausmus su patikimu suaugusiuoju',
            'Apsvarstykite pokalbį su tėvais ar globėjais'
          );
          break;
        case 'medium':
          recommendations.push(
            'Pabandykite aptarti sunkumus su draugu ar šeimos nariu',
            'Ieškokite pagalbos mokymosi klausimais',
            'Skirkite laiko veiklai, kuri jums patinka'
          );
          break;
      }

      if (culturalContext.includes('familyPressure')) {
        recommendations.push('Aptarkite šeimos lūkesčius ir savo galimybes');
      }
      if (culturalContext.includes('academicCulture')) {
        recommendations.push('Prisiminkite, kad nesėkmės yra mokymosi proceso dalis');
      }
    } else {
      switch (riskLevel) {
        case 'critical':
          recommendations.push(
            'Seek immediate help from a trusted adult or mental health professional',
            'Call crisis helpline: 988 (US) or local emergency services',
            'Contact your nearest mental health crisis center'
          );
          break;
        case 'high':
          recommendations.push(
            'Consider speaking with a school counselor or psychologist',
            'Talk to a trusted adult about how you\'re feeling',
            'Consider discussing with parents or guardians'
          );
          break;
        case 'medium':
          recommendations.push(
            'Try talking to a friend or family member about your difficulties',
            'Seek academic support if struggling with studies',
            'Engage in activities you enjoy to boost mood'
          );
          break;
      }

      if (culturalContext.includes('familyPressure')) {
        recommendations.push('Discuss family expectations and your personal capabilities');
      }
      if (culturalContext.includes('academicCulture')) {
        recommendations.push('Remember that setbacks are part of the learning process');
      }
    }

    return recommendations;
  }

  analyzeText(text: string): DistressAnalysis {
    if (!text || text.trim().length === 0) {
      return {
        riskLevel: 'low',
        confidence: 0,
        detectedLanguage: 'unknown',
        indicators: [],
        culturalContext: [],
        recommendations: [],
        emotionalMarkers: {
          sentiment: 'neutral',
          emotions: [],
          intensity: 0
        }
      };
    }

    const detectedLanguage = this.detectLanguage(text);
    
    if (detectedLanguage === 'unknown') {
      return {
        riskLevel: 'low',
        confidence: 0.1,
        detectedLanguage: 'unknown',
        indicators: ['Text language could not be determined'],
        culturalContext: [],
        recommendations: ['Please provide feedback in English or Lithuanian for better analysis'],
        emotionalMarkers: {
          sentiment: 'neutral',
          emotions: [],
          intensity: 0
        }
      };
    }

    const { matches, totalScore } = this.analyzeKeywordMatches(text, detectedLanguage);
    const culturalContext = this.analyzeCulturalContext(text, detectedLanguage);
    const hasEmergencyKeywords = matches.emergency && matches.emergency.length > 0;
    const riskLevel = this.calculateRiskLevel(totalScore, hasEmergencyKeywords);
    
    // Calculate confidence based on number of indicators found
    const totalIndicators = Object.values(matches).flat().length;
    const confidence = Math.min(0.9, 0.3 + (totalIndicators * 0.1));

    // Generate indicators list
    const indicators: string[] = [];
    Object.entries(matches).forEach(([category, words]) => {
      if (words.length > 0 && category !== 'positive') {
        indicators.push(`${category}: ${words.join(', ')}`);
      }
    });

    // Determine sentiment and emotions
    const hasPositive = matches.positive && matches.positive.length > 0;
    const hasNegative = totalScore > 0;
    const sentiment = hasPositive && !hasNegative ? 'positive' : 
                     hasNegative ? 'negative' : 'neutral';

    const emotions = [];
    if (matches.anxiety?.length) emotions.push('anxiety');
    if (matches.depression?.length) emotions.push('depression');
    if (matches.distress?.length) emotions.push('distress');
    if (matches.isolation?.length) emotions.push('isolation');
    if (matches.positive?.length) emotions.push('positivity');

    const recommendations = this.generateRecommendations(riskLevel, detectedLanguage, culturalContext);

    return {
      riskLevel,
      confidence,
      detectedLanguage,
      indicators,
      culturalContext,
      recommendations,
      emotionalMarkers: {
        sentiment,
        emotions,
        intensity: Math.min(1, totalScore / 20)
      }
    };
  }

  // Batch analysis for multiple texts
  analyzeBatch(texts: string[]): DistressAnalysis[] {
    return texts.map(text => this.analyzeText(text));
  }

  // Get language-specific crisis resources
  getCrisisResources(language: 'en' | 'lt') {
    if (language === 'lt') {
      return {
        hotlines: [
          { name: 'Jaunimo linija', number: '8 800 28 888', description: 'Nemokama pagalba jaunimui' },
          { name: 'Vaikų linija', number: '116 111', description: 'Pagalba vaikams ir paaugliams' }
        ],
        websites: [
          { name: 'Jaunimo linija', url: 'https://jaunimolinija.lt' },
          { name: 'Vilniaus psichikos sveikatos centras', url: 'https://vpsc.lt' }
        ]
      };
    } else {
      return {
        hotlines: [
          { name: 'Crisis Text Line', number: '741741', description: 'Text HOME to 741741' },
          { name: 'National Suicide Prevention Lifeline', number: '988', description: '24/7 crisis support' }
        ],
        websites: [
          { name: 'Crisis Text Line', url: 'https://crisistextline.org' },
          { name: 'National Alliance on Mental Illness', url: 'https://nami.org' }
        ]
      };
    }
  }
}

export const multiLanguageDistressService = new MultiLanguageDistressService();
