
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AccessibleButton } from '@/components/ui/accessible-button';
import { Calendar, MessageSquare, FileText, Heart } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

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
  const isMobile = useIsMobile();

  const actions = [
    {
      icon: Calendar,
      label: t('quickActions.checkMyClasses'),
      onClick: onViewClasses,
      color: 'text-brand-teal',
      description: t('quickActions.seeClassesComingUp')
    },
    {
      icon: MessageSquare,
      label: t('quickActions.shareHowClassWent'),
      onClick: onSubmitFeedback,
      color: 'text-brand-orange',
      description: t('quickActions.tellUsAboutClasses')
    },
    {
      icon: FileText,
      label: t('quickActions.checkInAboutMyWeek'),
      onClick: onWeeklySummary,
      color: 'text-brand-teal',
      description: t('quickActions.seeHowWeekGoing')
    },
    {
      icon: Heart,
      label: t('quickActions.howAmIFeeling'),
      onClick: onWellnessCheck,
      color: 'text-brand-orange',
      description: t('quickActions.talkAboutFeeling')
    }
  ];

  return (
    <Card 
      className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg"
      role="region"
      aria-labelledby="quick-actions-title"
    >
      <CardHeader className={cn(isMobile ? 'p-4 pb-2' : 'p-6 pb-4')}>
        <CardTitle 
          id="quick-actions-title"
          className={cn(isMobile ? 'text-lg' : 'text-xl')}
        >
          {t('quickActions.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className={cn(isMobile ? 'p-4 pt-0' : 'p-6 pt-0')}>
        <div className={cn(
          'grid gap-3',
          isMobile ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2'
        )}>
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <AccessibleButton
                key={index}
                variant="outline"
                onClick={action.onClick}
                className={cn(
                  'h-auto p-4 flex items-center gap-3 hover:bg-gray-50 border-gray-200 justify-start',
                  isMobile ? 'flex-col text-center min-h-[80px]' : 'flex-row'
                )}
                aria-label={`${action.label} - ${action.description}`}
                mobileOptimized={true}
              >
                <Icon 
                  className={cn('w-5 h-5', action.color)} 
                  aria-hidden="true"
                />
                <div className={cn(
                  isMobile ? 'text-center' : 'text-left'
                )}>
                  <span className="text-sm font-medium text-gray-700 block">
                    {action.label}
                  </span>
                  {!isMobile && (
                    <span className="text-xs text-gray-500 mt-1 block">
                      {action.description}
                    </span>
                  )}
                </div>
              </AccessibleButton>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionsCard;
