
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, MessageSquare, AlertTriangle, Globe, Shield } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import SmartFeedbackAnalyzer from './SmartFeedbackAnalyzer';
import MultiLanguageDistressDetector from './MultiLanguageDistressDetector';
import { useDistressDetection } from '@/hooks/useDistressDetection';
import { DistressAnalysis } from '@/services/multiLanguageDistressService';

interface EnhancedSmartFeedbackAnalyzerProps {
  studentId?: string;
  onAnalysisComplete?: (analysis: { nlp?: any; distress?: DistressAnalysis }) => void;
  onDistressAlert?: (analysis: DistressAnalysis) => void;
  className?: string;
}

const EnhancedSmartFeedbackAnalyzer: React.FC<EnhancedSmartFeedbackAnalyzerProps> = ({
  studentId,
  onAnalysisComplete,
  onDistressAlert,
  className
}) => {
  const { t } = useLanguage();
  const [textFeedback, setTextFeedback] = useState('');
  const [nlpAnalysis, setNlpAnalysis] = useState<any>(null);
  const [distressAnalysis, setDistressAnalysis] = useState<DistressAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState('combined');
  
  const { analyzeAndSave, analyzeText, isAnalyzing, error } = useDistressDetection();

  useEffect(() => {
    // Auto-analyze when text changes (debounced)
    if (textFeedback.trim().length > 20) {
      const timer = setTimeout(() => {
        handleAnalyze();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [textFeedback]);

  const handleAnalyze = async () => {
    if (!textFeedback.trim()) return;

    try {
      // Run distress analysis
      let distressResult = null;
      if (studentId) {
        distressResult = await analyzeAndSave(textFeedback, studentId);
      } else {
        // For demo purposes without student ID
        distressResult = await analyzeText(textFeedback);
      }

      if (distressResult) {
        setDistressAnalysis(distressResult);
        
        // Trigger alert if high risk
        if (['high', 'critical'].includes(distressResult.riskLevel)) {
          onDistressAlert?.(distressResult);
        }
      }

      // Update parent component
      onAnalysisComplete?.({
        nlp: nlpAnalysis,
        distress: distressResult
      });

    } catch (error) {
      console.error('Error in enhanced analysis:', error);
    }
  };

  const handleNlpAnalysisComplete = (analysis: any) => {
    setNlpAnalysis(analysis);
  };

  const handleDistressAnalysisUpdate = (analysis: DistressAnalysis) => {
    setDistressAnalysis(analysis);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            {t('ai.enhancedFeedbackAnalyzer') || 'Enhanced Feedback Analyzer'}
            <Globe className="w-4 h-4 text-muted-foreground" />
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            AI-powered analysis with multi-language distress detection (English & Lithuanian)
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Enter feedback text for comprehensive analysis:
            </label>
            <Textarea
              placeholder="Type or paste student feedback here... / Įveskite atsiliepimą čia..."
              value={textFeedback}
              onChange={(e) => setTextFeedback(e.target.value)}
              className="min-h-[120px]"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-muted-foreground">
                {textFeedback.length} characters • Supports English & Lithuanian
              </span>
              <Button
                onClick={handleAnalyze}
                disabled={!textFeedback.trim() || isAnalyzing}
                size="sm"
              >
                <MessageSquare className={`w-4 h-4 mr-2 ${isAnalyzing ? 'animate-pulse' : ''}`} />
                {isAnalyzing ? 'Analyzing...' : 'Analyze'}
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {(nlpAnalysis || distressAnalysis) && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="combined">Combined Analysis</TabsTrigger>
            <TabsTrigger value="distress">
              <Shield className="w-4 h-4 mr-1" />
              Distress Detection
            </TabsTrigger>
            <TabsTrigger value="nlp">
              <Brain className="w-4 h-4 mr-1" />
              NLP Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="combined" className="space-y-4">
            {/* Critical Alert at the top */}
            {distressAnalysis?.riskLevel === 'critical' && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>CRITICAL DISTRESS DETECTED:</strong> Immediate intervention required. 
                  Contact mental health professionals or crisis services immediately.
                </AlertDescription>
              </Alert>
            )}

            {/* High Risk Alert */}
            {distressAnalysis?.riskLevel === 'high' && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>HIGH DISTRESS LEVEL:</strong> This student may need additional support 
                  and monitoring. Consider reaching out directly.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              {/* Distress Summary */}
              {distressAnalysis && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Distress Analysis Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Risk Level:</span>
                      <span className={`font-medium ${
                        distressAnalysis.riskLevel === 'critical' ? 'text-red-600' :
                        distressAnalysis.riskLevel === 'high' ? 'text-orange-600' :
                        distressAnalysis.riskLevel === 'medium' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {distressAnalysis.riskLevel.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Language:</span>
                      <span className="font-medium">
                        {distressAnalysis.detectedLanguage === 'lt' ? 'Lithuanian' : 
                         distressAnalysis.detectedLanguage === 'en' ? 'English' : 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Confidence:</span>
                      <span className="font-medium">
                        {Math.round(distressAnalysis.confidence * 100)}%
                      </span>
                    </div>
                    {distressAnalysis.indicators.length > 0 && (
                      <div className="text-xs text-muted-foreground mt-2">
                        {distressAnalysis.indicators.length} distress indicator(s) detected
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* NLP Summary */}
              {nlpAnalysis && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">NLP Analysis Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Sentiment:</span>
                      <span className={`font-medium ${
                        nlpAnalysis.sentiment === 'positive' ? 'text-green-600' :
                        nlpAnalysis.sentiment === 'negative' ? 'text-red-600' :
                        'text-blue-600'
                      }`}>
                        {nlpAnalysis.sentiment}
                      </span>
                    </div>
                    {nlpAnalysis.emotions?.length > 0 && (
                      <div className="text-xs">
                        <span className="text-muted-foreground">Emotions: </span>
                        {nlpAnalysis.emotions.slice(0, 3).join(', ')}
                      </div>
                    )}
                    {nlpAnalysis.topics?.length > 0 && (
                      <div className="text-xs">
                        <span className="text-muted-foreground">Topics: </span>
                        {nlpAnalysis.topics.slice(0, 3).join(', ')}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="distress">
            <MultiLanguageDistressDetector
              text={textFeedback}
              onAnalysisUpdate={handleDistressAnalysisUpdate}
              showCrisisResources={true}
            />
          </TabsContent>

          <TabsContent value="nlp">
            <SmartFeedbackAnalyzer
              onAnalysisComplete={handleNlpAnalysisComplete}
            />
          </TabsContent>
        </Tabs>
      )}

      {/* Demo Examples */}
      {!textFeedback && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Try These Examples</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTextFeedback("I'm really struggling with math and feel like giving up. Nothing makes sense anymore and I can't keep up with everyone else.")}
              className="text-xs h-auto p-2 text-left justify-start whitespace-normal w-full"
            >
              English Example: "I'm really struggling with math and feel like giving up..."
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTextFeedback("Jaučiuosi labai blogai ir negaliu susitvarkyti su namų darbais. Viskas per sunku ir niekas nesiseka. Noriu viską mesti.")}
              className="text-xs h-auto p-2 text-left justify-start whitespace-normal w-full"
            >
              Lithuanian Example: "Jaučiuosi labai blogai ir negaliu susitvarkyti..."
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTextFeedback("Today's science lesson was amazing! I finally understood the concept and feel confident about the upcoming test.")}
              className="text-xs h-auto p-2 text-left justify-start whitespace-normal w-full"
            >
              Positive Example: "Today's science lesson was amazing! I finally understood..."
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedSmartFeedbackAnalyzer;
