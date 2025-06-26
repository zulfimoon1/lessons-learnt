
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  AlertTriangle, 
  Shield, 
  Brain, 
  Activity,
  TrendingUp,
  Phone,
  Clock
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEnhancedThreatDetection, EnhancedThreatAnalysis } from '@/hooks/useEnhancedThreatDetection';

interface EnhancedThreatDetectorProps {
  studentId?: string;
  onThreatDetected?: (analysis: EnhancedThreatAnalysis) => void;
  onImmediateAction?: (analysis: EnhancedThreatAnalysis) => void;
  className?: string;
  autoAnalyze?: boolean;
}

const EnhancedThreatDetector: React.FC<EnhancedThreatDetectorProps> = ({
  studentId = 'demo-student',
  onThreatDetected,
  onImmediateAction,
  className,
  autoAnalyze = true
}) => {
  const { t } = useLanguage();
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState<EnhancedThreatAnalysis | null>(null);
  const [riskTrends, setRiskTrends] = useState<any>(null);
  const [typingMetadata, setTypingMetadata] = useState({
    startTime: Date.now(),
    keyCount: 0,
    deletionCount: 0,
    pauseStart: Date.now()
  });

  const { analyzeText, getStudentRiskTrends, isAnalyzing, error } = useEnhancedThreatDetection();

  useEffect(() => {
    if (studentId) {
      loadRiskTrends();
    }
  }, [studentId]);

  useEffect(() => {
    if (autoAnalyze && text.trim().length > 10) {
      const timer = setTimeout(() => {
        handleAnalyze();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [text, autoAnalyze]);

  const loadRiskTrends = async () => {
    if (!studentId) return;
    const trends = await getStudentRiskTrends(studentId, 30);
    setRiskTrends(trends);
  };

  const handleAnalyze = async () => {
    if (!text.trim()) return;

    const metadata = {
      timestamp: new Date(),
      typingSpeed: typingMetadata.keyCount / ((Date.now() - typingMetadata.startTime) / 60000), // keys per minute
      deletionCount: typingMetadata.deletionCount,
      pauseDuration: Date.now() - typingMetadata.pauseStart
    };

    const result = await analyzeText(text, studentId, metadata);
    
    if (result) {
      setAnalysis(result);
      onThreatDetected?.(result);
      
      if (result.requiresImmediateAction) {
        onImmediateAction?.(result);
      }
    }
  };

  const handleTextChange = (value: string) => {
    const now = Date.now();
    
    // Track typing behavior
    if (value.length > text.length) {
      setTypingMetadata(prev => ({
        ...prev,
        keyCount: prev.keyCount + 1,
        pauseStart: now
      }));
    } else if (value.length < text.length) {
      setTypingMetadata(prev => ({
        ...prev,
        deletionCount: prev.deletionCount + 1,
        pauseStart: now
      }));
    }
    
    setText(value);
  };

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

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Risk Trends Summary */}
      {riskTrends && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Risk Trend Analysis (30 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{riskTrends.totalAlerts}</div>
                <div className="text-sm text-muted-foreground">Total Alerts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{riskTrends.criticalAlerts}</div>
                <div className="text-sm text-muted-foreground">Critical Alerts</div>
              </div>
              <div className="text-center">
                <Badge variant={
                  riskTrends.trendDirection === 'increasing' ? 'destructive' :
                  riskTrends.trendDirection === 'decreasing' ? 'default' : 'secondary'
                }>
                  {riskTrends.trendDirection}
                </Badge>
                <div className="text-sm text-muted-foreground">Trend</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium">
                  {riskTrends.lastAlert ? 
                    new Date(riskTrends.lastAlert.created_at).toLocaleDateString() : 
                    'No recent alerts'
                  }
                </div>
                <div className="text-sm text-muted-foreground">Last Alert</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Enhanced Threat Detection
            <Badge variant="outline" className="ml-auto">
              <Activity className="w-3 h-3 mr-1" />
              Real-time
            </Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Advanced AI-powered threat detection with behavioral analysis and cultural context
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Enter text for enhanced threat analysis:
            </label>
            <Textarea
              placeholder="Type your message here... (supports English & Lithuanian)"
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              className="min-h-[120px]"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-muted-foreground">
                {text.length} characters • Typing: {Math.round(typingMetadata.keyCount / Math.max((Date.now() - typingMetadata.startTime) / 60000, 1))} keys/min
              </span>
              {!autoAnalyze && (
                <Button
                  onClick={handleAnalyze}
                  disabled={!text.trim() || isAnalyzing}
                  size="sm"
                >
                  <Brain className={`w-4 h-4 mr-2 ${isAnalyzing ? 'animate-pulse' : ''}`} />
                  {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                </Button>
              )}
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
      {analysis && (
        <div className="space-y-4">
          {/* Critical Alert */}
          {analysis.requiresImmediateAction && (
            <Alert variant="destructive" className="border-red-600">
              <Phone className="h-4 w-4" />
              <AlertDescription>
                <strong>IMMEDIATE ACTION REQUIRED:</strong> Critical threat detected. 
                Contact crisis intervention team immediately.
              </AlertDescription>
            </Alert>
          )}

          {/* Main Analysis Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getRiskLevelIcon(analysis.riskLevel)}
                Enhanced Threat Analysis Results
                <Badge variant={getRiskLevelColor(analysis.riskLevel)} className="ml-auto">
                  {analysis.riskLevel.toUpperCase()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Risk Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Confidence:</span>
                  <div className="font-medium">{Math.round(analysis.confidence * 100)}%</div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Predictive Risk:</span>
                  <div className="font-medium">{Math.round(analysis.predictiveRiskScore * 100)}%</div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Emotion:</span>
                  <div className="font-medium capitalize">{analysis.semanticAnalysis.emotion}</div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Urgency:</span>
                  <div className="font-medium">{Math.round(analysis.semanticAnalysis.urgency * 100)}%</div>
                </div>
              </div>

              {/* Detected Patterns */}
              {analysis.detectedPatterns.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Detected Threat Patterns:</h4>
                  <div className="space-y-1">
                    {analysis.detectedPatterns.map((pattern, index) => (
                      <div key={index} className="text-sm bg-red-50 border border-red-200 p-2 rounded">
                        <strong>Pattern:</strong> "{pattern}"
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cultural Factors */}
              {analysis.culturalFactors.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Cultural Context Factors:</h4>
                  <div className="flex gap-1 flex-wrap">
                    {analysis.culturalFactors.map((factor, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {factor.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Semantic Analysis */}
              <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                <h4 className="font-medium text-sm mb-2">Semantic Analysis:</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><strong>Sentiment:</strong> {analysis.semanticAnalysis.sentiment.toFixed(2)}</div>
                  <div><strong>Tone:</strong> {analysis.semanticAnalysis.tone}</div>
                </div>
              </div>

              {/* Intervention Recommendations */}
              <div>
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Intervention Recommendations:
                </h4>
                <div className="space-y-2">
                  {analysis.interventionRecommendations.map((recommendation, index) => (
                    <div key={index} className={`text-sm p-2 rounded border ${
                      analysis.riskLevel === 'critical' ? 'bg-red-50 border-red-200' :
                      analysis.riskLevel === 'high' ? 'bg-orange-50 border-orange-200' :
                      'bg-blue-50 border-blue-200'
                    }`}>
                      • {recommendation}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Demo Examples */}
      {!analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Try Enhanced Detection Examples</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setText("I feel so hopeless lately and I just want everything to stop")}
              className="text-xs h-auto p-2 text-left justify-start whitespace-normal w-full"
            >
              "I feel so hopeless lately and I just want everything to stop"
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setText("Jaučiuosi labai liūdnas ir nieko nebenoriu daryti gyvenime")}
              className="text-xs h-auto p-2 text-left justify-start whitespace-normal w-full"
            >
              "Jaučiuosi labai liūdnas ir nieko nebenoriu daryti gyvenime" (Lithuanian)
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setText("Everything is great! I love learning new things and spending time with friends.")}
              className="text-xs h-auto p-2 text-left justify-start whitespace-normal w-full"
            >
              "Everything is great! I love learning new things and spending time with friends." (Positive example)
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedThreatDetector;
