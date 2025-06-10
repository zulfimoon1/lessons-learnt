
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import WeeklySummaryReview from "@/components/WeeklySummaryReview";
import { useLanguage } from "@/contexts/LanguageContext";

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

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.weeklySummaries')}</CardTitle>
          <CardDescription>
            {t('teacher.subscriptionRequiredForSummaries')}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground mb-4">{t('teacher.subscriptionRequiredForSummaries')}</p>
          <Button 
            onClick={onCreateCheckout}
            disabled={isCreatingCheckout}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isCreatingCheckout ? t('pricing.processing') : t('teacher.subscribeToContinue')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <WeeklySummaryReview school={school} />
    </div>
  );
};

export default WeeklySummariesTab;
