
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MentalHealthArticles from "@/components/MentalHealthArticles";
import { useLanguage } from "@/contexts/LanguageContext";
import { BookOpen, Library, Star } from 'lucide-react';

interface ArticlesTabProps {
  teacher: any;
  subscription?: any;
  onCreateCheckout?: () => void;
  isCreatingCheckout?: boolean;
}

const ArticlesTab: React.FC<ArticlesTabProps> = ({
  teacher,
  subscription,
  onCreateCheckout,
  isCreatingCheckout = false
}) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Header Section - Matching AI Insights Style */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-brand-teal to-brand-orange flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Educational Articles</h2>
            <p className="text-gray-600">
              Curated articles and resources for professional development
            </p>
          </div>
        </div>
      </div>

      {!subscription && onCreateCheckout ? (
        <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-brand-teal/5 to-brand-orange/10 hover:from-brand-teal/10 hover:to-brand-orange/20">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-teal/10 flex items-center justify-center group-hover:bg-brand-teal/20 transition-colors">
                <Star className="w-4 h-4 text-brand-teal" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-900">Premium Content</CardTitle>
                <CardDescription className="text-sm">Access professional development articles</CardDescription>
              </div>
            </div>
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
      ) : (
        <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-brand-teal/5 to-brand-orange/10 hover:from-brand-teal/10 hover:to-brand-orange/20">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-teal/10 flex items-center justify-center group-hover:bg-brand-teal/20 transition-colors">
                <Library className="w-4 h-4 text-brand-teal" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-900">Article Library</CardTitle>
                <CardDescription className="text-sm">Professional development and educational resources</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <MentalHealthArticles teacher={teacher} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ArticlesTab;
