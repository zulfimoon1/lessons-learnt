
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { MessageSquareIcon, BookOpenIcon, EyeOffIcon } from "lucide-react";
import StarRating from "./StarRating";
import EmotionalStateSelector from "./EmotionalStateSelector";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStorage } from "@/hooks/useAuthStorage";
import { useLanguage } from "@/contexts/LanguageContext";

const LessonFeedbackForm = () => {
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDescription, setLessonDescription] = useState("");
  const [understanding, setUnderstanding] = useState(0);
  const [interest, setInterest] = useState(0);
  const [growth, setGrowth] = useState(0);
  const [emotionalState, setEmotionalState] = useState("");
  const [whatWentWell, setWhatWentWell] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [additionalComments, setAdditionalComments] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { student } = useAuthStorage();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!lessonTitle.trim()) {
      toast({
        title: t('common.error'),
        description: "Please enter a lesson title",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // First create a class schedule entry (simplified for feedback submission)
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('class_schedules')
        .insert({
          teacher_id: '00000000-0000-0000-0000-000000000000', // Placeholder for feedback-only submissions
          subject: 'Student Feedback',
          lesson_topic: lessonTitle.trim(),
          description: lessonDescription.trim() || null,
          grade: student?.grade || 'Unknown',
          school: student?.school || 'Unknown',
          class_date: new Date().toISOString().split('T')[0],
          class_time: '00:00:00'
        })
        .select()
        .single();

      if (scheduleError) throw scheduleError;

      // Now create the feedback entry
      const { error } = await supabase
        .from('feedback')
        .insert({
          student_id: isAnonymous ? null : student?.id,
          student_name: isAnonymous ? t('demo.mockup.anonymousStudent') : student?.full_name || '',
          class_schedule_id: scheduleData.id,
          understanding: understanding,
          interest: interest,
          educational_growth: growth,
          emotional_state: emotionalState || 'neutral',
          what_went_well: whatWentWell.trim() || null,
          suggestions: suggestions.trim() || null,
          additional_comments: additionalComments.trim() || null,
          is_anonymous: isAnonymous
        });

      if (error) throw error;

      toast({
        title: t('feedback.submitted'),
        description: t('feedback.submittedDescription'),
      });

      // Reset form
      setLessonTitle("");
      setLessonDescription("");
      setUnderstanding(0);
      setInterest(0);
      setGrowth(0);
      setEmotionalState("");
      setWhatWentWell("");
      setSuggestions("");
      setAdditionalComments("");
      setIsAnonymous(false);
    } catch (error) {
      console.error('Feedback submission error:', error);
      toast({
        title: t('common.error'),
        description: t('feedback.submitError'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto flex items-center justify-center mb-4">
          <MessageSquareIcon className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl text-gray-900">{t('feedback.title')}</CardTitle>
        <CardDescription className="text-lg">
          {t('feedback.description')}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="lessonTitle" className="flex items-center gap-2 text-base font-medium">
                <BookOpenIcon className="w-5 h-5 text-blue-500" />
                {t('feedback.lessonTitle')}
              </Label>
              <Badge variant="outline" className="mb-2 bg-red-50 text-red-700 border-red-200">
                Required
              </Badge>
              <Input
                id="lessonTitle"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder={t('feedback.lessonTitlePlaceholder')}
                required
              />
            </div>

            <div>
              <Label htmlFor="lessonDescription" className="text-base font-medium">
                {t('feedback.lessonDescription')}
              </Label>
              <Badge variant="outline" className="mb-2 bg-gray-50 text-gray-700 border-gray-200">
                Optional
              </Badge>
              <Textarea
                id="lessonDescription"
                value={lessonDescription}
                onChange={(e) => setLessonDescription(e.target.value)}
                placeholder={t('feedback.lessonDescriptionPlaceholder')}
                rows={3}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label className="text-base font-medium">{t('feedback.understanding')}</Label>
              <StarRating rating={understanding} onRatingChange={setUnderstanding} />
            </div>

            <div>
              <Label className="text-base font-medium">{t('feedback.interest')}</Label>
              <StarRating rating={interest} onRatingChange={setInterest} />
            </div>

            <div>
              <Label className="text-base font-medium">{t('feedback.growth')}</Label>
              <StarRating rating={growth} onRatingChange={setGrowth} />
            </div>
          </div>

          <div>
            <Label className="text-base font-medium">{t('feedback.emotionalState')}</Label>
            <p className="text-sm text-gray-600 mb-3">
              {t('feedback.emotionalStateDescription')}
            </p>
            <EmotionalStateSelector 
              selectedState={emotionalState} 
              onStateChange={setEmotionalState} 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="whatWentWell" className="text-base font-medium">
                {t('feedback.whatWentWell')}
              </Label>
              <Textarea
                id="whatWentWell"
                value={whatWentWell}
                onChange={(e) => setWhatWentWell(e.target.value)}
                placeholder={t('feedback.whatWentWellPlaceholder')}
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="suggestions" className="text-base font-medium">
                {t('feedback.suggestions')}
              </Label>
              <Textarea
                id="suggestions"
                value={suggestions}
                onChange={(e) => setSuggestions(e.target.value)}
                placeholder={t('feedback.suggestionsPlaceholder')}
                rows={4}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="additionalComments" className="text-base font-medium">
              {t('feedback.additionalComments')}
            </Label>
            <Textarea
              id="additionalComments"
              value={additionalComments}
              onChange={(e) => setAdditionalComments(e.target.value)}
              placeholder={t('feedback.additionalCommentsPlaceholder')}
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
            <Checkbox
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
            />
            <Label htmlFor="anonymous" className="flex items-center gap-2 text-sm">
              <EyeOffIcon className="w-4 h-4 text-gray-500" />
              {t('feedback.submitAnonymously')}
            </Label>
          </div>

          <div className="flex justify-center pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isSubmitting ? t('feedback.submitting') : t('feedback.submitFeedback')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default LessonFeedbackForm;
