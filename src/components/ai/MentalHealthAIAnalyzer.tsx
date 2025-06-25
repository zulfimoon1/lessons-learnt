
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Heart, AlertTriangle, TrendingUp, Brain, Loader2, Shield } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { aiRecommendationService } from '@/services/aiRecommendationService';

interface MentalHealthPattern {
  riskLevel: 'low' | 'medium' | 'high';
  trends: string[];
  recommendations: string[];
}

interface MentalHealthAIAnalyzerProps {
  school: string;
}

const MentalHealthAIAnalyzer: React.FC<MentalHealthAIAnalyzerProps> = ({ school }) => {
  const { t } = useLanguage();
  const [analysis, setAnalysis] = useState<MentalHealthPattern | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalysis();
  }, [school]);

  const loadAnalysis = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await aiRecommendationService.analyzeMentalHealthPatterns(school);
      setAnalysis(data);
    } catch (err) {
      console.error('Error loading mental health analysis:', err);
      setError('Failed to load analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getRiskLevelIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return <AlertTriangle className="w-5 h-5" />;
      case 'medium': return <TrendingUp className="w-5 h-5" />;
      case 'low': return <Shield className="w-5 h-5" />;
      default: return <Heart className="w-5 h-5" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            {t('ai.mentalHealthAnalyzer') || 'Mental Health AI Analyzer'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">Analyzing mental health patterns...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            {t('ai.mentalHealthAnalyzer') || 'Mental Health AI Analyzer'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadAnalysis} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          {t('ai.mentalHealthAnalyzer') || 'Mental Health AI Analyzer'}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          AI-powered analysis of mental health patterns and risks
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Risk Level Overview */}
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              {getRiskLevelIcon(analysis.riskLevel)}
              <span className="font-medium">Current Risk Level:</span>
            </div>
            <Badge variant={getRiskLevelColor(analysis.riskLevel)} className="flex items-center gap-1">
              {analysis.riskLevel.toUpperCase()}
            </Badge>
          </div>

          {/* High Risk Alert */}
          {analysis.riskLevel === 'high' && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>High Risk Detected:</strong> Immediate attention and intervention may be required. 
                Consider contacting your school counselor or mental health professional.
              </AlertDescription>
            </Alert>
          )}

          {/* Medium Risk Warning */}
          {analysis.riskLevel === 'medium' && (
            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                <strong>Increased Monitoring Recommended:</strong> Some concerning patterns detected. 
                Enhanced support and preventive measures should be considered.
              </AlertDescription>
            </Alert>
          )}

          {/* Trends Analysis */}
          {analysis.trends.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Identified Trends
              </h4>
              <div className="space-y-2">
                {analysis.trends.map((trend, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">{trend}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Recommendations */}
          {analysis.recommendations.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Brain className="w-4 h-4" />
                AI Recommendations
              </h4>
              <div className="space-y-2">
                {analysis.recommendations.map((recommendation, index) => (
                  <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Issues */}
          {analysis.riskLevel === 'low' && analysis.trends.length === 0 && (
            <div className="text-center py-6">
              <Shield className="w-12 h-12 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium text-green-600 mb-1">All Clear</h4>
              <p className="text-sm text-muted-foreground">
                No significant mental health concerns detected in recent data. 
                Continue regular monitoring and support.
              </p>
            </div>
          )}

          {/* Refresh Button */}
          <div className="pt-4 border-t">
            <Button onClick={loadAnalysis} variant="outline" className="w-full">
              Refresh Analysis
            </Button>
          </div>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground p-3 bg-muted rounded-lg">
            <strong>Disclaimer:</strong> This AI analysis is for informational purposes only and should not replace 
            professional mental health assessment. Always consult qualified professionals for serious concerns.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MentalHealthAIAnalyzer;
