
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { classScheduleService } from '@/services/classScheduleService';
import { Calendar, Clock, BookOpen, Users, Repeat, CalendarDays } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { addDays, addWeeks, addMonths, format, parseISO } from 'date-fns';

interface ClassScheduleFormProps {
  teacher: {
    id: string;
    name: string;
    school: string;
    role: string;
  };
  onScheduleCreated?: () => void;
}

const ClassScheduleForm: React.FC<ClassScheduleFormProps> = ({ teacher, onScheduleCreated }) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    grade: '',
    subject: '',
    lesson_topic: '',
    class_date: '',
    class_time: '',
    duration_minutes: 60,
    description: ''
  });

  const [recurringData, setRecurringData] = useState({
    isRecurring: false,
    frequency: 'weekly', // 'daily', 'weekly', 'monthly'
    endDate: '',
    numberOfOccurrences: 10,
    daysOfWeek: [] as number[], // 0 = Sunday, 1 = Monday, etc.
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Submitting schedule with teacher data:', { teacher, formData, recurringData });
      
      if (recurringData.isRecurring) {
        // Generate recurring dates
        const dates = generateRecurringDates(
          formData.class_date,
          recurringData.frequency,
          recurringData.endDate,
          recurringData.numberOfOccurrences
        );

        // Create multiple schedule entries
        const schedules = dates.map(date => ({
          teacher_id: teacher.id,
          school: teacher.school,
          grade: formData.grade,
          subject: formData.subject,
          lesson_topic: formData.lesson_topic,
          class_date: date,
          class_time: formData.class_time,
          duration_minutes: formData.duration_minutes,
          description: formData.description || null
        }));

        const result = await classScheduleService.bulkCreateSchedules(schedules);

        if (result.error) {
          throw result.error;
        }

        toast({
          title: t('common.success'),
          description: `Created ${dates.length} recurring classes successfully!`,
        });
      } else {
        // Create single schedule
        const scheduleData = {
          teacher_id: teacher.id,
          school: teacher.school,
          grade: formData.grade,
          subject: formData.subject,
          lesson_topic: formData.lesson_topic,
          class_date: formData.class_date,
          class_time: formData.class_time,
          duration_minutes: formData.duration_minutes,
          description: formData.description || null
        };

        const result = await classScheduleService.createSchedule(scheduleData);

        if (result.error) {
          throw result.error;
        }

        toast({
          title: t('common.success'),
          description: t('schedule.success'),
        });
      }

      // Reset form
      setFormData({
        grade: '',
        subject: '',
        lesson_topic: '',
        class_date: '',
        class_time: '',
        duration_minutes: 60,
        description: ''
      });

      setRecurringData({
        isRecurring: false,
        frequency: 'weekly',
        endDate: '',
        numberOfOccurrences: 10,
        daysOfWeek: [],
      });

      onScheduleCreated?.();
    } catch (error) {
      console.error('Error creating schedule:', error);
      toast({
        title: t('common.error'),
        description: t('schedule.error'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRecurringChange = (field: string, value: any) => {
    setRecurringData(prev => ({ ...prev, [field]: value }));
  };

  const generateRecurringDates = (startDate: string, frequency: string, endDate: string, numberOfOccurrences: number): string[] => {
    const dates: string[] = [];
    let currentDate = parseISO(startDate);
    const end = endDate ? parseISO(endDate) : null;
    
    dates.push(format(currentDate, 'yyyy-MM-dd')); // Include the start date
    
    for (let i = 1; i < numberOfOccurrences; i++) {
      switch (frequency) {
        case 'daily':
          currentDate = addDays(currentDate, 1);
          break;
        case 'weekly':
          currentDate = addWeeks(currentDate, 1);
          break;
        case 'monthly':
          currentDate = addMonths(currentDate, 1);
          break;
        default:
          return dates;
      }
      
      if (end && currentDate > end) {
        break;
      }
      
      dates.push(format(currentDate, 'yyyy-MM-dd'));
    }
    
    return dates;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          {t('schedule.createTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="grade" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                {t('schedule.gradeClass')}
              </Label>
              <Input
                id="grade"
                value={formData.grade}
                onChange={(e) => handleInputChange('grade', e.target.value)}
                placeholder={t('schedule.gradePlaceholder')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                {t('schedule.subject')}
              </Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                placeholder={t('schedule.subjectPlaceholder')}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lesson_topic">{t('schedule.lessonTopic')}</Label>
            <Input
              id="lesson_topic"
              value={formData.lesson_topic}
              onChange={(e) => handleInputChange('lesson_topic', e.target.value)}
              placeholder={t('schedule.lessonTopicPlaceholder')}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="class_date">{t('schedule.classDate')}</Label>
              <Input
                id="class_date"
                type="date"
                value={formData.class_date}
                onChange={(e) => handleInputChange('class_date', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="class_time" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {t('schedule.classTime')}
              </Label>
              <Input
                id="class_time"
                type="time"
                value={formData.class_time}
                onChange={(e) => handleInputChange('class_time', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration_minutes">{t('schedule.duration')}</Label>
            <Input
              id="duration_minutes"
              type="number"
              value={formData.duration_minutes}
              onChange={(e) => handleInputChange('duration_minutes', parseInt(e.target.value))}
              min="15"
              max="180"
              step="15"
              required
            />
          </div>

          {/* Recurring Event Options */}
          <div className="space-y-4 p-4 border rounded-lg bg-gray-50/50">
            <div className="flex items-center justify-between">
              <Label htmlFor="recurring" className="flex items-center gap-2">
                <Repeat className="w-4 h-4" />
                Make this a recurring event
              </Label>
              <Switch
                id="recurring"
                checked={recurringData.isRecurring}
                onCheckedChange={(checked) => handleRecurringChange('isRecurring', checked)}
              />
            </div>

            {recurringData.isRecurring && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select
                      value={recurringData.frequency}
                      onValueChange={(value) => handleRecurringChange('frequency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="occurrences">Number of Classes</Label>
                    <Input
                      id="occurrences"
                      type="number"
                      value={recurringData.numberOfOccurrences}
                      onChange={(e) => handleRecurringChange('numberOfOccurrences', parseInt(e.target.value))}
                      min="1"
                      max="52"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date (Optional)</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={recurringData.endDate}
                    onChange={(e) => handleRecurringChange('endDate', e.target.value)}
                    min={formData.class_date}
                  />
                  <p className="text-xs text-gray-600">
                    If set, recurring classes will stop at this date regardless of number of classes
                  </p>
                </div>

                {formData.class_date && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <CalendarDays className="w-4 h-4 inline mr-1" />
                      This will create {recurringData.numberOfOccurrences} {recurringData.frequency} classes starting from{' '}
                      {format(parseISO(formData.class_date), 'MMMM d, yyyy')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('schedule.description')}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder={t('schedule.descriptionPlaceholder')}
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? t('schedule.creating') : t('schedule.createButton')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ClassScheduleForm;
