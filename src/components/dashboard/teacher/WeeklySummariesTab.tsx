
import React from "react";
import WeeklySummaryReview from "@/components/WeeklySummaryReview";
import { useLanguage } from "@/contexts/LanguageContext";

interface WeeklySummariesTabProps {
  teacher: any;
}

const WeeklySummariesTab: React.FC<WeeklySummariesTabProps> = ({ teacher }) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="bg-card p-6 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">
          {t('weekly.summaries')}
        </h2>
        <p className="text-muted-foreground mb-6">
          {t('dashboard.feedbackDescription')}
        </p>
        <WeeklySummaryReview teacher={teacher} />
      </div>
    </div>
  );
};

export default WeeklySummariesTab;
