
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCardIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface SubscriptionBannerProps {
  isDoctor?: boolean;
  onSubscribe: () => void;
  isCreatingCheckout: boolean;
}

const SubscriptionBanner: React.FC<SubscriptionBannerProps> = ({
  isDoctor = false,
  onSubscribe,
  isCreatingCheckout
}) => {
  const { t } = useLanguage();

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-800">
          <CreditCardIcon className="w-5 h-5" />
          {t('admin.subscription')}
        </CardTitle>
        <CardDescription className="text-yellow-700">
          {isDoctor
            ? t('teacher.doctorSubscriptionDescription')
            : t('teacher.subscriptionDescription')
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={onSubscribe}
          disabled={isCreatingCheckout}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isCreatingCheckout ? t('pricing.processing') : t('dashboard.subscribeNow')}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SubscriptionBanner;
