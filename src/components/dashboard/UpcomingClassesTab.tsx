
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Clock, BookOpen, Calendar } from "lucide-react";

interface ClassSchedule {
  id: string;
  subject: string;
  grade: string;
  lesson_topic: string;
  class_date: string;
  class_time: string;
  duration_minutes: number;
  teacher_id: string;
  school: string;
}

interface UpcomingClassesTabProps {
  classes: ClassSchedule[];
  studentGrade?: string;
  studentSchool?: string;
}

const UpcomingClassesTab: React.FC<UpcomingClassesTabProps> = React.memo(({ 
  classes, 
  studentGrade, 
  studentSchool 
}) => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();

  return (
    <Card role="region" aria-labelledby="upcoming-classes-title">
      <CardHeader className={cn(isMobile ? 'p-4 pb-2' : 'p-6 pb-4')}>
        <CardTitle 
          id="upcoming-classes-title"
          className={cn(isMobile ? 'text-lg' : 'text-xl')}
        >
          {t('class.upcomingClasses')}
        </CardTitle>
        <CardDescription className={cn(isMobile ? 'text-sm' : 'text-base')}>
          {t('dashboard.scheduledClasses')} {studentGrade} {t('auth.school').toLowerCase()} {studentSchool}
        </CardDescription>
      </CardHeader>
      <CardContent className={cn(isMobile ? 'p-4 pt-0' : 'p-6 pt-0')}>
        <div className="space-y-4">
          {classes.map((classItem) => (
            <div 
              key={classItem.id} 
              className={cn(
                'p-4 border rounded-lg transition-colors hover:bg-gray-50',
                isMobile ? 'space-y-3' : 'flex items-center justify-between'
              )}
              role="article"
              aria-labelledby={`class-${classItem.id}-title`}
            >
              <div className={cn(isMobile ? 'space-y-2' : 'flex-1')}>
                <div className="flex items-start gap-2">
                  <BookOpen 
                    className="w-4 h-4 text-brand-teal mt-0.5 flex-shrink-0" 
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 
                      id={`class-${classItem.id}-title`}
                      className={cn(
                        'font-medium text-foreground',
                        isMobile ? 'text-sm' : 'text-base'
                      )}
                    >
                      {classItem.subject}
                    </h3>
                    <p className={cn(
                      'text-muted-foreground mt-1',
                      isMobile ? 'text-xs' : 'text-sm'
                    )}>
                      {classItem.lesson_topic}
                    </p>
                  </div>
                </div>
                
                <div className={cn(
                  'flex gap-2',
                  isMobile ? 'flex-wrap' : 'mt-2'
                )}>
                  <Badge 
                    variant="outline" 
                    className={cn(isMobile ? 'text-xs' : 'text-sm')}
                    aria-label={`Grade ${classItem.grade}`}
                  >
                    {classItem.grade}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      'flex items-center gap-1',
                      isMobile ? 'text-xs' : 'text-sm'
                    )}
                    aria-label={`Duration ${classItem.duration_minutes} minutes`}
                  >
                    <Clock className="w-3 h-3" aria-hidden="true" />
                    {classItem.duration_minutes} {t('class.duration')}
                  </Badge>
                </div>
              </div>
              
              <div className={cn(
                'flex items-center gap-2',
                isMobile ? 'justify-between border-t pt-2 mt-2' : 'text-right ml-4'
              )}>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="w-4 h-4" aria-hidden="true" />
                  <span className={cn(isMobile ? 'text-xs' : 'text-sm')}>
                    {new Date(classItem.class_date).toLocaleDateString()}
                  </span>
                </div>
                <div className={cn(
                  'font-medium',
                  isMobile ? 'text-sm' : 'text-base'
                )}>
                  {classItem.class_time}
                </div>
              </div>
            </div>
          ))}
          {classes.length === 0 && (
            <div 
              className="text-center py-8"
              role="status"
              aria-live="polite"
            >
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" aria-hidden="true" />
              <p className="text-muted-foreground">
                {t('dashboard.noClasses')}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

UpcomingClassesTab.displayName = "UpcomingClassesTab";

export default UpcomingClassesTab;
