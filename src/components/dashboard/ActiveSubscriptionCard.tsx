
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

interface ActiveSubscriptionCardProps {
  plan: string;
  expiryDate: string;
}

const ActiveSubscriptionCard: React.FC<ActiveSubscriptionCardProps> = ({ plan, expiryDate }) => {
  const { t } = useLanguage();

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="text-green-800">{t('admin.subscription')}</CardTitle>
        <CardDescription className="text-green-700">
          {t('teacher.activePlan', { 
            planType: plan, 
            date: new Date(expiryDate).toLocaleDateString() 
          })}
        </CardDescription>
      </CardHeader>
    </Card>
  );
};

export default ActiveSubscriptionCard;
