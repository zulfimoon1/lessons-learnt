
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, ClockIcon, UserIcon, BookOpenIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";

interface ClassItem {
  id: string;
  grade: string;
  subject: string;
  lesson_topic: string;
  class_date: string;
  class_time: string;
  duration_minutes: number;
  description?: string;
  teacher_name?: string;
}

interface UpcomingClassesTabProps {
  classes: ClassItem[];
  studentGrade?: string;
  studentSchool?: string;
}

const UpcomingClassesTab: React.FC<UpcomingClassesTabProps> = ({ 
  classes, 
  studentGrade, 
  studentSchool 
}) => {
  const { t } = useLanguage();

  if (classes.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-brand-teal/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-brand-dark">
            <CalendarIcon className="w-5 h-5 text-brand-teal" />
            {t('class.upcomingClasses')}
          </CardTitle>
          <CardDescription>
            Scheduled classes for grade {studentGrade} at {studentSchool}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="w-16 h-16 bg-brand-teal/10 rounded-full flex items-center justify-center mb-4">
            <CalendarIcon className="w-8 h-8 text-brand-teal" />
          </div>
          <p className="text-brand-dark font-medium mb-2">{t('dashboard.noClasses')}</p>
          <p className="text-brand-dark/60 text-sm text-center">
            Check back later for new class schedules
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-brand-teal/20 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-brand-dark">
          <CalendarIcon className="w-5 h-5 text-brand-teal" />
          {t('class.upcomingClasses')}
        </CardTitle>
        <CardDescription>
          Scheduled classes for grade {studentGrade} at {studentSchool}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classes.map((classItem) => (
            <Card key={classItem.id} className="border border-gray-200 hover:border-brand-teal/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-semibold text-brand-dark">
                      {classItem.subject}
                    </CardTitle>
                    <p className="text-sm text-brand-dark/80 font-medium">
                      {classItem.lesson_topic}
                    </p>
                  </div>
                  <Badge variant="outline" className="border-brand-teal/30 text-brand-teal">
                    Grade {classItem.grade}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-brand-dark/70">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{new Date(classItem.class_date).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-brand-dark/70">
                    <ClockIcon className="w-4 h-4" />
                    <span>{classItem.class_time} ({classItem.duration_minutes} minutes)</span>
                  </div>
                  
                  {classItem.teacher_name && (
                    <div className="flex items-center gap-2 text-sm text-brand-dark/70">
                      <UserIcon className="w-4 h-4" />
                      <span>{classItem.teacher_name}</span>
                    </div>
                  )}
                  
                  {classItem.description && (
                    <div className="flex items-start gap-2 text-sm text-brand-dark/70 mt-3 pt-3 border-t border-gray-100">
                      <BookOpenIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <p className="line-clamp-2">{classItem.description}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingClassesTab;
