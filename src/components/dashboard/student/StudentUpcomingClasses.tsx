
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, BookOpen, User, MessageSquare, GraduationCap, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

interface ClassSchedule {
  id: string;
  subject: string;
  lesson_topic: string;
  class_date: string;
  class_time: string;
  duration_minutes: number;
  teacher_id: string;
  school: string;
  grade: string;
  teacher_name?: string;
  has_feedback?: boolean;
  is_past?: boolean;
}

interface StudentUpcomingClassesProps {
  student: {
    id: string;
    full_name: string;
    school: string;
    grade: string;
  };
}

const StudentUpcomingClasses: React.FC<StudentUpcomingClassesProps> = ({ student }) => {
  const [upcomingClasses, setUpcomingClasses] = useState<ClassSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    fetchUpcomingClasses();
  }, [student.school, student.grade]);

  const fetchUpcomingClasses = async () => {
    try {
      setIsLoading(true);
      
      const today = new Date();
      
      // Fetch classes for the student's school and grade
      const { data: classData, error } = await supabase
        .from('class_schedules')
        .select('*')
        .eq('school', student.school)
        .eq('grade', student.grade)
        .order('class_date', { ascending: true })
        .order('class_time', { ascending: true });

      if (error) throw error;

      // Get existing feedback for this student
      const { data: feedbackData } = await supabase
        .from('feedback')
        .select('class_schedule_id')
        .eq('student_id', student.id);

      const feedbackClassIds = new Set(feedbackData?.map(f => f.class_schedule_id) || []);

      const classesWithTeachers = await Promise.all(
        (classData || []).map(async (classItem) => {
          const { data: teacherData } = await supabase
            .from('teachers')
            .select('name')
            .eq('id', classItem.teacher_id)
            .single();

          const classDateTime = new Date(`${classItem.class_date}T${classItem.class_time}`);
          const isPast = classDateTime < today;
          const hasFeedback = feedbackClassIds.has(classItem.id);

          return {
            ...classItem,
            teacher_name: teacherData?.name || t('student.defaultName'),
            has_feedback: hasFeedback,
            is_past: isPast
          };
        })
      );

      // Updated filtering logic: Show upcoming classes OR past classes WITHOUT feedback
      // Exclude past classes that already have feedback
      const filteredClasses = classesWithTeachers.filter(classItem => {
        // Always show upcoming classes (not past)
        if (!classItem.is_past) {
          return true;
        }
        // For past classes, only show if NO feedback has been submitted
        return !classItem.has_feedback;
      });

      setUpcomingClasses(filteredClasses);
    } catch (error) {
      console.error('Error fetching upcoming classes:', error);
      toast({
        title: t('common.error'),
        description: t('student.failedToLoadClasses'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveFeedback = (classScheduleId: string) => {
    navigate(`/student-dashboard?tab=feedback&classId=${classScheduleId}`);
  };

  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-brand-teal/20">
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal"></div>
          <span className="ml-3 text-brand-dark">{t('common.loading')}</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-brand-teal/20 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-brand-teal to-brand-orange/20 rounded-t-lg">
        <CardTitle className="flex items-center gap-3 text-white">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          {t('dashboard.upcomingClasses')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {upcomingClasses.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-brand-teal/10 rounded-full mx-auto mb-4 flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-brand-teal" />
            </div>
            <p className="text-brand-dark font-medium mb-2">{t('dashboard.noClasses')}</p>
            <p className="text-brand-dark/60 text-sm">
              {t('dashboard.scheduledClasses', { 
                grade: student.grade, 
                school: student.school 
              })}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingClasses.map((classItem, index) => (
              <div 
                key={classItem.id} 
                className="group border border-brand-teal/20 rounded-lg p-5 hover:bg-brand-teal/5 hover:border-brand-teal/40 transition-all duration-200 hover:shadow-md"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-brand-orange/20 rounded-full flex items-center justify-center">
                        <GraduationCap className="w-4 h-4 text-brand-orange" />
                      </div>
                      <h3 className="font-semibold text-brand-dark text-lg">{classItem.subject}</h3>
                      <Badge variant="outline" className="border-brand-teal text-brand-teal">
                        {classItem.grade}
                      </Badge>
                      {classItem.is_past && !classItem.has_feedback && (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
                          {t('feedback.pending')}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-brand-dark/80 mb-3 font-medium">{classItem.lesson_topic}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                      <div className="flex items-center gap-2 text-brand-dark/70">
                        <Calendar className="w-4 h-4 text-brand-teal" />
                        <span className="text-sm font-medium">
                          {new Date(classItem.class_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-brand-dark/70">
                        <Clock className="w-4 h-4 text-brand-orange" />
                        <span className="text-sm font-medium">{classItem.class_time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-brand-dark/70">
                        <User className="w-4 h-4 text-brand-teal" />
                        <span className="text-sm font-medium">{classItem.teacher_name}</span>
                      </div>
                    </div>
                    
                    <Badge variant="secondary" className="bg-brand-teal/10 text-brand-teal border-brand-teal/20">
                      {classItem.duration_minutes} {classItem.duration_minutes === 1 ? t('common.minute') : t('common.minutes')}
                    </Badge>
                  </div>
                  
                  <div className="ml-6">
                    <Button
                      size="sm"
                      onClick={() => handleLeaveFeedback(classItem.id)}
                      className="bg-gradient-to-r from-brand-orange to-brand-orange/80 hover:from-brand-orange/90 hover:to-brand-orange/70 text-white shadow-lg hover:shadow-xl transition-all duration-200 group-hover:scale-105"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      {t('feedback.submitFeedback')}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentUpcomingClasses;
