
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  Target, 
  Lightbulb, 
  TrendingUp, 
  User,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useAdvancedAI } from '@/hooks/useAdvancedAI';

interface IntelligenceEnhancementDashboardProps {
  studentId?: string;
  teacherId?: string;
  school: string;
  className?: string;
}

const IntelligenceEnhancementDashboard: React.FC<IntelligenceEnhancementDashboardProps> = ({
  studentId,
  teacherId,
  school,
  className
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState(studentId);
  const [activeTab, setActiveTab] = useState('profile');
  
  const {
    personalizationProfile,
    predictiveInsights,
    contentRecommendations,
    isLoading,
    error,
    generatePersonalizationProfile,
    generatePredictiveInsights,
    generateContentRecommendations,
    generateComprehensiveReport,
    clearError,
    isAnyLoading
  } = useAdvancedAI(selectedStudentId);

  // Auto-generate insights when student is selected
  useEffect(() => {
    if (selectedStudentId && !isAnyLoading) {
      generateComprehensiveReport();
    }
  }, [selectedStudentId, generateComprehensiveReport, isAnyLoading]);

  const handleRefreshAll = async () => {
    if (!selectedStudentId) return;
    await generateComprehensiveReport();
  };

  const getPriorityLevel = (insight: any) => {
    if (insight.impactLevel === 'high') return 'high';
    if (insight.impactLevel === 'medium') return 'medium';
    return 'low';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 text-blue-600" />
            Intelligence Enhancement Dashboard
          </h2>
          <p className="text-sm text-muted-foreground">
            AI-powered personalization and predictive analytics for {school}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {selectedStudentId && (
            <Button
              onClick={handleRefreshAll}
              disabled={isAnyLoading}
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isAnyLoading ? 'animate-spin' : ''}`} />
              Refresh All
            </Button>
          )}
        </div>
      </div>

      {/* Student Selection - for teachers */}
      {teacherId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Student Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <input
              type="text"
              placeholder="Enter Student ID for analysis..."
              value={selectedStudentId || ''}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button variant="ghost" size="sm" onClick={clearError} className="ml-2">
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      {selectedStudentId ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="insights">
              <TrendingUp className="w-4 h-4 mr-2" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="recommendations">
              <Lightbulb className="w-4 h-4 mr-2" />
              Content
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <Target className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Personalization Profile</CardTitle>
                <p className="text-sm text-muted-foreground">
                  AI-generated learning profile based on behavior analysis
                </p>
              </CardHeader>
              <CardContent>
                {personalizationProfile ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h4 className="font-medium mb-2">Learning Preferences</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Learning Style:</span>
                            <Badge variant="outline">{personalizationProfile.learningStyle}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Language:</span>
                            <Badge variant="outline">{personalizationProfile.preferredLanguage.toUpperCase()}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Difficulty:</span>
                            <Badge variant="outline">{personalizationProfile.difficultyPreference}</Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Interaction Patterns</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Avg Session:</span>
                            <span>{personalizationProfile.interactionPatterns.avgSessionDuration}min</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Response Speed:</span>
                            <Badge variant="outline">{personalizationProfile.interactionPatterns.responseSpeed}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Preferred Time:</span>
                            <span>{personalizationProfile.interactionPatterns.preferredTimeOfDay}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h4 className="font-medium mb-2">Strength Areas</h4>
                        <div className="flex flex-wrap gap-1">
                          {personalizationProfile.strengthAreas.map((area, index) => (
                            <Badge key={index} className="bg-green-100 text-green-800">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Improvement Areas</h4>
                        <div className="flex flex-wrap gap-1">
                          {personalizationProfile.improvementAreas.map((area, index) => (
                            <Badge key={index} className="bg-orange-100 text-orange-800">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Emotional Patterns</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Engagement Level: </span>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${personalizationProfile.emotionalPatterns.engagementLevel * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        {personalizationProfile.emotionalPatterns.positiveIndicators.length > 0 && (
                          <div>
                            <span className="font-medium">Positive Indicators: </span>
                            {personalizationProfile.emotionalPatterns.positiveIndicators.join(', ')}
                          </div>
                        )}
                        {personalizationProfile.emotionalPatterns.stressIndicators.length > 0 && (
                          <div>
                            <span className="font-medium">Stress Indicators: </span>
                            <span className="text-red-600">
                              {personalizationProfile.emotionalPatterns.stressIndicators.join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-muted-foreground mt-2">Generating personalization profile...</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No profile data available</p>
                    <Button 
                      onClick={() => generatePersonalizationProfile()} 
                      className="mt-2"
                      size="sm"
                    >
                      Generate Profile
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            {predictiveInsights.length > 0 ? (
              predictiveInsights.map((insight) => (
                <Card key={insight.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        {insight.type.replace('_', ' ').toUpperCase()} Prediction
                      </CardTitle>
                      <div className="flex gap-2">
                        <Badge variant={getPriorityColor(getPriorityLevel(insight)) as any}>
                          {insight.impactLevel}
                        </Badge>
                        <Badge variant="outline">
                          {Math.round(insight.confidence * 100)}%
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-3">{insight.prediction}</p>
                    
                    {insight.recommendedActions.length > 0 && (
                      <div>
                        <h5 className="text-xs font-medium mb-2">Recommended Actions:</h5>
                        <ul className="space-y-1">
                          {insight.recommendedActions.map((action, index) => (
                            <li key={index} className="text-xs bg-blue-50 p-2 rounded border-l-2 border-blue-200">
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Generating predictive insights...</p>
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground mb-4">No predictive insights available</p>
                  <Button 
                    onClick={() => generatePredictiveInsights()} 
                    size="sm"
                  >
                    Generate Insights
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            {contentRecommendations.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {contentRecommendations.map((rec) => (
                  <Card key={rec.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-sm">{rec.title}</CardTitle>
                        <Badge variant="outline">{rec.type}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-xs text-muted-foreground">{rec.description}</p>
                      
                      <div className="flex justify-between text-xs">
                        <span>Duration: {rec.estimatedDuration}min</span>
                        <span>Difficulty: {rec.difficulty}</span>
                      </div>
                      
                      <div className="flex justify-between text-xs">
                        <span>Language: {rec.language.toUpperCase()}</span>
                        <span>Score: {Math.round(rec.relevanceScore * 100)}%</span>
                      </div>
                      
                      <div className="text-xs">
                        <span className="font-medium">Reason: </span>
                        {rec.adaptationReason}
                      </div>
                      
                      {rec.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {rec.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Generating content recommendations...</p>
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground mb-4">No content recommendations available</p>
                  <Button 
                    onClick={() => generateContentRecommendations()} 
                    size="sm"
                  >
                    Generate Recommendations
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">{predictiveInsights.length}</div>
                  <p className="text-xs text-muted-foreground">Active Insights</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">{contentRecommendations.length}</div>
                  <p className="text-xs text-muted-foreground">Recommendations</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">
                    {personalizationProfile ? Math.round(personalizationProfile.emotionalPatterns.engagementLevel * 100) : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">Engagement Level</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center">
            <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {teacherId ? 'Select a student to view AI-powered insights' : 'Student ID required for analysis'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IntelligenceEnhancementDashboard;
