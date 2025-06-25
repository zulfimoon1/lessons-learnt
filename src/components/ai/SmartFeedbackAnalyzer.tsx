
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Brain, AlertTriangle, CheckCircle, Info, Lightbulb } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { advancedAIService } from '@/services/advancedAIService';

interface SmartFeedbackAnalyzerProps {
  onAnalysisComplete?: (analysis: any) => void;
  className?: string;
}

const SmartFeedbackAnalyzer: React.FC<SmartFeedbackAnalyzerProps> = ({
  onAnalysisComplete,
  className
}) => {
  const { t } = useLanguage();
  const [textFeedback, setTextFeedback] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeFeedback = async () => {
    if (!textFeedback.trim()) return;

    try {
      setIsAnalyzing(true);
      console.log('🧠 Analyzing feedback with NLP...');
      
      const result = await advancedAIService.analyzeTextFeedback(textFeedback);
      setAnalysis(result);
      onAnalysisComplete?.(result);
    } catch (error) {
      console.error('Error analyzing feedback:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'negative':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'negative':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          {t('ai.feedbackAnalyzer') || 'Smart Feedback Analyzer'}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          AI-powered analysis of student feedback for insights and patterns
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Input Section */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Enter feedback text for analysis:
          </label>
          <Textarea
            placeholder="Type or paste student feedback here..."
            value={textFeedback}
            onChange={(e) => setTextFeedback(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-muted-foreground">
              {textFeedback.length} characters
            </span>
            <Button
              onClick={analyzeFeedback}
              disabled={!textFeedback.trim() || isAnalyzing}
              size="sm"
            >
              <MessageSquare className={`w-4 h-4 mr-2 ${isAnalyzing ? 'animate-pulse' : ''}`} />
              {isAnalyzing ? 'Analyzing...' : 'Analyze Feedback'}
            </Button>
          </div>
        </div>

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-4">
            {/* Sentiment Analysis */}
            <div className={`p-3 rounded-lg border ${getSentimentColor(analysis.sentiment)}`}>
              <div className="flex items-center gap-2 mb-2">
                {getSentimentIcon(analysis.sentiment)}
                <h4 className="font-medium text-sm">Sentiment Analysis</h4>
              </div>
              <p className="text-sm capitalize">
                Overall sentiment: <strong>{analysis.sentiment}</strong>
              </p>
            </div>

            {/* Emotions Detected */}
            {analysis.emotions.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2">Emotions Detected</h4>
                <div className="flex gap-1 flex-wrap">
                  {analysis.emotions.map((emotion: string) => (
                    <Badge key={emotion} variant="outline" className="text-xs">
                      {emotion}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Topics Mentioned */}
            {analysis.topics.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2">Topics Mentioned</h4>
                <div className="flex gap-1 flex-wrap">
                  {analysis.topics.map((topic: string) => (
                    <Badge key={topic} variant="secondary" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Concerns Identified */}
            {analysis.concerns.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2 text-yellow-800">
                  <AlertTriangle className="w-4 h-4" />
                  Concerns Identified
                </h4>
                <ul className="space-y-1">
                  {analysis.concerns.map((concern: string, index: number) => (
                    <li key={index} className="text-sm text-yellow-700">
                      • {concern}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* AI Suggestions */}
            {analysis.suggestions.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2 text-blue-800">
                  <Lightbulb className="w-4 h-4" />
                  AI Suggestions
                </h4>
                <ul className="space-y-1">
                  {analysis.suggestions.map((suggestion: string, index: number) => (
                    <li key={index} className="text-sm text-blue-700">
                      • {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Demo Examples */}
        {!analysis && (
          <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Try These Examples
            </h4>
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTextFeedback("I really enjoyed today's math lesson! The visual examples helped me understand fractions much better. Can we do more activities like this?")}
                className="text-xs h-auto p-2 text-left justify-start whitespace-normal"
              >
                "I really enjoyed today's math lesson! The visual examples helped me understand fractions much better..."
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTextFeedback("The science experiment was confusing and I don't understand why we had to do it. It felt too hard and I'm worried about the upcoming test.")}
                className="text-xs h-auto p-2 text-left justify-start whitespace-normal"
              >
                "The science experiment was confusing and I don't understand why we had to do it..."
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SmartFeedbackAnalyzer;
