
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AIRecommendationsCard from '@/components/ai/AIRecommendationsCard';
import StudentEngagementPredictor from '@/components/ai/StudentEngagementPredictor';
import { Brain, Sparkles, Target } from 'lucide-react';

interface AIInsightsTabProps {
  teacher: {
    id: string;
    school: string;
    name: string;
    role: string;
  };
}

const AIInsightsTab: React.FC<AIInsightsTabProps> = ({ teacher }) => {
  return (
    <div className="space-y-6">
      {/* Header Section - Matching Student Dashboard Style */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI-Powered Insights</h2>
            <p className="text-gray-600">
              Intelligent recommendations and predictions based on your teaching data
            </p>
          </div>
        </div>
      </div>

      {/* AI Feature Cards Grid */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {/* AI Recommendations */}
        <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-brand-teal/5 to-brand-teal/10 hover:from-brand-teal/10 hover:to-brand-teal/20">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-teal/10 flex items-center justify-center group-hover:bg-brand-teal/20 transition-colors">
                <Sparkles className="w-4 h-4 text-brand-teal" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-900">Smart Recommendations</CardTitle>
                <CardDescription className="text-sm">Personalized teaching suggestions</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <AIRecommendationsCard teacherId={teacher.id} />
          </CardContent>
        </Card>

        {/* Student Engagement Predictor */}
        <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-brand-orange/5 to-brand-orange/10 hover:from-brand-orange/10 hover:to-brand-orange/20">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-orange/10 flex items-center justify-center group-hover:bg-brand-orange/20 transition-colors">
                <Target className="w-4 h-4 text-brand-orange" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-900">Engagement Predictor</CardTitle>
                <CardDescription className="text-sm">Forecast student participation</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <StudentEngagementPredictor school={teacher.school} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIInsightsTab;
