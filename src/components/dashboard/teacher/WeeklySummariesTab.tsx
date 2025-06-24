
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

  if (!subscription) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-brand-teal/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-brand-teal to-brand-orange/20 rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            {t('dashboard.weeklySummaries')}
          </CardTitle>
          <CardDescription className="text-white/80">
            {t('teacher.subscriptionRequiredForSummaries')}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <div className="w-20 h-20 bg-brand-orange/10 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Users className="w-10 h-10 text-brand-orange" />
          </div>
          <p className="text-brand-dark/60 mb-6">{t('teacher.subscriptionRequiredForSummaries')}</p>
          <Button 
            onClick={onCreateCheckout}
            disabled={isCreatingCheckout}
            className="bg-gradient-to-r from-brand-orange to-brand-orange/80 hover:from-brand-orange/90 hover:to-brand-orange/70 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isCreatingCheckout ? t('pricing.processing') : t('teacher.subscribeToContinue')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <WeeklySummaryReview />
    </div>
  );
};

export default WeeklySummariesTab;
