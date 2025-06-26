
import React from "react";
import WeeklySummaryReview from "@/components/WeeklySummaryReview";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { FileText, TrendingUp } from 'lucide-react';

interface WeeklySummariesTabProps {
  teacher: any;
}

const WeeklySummariesTab: React.FC<WeeklySummariesTabProps> = ({ teacher }) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Header Section - Matching AI Insights Style */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-brand-teal to-brand-orange flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Weekly Summaries</h2>
            <p className="text-gray-600">
              Review and analyze student weekly feedback and concerns
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-brand-teal/5 to-brand-orange/10 hover:from-brand-teal/10 hover:to-brand-orange/20">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-teal/10 flex items-center justify-center group-hover:bg-brand-teal/20 transition-colors">
              <TrendingUp className="w-4 h-4 text-brand-teal" />
            </div>
            <div>
              <CardTitle className="text-lg text-gray-900">Student Weekly Reports</CardTitle>
              <CardDescription className="text-sm">Comprehensive review of student emotional and academic feedback</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <WeeklySummaryReview teacher={teacher} />
        </CardContent>
      </Card>
    </div>
  );
};

export default WeeklySummariesTab;
