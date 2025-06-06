
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Send, UserIcon, ShieldIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import StarRating from "@/components/StarRating";
import EmotionalStateSelector from "@/components/EmotionalStateSelector";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface Student {
  id: string;
  full_name: string;
  school: string;
  grade: string;
}

interface LessonFeedbackFormProps {
  student: Student;
}

const LessonFeedbackForm = ({ student }: LessonFeedbackFormProps) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    subject: "",
    lessonTopic: "",
    understanding: 0,
    interest: 0,
    educationalGrowth: 0,
    emotionalState: "",
    whatWorkedWell: "",
    whatWasConfusing: "",
    howToImprove: "",
    additionalComments: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // First, find or create a class schedule entry for this subject/lesson
      const { data: existingSchedule, error: scheduleError } = await supabase
        .from('class_schedules')
        .select('id')
        .eq('subject', formData.subject)
        .eq('lesson_topic', formData.lessonTopic)
        .eq('school', student.school)
        .eq('grade', student.grade)
        .limit(1);

      if (scheduleError) throw scheduleError;

      let classScheduleId;
      
      if (existingSchedule && existingSchedule.length > 0) {
        classScheduleId = existingSchedule[0].id;
      } else {
        // Create a new class schedule entry
        const { data: newSchedule, error: createError } = await supabase
          .from('class_schedules')
          .insert({
            subject: formData.subject,
            lesson_topic: formData.lessonTopic,
            school: student.school,
            grade: student.grade,
            class_date: new Date().toISOString().split('T')[0],
            class_time: '09:00:00',
            teacher_id: '00000000-0000-0000-0000-000000000000' // placeholder
          })
          .select('id')
          .single();

        if (createError) throw createError;
        classScheduleId = newSchedule.id;
      }

      // Now insert the feedback
      const { error } = await supabase
        .from('feedback')
        .insert({
          student_id: student.id,
          student_name: student.full_name,
          class_schedule_id: classScheduleId,
          understanding: formData.understanding,
          interest: formData.interest,
          educational_growth: formData.educationalGrowth,
          emotional_state: formData.emotionalState,
          what_went_well: formData.whatWorkedWell,
          suggestions: formData.howToImprove,
          additional_comments: formData.additionalComments
        });

      if (error) throw error;

      toast({
        title: t('feedback.submitted'),
        description: t('feedback.submittedDesc'),
      });

      // Reset form
      setFormData({
        subject: "",
        lessonTopic: "",
        understanding: 0,
        interest: 0,
        educationalGrowth: 0,
        emotionalState: "",
        whatWorkedWell: "",
        whatWasConfusing: "",
        howToImprove: "",
        additionalComments: ""
      });
    } catch (error) {
      toast({
        title: t('feedback.submitError'),
        description: t('feedback.submitErrorDesc'),
        variant: "destructive",
      });
    }
  };

  const isFormValid = formData.subject && formData.lessonTopic && formData.understanding > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center gap-3 mb-2 justify-center">
          <h2 className="text-2xl font-bold text-gray-900">{t('feedback.title')}</h2>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <UserIcon className="w-3 h-3 mr-1" />
            {student?.full_name}
          </Badge>
        </div>
        <p className="text-gray-600">
          {t('feedback.subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">{t('feedback.lessonDetails')}</CardTitle>
            <CardDescription>{t('feedback.lessonDetailsDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subject" className="text-gray-700 font-medium">{t('class.subject')}</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('subject.selectSubject')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mathematics">{t('subject.mathematics')}</SelectItem>
                    <SelectItem value="science">{t('subject.science')}</SelectItem>
                    <SelectItem value="english">{t('subject.english')}</SelectItem>
                    <SelectItem value="history">{t('subject.history')}</SelectItem>
                    <SelectItem value="art">{t('subject.art')}</SelectItem>
                    <SelectItem value="music">{t('subject.music')}</SelectItem>
                    <SelectItem value="physical-education">{t('subject.physicalEducation')}</SelectItem>
                    <SelectItem value="other">{t('subject.other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="lessonTopic" className="text-gray-700 font-medium">{t('feedback.lessonTopic')}</Label>
                <Input
                  id="lessonTopic"
                  placeholder={t('feedback.lessonTopicPlaceholder')}
                  value={formData.lessonTopic}
                  onChange={(e) => setFormData(prev => ({ ...prev, lessonTopic: e.target.value }))}
                  className="border-gray-200"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Understanding and Engagement */}
        <Card className="bg-white/80 backdrop-blur-sm border-green-100">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">{t('feedback.learningAssessment')}</CardTitle>
            <CardDescription>{t('feedback.learningAssessmentDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-gray-700 font-medium">{t('feedback.understandingQuestion')}</Label>
              <StarRating
                rating={formData.understanding}
                onRatingChange={(rating) => setFormData(prev => ({ ...prev, understanding: rating }))}
                labels={[
                  t('rating.understanding.1'),
                  t('rating.understanding.2'),
                  t('rating.understanding.3'),
                  t('rating.understanding.4'),
                  t('rating.understanding.5')
                ]}
              />
            </div>

            <div>
              <Label className="text-gray-700 font-medium">{t('feedback.interestQuestion')}</Label>
              <StarRating
                rating={formData.interest}
                onRatingChange={(rating) => setFormData(prev => ({ ...prev, interest: rating }))}
                labels={[
                  t('rating.interest.1'),
                  t('rating.interest.2'),
                  t('rating.interest.3'),
                  t('rating.interest.4'),
                  t('rating.interest.5')
                ]}
              />
            </div>

            <div>
              <Label className="text-gray-700 font-medium">{t('feedback.educationalGrowthQuestion')}</Label>
              <StarRating
                rating={formData.educationalGrowth}
                onRatingChange={(rating) => setFormData(prev => ({ ...prev, educationalGrowth: rating }))}
                labels={[
                  t('rating.growth.1'),
                  t('rating.growth.2'),
                  t('rating.growth.3'),
                  t('rating.growth.4'),
                  t('rating.growth.5')
                ]}
              />
            </div>
          </CardContent>
        </Card>

        {/* Emotional State */}
        <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">{t('feedback.emotionalWellbeing')}</CardTitle>
            <CardDescription>{t('feedback.emotionalWellbeingDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <EmotionalStateSelector
              selectedState={formData.emotionalState}
              onStateChange={(state) => setFormData(prev => ({ ...prev, emotionalState: state }))}
            />
          </CardContent>
        </Card>

        {/* Detailed Feedback */}
        <Card className="bg-white/80 backdrop-blur-sm border-indigo-100">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">{t('feedback.detailedFeedback')}</CardTitle>
            <CardDescription>{t('feedback.detailedFeedbackDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="whatWorkedWell" className="text-gray-700 font-medium">{t('feedback.whatWorkedWell')}</Label>
              <Textarea
                id="whatWorkedWell"
                placeholder={t('feedback.whatWorkedWellPlaceholder')}
                value={formData.whatWorkedWell}
                onChange={(e) => setFormData(prev => ({ ...prev, whatWorkedWell: e.target.value }))}
                className="border-gray-200 min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor="whatWasConfusing" className="text-gray-700 font-medium">{t('feedback.whatWasConfusing')}</Label>
              <Textarea
                id="whatWasConfusing"
                placeholder={t('feedback.whatWasConfusingPlaceholder')}
                value={formData.whatWasConfusing}
                onChange={(e) => setFormData(prev => ({ ...prev, whatWasConfusing: e.target.value }))}
                className="border-gray-200 min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor="howToImprove" className="text-gray-700 font-medium">{t('feedback.howToImprove')}</Label>
              <Textarea
                id="howToImprove"
                placeholder={t('feedback.howToImprovePlaceholder')}
                value={formData.howToImprove}
                onChange={(e) => setFormData(prev => ({ ...prev, howToImprove: e.target.value }))}
                className="border-gray-200 min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor="additionalComments" className="text-gray-700 font-medium">{t('feedback.additionalComments')}</Label>
              <Textarea
                id="additionalComments"
                placeholder={t('feedback.additionalCommentsPlaceholder')}
                value={formData.additionalComments}
                onChange={(e) => setFormData(prev => ({ ...prev, additionalComments: e.target.value }))}
                className="border-gray-200 min-h-[80px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-center pt-6">
          <Button 
            type="submit" 
            disabled={!isFormValid}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5 mr-2" />
            {t('feedback.submit')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LessonFeedbackForm;
