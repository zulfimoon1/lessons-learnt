import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import StarRating from './StarRating';
import EmotionalStateSelector from './EmotionalStateSelector';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { classScheduleService } from '@/services/classScheduleService';

const LessonFeedbackForm: React.FC = () => {
  const { student } = useAuth();
  const { t } = useLanguage();
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [subject, setSubject] = useState('');
  const [lessonTopic, setLessonTopic] = useState('');
  const [understanding, setUnderstanding] = useState(0);
  const [interest, setInterest] = useState(0);
  const [growth, setGrowth] = useState(0);
  const [emotionalState, setEmotionalState] = useState('');
  const [whatWentWell, setWhatWentWell] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [additionalComments, setAdditionalComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      if (!student) return;
      
      try {
        const response = await classScheduleService.getSchedulesBySchool(student.school);
        if (response.data) {
          const filteredClasses = response.data.filter(
            (classItem: any) => classItem.grade === student.grade
          );
          setClasses(filteredClasses);
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
      }
    };

    fetchClasses();
  }, [student]);

  const handleClassSelect = (classId: string) => {
    setSelectedClass(classId);
    const classData = classes.find(c => c.id === classId);
    if (classData) {
      setSubject(classData.subject || '');
      setLessonTopic(classData.lesson_topic || '');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('feedback')
        .insert({
          student_id: student.id,
          student_name: student.full_name,
          class_schedule_id: selectedClass || null,
          understanding: understanding,
          interest: interest,
          educational_growth: growth,
          emotional_state: emotionalState,
          what_went_well: whatWentWell,
          suggestions: suggestions,
          additional_comments: additionalComments
        });

      if (error) throw error;

      toast.success(t('feedback.submitSuccess') || 'Feedback submitted successfully!');
      
      // Reset form
      setSelectedClass('');
      setSubject('');
      setLessonTopic('');
      setUnderstanding(0);
      setInterest(0);
      setGrowth(0);
      setEmotionalState('');
      setWhatWentWell('');
      setSuggestions('');
      setAdditionalComments('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error(t('feedback.submitError') || 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-brand-dark">
          {t('feedback.shareExperience') || 'Share Your Learning Experience'}
        </CardTitle>
        <p className="text-muted-foreground">
          {t('feedback.helpTeacher') || 'Help your teacher understand how to make lessons even better'}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Class Selection */}
          <div className="space-y-2">
            <Label htmlFor="class-select" className="text-base font-medium">
              {t('feedback.selectClass') || 'Select a Class (Optional)'}
            </Label>
            <p className="text-sm text-muted-foreground">
              {t('feedback.selectClassDescription') || 'Choose a specific class to provide feedback for, or leave unselected for general feedback.'}
            </p>
            <Select value={selectedClass} onValueChange={handleClassSelect}>
              <SelectTrigger>
                <SelectValue placeholder={t('feedback.selectClassPlaceholder') || 'Select a class...'} />
              </SelectTrigger>
              <SelectContent>
                {classes.map((classItem) => (
                  <SelectItem key={classItem.id} value={classItem.id}>
                    {classItem.subject} - {classItem.lesson_topic}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Lesson Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {t('feedback.lessonDetails') || 'Lesson Details'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('feedback.fillDetails') || 'Fill all details below if relevant.'}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">
                  {t('feedback.subject') || 'Subject'}
                </Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={t('feedback.subjectPlaceholder') || 'e.g. Mathematics, History, etc.'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lesson-topic">
                  {t('feedback.lessonTopic') || 'Lesson Topic'}
                </Label>
                <Input
                  id="lesson-topic"
                  value={lessonTopic}
                  onChange={(e) => setLessonTopic(e.target.value)}
                  placeholder={t('feedback.lessonTopicPlaceholder') || 'e.g. Fractions, Photosynthesis, Shakespeare'}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Learning Assessment */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {t('feedback.learningAssessment') || 'Learning Assessment'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('feedback.rateExperience') || 'Rate your learning experience'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  {t('feedback.understandingQuestion') || 'How well did you understand the lesson?'}
                </Label>
                <StarRating
                  rating={understanding}
                  onRatingChange={setUnderstanding}
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  {t('feedback.interestQuestion') || 'How interesting was the lesson?'}
                </Label>
                <StarRating
                  rating={interest}
                  onRatingChange={setInterest}
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  {t('feedback.growthQuestion') || 'How much do you feel you learned or grew from this lesson?'}
                </Label>
                <StarRating
                  rating={growth}
                  onRatingChange={setGrowth}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Emotional State */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              {t('feedback.emotionalState') || 'Emotional State'}
            </Label>
            <EmotionalStateSelector
              selectedState={emotionalState}
              onStateChange={setEmotionalState}
            />
          </div>

          <Separator />

          {/* Open-ended Questions */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="what-went-well">
                  {t('feedback.whatWentWell') || 'What went well in this lesson?'}
                </Label>
                <Textarea
                  id="what-went-well"
                  value={whatWentWell}
                  onChange={(e) => setWhatWentWell(e.target.value)}
                  placeholder={t('feedback.whatWentWellPlaceholder') || 'Share what you found helpful or enjoyed about the lesson...'}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="suggestions">
                  {t('feedback.suggestionsImprovement') || 'Suggestions for improvement'}
                </Label>
                <Textarea
                  id="suggestions"
                  value={suggestions}
                  onChange={(e) => setSuggestions(e.target.value)}
                  placeholder={t('feedback.suggestionsPlaceholder') || 'What could be improved? (Class session?)'}
                  className="min-h-[100px]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additional-comments">
                {t('feedback.additionalComments') || 'Additional comments'}
              </Label>
              <Textarea
                id="additional-comments"
                value={additionalComments}
                onChange={(e) => setAdditionalComments(e.target.value)}
                placeholder={t('feedback.additionalCommentsPlaceholder') || 'Do you have any thoughts or feedback you would like to share?'}
                className="min-h-[80px]"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
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
