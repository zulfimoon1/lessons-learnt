
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  Shield, 
  Brain, 
  Globe, 
  Phone, 
  ExternalLink,
  Heart
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { multiLanguageDistressService, DistressAnalysis } from '@/services/multiLanguageDistressService';

interface MultiLanguageDistressDetectorProps {
  text: string;
  onAnalysisUpdate?: (analysis: DistressAnalysis) => void;
  showCrisisResources?: boolean;
  className?: string;
}

const MultiLanguageDistressDetector: React.FC<MultiLanguageDistressDetectorProps> = ({
  text,
  onAnalysisUpdate,
  showCrisisResources = true,
  className
}) => {
  const { t } = useLanguage();
  const [analysis, setAnalysis] = useState<DistressAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (!text || text.trim().length < 10) {
      setAnalysis(null);
      return;
    }

    setIsAnalyzing(true);
    
    // Debounce analysis to avoid excessive processing
    const timer = setTimeout(() => {
      const result = multiLanguageDistressService.analyzeText(text);
      setAnalysis(result);
      onAnalysisUpdate?.(result);
      setIsAnalyzing(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [text, onAnalysisUpdate]);

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getRiskLevelIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'high': return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'medium': return <Shield className="w-5 h-5 text-yellow-600" />;
      case 'low': return <Shield className="w-5 h-5 text-green-600" />;
      default: return <Shield className="w-5 h-5" />;
    }
  };

  const getLanguageName = (lang: string) => {
    switch (lang) {
      case 'lt': return 'Lithuanian';
      case 'en': return 'English';
      default: return 'Unknown';
    }
  };

  if (isAnalyzing) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-4">
          <Brain className="w-5 h-5 animate-pulse mr-2" />
          <span className="text-sm text-muted-foreground">
            {t('ai.analyzingDistress') || 'Analyzing for distress indicators...'}
          </span>
        </CardContent>
      </Card>
    );
  }

  if (!analysis || analysis.confidence === 0) {
    return null;
  }

  const crisisResources = multiLanguageDistressService.getCrisisResources(analysis.detectedLanguage);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Analysis Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            {t('ai.distressAnalysis') || 'Multi-Language Distress Analysis'}
            <Badge variant="outline" className="ml-auto">
              <Globe className="w-3 h-3 mr-1" />
              {getLanguageName(analysis.detectedLanguage)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Risk Level */}
          <div className="flex items-center gap-4 p-3 border rounded-lg">
            {getRiskLevelIcon(analysis.riskLevel)}
            <div className="flex-1">
              <span className="font-medium">Risk Level:</span>
              <Badge variant={getRiskLevelColor(analysis.riskLevel)} className="ml-2">
                {analysis.riskLevel.toUpperCase()}
              </Badge>
              <div className="text-xs text-muted-foreground mt-1">
                Confidence: {Math.round(analysis.confidence * 100)}%
              </div>
            </div>
          </div>

          {/* Critical Alert */}
          {analysis.riskLevel === 'critical' && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>CRITICAL ALERT:</strong> Immediate intervention may be required. 
                Please contact a mental health professional or crisis hotline immediately.
              </AlertDescription>
            </Alert>
          )}

          {/* High Risk Alert */}
          {analysis.riskLevel === 'high' && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>HIGH RISK:</strong> This student may need additional support. 
                Consider reaching out to them directly or involving school counselors.
              </AlertDescription>
            </Alert>
          )}

          {/* Detected Indicators */}
          {analysis.indicators.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Detected Indicators:</h4>
              <div className="space-y-1">
                {analysis.indicators.map((indicator, index) => (
                  <div key={index} className="text-xs bg-muted p-2 rounded">
                    {indicator}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cultural Context */}
          {analysis.culturalContext.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Cultural Context:</h4>
              <div className="flex gap-1 flex-wrap">
                {analysis.culturalContext.map((context, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {context}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Emotional Markers */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Emotional Analysis:</h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Sentiment:</span>
                <Badge variant="outline" className="ml-1 text-xs">
                  {analysis.emotionalMarkers.sentiment}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Intensity:</span>
                <span className="ml-1 font-medium">
                  {Math.round(analysis.emotionalMarkers.intensity * 100)}%
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Emotions:</span>
                <div className="flex gap-1 flex-wrap mt-1">
                  {analysis.emotionalMarkers.emotions.map((emotion, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {emotion}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {analysis.recommendations.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Recommendations:
              </h4>
              <div className="space-y-1">
                {analysis.recommendations.map((recommendation, index) => (
                  <div key={index} className="text-sm bg-blue-50 border border-blue-200 p-2 rounded">
                    {recommendation}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Crisis Resources */}
      {showCrisisResources && (analysis.riskLevel === 'critical' || analysis.riskLevel === 'high') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Phone className="w-5 h-5" />
              Crisis Support Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Hotlines */}
            <div>
              <h4 className="font-medium text-sm mb-2">Emergency Hotlines:</h4>
              <div className="space-y-2">
                {crisisResources.hotlines.map((hotline, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-red-50 border border-red-200 rounded">
                    <div>
                      <div className="font-medium text-sm">{hotline.name}</div>
                      <div className="text-xs text-muted-foreground">{hotline.description}</div>
                    </div>
                    <Badge variant="destructive" className="font-mono">
                      {hotline.number}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Websites */}
            <div>
              <h4 className="font-medium text-sm mb-2">Support Websites:</h4>
              <div className="space-y-2">
                {crisisResources.websites.map((website, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full justify-between"
                    onClick={() => window.open(website.url, '_blank')}
                  >
                    {website.name}
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MultiLanguageDistressDetector;
