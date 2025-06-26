
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MentalHealthArticles from "@/components/MentalHealthArticles";
import OptimizedMentalHealthAlerts from "@/components/OptimizedMentalHealthAlerts";
import { useLanguage } from "@/contexts/LanguageContext";
import { Heart, Shield, Users, AlertTriangle } from 'lucide-react';

interface MentalHealthTabProps {
  teacher: any;
  subscription?: any;
  onCreateCheckout?: () => void;
  isCreatingCheckout?: boolean;
}

const MentalHealthTab: React.FC<MentalHealthTabProps> = ({
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Mental Health Support</h2>
            <p className="text-gray-600">
              Resources and tools to support student wellbeing
            </p>
          </div>
        </div>
      </div>

      {/* Optimized Mental Health Alerts Dashboard */}
      <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-red-500/5 to-orange-500/10 hover:from-red-500/10 hover:to-orange-500/20">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <CardTitle className="text-lg text-gray-900">Mental Health Alerts</CardTitle>
              <CardDescription className="text-sm">Monitor and respond to student mental health concerns</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <OptimizedMentalHealthAlerts />
        </CardContent>
      </Card>

      {!subscription && onCreateCheckout ? (
        <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-purple-500/5 to-pink-500/10 hover:from-purple-500/10 hover:to-pink-500/20">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                <Shield className="w-4 h-4 text-purple-500" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-900">Premium Feature</CardTitle>
                <CardDescription className="text-sm">Subscription required for mental health resources</CardDescription>
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
        <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-purple-500/5 to-pink-500/10 hover:from-purple-500/10 hover:to-pink-500/20">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                <Users className="w-4 h-4 text-purple-500" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-900">Wellbeing Resources</CardTitle>
                <CardDescription className="text-sm">Articles and guidance for student mental health support</CardDescription>
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

export default MentalHealthTab;
