
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, BookOpenIcon, CalendarIcon, ClockIcon, RefreshCcwIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Teacher {
  id: string;
  name: string;
  email: string;
  role: string;
  school: string;
}

interface ClassScheduleFormProps {
  teacher: Teacher;
}

const ClassScheduleForm = ({ teacher }: ClassScheduleFormProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    subject: "",
    lesson_topic: "",
    class_date: "",
    class_time: "",
    duration_minutes: 60,
    school: teacher?.school || "",
    grade: "",
    description: "",
    is_recurring: false,
    recurrence_pattern: "weekly",
    recurrence_end_date: "",
    number_of_occurrences: 4
  });

  const generateRecurringDates = (startDate: string, pattern: string, endDate: string, occurrences: number) => {
    const dates = [];
    const start = new Date(startDate);
    let current = new Date(start);
    
    for (let i = 0; i < occurrences; i++) {
      if (endDate && current > new Date(endDate)) break;
      
      dates.push(new Date(current));
      
      // Add interval based on pattern
      switch (pattern) {
        case "weekly":
          current.setDate(current.getDate() + 7);
          break;
        case "biweekly":
          current.setDate(current.getDate() + 14);
          break;
        case "monthly":
          current.setMonth(current.getMonth() + 1);
          break;
      }
    }
    
    return dates;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (formData.is_recurring) {
        // Generate recurring schedule entries
        const dates = generateRecurringDates(
          formData.class_date,
          formData.recurrence_pattern,
          formData.recurrence_end_date,
          formData.number_of_occurrences
        );
        
        const schedules = dates.map(date => ({
          subject: formData.subject,
          lesson_topic: formData.lesson_topic,
          class_date: date.toISOString().split('T')[0],
          class_time: formData.class_time,
          duration_minutes: formData.duration_minutes,
          school: formData.school,
          grade: formData.grade,
          description: formData.description,
          teacher_id: teacher.id
        }));

        const { error } = await supabase
          .from('class_schedules')
          .insert(schedules);

        if (error) throw error;

        toast({
          title: t('common.success'),
          description: t('teacher.classesScheduledSuccess', { count: schedules.length.toString() }),
        });
      } else {
        // Single schedule entry
        const { error } = await supabase
          .from('class_schedules')
          .insert({
            subject: formData.subject,
            lesson_topic: formData.lesson_topic,
            class_date: formData.class_date,
            class_time: formData.class_time,
            duration_minutes: formData.duration_minutes,
            school: formData.school,
            grade: formData.grade,
            description: formData.description,
            teacher_id: teacher.id
          });

        if (error) throw error;

        toast({
          title: t('common.success'),
          description: t('teacher.classScheduledSuccess'),
        });
      }

      // Reset form
      setFormData({
        subject: "",
        lesson_topic: "",
        class_date: "",
        class_time: "",
        duration_minutes: 60,
        school: teacher?.school || "",
        grade: "",
        description: "",
        is_recurring: false,
        recurrence_pattern: "weekly",
        recurrence_end_date: "",
        number_of_occurrences: 4
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('teacher.scheduleClassFailed'),
        variant: "destructive",
      });
    }
  };

  const isFormValid = formData.subject && formData.lesson_topic && formData.class_date && 
                     formData.class_time && formData.school && formData.grade;

  const isRecurrenceEndDateValid = !formData.is_recurring || 
                                  (formData.recurrence_end_date && new Date(formData.recurrence_end_date) > new Date(formData.class_date));

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
              <BookOpenIcon className="w-5 h-5" />
              {t('teacher.classDetailsTitle')}
            </CardTitle>
            <CardDescription>{t('teacher.classDetailsDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subject" className="text-gray-700 font-medium">{t('teacher.subjectLabel')}</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('teacher.selectSubject')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mathematics">{t('teacher.mathematics')}</SelectItem>
                    <SelectItem value="science">{t('teacher.science')}</SelectItem>
                    <SelectItem value="english">{t('teacher.english')}</SelectItem>
                    <SelectItem value="history">{t('teacher.history')}</SelectItem>
                    <SelectItem value="geography">{t('teacher.geography')}</SelectItem>
                    <SelectItem value="art">{t('teacher.art')}</SelectItem>
                    <SelectItem value="music">{t('teacher.music')}</SelectItem>
                    <SelectItem value="physical-education">{t('teacher.physicalEducation')}</SelectItem>
                    <SelectItem value="computer-science">{t('teacher.computerScience')}</SelectItem>
                    <SelectItem value="other">{t('teacher.other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="lesson_topic" className="text-gray-700 font-medium">{t('teacher.lessonTopicLabel')}</Label>
                <Input
                  id="lesson_topic"
                  placeholder={t('teacher.lessonTopicPlaceholder')}
                  value={formData.lesson_topic}
                  onChange={(e) => setFormData(prev => ({ ...prev, lesson_topic: e.target.value }))}
                  className="border-gray-200"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-gray-700 font-medium">{t('teacher.descriptionLabel')}</Label>
              <Textarea
                id="description"
                placeholder={t('teacher.descriptionPlaceholder')}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="border-gray-200 min-h-[80px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Schedule Information */}
        <Card className="bg-white/80 backdrop-blur-sm border-green-100">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              {t('teacher.scheduleDetailsTitle')}
            </CardTitle>
            <CardDescription>{t('teacher.scheduleDetailsDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="class_date" className="text-gray-700 font-medium">{t('teacher.dateLabel')}</Label>
                <Input
                  id="class_date"
                  type="date"
                  value={formData.class_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, class_date: e.target.value }))}
                  className="border-gray-200"
                />
              </div>
              <div>
                <Label htmlFor="class_time" className="text-gray-700 font-medium">{t('teacher.timeLabel')}</Label>
                <Input
                  id="class_time"
                  type="time"
                  value={formData.class_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, class_time: e.target.value }))}
                  className="border-gray-200"
                />
              </div>
              <div>
                <Label htmlFor="duration_minutes" className="text-gray-700 font-medium">{t('teacher.durationLabel')}</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, duration_minutes: parseInt(value) }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="60" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">{t('teacher.30minutes')}</SelectItem>
                    <SelectItem value="45">{t('teacher.45minutes')}</SelectItem>
                    <SelectItem value="60">{t('teacher.60minutes')}</SelectItem>
                    <SelectItem value="90">{t('teacher.90minutes')}</SelectItem>
                    <SelectItem value="120">{t('teacher.120minutes')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="school" className="text-gray-700 font-medium">{t('teacher.schoolLabel')}</Label>
                <Input
                  id="school"
                  placeholder={t('teacher.schoolPlaceholder')}
                  value={formData.school}
                  onChange={(e) => setFormData(prev => ({ ...prev, school: e.target.value }))}
                  className="border-gray-200"
                />
              </div>
              <div>
                <Label htmlFor="grade" className="text-gray-700 font-medium">{t('teacher.classGradeLabel')}</Label>
                <Input
                  id="grade"
                  placeholder={t('teacher.classGradePlaceholder')}
                  value={formData.grade}
                  onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
                  className="border-gray-200"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recurring Options */}
        <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
              <RefreshCcwIcon className="w-5 h-5" />
              {t('teacher.recurringScheduleTitle')}
            </CardTitle>
            <CardDescription>{t('teacher.recurringScheduleDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_recurring"
                checked={formData.is_recurring}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_recurring: checked }))}
              />
              <Label htmlFor="is_recurring" className="text-gray-700 font-medium">
                {t('teacher.makeRecurring')}
              </Label>
            </div>

            {formData.is_recurring && (
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="recurrence_pattern" className="text-gray-700 font-medium">{t('teacher.repeatPatternLabel')}</Label>
                    <Select 
                      value={formData.recurrence_pattern} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, recurrence_pattern: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">{t('teacher.weekly')}</SelectItem>
                        <SelectItem value="biweekly">{t('teacher.biweekly')}</SelectItem>
                        <SelectItem value="monthly">{t('teacher.monthly')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="number_of_occurrences" className="text-gray-700 font-medium">{t('teacher.numberOfClassesLabel')}</Label>
                    <Input
                      id="number_of_occurrences"
                      type="number"
                      min="1"
                      max="52"
                      value={formData.number_of_occurrences}
                      onChange={(e) => setFormData(prev => ({ ...prev, number_of_occurrences: parseInt(e.target.value) || 1 }))}
                      className="border-gray-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="recurrence_end_date" className="text-gray-700 font-medium">{t('teacher.endDateLabel')}</Label>
                    <Input
                      id="recurrence_end_date"
                      type="date"
                      value={formData.recurrence_end_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, recurrence_end_date: e.target.value }))}
                      className="border-gray-200"
                    />
                  </div>
                </div>
                
                {!isRecurrenceEndDateValid && (
                  <p className="text-sm text-red-600">{t('teacher.endDateMustBeAfterStart')}</p>
                )}

                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-sm text-purple-700">
                    <strong>{t('common.preview')}:</strong> {t('teacher.previewText', { 
                      count: formData.number_of_occurrences.toString(),
                      date: formData.class_date && new Date(formData.class_date).toLocaleDateString(),
                      pattern: t(`teacher.${formData.recurrence_pattern}`)
                    })}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-center pt-6">
          <Button 
            type="submit" 
            disabled={!isFormValid || !isRecurrenceEndDateValid}
            size="lg"
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5 mr-2" />
            {formData.is_recurring ? t('teacher.scheduleMultipleClasses', { count: formData.number_of_occurrences.toString() }) : t('teacher.scheduleClass')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ClassScheduleForm;
