import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpenIcon, MessageSquareIcon, EyeOffIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import StarRating from "./StarRating";
import EmotionalStateSelector from "./EmotionalStateSelector";

interface Student {
  id: string;
  full_name: string;
  school: string;
  grade: string;
}

interface ClassSchedule {
  id: string;
  subject: string;
  grade: string;
  lesson_topic: string;
  class_date: string;
  class_time: string;
  teacher_id: string;
  school: string;
}

interface LessonFeedbackFormProps {
  student: Student;
}

const LessonFeedbackForm = ({ student }: LessonFeedbackFormProps) => {
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [availableClasses, setAvailableClasses] = useState<ClassSchedule[]>([]);
  const [understanding, setUnderstanding] = useState(0);
  const [interest, setInterest] = useState(0);
  const [educationalGrowth, setEducationalGrowth] = useState(0);
  const [emotionalState, setEmotionalState] = useState("");
  const [whatWentWell, setWhatWentWell] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [additionalComments, setAdditionalComments] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    if (student?.school && student?.grade) {
      loadAvailableClasses();
    }
  }, [student]);

  const loadAvailableClasses = async () => {
    if (!student?.school || !student?.grade) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('class_schedules')
        .select('*')
        .eq('school', student.school)
        .eq('grade', student.grade)
        .lte('class_date', today)
        .order('class_date', { ascending: false })
        .order('class_time', { ascending: false })
        .limit(10);

      if (error) throw error;
      setAvailableClasses(data || []);
    } catch (error) {
      console.error('Error loading classes:', error);
      toast({
        title: t('common.error'),
        description: "Failed to load available classes",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClass) {
      toast({
        title: t('feedback.selectClass'),
        description: t('feedback.selectClassDesc'),
        variant: "destructive",
      });
      return;
    }

    if (!emotionalState) {
      toast({
        title: t('feedback.selectEmotion'),
        description: t('feedback.selectEmotionDesc'),
        variant: "destructive",
      });
      return;
    }

    if (understanding === 0 || interest === 0 || educationalGrowth === 0) {
      toast({
        title: t('feedback.rateAll'),
        description: t('feedback.rateAllDesc'),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('feedback')
        .insert({
          student_id: isAnonymous ? null : student?.id,
          student_name: isAnonymous ? 'Anonymous' : student?.full_name || '',
          class_schedule_id: selectedClass,
          understanding,
          interest,
          educational_growth: educationalGrowth,
          emotional_state: emotionalState,
          what_went_well: whatWentWell.trim() || null,
          suggestions: suggestions.trim() || null,
          additional_comments: additionalComments.trim() || null,
          is_anonymous: isAnonymous
        });

      if (error) throw error;

      toast({
        title: t('feedback.submitted'),
        description: t('feedback.submittedDesc'),
      });

      // Reset form
      setSelectedClass("");
      setUnderstanding(0);
      setInterest(0);
      setEducationalGrowth(0);
      setEmotionalState("");
      setWhatWentWell("");
      setSuggestions("");
      setAdditionalComments("");
      setIsAnonymous(false);
    } catch (error) {
      toast({
        title: t('feedback.submitFailed'),
        description: t('feedback.submitFailedDesc'),
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
          {t('feedback.subtitle')}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="class-select" className="flex items-center gap-2 text-base font-medium">
              <BookOpenIcon className="w-5 h-5 text-blue-500" />
              {t('feedback.selectClass')}
            </Label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder={t('feedback.selectClassPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {availableClasses.map((classItem) => (
                  <SelectItem key={classItem.id} value={classItem.id}>
                    {classItem.subject} - {classItem.lesson_topic} ({new Date(classItem.class_date).toLocaleDateString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-base font-medium">{t('feedback.emotionalState')}</Label>
            <EmotionalStateSelector
              selectedState={emotionalState}
              onStateChange={setEmotionalState}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label className="text-base font-medium">{t('feedback.understanding')}</Label>
              <StarRating
                rating={understanding}
                onRatingChange={setUnderstanding}
              />
            </div>

            <div>
              <Label className="text-base font-medium">{t('feedback.interest')}</Label>
              <StarRating
                rating={interest}
                onRatingChange={setInterest}
              />
            </div>

            <div>
              <Label className="text-base font-medium">{t('feedback.growth')}</Label>
              <StarRating
                rating={educationalGrowth}
                onRatingChange={setEducationalGrowth}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="what-went-well" className="text-base font-medium">
                {t('feedback.whatWentWell')}
              </Label>
              <Badge variant="outline" className="mb-2 bg-green-50 text-green-700 border-green-200">
                {t('feedback.optional')}
              </Badge>
              <Textarea
                id="what-went-well"
                placeholder={t('feedback.whatWentWellPlaceholder')}
                value={whatWentWell}
                onChange={(e) => setWhatWentWell(e.target.value)}
                className="min-h-[80px] resize-none"
              />
            </div>

            <div>
              <Label htmlFor="suggestions" className="text-base font-medium">
                {t('feedback.suggestions')}
              </Label>
              <Badge variant="outline" className="mb-2 bg-yellow-50 text-yellow-700 border-yellow-200">
                {t('feedback.optional')}
              </Badge>
              <Textarea
                id="suggestions"
                placeholder={t('feedback.suggestionsPlaceholder')}
                value={suggestions}
                onChange={(e) => setSuggestions(e.target.value)}
                className="min-h-[80px] resize-none"
              />
            </div>

            <div>
              <Label htmlFor="additional" className="text-base font-medium">
                {t('feedback.additional')}
              </Label>
              <Badge variant="outline" className="mb-2 bg-purple-50 text-purple-700 border-purple-200">
                {t('feedback.optional')}
              </Badge>
              <Textarea
                id="additional"
                placeholder={t('feedback.additionalPlaceholder')}
                value={additionalComments}
                onChange={(e) => setAdditionalComments(e.target.value)}
                className="min-h-[80px] resize-none"
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
          </div>

          <div className="flex justify-center pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isSubmitting ? t('feedback.submitting') : t('feedback.submit')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default LessonFeedbackForm;
