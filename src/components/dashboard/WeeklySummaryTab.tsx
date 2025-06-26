
import React from "react";
import WeeklySummaryForm from "@/components/dashboard/student/WeeklySummaryForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

interface WeeklySummaryTabProps {
  student: any;
}

const WeeklySummaryTab: React.FC<WeeklySummaryTabProps> = ({ student }) => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6">
      {/* Information Card explaining the routing */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-blue-800 text-lg">How's Your Week Going?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-blue-900 text-sm font-semibold">
            Tell us about your week! We want to know how you're doing both in school and with your feelings.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-orange-100 p-3 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="font-semibold" style={{ color: '#000000' }}>How You're Feeling</span>
              </div>
              <p className="text-xs font-medium" style={{ color: '#000000' }}>
                Tell us about your emotions, friendships, stress, or anything that's on your mind
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-semibold" style={{ color: '#000000' }}>How School's Going</span>
              </div>
              <p className="text-xs font-medium" style={{ color: '#000000' }}>
                Share about your classes, homework, tests, or anything school-related
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* The actual weekly summary form with proper styling */}
      <WeeklySummaryForm student={student} />
    </div>
  );
};

export default WeeklySummaryTab;
