
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/StarRating";
import { EmotionalStateSelector } from "@/components/EmotionalStateSelector";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const LessonFeedbackForm = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [understanding, setUnderstanding] = useState(0);
  const [interest, setInterest] = useState(0);
  const [growth, setGrowth] = useState(0);
  const [emotionalState, setEmotionalState] = useState('');
  const [whatWentWell, setWhatWentWell] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [additionalComments, setAdditionalComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: t('feedback.submitted') || "Feedback Submitted",
        description: t('feedback.submittedDescription') || "Thank you for your feedback!",
      });

      // Reset form
      setTitle('');
      setDescription('');
      setUnderstanding(0);
      setInterest(0);
      setGrowth(0);
      setEmotionalState('');
      setWhatWentWell('');
      setSuggestions('');
      setAdditionalComments('');
    } catch (error) {
      toast({
        title: t('common.error') || "Error",
        description: t('feedback.submitError') || "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('feedback.title') || 'Lesson Feedback'}</CardTitle>
        <CardDescription>
          {t('feedback.description') || 'Share your thoughts about today\'s lesson to help improve the learning experience.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">{t('feedback.lessonTitle') || 'Lesson Title'}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('feedback.lessonTitlePlaceholder') || 'Enter the lesson title'}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">{t('feedback.lessonDescription') || 'Lesson Description'}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('feedback.lessonDescriptionPlaceholder') || 'Briefly describe what was covered in the lesson'}
              rows={3}
            />
          </div>

          <div>
            <Label>{t('feedback.understanding') || 'How well did you understand the lesson content?'}</Label>
            <StarRating rating={understanding} onRatingChange={setUnderstanding} />
          </div>

          <div>
            <Label>{t('feedback.interest') || 'How interesting was the lesson for you?'}</Label>
            <StarRating rating={interest} onRatingChange={setInterest} />
          </div>

          <div>
            <Label>{t('feedback.growth') || 'How much do you feel you learned or grew from this lesson?'}</Label>
            <StarRating rating={growth} onRatingChange={setGrowth} />
          </div>

          <div>
            <Label>{t('feedback.emotionalState') || 'Emotional State'}</Label>
            <p className="text-sm text-muted-foreground mb-3">
              {t('feedback.emotionalStateDescription') || 'Select how you felt emotionally during the lesson. This helps your teacher understand the classroom environment.'}
            </p>
            <EmotionalStateSelector
              selectedState={emotionalState}
              onStateChange={setEmotionalState}
            />
          </div>

          <div>
            <Label htmlFor="whatWentWell">{t('feedback.whatWentWell') || 'What went well in this lesson?'}</Label>
            <Textarea
              id="whatWentWell"
              value={whatWentWell}
              onChange={(e) => setWhatWentWell(e.target.value)}
              placeholder={t('feedback.whatWentWellPlaceholder') || 'Share what you enjoyed or found helpful about the lesson'}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="suggestions">{t('feedback.suggestions') || 'Suggestions for Improvement'}</Label>
            <Textarea
              id="suggestions"
              value={suggestions}
              onChange={(e) => setSuggestions(e.target.value)}
              placeholder={t('feedback.suggestionsPlaceholder') || 'What could be improved in future lessons?'}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="additionalComments">{t('feedback.additionalComments') || 'Additional Comments'}</Label>
            <Textarea
              id="additionalComments"
              value={additionalComments}
              onChange={(e) => setAdditionalComments(e.target.value)}
              placeholder={t('feedback.additionalCommentsPlaceholder') || 'Any other thoughts or feedback you\'d like to share?'}
              rows={3}
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting 
              ? (t('feedback.submitting') || 'Submitting...') 
              : (t('feedback.submitFeedback') || 'Submit Feedback')
            }
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default LessonFeedbackForm;
