
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MentalHealthArticles from "@/components/MentalHealthArticles";
import { useLanguage } from "@/contexts/LanguageContext";

interface ArticlesTabProps {
  teacher: any;
  subscription: any;
  onCreateCheckout: () => void;
  isCreatingCheckout: boolean;
}

const ArticlesTab: React.FC<ArticlesTabProps> = ({
  teacher,
  subscription,
  onCreateCheckout,
  isCreatingCheckout
}) => {
  const { t } = useLanguage();

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('articles.mentalHealth')}</CardTitle>
          <CardDescription>
            {t('articles.subscriptionRequired')}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground mb-4">{t('articles.subscriptionRequired')}</p>
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
      <MentalHealthArticles teacher={teacher} />
    </div>
  );
};

export default ArticlesTab;
