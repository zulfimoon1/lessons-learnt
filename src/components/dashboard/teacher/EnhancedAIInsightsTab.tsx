
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AIRecommendationsCard from '@/components/ai/AIRecommendationsCard';
import StudentEngagementPredictor from '@/components/ai/StudentEngagementPredictor';
import MentalHealthAIAnalyzer from '@/components/ai/MentalHealthAIAnalyzer';
import SmartFeedbackAnalyzer from '@/components/ai/SmartFeedbackAnalyzer';

interface EnhancedAIInsightsTabProps {
  teacher: {
    id: string;
    school: string;
    name: string;
    role: string;
  };
}

const EnhancedAIInsightsTab: React.FC<EnhancedAIInsightsTabProps> = ({ teacher }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-brand-dark">Enhanced AI Insights</h2>
          <p className="text-brand-dark/70">
            Advanced AI-powered analytics, personalization, and feedback analysis
          </p>
        </div>
      </div>
      
      {/* Top Row - Existing AI Components (preserved) */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <AIRecommendationsCard teacherId={teacher.id} />
        <StudentEngagementPredictor school={teacher.school} />
      </div>

      {/* Second Row - New Advanced AI Features */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
        <SmartFeedbackAnalyzer />
      </div>

      {/* Third Row - Mental Health AI (preserved) */}
      <div className="grid gap-6 md:grid-cols-1">
        <MentalHealthAIAnalyzer school={teacher.school} />
      </div>
    </div>
  );
};

export default EnhancedAIInsightsTab;
