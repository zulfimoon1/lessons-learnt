
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('class.upcomingClasses')}</CardTitle>
        <CardDescription>
          {t('dashboard.scheduledClasses')} {studentGrade} {t('auth.school').toLowerCase()} {studentSchool}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {classes.map((classItem) => (
            <div key={classItem.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">{classItem.subject}</h3>
                <p className="text-sm text-muted-foreground">{classItem.lesson_topic}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline">{classItem.grade}</Badge>
                  <Badge variant="outline">{classItem.duration_minutes} {t('class.duration')}</Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">{new Date(classItem.class_date).toLocaleDateString()}</p>
                <p className="text-sm text-muted-foreground">{classItem.class_time}</p>
              </div>
            </div>
          ))}
          {classes.length === 0 && (
            <p className="text-center text-muted-foreground py-8">{t('dashboard.noClasses')}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

UpcomingClassesTab.displayName = "UpcomingClassesTab";

export default UpcomingClassesTab;
