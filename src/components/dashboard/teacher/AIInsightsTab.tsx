
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BrainIcon, TrendingUpIcon, UserIcon, BarChart3Icon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface AIInsightsTabProps {
  teacher: any;
}

const AIInsightsTab: React.FC<AIInsightsTabProps> = ({ teacher }) => {
  const { t } = useLanguage();

  const handleGenerateInsights = () => {
    // Placeholder for AI insights generation
    console.log('Generating AI insights...');
  };

  return (
    <div className="space-y-6">
      <div className="bg-card p-6 rounded-lg border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <BrainIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{t('ai.insights')}</h2>
            <p className="text-muted-foreground">{t('ai.insightsDescription')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUpIcon className="w-4 h-4" />
                {t('ai.studentEngagement')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">{t('ai.analyzingData')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                {t('ai.classPerformance')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">{t('ai.noDataAvailable')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3Icon className="w-4 h-4" />
                {t('ai.recommendations')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleGenerateInsights}
                variant="outline" 
                size="sm"
                className="w-full"
              >
                {t('ai.generateInsights')}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <h3 className="font-medium mb-2">{t('ai.improvementSuggestions')}</h3>
          <p className="text-muted-foreground text-sm">
            {t('ai.subscriptionRequired')}
          </p>
          <Button className="mt-3" variant="outline">
            {t('ai.subscribeToUnlock')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIInsightsTab;
