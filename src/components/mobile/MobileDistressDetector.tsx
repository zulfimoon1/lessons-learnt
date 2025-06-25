
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  AlertTriangle, 
  Phone, 
  Heart,
  Globe,
  MessageSquare
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMobileCapabilities } from '@/hooks/useMobileCapabilities';
import { useDistressDetection } from '@/hooks/useDistressDetection';
import { DistressAnalysis } from '@/services/multiLanguageDistressService';

interface MobileDistressDetectorProps {
  studentId?: string;
  onAnalysisComplete?: (analysis: DistressAnalysis) => void;
  className?: string;
}

const MobileDistressDetector: React.FC<MobileDistressDetectorProps> = ({
  studentId,
  onAnalysisComplete,
  className
}) => {
  const { t } = useLanguage();
  const { isMobile, isOnline } = useMobileCapabilities();
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState<DistressAnalysis | null>(null);
  
  const { analyzeText, analyzeAndSave, isAnalyzing, error } = useDistressDetection();

  const handleAnalyze = async () => {
    if (!text.trim()) return;

    try {
      let result = null;
      if (studentId && isOnline) {
        result = await analyzeAndSave(text, studentId);
      } else {
        result = await analyzeText(text);
      }

      if (result) {
        setAnalysis(result);
        onAnalysisComplete?.(result);
      }
    } catch (error) {
      console.error('Mobile distress analysis error:', error);
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Mobile-optimized input */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="w-5 h-5" />
            {t('ai.distressDetection') || 'Distress Detection'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder={isMobile ? "Share your thoughts..." : "Type your feedback here..."}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[100px] text-base"
            disabled={isAnalyzing}
          />
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {text.length} chars • {!isOnline && 'Offline mode'}
            </span>
            <Button
              onClick={handleAnalyze}
              disabled={!text.trim() || isAnalyzing}
              size={isMobile ? "default" : "sm"}
              className="min-w-[100px]"
            >
              <MessageSquare className={`w-4 h-4 mr-2 ${isAnalyzing ? 'animate-pulse' : ''}`} />
              {isAnalyzing ? 'Analyzing...' : 'Analyze'}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Mobile-optimized results */}
      {analysis && (
        <Card>
          <CardContent className="pt-4 space-y-4">
            {/* Risk level indicator */}
            <div className={`p-3 rounded-lg border ${getRiskLevelColor(analysis.riskLevel)}`}>
              <div className="flex items-center justify-between">
                <span className="font-medium">Risk Level</span>
                <Badge variant="outline" className="font-semibold">
                  {analysis.riskLevel.toUpperCase()}
                </Badge>
              </div>
              <div className="text-sm mt-1">
                Confidence: {Math.round(analysis.confidence * 100)}%
              </div>
            </div>

            {/* Critical/High risk alerts */}
            {(analysis.riskLevel === 'critical' || analysis.riskLevel === 'high') && (
              <Alert variant={analysis.riskLevel === 'critical' ? 'destructive' : 'default'}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {analysis.riskLevel === 'critical' 
                    ? 'Immediate support recommended. Contact crisis services.'
                    : 'Consider reaching out for additional support.'
                  }
                </AlertDescription>
              </Alert>
            )}

            {/* Recommendations */}
            {analysis.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Recommendations
                </h4>
                {analysis.recommendations.slice(0, 2).map((rec, index) => (
                  <div key={index} className="text-sm p-2 bg-blue-50 rounded border">
                    {rec}
                  </div>
                ))}
              </div>
            )}

            {/* Crisis resources for high/critical cases */}
            {(analysis.riskLevel === 'critical' || analysis.riskLevel === 'high') && 
             analysis.detectedLanguage !== 'unknown' && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-red-600 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Crisis Support
                </h4>
                <div className="text-sm space-y-1">
                  {analysis.detectedLanguage === 'lt' ? (
                    <>
                      <div className="p-2 bg-red-50 rounded border border-red-200">
                        <strong>Jaunimo linija:</strong> 8 800 28 888
                      </div>
                      <div className="p-2 bg-red-50 rounded border border-red-200">
                        <strong>Vaikų linija:</strong> 116 111
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-2 bg-red-50 rounded border border-red-200">
                        <strong>Crisis Text Line:</strong> Text HOME to 741741
                      </div>
                      <div className="p-2 bg-red-50 rounded border border-red-200">
                        <strong>Suicide Prevention:</strong> 988
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MobileDistressDetector;
