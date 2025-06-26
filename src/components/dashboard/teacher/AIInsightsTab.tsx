
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AIRecommendationsCard from '@/components/ai/AIRecommendationsCard';
import StudentEngagementPredictor from '@/components/ai/StudentEngagementPredictor';
import MentalHealthAIAnalyzer from '@/components/ai/MentalHealthAIAnalyzer';

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-brand-dark mb-2">AI-Powered Insights</h2>
          <p className="text-brand-dark/70">
            Intelligent recommendations and predictions based on your teaching data
          </p>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-border/50 shadow-sm">
          <AIRecommendationsCard teacherId={teacher.id} />
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-border/50 shadow-sm">
          <StudentEngagementPredictor school={teacher.school} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-1">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-border/50 shadow-sm">
          <MentalHealthAIAnalyzer school={teacher.school} />
        </div>
      </div>
    </div>
  );
};

export default AIInsightsTab;
