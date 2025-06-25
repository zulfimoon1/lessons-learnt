import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AIStudentInsights from './AIStudentInsights';
import AIPersonalizationCard from '@/components/ai/AIPersonalizationCard';

interface EnhancedAIStudentInsightsProps {
  studentId: string;
  school: string;
  grade: string;
}

const EnhancedAIStudentInsights: React.FC<EnhancedAIStudentInsightsProps> = ({
  studentId,
  school,
  grade
}) => {
  return (
    <div className="space-y-6">
      {/* Existing AI Student Insights (preserved) */}
      <AIStudentInsights 
        studentId={studentId} 
        school={school} 
        grade={grade} 
      />
      
      {/* New Advanced AI Personalization */}
      <AIPersonalizationCard studentId={studentId} />
    </div>
  );
};

export default EnhancedAIStudentInsights;
