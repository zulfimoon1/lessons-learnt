
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Users, AlertTriangle, TrendingUp, Brain, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { aiRecommendationService } from '@/services/aiRecommendationService';

interface StudentEngagementPrediction {
  studentId: string;
  studentName: string;
  riskLevel: 'low' | 'medium' | 'high';
  predictedEngagement: number;
  factors: string[];
  recommendations: string[];
}

interface StudentEngagementPredictorProps {
  school: string;
  grade?: string;
}

const StudentEngagementPredictor: React.FC<StudentEngagementPredictorProps> = ({
  school,
  grade
}) => {
  const { t } = useLanguage();
  const [predictions, setPredictions] = useState<StudentEngagementPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPredictions();
  }, [school, grade]);

  const loadPredictions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await aiRecommendationService.predictStudentEngagement(school, grade);
      setPredictions(data);
    } catch (err) {
      console.error('Error loading engagement predictions:', err);
      setError('Failed to load predictions');
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
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <TrendingUp className="w-4 h-4" />;
      case 'low': return <Users className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            {t('ai.engagementPredictor') || 'Student Engagement Predictor'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">Analyzing student engagement patterns...</span>
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
            {t('ai.engagementPredictor') || 'Student Engagement Predictor'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadPredictions} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const highRiskStudents = predictions.filter(p => p.riskLevel === 'high');
  const mediumRiskStudents = predictions.filter(p => p.riskLevel === 'medium');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          {t('ai.engagementPredictor') || 'Student Engagement Predictor'}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          AI-powered insights into student engagement risks
        </p>
      </CardHeader>
      <CardContent>
        {predictions.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">
              No student data available for analysis. Encourage feedback submission to enable predictions.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{highRiskStudents.length}</div>
                <div className="text-sm text-muted-foreground">High Risk</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{mediumRiskStudents.length}</div>
                <div className="text-sm text-muted-foreground">Medium Risk</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {predictions.length - highRiskStudents.length - mediumRiskStudents.length}
                </div>
                <div className="text-sm text-muted-foreground">Low Risk</div>
              </div>
            </div>

            {/* High Risk Students - Priority */}
            {highRiskStudents.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-red-600 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Priority Attention Needed
                </h4>
                {highRiskStudents.slice(0, 5).map((prediction, index) => (
                  <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-medium">{prediction.studentName}</h5>
                      <div className="flex items-center gap-2">
                        <Badge variant={getRiskLevelColor(prediction.riskLevel)} className="flex items-center gap-1">
                          {getRiskLevelIcon(prediction.riskLevel)}
                          {prediction.riskLevel} risk
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Predicted Engagement</span>
                        <span>{Math.round(prediction.predictedEngagement * 100)}%</span>
                      </div>
                      <Progress value={prediction.predictedEngagement * 100} className="h-2" />
                    </div>

                    {prediction.factors.length > 0 && (
                      <div className="mb-2">
                        <p className="text-sm font-medium mb-1">Risk Factors:</p>
                        <ul className="text-sm text-muted-foreground">
                          {prediction.factors.map((factor, idx) => (
                            <li key={idx}>• {factor}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {prediction.recommendations.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-1">Recommendations:</p>
                        <ul className="text-sm text-green-700">
                          {prediction.recommendations.map((rec, idx) => (
                            <li key={idx}>• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Medium Risk Students */}
            {mediumRiskStudents.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-yellow-600 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Monitor Closely
                </h4>
                {mediumRiskStudents.slice(0, 3).map((prediction, index) => (
                  <div key={index} className="border border-yellow-200 rounded-lg p-3 bg-yellow-50">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium">{prediction.studentName}</h5>
                      <Badge variant={getRiskLevelColor(prediction.riskLevel)} className="flex items-center gap-1">
                        {getRiskLevelIcon(prediction.riskLevel)}
                        {prediction.riskLevel} risk
                      </Badge>
                    </div>
                    
                    <div className="mb-2">
                      <Progress value={prediction.predictedEngagement * 100} className="h-2" />
                    </div>

                    {prediction.recommendations.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {prediction.recommendations[0]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 border-t">
              <Button onClick={loadPredictions} variant="outline" className="w-full">
                Refresh Analysis
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentEngagementPredictor;
