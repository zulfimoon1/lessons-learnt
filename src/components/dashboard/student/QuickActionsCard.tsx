
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MessageSquare, FileText, Heart } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface QuickActionsCardProps {
  onViewClasses: () => void;
  onSubmitFeedback: () => void;
  onWeeklySummary: () => void;
  onWellnessCheck: () => void;
}

const QuickActionsCard: React.FC<QuickActionsCardProps> = ({
  onViewClasses,
  onSubmitFeedback,
  onWeeklySummary,
  onWellnessCheck
}) => {
  const { t } = useLanguage();

  const actions = [
    {
      icon: Calendar,
      label: t('dashboard.viewClasses') || 'View Classes',
      onClick: onViewClasses,
      color: 'text-brand-teal'
    },
    {
      icon: MessageSquare,
      label: t('dashboard.submitFeedback') || 'Submit Feedback',
      onClick: onSubmitFeedback,
      color: 'text-brand-orange'
    },
    {
      icon: FileText,
      label: t('dashboard.weeklySummary') || 'Weekly Summary',
      onClick: onWeeklySummary,
      color: 'text-brand-teal'
    },
    {
      icon: Heart,
      label: t('dashboard.wellnessCheck') || 'Wellness Check',
      onClick: onWellnessCheck,
      color: 'text-brand-orange'
    }
  ];

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg">
          {t('dashboard.quickActions') || 'Quick Actions'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant="outline"
                onClick={action.onClick}
                className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-gray-50 border-gray-200"
              >
                <Icon className={`w-5 h-5 ${action.color}`} />
                <span className="text-sm font-medium text-gray-700">
                  {action.label}
                </span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionsCard;
