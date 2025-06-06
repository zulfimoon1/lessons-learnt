import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, ClockIcon, LogOutIcon, BookOpenIcon, MessageSquareIcon, TrendingUpIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import LessonFeedbackForm from "@/components/LessonFeedbackForm";
import WeeklySummary from "@/components/WeeklySummary";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import PsychologistInfo from "@/components/PsychologistInfo";

interface ClassSchedule {
  id: string;
  subject: string;
  lesson_topic: string;
  class_date: string;
  class_time: string;
  duration_minutes: number;
  description?: string;
  teacher_id: string;
}

const StudentDashboard = () => {
  const { student, logout } = useAuth();
  const { t } = useLanguage();
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassSchedule | null>(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showWeeklySummary, setShowWeeklySummary] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (student) {
      fetchSchedules();
    }
  }, [student]);

  const fetchSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from('class_schedules')
        .select('*')
        .eq('school', student?.school)
        .eq('grade', student?.grade)
        .order('class_date', { ascending: true });

      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      toast({
        title: "Error loading schedules",
        description: "Failed to load your class schedules",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedbackSubmit = async (feedbackData: any) => {
    try {
      const submissionData = {
        class_schedule_id: selectedClass?.id,
        student_id: feedbackData.isAnonymous ? null : student?.id,
        student_name: feedbackData.isAnonymous ? null : student?.full_name,
        is_anonymous: feedbackData.isAnonymous || false,
        understanding: feedbackData.understanding,
        interest: feedbackData.interest,
        educational_growth: feedbackData.educationalGrowth,
        emotional_state: feedbackData.emotionalState,
        what_went_well: feedbackData.whatWorkedWell,
        suggestions: feedbackData.howToImprove,
        additional_comments: feedbackData.additionalComments
      };

      const { error } = await supabase
        .from('feedback')
        .insert(submissionData);

      if (error) throw error;

      toast({
        title: "Feedback submitted! 🎉",
        description: feedbackData.isAnonymous 
          ? "Your anonymous feedback has been sent to your teacher."
          : "Your feedback has been sent to your teacher.",
      });

      setShowFeedbackForm(false);
      setSelectedClass(null);
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (showWeeklySummary) {
    return <WeeklySummary onClose={() => setShowWeeklySummary(false)} />;
  }

  if (showFeedbackForm && selectedClass) {
    return (
      <LessonFeedbackForm
        onSubmit={(data) => handleFeedbackSubmit({ ...data, isAnonymous: false })}
        onCancel={() => {
          setShowFeedbackForm(false);
          setSelectedClass(null);
        }}
        studentInfo={{
          name: student?.full_name || "",
          email: `${student?.full_name}@${student?.school}` || ""
        }}
        isAnonymous={false}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-blue-100">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <BookOpenIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.myClasses')}</h1>
                <p className="text-gray-600">
                  {t('dashboard.welcome')}, {student?.full_name} - {student?.school}, {student?.grade}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <Button 
                onClick={() => setShowWeeklySummary(true)}
                variant="outline"
                className="border-purple-200 text-purple-600 hover:bg-purple-50"
              >
                <TrendingUpIcon className="w-4 h-4 mr-2" />
                {t('weekly.title')}
              </Button>
              <Button 
                onClick={logout}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <LogOutIcon className="w-4 h-4 mr-2" />
                {t('dashboard.logout')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">{t('loading')}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Psychologist Information */}
            {student && (
              <PsychologistInfo school={student.school} />
            )}

            {schedules.length === 0 ? (
              <Card className="bg-white/70 backdrop-blur-sm border-gray-200">
                <CardContent className="text-center py-12">
                  <BookOpenIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('dashboard.noClasses')}</h3>
                  <p className="text-gray-600">
                    {t('dashboard.noClassesDescription')}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                <h2 className="text-xl font-semibold text-gray-900">{t('dashboard.upcomingClasses')}</h2>
                
                {schedules.map((schedule) => (
                  <Card key={schedule.id} className="bg-white/70 backdrop-blur-sm border-gray-200 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg text-gray-900">{schedule.subject}</CardTitle>
                          <CardDescription className="text-base font-medium text-gray-700">
                            {schedule.lesson_topic}
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {schedule.duration_minutes} min
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4" />
                          {formatDate(schedule.class_date)}
                        </div>
                        <div className="flex items-center gap-2">
                          <ClockIcon className="w-4 h-4" />
                          {formatTime(schedule.class_time)}
                        </div>
                      </div>
                      
                      {schedule.description && (
                        <p className="text-gray-600 text-sm">{schedule.description}</p>
                      )}

                      <div className="flex gap-2 pt-4">
                        <Button
                          onClick={() => {
                            setSelectedClass(schedule);
                            setShowFeedbackForm(true);
                          }}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        >
                          <MessageSquareIcon className="w-4 h-4 mr-2" />
                          {t('dashboard.giveFeedback')}
                        </Button>
                        
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedClass(schedule);
                            setShowFeedbackForm(true);
                          }}
                          className="border-orange-200 text-orange-600 hover:bg-orange-50"
                        >
                          {t('dashboard.giveAnonymousFeedback')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
