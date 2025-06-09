
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { HeartIcon, BookOpenIcon, CalendarIcon, EyeOffIcon, EditIcon, CheckIcon, XIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

interface Student {
  id: string;
  full_name: string;
  school: string;
  grade: string;
}

interface CompiledWeeklySummaryProps {
  student: Student;
}

interface WeeklyFeedbackSummary {
  emotional_overview: string;
  academic_overview: string;
  total_feedback_count: number;
  week_start_date: string;
}

const CompiledWeeklySummary = ({ student }: CompiledWeeklySummaryProps) => {
  const [compiledSummary, setCompiledSummary] = useState<WeeklyFeedbackSummary | null>(null);
  const [editedEmotional, setEditedEmotional] = useState("");
  const [editedAcademic, setEditedAcademic] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useLanguage();

  const getStartOfWeek = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek.toISOString().split('T')[0];
  };

  useEffect(() => {
    loadCompiledSummary();
  }, [student]);

  const loadCompiledSummary = async () => {
    if (!student?.id) return;

    setIsLoading(true);
    try {
      const currentWeekStart = getStartOfWeek(new Date());
      
      // Get feedback from this week
      const { data: feedback, error: feedbackError } = await supabase
        .from('feedback')
        .select(`
          emotional_state,
          what_went_well,
          suggestions,
          additional_comments,
          understanding,
          interest,
          educational_growth,
          submitted_at
        `)
        .eq('student_id', student.id)
        .gte('submitted_at', currentWeekStart + 'T00:00:00.000Z')
        .lt('submitted_at', new Date(new Date(currentWeekStart).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString());

      if (feedbackError) throw feedbackError;

      if (feedback && feedback.length > 0) {
        const summary = compileFeedbackIntoSummary(feedback);
        setCompiledSummary({
          ...summary,
          week_start_date: currentWeekStart,
          total_feedback_count: feedback.length
        });
        setEditedEmotional(summary.emotional_overview);
        setEditedAcademic(summary.academic_overview);
      } else {
        setCompiledSummary(null);
      }
    } catch (error) {
      console.error('Error loading compiled summary:', error);
      toast({
        title: t('common.error'),
        description: 'Failed to load weekly feedback summary',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const compileFeedbackIntoSummary = (feedbackData: any[]) => {
    const emotionalStates = feedbackData.map(f => f.emotional_state).filter(Boolean);
    const positiveComments = feedbackData.map(f => f.what_went_well).filter(Boolean);
    const concerns = feedbackData.map(f => f.suggestions).filter(Boolean);
    const additionalComments = feedbackData.map(f => f.additional_comments).filter(Boolean);
    
    // Calculate averages
    const avgUnderstanding = feedbackData.reduce((acc, f) => acc + f.understanding, 0) / feedbackData.length;
    const avgInterest = feedbackData.reduce((acc, f) => acc + f.interest, 0) / feedbackData.length;
    const avgGrowth = feedbackData.reduce((acc, f) => acc + f.educational_growth, 0) / feedbackData.length;

    // Compile emotional overview
    const mostCommonEmotion = emotionalStates.length > 0 
      ? emotionalStates.reduce((a, b, i, arr) => 
          arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
        ) 
      : "neutral";

    const emotionalOverview = `This week, you've generally felt ${mostCommonEmotion.toLowerCase()} during classes. ${
      positiveComments.length > 0 
        ? `You've highlighted positive aspects like: ${positiveComments.slice(0, 2).join(', ')}.` 
        : ''
    }`;

    // Compile academic overview
    const academicOverview = `Your average understanding was ${avgUnderstanding.toFixed(1)}/5, interest level ${avgInterest.toFixed(1)}/5, and educational growth ${avgGrowth.toFixed(1)}/5. ${
      concerns.length > 0 
        ? `Areas for improvement include: ${concerns.slice(0, 2).join(', ')}.` 
        : 'You seem to be keeping up well with your studies.'
    }`;

    return {
      emotional_overview: emotionalOverview,
      academic_overview: academicOverview
    };
  };

  const handleSaveEdits = async () => {
    if (!student?.id || !compiledSummary) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('weekly_summaries')
        .upsert({
          student_id: isAnonymous ? null : student.id,
          student_name: isAnonymous ? 'Anonymous' : student.full_name,
          school: student.school,
          grade: student.grade,
          emotional_concerns: editedEmotional.trim() || null,
          academic_concerns: editedAcademic.trim() || null,
          week_start_date: compiledSummary.week_start_date,
          is_anonymous: isAnonymous
        });

      if (error) throw error;

      toast({
        title: 'Weekly Summary Updated',
        description: 'Your weekly summary has been saved successfully.',
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Error saving weekly summary:', error);
      toast({
        title: t('common.error'),
        description: 'Failed to save weekly summary',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedEmotional(compiledSummary?.emotional_overview || "");
    setEditedAcademic(compiledSummary?.academic_overview || "");
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (!compiledSummary) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mx-auto flex items-center justify-center mb-4">
            <CalendarIcon className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-gray-900">Weekly Feedback Summary</CardTitle>
          <CardDescription className="text-lg">
            No feedback submitted this week yet. Complete some lesson feedback to see your weekly summary here.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mx-auto flex items-center justify-center mb-4">
          <CalendarIcon className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl text-gray-900">Weekly Feedback Summary</CardTitle>
        <CardDescription className="text-lg">
          Compiled from {compiledSummary.total_feedback_count} feedback submission(s) this week
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Your Week at a Glance</h3>
            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <EditIcon className="w-4 h-4" />
                Edit Summary
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <Label className="flex items-center gap-2 text-base font-medium">
                <HeartIcon className="w-5 h-5 text-pink-500" />
                Emotional Wellbeing
              </Label>
              {isEditing ? (
                <Textarea
                  value={editedEmotional}
                  onChange={(e) => setEditedEmotional(e.target.value)}
                  className="min-h-[80px] mt-2"
                  placeholder="How have you been feeling emotionally this week?"
                />
              ) : (
                <p className="mt-2 p-3 bg-pink-50 rounded-lg text-gray-700">
                  {compiledSummary.emotional_overview}
                </p>
              )}
            </div>

            <div>
              <Label className="flex items-center gap-2 text-base font-medium">
                <BookOpenIcon className="w-5 h-5 text-blue-500" />
                Academic Progress
              </Label>
              {isEditing ? (
                <Textarea
                  value={editedAcademic}
                  onChange={(e) => setEditedAcademic(e.target.value)}
                  className="min-h-[80px] mt-2"
                  placeholder="How has your academic progress been this week?"
                />
              ) : (
                <p className="mt-2 p-3 bg-blue-50 rounded-lg text-gray-700">
                  {compiledSummary.academic_overview}
                </p>
              )}
            </div>

            {isEditing && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
                  <Checkbox
                    id="anonymous"
                    checked={isAnonymous}
                    onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
                  />
                  <Label htmlFor="anonymous" className="flex items-center gap-2 text-sm">
                    <EyeOffIcon className="w-4 h-4 text-gray-500" />
                    Submit anonymously
                  </Label>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleSaveEdits}
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                  >
                    <CheckIcon className="w-4 h-4" />
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    onClick={handleCancelEdit}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <XIcon className="w-4 h-4" />
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompiledWeeklySummary;
