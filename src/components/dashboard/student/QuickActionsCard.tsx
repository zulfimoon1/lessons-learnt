
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, MessageSquareIcon, FileTextIcon, HeartIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface QuickActionsCardProps {
  onViewClasses: () => void;
  onSubmitFeedback: () => void;
  onWeeklySummary: () => void;
  onWellnessCheck: () => void;
}

const QuickActionsCard: React.FC<QuickActionsCardProps> = ({
  onViewClasses,
  onSubmitFeedback,
  onWeeklySummary,
  onWellnessCheck
}) => {
  const { t } = useLanguage();

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-brand-teal/20 shadow-lg">
      <CardHeader>
        <CardTitle className="text-brand-dark">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-4"
            onClick={onViewClasses}
          >
            <CalendarIcon className="w-6 h-6 text-brand-teal" />
            <span className="text-sm">View Classes</span>
          </Button>
          
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-4"
            onClick={onSubmitFeedback}
          >
            <MessageSquareIcon className="w-6 h-6 text-brand-orange" />
            <span className="text-sm">Share Feedback</span>
          </Button>
          
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-4"
            onClick={onWeeklySummary}
          >
            <FileTextIcon className="w-6 h-6 text-brand-purple" />
            <span className="text-sm">Weekly Summary</span>
          </Button>
          
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-4"
            onClick={onWellnessCheck}
          >
            <HeartIcon className="w-6 h-6 text-red-500" />
            <span className="text-sm">Wellness Check</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionsCard;
