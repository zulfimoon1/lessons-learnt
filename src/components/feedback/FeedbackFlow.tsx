import React, { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { classScheduleService } from "@/services/classScheduleService";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ClassSelector from './ClassSelector';
import AttendanceTracker from './AttendanceTracker';
import SimpleFeedbackForm from './SimpleFeedbackForm';

type FlowStep = 'select' | 'attendance' | 'feedback' | 'complete';

interface ClassItem {
  id: string;
  lesson_topic: string;
  subject: string;
  class_date: string;
  class_time: string;
  duration_minutes: number;
  description?: string;
  grade: string;
  school: string;
}

const FeedbackFlow: React.FC = () => {
  const [step, setStep] = useState<FlowStep>('select');
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { student } = useAuth();
  const { toast } = useToast();

  // Helper function to normalize grades for comparison
  const normalizeGrade = (grade: string): string => {
    if (!grade) return '';
    return grade.toLowerCase().replace(/^(grade\s*|class\s*)/i, '').trim();
  };

  // Helper function to check if grades match
  const gradesMatch = (grade1: string, grade2: string): boolean => {
    const normalized1 = normalizeGrade(grade1);
    const normalized2 = normalizeGrade(grade2);
    return normalized1 === normalized2;
  };

  useEffect(() => {
    const loadClasses = async () => {
      if (!student) return;

      try {
        setIsLoading(true);
        
        const response = await classScheduleService.getSchedulesBySchool(student.school);
        
        if (response.data) {
          const today = new Date();
          
          // Get classes from the last 14 days (reasonable window for feedback)
          const relevantClasses = response.data.filter((classItem: any) => {
            const classDate = new Date(classItem.class_date);
            const daysDiff = Math.abs(today.getTime() - classDate.getTime()) / (1000 * 3600 * 24);
            const isRelevantGrade = gradesMatch(classItem.grade, student.grade);
            const isPast = classDate <= today; // Only past classes
            
            return daysDiff <= 14 && isRelevantGrade && isPast;
          });

          // Get existing feedback for this student
          const { data: feedbackData } = await supabase
            .from('feedback')
            .select('class_schedule_id')
            .eq('student_id', student.id);

          const feedbackClassIds = new Set(feedbackData?.map(f => f.class_schedule_id) || []);

          // Filter out classes that already have feedback
          const classesNeedingFeedback = relevantClasses.filter(
            (classItem: any) => !feedbackClassIds.has(classItem.id)
          );

          setClasses(classesNeedingFeedback);
        }
      } catch (error) {
        console.error('Error loading classes:', error);
        toast({
          title: "Couldn't load classes",
          description: "Please try again in a moment.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadClasses();
  }, [student]);

  const handleClassSelected = (classItem: ClassItem) => {
    setSelectedClass(classItem);
    setStep('attendance');
  };

  const handleAttendanceConfirmed = async (attended: boolean, reason?: string) => {
    if (!attended) {
      // Student didn't attend - no feedback needed about class content
      toast({
        title: "Thanks for letting us know!",
        description: "We've noted that you missed this class.",
      });
      setStep('complete');
    } else {
      setStep('feedback');
    }
  };

  const handleFeedbackSuccess = () => {
    setStep('complete');
  };

  const handleBack = () => {
    if (step === 'attendance') {
      setStep('select');
      setSelectedClass(null);
    } else if (step === 'feedback') {
      setStep('attendance');
    }
  };

  const handleStartOver = () => {
    setStep('select');
    setSelectedClass(null);
    // Reload classes to remove the one we just provided feedback for
    if (student) {
      const loadClasses = async () => {
        const response = await classScheduleService.getSchedulesBySchool(student.school);
        if (response.data) {
          const today = new Date();
          const relevantClasses = response.data.filter((classItem: any) => {
            const classDate = new Date(classItem.class_date);
            const daysDiff = Math.abs(today.getTime() - classDate.getTime()) / (1000 * 3600 * 24);
            const isRelevantGrade = gradesMatch(classItem.grade, student.grade);
            const isPast = classDate <= today;
            return daysDiff <= 14 && isRelevantGrade && isPast;
          });

          const { data: feedbackData } = await supabase
            .from('feedback')
            .select('class_schedule_id')
            .eq('student_id', student.id);

          const feedbackClassIds = new Set(feedbackData?.map(f => f.class_schedule_id) || []);
          const classesNeedingFeedback = relevantClasses.filter(
            (classItem: any) => !feedbackClassIds.has(classItem.id)
          );

          setClasses(classesNeedingFeedback);
        }
      };
      loadClasses();
    }
  };

  if (step === 'select') {
    return (
      <ClassSelector
        classes={classes}
        onClassSelected={handleClassSelected}
        isLoading={isLoading}
      />
    );
  }

  if (step === 'attendance' && selectedClass) {
    return (
      <AttendanceTracker
        classInfo={selectedClass}
        onAttendanceConfirmed={handleAttendanceConfirmed}
        onBack={handleBack}
      />
    );
  }

  if (step === 'feedback' && selectedClass) {
    return (
      <SimpleFeedbackForm
        classInfo={selectedClass}
        onSuccess={handleFeedbackSuccess}
        onBack={handleBack}
      />
    );
  }

  if (step === 'complete') {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Thanks for sharing!
          </h2>
          <p className="text-gray-600 mb-8">
            Your thoughts help make school better for everyone.
          </p>
          {classes.length > 1 && (
            <button
              onClick={handleStartOver}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Share thoughts about another class
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default FeedbackFlow;