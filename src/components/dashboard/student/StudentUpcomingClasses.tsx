
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, BookOpen, User, MessageSquare, GraduationCap, CheckCircle, AlertCircle } from "lucide-react";
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
  onClassCountChange?: (count: number) => void;
}

const StudentUpcomingClasses: React.FC<StudentUpcomingClassesProps> = ({ student, onClassCountChange }) => {
  const [classes, setClasses] = useState<ClassSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Helper function to normalize grades for comparison
  const normalizeGrade = (grade: string): string => {
    if (!grade) return '';
    // Remove common prefixes and convert to lowercase for comparison
    return grade.toLowerCase().replace(/^(grade\s*|class\s*)/i, '').trim();
  };

  // Helper function to check if grades match
  const gradesMatch = (grade1: string, grade2: string): boolean => {
    const normalized1 = normalizeGrade(grade1);
    const normalized2 = normalizeGrade(grade2);
    return normalized1 === normalized2;
  };

  useEffect(() => {
    fetchClasses();
  }, [student.school, student.grade]);

  useEffect(() => {
    // Notify parent component of class count change
    onClassCountChange?.(classes.length);
  }, [classes.length, onClassCountChange]);

  const fetchClasses = async () => {
    try {
      setIsLoading(true);
      
      console.log('🔍 StudentUpcomingClasses: Loading classes for student:', { 
        name: student.full_name,
        school: student.school, 
        grade: student.grade,
        studentId: student.id 
      });
      
      // Fetch ALL classes for the student's school and grade in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: classData, error } = await supabase
        .from('class_schedules')
        .select('*')
        .eq('school', student.school)
        .gte('class_date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('class_date', { ascending: false })
        .order('class_time', { ascending: false });

      if (error) {
        console.error('❌ Error fetching classes:', error);
        throw error;
      }

      console.log('📋 Raw class schedules found:', classData?.length || 0);
      console.log('📋 Class data:', classData);

      if (!classData || classData.length === 0) {
        setDebugInfo(`No classes found for school "${student.school}" in the last 30 days.`);
        setClasses([]);
        return;
      }

      // Filter classes by grade with flexible matching
      const gradeMatchedClasses = classData.filter(classItem => {
        const isMatch = gradesMatch(classItem.grade, student.grade);
        console.log('🎯 Grade matching:', {
          classGrade: classItem.grade,
          studentGrade: student.grade,
          normalizedClassGrade: normalizeGrade(classItem.grade),
          normalizedStudentGrade: normalizeGrade(student.grade),
          match: isMatch
        });
        return isMatch;
      });

      console.log('📊 Grade-matched classes:', gradeMatchedClasses.length);

      if (gradeMatchedClasses.length === 0) {
        setDebugInfo(`No classes found for grade "${student.grade}" at "${student.school}" in the last 30 days. Available grades: ${[...new Set(classData.map(c => c.grade))].join(', ')}`);
        setClasses([]);
        return;
      }

      // Get existing feedback for this student
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedback')
        .select('class_schedule_id')
        .eq('student_id', student.id);

      if (feedbackError) {
        console.error('❌ Error fetching feedback:', feedbackError);
      }

      console.log('✅ Existing feedback for student:', feedbackData?.length || 0);

      const feedbackClassIds = new Set(feedbackData?.map(f => f.class_schedule_id) || []);

      // Get teacher names and process classes
      const classesWithDetails = await Promise.all(
        gradeMatchedClasses.map(async (classItem) => {
          const { data: teacherData } = await supabase
            .from('teachers')
            .select('name')
            .eq('id', classItem.teacher_id)
            .single();

          const classDateTime = new Date(`${classItem.class_date}T${classItem.class_time}`);
          const now = new Date();
          const isPast = classDateTime < now;
          const hasFeedback = feedbackClassIds.has(classItem.id);

          console.log('🎯 Processing class:', {
            id: classItem.id,
            subject: classItem.subject,
            lesson_topic: classItem.lesson_topic,
            date: classItem.class_date,
            time: classItem.class_time,
            isPast,
            hasFeedback,
            shouldShow: !isPast || !hasFeedback // Show if upcoming OR past without feedback
          });

          return {
            ...classItem,
            teacher_name: teacherData?.name || 'Unknown Teacher',
            has_feedback: hasFeedback,
            is_past: isPast
          };
        })
      );

      // Show both upcoming classes AND past classes that don't have feedback
      const relevantClasses = classesWithDetails.filter(classItem => {
        // Show upcoming classes OR past classes without feedback
        const shouldShow = !classItem.is_past || !classItem.has_feedback;
        return shouldShow;
      });

      console.log('📊 Final classes to show:', relevantClasses.length);
      console.log('📊 Classes details:', relevantClasses.map(c => ({
        subject: c.subject,
        topic: c.lesson_topic,
        date: c.class_date,
        isPast: c.is_past,
        hasFeedback: c.has_feedback
      })));

      setClasses(relevantClasses);
      
      const debugMessage = `
        Student: ${student.full_name}
        School: ${student.school}
        Grade: ${student.grade} (normalized: ${normalizeGrade(student.grade)})
        Total classes found: ${classData.length}
        Grade-matched classes: ${gradeMatchedClasses.length}
        Classes with feedback: ${feedbackClassIds.size}
        Classes needing attention: ${relevantClasses.length}
        
        Available grades in database: ${[...new Set(classData.map(c => c.grade))].join(', ')}
      `;
      setDebugInfo(debugMessage);
      
    } catch (error) {
      console.error('💥 Error loading classes:', error);
      setDebugInfo(`Error loading classes: ${error.message}`);
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
          {t('classes.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Debug Information */}
        {debugInfo && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">{t('classes.debugInfo')}</span>
            </div>
            <div className="text-xs text-blue-700 whitespace-pre-line">{debugInfo}</div>
          </div>
        )}

        {classes.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-brand-teal/10 rounded-full mx-auto mb-4 flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-brand-teal" />
            </div>
            <p className="text-brand-dark font-medium mb-2">{t('classes.noClassesFound')}</p>
            <p className="text-brand-dark/60 text-sm">
              {t('classes.classesWillAppear', { grade: student.grade, school: student.school })}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {classes.map((classItem, index) => (
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
                          {t('classes.feedbackNeeded')}
                        </Badge>
                      )}
                      {classItem.has_feedback && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {t('classes.feedbackSubmitted')}
                        </Badge>
                      )}
                      {!classItem.is_past && (
                        <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200">
                          {t('classes.upcoming')}
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
                    {!classItem.has_feedback && (
                      <Button
                        size="sm"
                        onClick={() => handleLeaveFeedback(classItem.id)}
                        className="bg-gradient-to-r from-brand-orange to-brand-orange/80 hover:from-brand-orange/90 hover:to-brand-orange/70 text-white shadow-lg hover:shadow-xl transition-all duration-200 group-hover:scale-105"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        {classItem.is_past ? t('classes.leaveFeedback') : t('classes.submitFeedback')}
                      </Button>
                    )}
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
