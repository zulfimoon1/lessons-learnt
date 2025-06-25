
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCapIcon, CalendarIcon, HeartIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface WelcomeSectionProps {
  studentName: string;
  school: string;
  grade: string;
  upcomingClassesCount: number;
}

const WelcomeSection: React.FC<WelcomeSectionProps> = ({
  studentName,
  school,
  grade,
  upcomingClassesCount
}) => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();

  const stats = [
    {
      icon: GraduationCapIcon,
      label: t('auth.school') || 'School',
      value: school,
      color: 'text-brand-teal'
    },
    {
      icon: GraduationCapIcon,
      label: t('auth.grade') || 'Grade',
      value: grade,
      color: 'text-brand-orange'
    },
    {
      icon: CalendarIcon,
      label: t('class.upcomingClasses') || 'Upcoming Classes',
      value: upcomingClassesCount.toString(),
      color: 'text-brand-teal'
    }
  ];

  return (
    <Card 
      className="bg-gradient-to-r from-brand-teal/10 to-brand-orange/10 border-brand-teal/20"
      role="banner"
      aria-labelledby="welcome-title"
    >
      <CardHeader className={cn(isMobile ? 'p-4 pb-2' : 'p-6 pb-4')}>
        <CardTitle 
          id="welcome-title"
          className={cn(
            'flex items-center gap-3',
            isMobile ? 'text-lg flex-col text-center sm:flex-row sm:text-left' : 'text-xl'
          )}
        >
          <GraduationCapIcon 
            className="w-6 h-6 text-brand-teal" 
            aria-hidden="true"
          />
          <span>
            {t('dashboard.welcome') || 'Welcome'}, {studentName}!
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className={cn(isMobile ? 'p-4 pt-0' : 'p-6 pt-0')}>
        <div className={cn(
          'grid gap-4',
          isMobile ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-3'
        )}>
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg bg-white/60',
                  isMobile && 'justify-center sm:justify-start'
                )}
                role="group"
                aria-label={`${stat.label}: ${stat.value}`}
              >
                <Icon 
                  className={cn('w-5 h-5', stat.color)} 
                  aria-hidden="true"
                />
                <div className={cn(isMobile ? 'text-center sm:text-left' : 'text-left')}>
                  <p className="text-sm text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="font-medium">
                    {stat.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className={cn(
          'mt-4 p-3 bg-white/50 rounded-lg',
          isMobile && 'text-center'
        )}>
          <div className="flex items-center gap-2 justify-center">
            <HeartIcon 
              className="w-4 h-4 text-brand-orange" 
              aria-hidden="true"
            />
            <p className={cn('text-sm', isMobile ? 'text-center' : 'text-left')}>
              {t('dashboard.studentWelcomeMessage') || 'Ready to share your feedback and help improve your learning experience!'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WelcomeSection;
