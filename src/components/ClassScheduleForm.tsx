
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

interface ClassScheduleFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const ClassScheduleForm = ({ onSubmit, onCancel }: ClassScheduleFormProps) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    subject: "",
    lesson_topic: "",
    class_date: "",
    class_time: "",
    duration_minutes: 60,
    school: "",
    grade: "",
    description: "",
    is_recurring: false,
    recurrence_pattern: "weekly",
    recurrence_end_date: "",
    number_of_occurrences: 4
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isFormValid = formData.subject && formData.lesson_topic && formData.class_date && 
                     formData.class_time && formData.school && formData.grade;

  const isRecurrenceEndDateValid = !formData.is_recurring || 
                                  (formData.recurrence_end_date && new Date(formData.recurrence_end_date) > new Date(formData.class_date));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onCancel}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('schedule.backToDashboard')}
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{t('schedule.title')}</h1>
            <p className="text-gray-600">{t('schedule.subtitle')}</p>
          </div>
          <LanguageSwitcher />
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                <BookOpenIcon className="w-5 h-5" />
                {t('schedule.classDetails')}
              </CardTitle>
              <CardDescription>{t('schedule.classDetailsDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subject" className="text-gray-700 font-medium">{t('schedule.subject')}</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('schedule.selectSubject')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mathematics">Mathematics</SelectItem>
                      <SelectItem value="science">Science</SelectItem>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="history">History</SelectItem>
                      <SelectItem value="geography">Geography</SelectItem>
                      <SelectItem value="art">Art</SelectItem>
                      <SelectItem value="music">Music</SelectItem>
                      <SelectItem value="physical-education">Physical Education</SelectItem>
                      <SelectItem value="computer-science">Computer Science</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="lesson_topic" className="text-gray-700 font-medium">{t('schedule.lessonTopic')}</Label>
                  <Input
                    id="lesson_topic"
                    placeholder="e.g., Fractions, Photosynthesis, Shakespeare"
                    value={formData.lesson_topic}
                    onChange={(e) => setFormData(prev => ({ ...prev, lesson_topic: e.target.value }))}
                    className="border-gray-200"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-gray-700 font-medium">{t('schedule.description')}</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of what will be covered in this lesson..."
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
                {t('schedule.scheduleDetails')}
              </CardTitle>
              <CardDescription>{t('schedule.scheduleDetailsDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="class_date" className="text-gray-700 font-medium">{t('schedule.date')}</Label>
                  <Input
                    id="class_date"
                    type="date"
                    value={formData.class_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, class_date: e.target.value }))}
                    className="border-gray-200"
                  />
                </div>
                <div>
                  <Label htmlFor="class_time" className="text-gray-700 font-medium">{t('schedule.time')}</Label>
                  <Input
                    id="class_time"
                    type="time"
                    value={formData.class_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, class_time: e.target.value }))}
                    className="border-gray-200"
                  />
                </div>
                <div>
                  <Label htmlFor="duration_minutes" className="text-gray-700 font-medium">{t('schedule.duration')}</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, duration_minutes: parseInt(value) }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="60" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 {t('common.minutes')}</SelectItem>
                      <SelectItem value="45">45 {t('common.minutes')}</SelectItem>
                      <SelectItem value="60">60 {t('common.minutes')}</SelectItem>
                      <SelectItem value="90">90 {t('common.minutes')}</SelectItem>
                      <SelectItem value="120">120 {t('common.minutes')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="school" className="text-gray-700 font-medium">{t('schedule.school')}</Label>
                  <Input
                    id="school"
                    placeholder="School name"
                    value={formData.school}
                    onChange={(e) => setFormData(prev => ({ ...prev, school: e.target.value }))}
                    className="border-gray-200"
                  />
                </div>
                <div>
                  <Label htmlFor="grade" className="text-gray-700 font-medium">{t('schedule.classGrade')}</Label>
                  <Input
                    id="grade"
                    placeholder="e.g., Grade 5, Class 10A, Year 9"
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
                {t('schedule.recurringOptions')}
              </CardTitle>
              <CardDescription>{t('schedule.recurringDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="is_recurring" 
                  checked={formData.is_recurring}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_recurring: checked }))} 
                />
                <Label htmlFor="is_recurring" className="font-medium">{t('schedule.makeRecurring')}</Label>
              </div>

              {formData.is_recurring && (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="recurrence_pattern" className="text-gray-700 font-medium">{t('schedule.repeats')}</Label>
                      <Select 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, recurrence_pattern: value }))}
                        defaultValue={formData.recurrence_pattern}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select pattern" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="bi-weekly">Every Two Weeks</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="number_of_occurrences" className="text-gray-700 font-medium">{t('schedule.occurrences')}</Label>
                      <Select 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, number_of_occurrences: parseInt(value) }))}
                        defaultValue={formData.number_of_occurrences.toString()}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="4" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">2 Classes</SelectItem>
                          <SelectItem value="4">4 Classes</SelectItem>
                          <SelectItem value="8">8 Classes</SelectItem>
                          <SelectItem value="12">12 Classes (Term/Semester)</SelectItem>
                          <SelectItem value="36">36 Classes (Full Year)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="recurrence_end_date" className="text-gray-700 font-medium">{t('schedule.endDate')}</Label>
                    <Input
                      id="recurrence_end_date"
                      type="date"
                      value={formData.recurrence_end_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, recurrence_end_date: e.target.value }))}
                      className={`border-gray-200 ${!isRecurrenceEndDateValid && "border-red-500"}`}
                    />
                    {!isRecurrenceEndDateValid && (
                      <p className="text-red-500 text-sm mt-1">End date must be after the start date</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      Optional: If not specified, classes will be created based on the number of occurrences
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
              {formData.is_recurring ? t('schedule.scheduleRecurringClasses') : t('schedule.scheduleClass')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClassScheduleForm;
