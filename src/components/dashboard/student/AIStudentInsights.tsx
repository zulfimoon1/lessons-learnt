
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, TrendingUp, BookOpen } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface AIStudentInsightsProps {
  studentId: string;
  school: string;
  grade: string;
}

const AIStudentInsights: React.FC<AIStudentInsightsProps> = ({
  studentId,
  school,
  grade
}) => {
  const { t } = useLanguage();

  return (
    <Card className="bg-gradient-to-r from-brand-teal/10 to-brand-orange/10 border-brand-teal/20 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-brand-dark">
          <Brain className="w-5 h-5 text-brand-teal" />
          AI Personal Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/60 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-brand-orange" />
              <h3 className="font-semibold text-brand-dark">Explore New Learning Methods</h3>
            </div>
            <p className="text-sm text-brand-dark/80 mb-3">
              Try different study techniques to see what works best for you.
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-brand-orange h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
            <p className="text-xs text-brand-dark/60 mt-1">75%</p>
          </div>
          
          <div className="bg-white/60 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-brand-teal" />
              <h3 className="font-semibold text-brand-dark">Increase Participation</h3>
            </div>
            <p className="text-sm text-brand-dark/80 mb-3">
              Regular feedback helps both you and your teachers understand your learning needs better.
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-brand-teal h-2 rounded-full" style={{ width: '60%' }}></div>
            </div>
            <p className="text-xs text-brand-dark/60 mt-1">60%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIStudentInsights;
