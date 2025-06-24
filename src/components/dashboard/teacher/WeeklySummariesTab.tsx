
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import WeeklySummaryReview from "@/components/WeeklySummaryReview";
import { useLanguage } from "@/contexts/LanguageContext";
import { FileText, Users } from "lucide-react";

interface WeeklySummariesTabProps {
  school?: string;
  subscription: any;
  onCreateCheckout: () => void;
  isCreatingCheckout: boolean;
}

const WeeklySummariesTab: React.FC<WeeklySummariesTabProps> = ({
  school,
  subscription,
  onCreateCheckout,
  isCreatingCheckout
}) => {
  const { t } = useLanguage();

  // Always show the weekly summaries for teachers - remove subscription requirement
  return (
    <div className="space-y-6">
      <WeeklySummaryReview />
    </div>
  );
};

export default WeeklySummariesTab;
