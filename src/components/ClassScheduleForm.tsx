
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { classScheduleService } from '@/services/classScheduleService';
import { Calendar, Clock, BookOpen, Users } from 'lucide-react';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Submitting schedule with teacher data:', { teacher, formData });
      
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
        title: "Success",
        description: "Class schedule created successfully",
      });

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

      onScheduleCreated?.();
    } catch (error) {
      console.error('Error creating schedule:', error);
      toast({
        title: "Error",
        description: "Failed to create class schedule. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Create Class Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="grade" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Grade/Class
              </Label>
              <Input
                id="grade"
                value={formData.grade}
                onChange={(e) => handleInputChange('grade', e.target.value)}
                placeholder="e.g., 5A, Grade 10"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Subject
              </Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                placeholder="e.g., Mathematics, English"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lesson_topic">Lesson Topic</Label>
            <Input
              id="lesson_topic"
              value={formData.lesson_topic}
              onChange={(e) => handleInputChange('lesson_topic', e.target.value)}
              placeholder="e.g., Algebra Basics, Shakespeare's Hamlet"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="class_date">Class Date</Label>
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
                Class Time
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
            <Label htmlFor="duration_minutes">Duration (minutes)</Label>
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

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Additional notes about the lesson..."
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Class Schedule'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ClassScheduleForm;
