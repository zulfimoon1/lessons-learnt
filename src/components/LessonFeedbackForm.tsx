
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EyeOffIcon } from "lucide-react";
import StarRating from "./StarRating";
import EmotionalStateSelector from "./EmotionalStateSelector";
import DataProtectionBanner from "./DataProtectionBanner";
import { useLanguage } from "@/contexts/LanguageContext";

interface FeedbackData {
  understanding: number;
  interest: number;
  educationalGrowth: number;
  emotionalState: string;
  whatWentWell: string;
  suggestions: string;
  additionalComments: string;
  isAnonymous: boolean;
}

interface LessonFeedbackFormProps {
  classScheduleId?: string;
  student?: any;
}

const LessonFeedbackForm: React.FC<LessonFeedbackFormProps> = ({ 
  classScheduleId, 
  student
}) => {
  const [feedbackData, setFeedbackData] = useState<FeedbackData>({
    understanding: 0,
    interest: 0,
    educationalGrowth: 0,
    emotionalState: '',
    whatWentWell: '',
    suggestions: '',
    additionalComments: '',
    isAnonymous: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('feedback')
        .insert([
          {
            class_schedule_id: classScheduleId,
            understanding: feedbackData.understanding,
            interest: feedbackData.interest,
            educational_growth: feedbackData.educationalGrowth,
            emotional_state: feedbackData.emotionalState,
            what_went_well: feedbackData.whatWentWell,
            suggestions: feedbackData.suggestions,
            additional_comments: feedbackData.additionalComments,
            is_anonymous: feedbackData.isAnonymous,
            submitted_at: new Date().toISOString(),
          },
        ]);

      if (error) {
        console.error('Error submitting feedback:', error);
        toast({
          title: t('common.error'),
          description: t('feedback.submitFailed'),
          variant: "destructive",
        });
      } else {
        toast({
          title: t('feedback.submitted'),
          description: t('feedback.submitSuccess'),
        });
        // Reset form
        setFeedbackData({
          understanding: 0,
          interest: 0,
          educationalGrowth: 0,
          emotionalState: '',
          whatWentWell: '',
          suggestions: '',
          additionalComments: '',
          isAnonymous: false,
        });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: t('common.error'),
        description: t('feedback.unexpectedError'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFeedbackData(prev => ({ ...prev, [name]: value }));
  };

  const handleStarClick = (name: string, value: number) => {
    setFeedbackData(prev => ({ ...prev, [name]: value }));
  };

  const handleEmotionalStateChange = (state: string) => {
    setFeedbackData(prev => ({ ...prev, emotionalState: state }));
  };

  return (
    <div className="space-y-6">
      <DataProtectionBanner />
      <Card>
        <CardHeader>
          <CardTitle>{t('feedback.title')}</CardTitle>
          <CardDescription>{t('feedback.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>{t('feedback.understanding')}</Label>
              <StarRating
                rating={feedbackData.understanding}
                onRatingChange={(value) => handleStarClick('understanding', value)}
              />
            </div>
            
            <div>
              <Label>{t('feedback.interest')}</Label>
              <StarRating
                rating={feedbackData.interest}
                onRatingChange={(value) => handleStarClick('interest', value)}
              />
            </div>
            
            <div>
              <Label>{t('feedback.growth')}</Label>
              <StarRating
                rating={feedbackData.educationalGrowth}
                onRatingChange={(value) => handleStarClick('educationalGrowth', value)}
              />
            </div>

            <div>
              <Label>{t('feedback.emotionalState')}</Label>
              <EmotionalStateSelector
                onStateChange={handleEmotionalStateChange}
                selectedState={feedbackData.emotionalState}
              />
            </div>

            <div>
              <Label htmlFor="whatWentWell">{t('feedback.whatWentWell')}</Label>
              <Textarea
                id="whatWentWell"
                name="whatWentWell"
                value={feedbackData.whatWentWell}
                onChange={handleInputChange}
                placeholder={t('feedback.whatWentWellPlaceholder')}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="suggestions">{t('feedback.suggestions')}</Label>
              <Textarea
                id="suggestions"
                name="suggestions"
                value={feedbackData.suggestions}
                onChange={handleInputChange}
                placeholder={t('feedback.suggestionsPlaceholder')}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="additionalComments">{t('feedback.additionalComments')}</Label>
              <Textarea
                id="additionalComments"
                name="additionalComments"
                value={feedbackData.additionalComments}
                onChange={handleInputChange}
                placeholder={t('feedback.additionalCommentsPlaceholder')}
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isAnonymous"
                checked={feedbackData.isAnonymous}
                onCheckedChange={(checked) => setFeedbackData(prev => ({ ...prev, isAnonymous: Boolean(checked) }))}
              />
              <Label htmlFor="isAnonymous" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed flex items-center gap-1">
                {t('feedback.anonymous')}
                <EyeOffIcon className="w-4 h-4 text-gray-500" />
              </Label>
            </div>

            <Button disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
              {isSubmitting ? t('common.submitting') : t('feedback.submit')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LessonFeedbackForm;
