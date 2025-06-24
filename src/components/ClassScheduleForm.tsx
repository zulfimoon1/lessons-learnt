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
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    
    // Basic validation
    if (!formData.subject || !formData.lesson_topic || !formData.class_date || 
        !formData.class_time || !formData.school || !formData.grade) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!teacher?.id) {
      toast({
        title: "Error",
        description: "Teacher information not found. Please login again.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('🔄 Starting class scheduling process...');
      console.log('📧 Teacher:', teacher);
      console.log('📝 Form data:', formData);
      
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
          description: formData.description || '',
          teacher_id: teacher.id
        }));

        console.log('📅 Inserting recurring schedules:', schedules.length, 'classes');

        // Insert schedules one by one to handle any individual failures
        let successCount = 0;
        const errors = [];

        for (const schedule of schedules) {
          try {
            const { error } = await supabase
              .from('class_schedules')
              .insert(schedule);

            if (error) {
              console.error('❌ Failed to insert schedule:', error);
              errors.push(error.message);
            } else {
              successCount++;
              console.log('✅ Successfully inserted schedule for date:', schedule.class_date);
            }
          } catch (err) {
            console.error('❌ Exception inserting schedule:', err);
            errors.push(err.message);
          }
        }

        if (successCount > 0) {
          toast({
            title: "Success",
            description: `${successCount} classes scheduled successfully!${errors.length > 0 ? ` ${errors.length} failed.` : ''}`,
          });
        } else {
          throw new Error(`Failed to create any schedules: ${errors.join(', ')}`);
        }
      } else {
        // Single schedule entry
        const scheduleData = {
          subject: formData.subject,
          lesson_topic: formData.lesson_topic,
          class_date: formData.class_date,
          class_time: formData.class_time,
          duration_minutes: formData.duration_minutes,
          school: formData.school,
          grade: formData.grade,
          description: formData.description || '',
          teacher_id: teacher.id
        };

        console.log('📅 Inserting single schedule:', scheduleData);

        const { error } = await supabase
          .from('class_schedules')
          .insert(scheduleData);

        if (error) {
          console.error('❌ Database error inserting schedule:', error);
          throw new Error(`Failed to create schedule: ${error.message}`);
        }

        console.log('✅ Successfully inserted schedule');

        toast({
          title: "Success",
          description: "Class scheduled successfully!",
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
      console.error('💥 Error scheduling class:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to schedule class. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.subject && formData.lesson_topic && formData.class_date && 
                     formData.class_time && formData.school && formData.grade;

  const isRecurrenceEndDateValid = !formData.is_recurring || 
                                  !formData.recurrence_end_date ||
                                  (formData.recurrence_end_date && new Date(formData.recurrence_end_date) > new Date(formData.class_date));

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
              <BookOpenIcon className="w-5 h-5" />
              Class Details
            </CardTitle>
            <CardDescription>Enter the details for your class</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subject" className="text-gray-700 font-medium">Subject</Label>
                <Select value={formData.subject} onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject" />
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
                <Label htmlFor="lesson_topic" className="text-gray-700 font-medium">Lesson Topic</Label>
                <Input
                  id="lesson_topic"
                  placeholder="Enter lesson topic"
                  value={formData.lesson_topic}
                  onChange={(e) => setFormData(prev => ({ ...prev, lesson_topic: e.target.value }))}
                  className="border-gray-200"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-gray-700 font-medium">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter class description"
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
              Schedule Details
            </CardTitle>
            <CardDescription>Set the date and time for your class</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="class_date" className="text-gray-700 font-medium">Date</Label>
                <Input
                  id="class_date"
                  type="date"
                  value={formData.class_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, class_date: e.target.value }))}
                  className="border-gray-200"
                />
              </div>
              <div>
                <Label htmlFor="class_time" className="text-gray-700 font-medium">Time</Label>
                <Input
                  id="class_time"
                  type="time"
                  value={formData.class_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, class_time: e.target.value }))}
                  className="border-gray-200"
                />
              </div>
              <div>
                <Label htmlFor="duration_minutes" className="text-gray-700 font-medium">Duration</Label>
                <Select value={formData.duration_minutes.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, duration_minutes: parseInt(value) }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="60" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                    <SelectItem value="120">120 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="school" className="text-gray-700 font-medium">School</Label>
                <Input
                  id="school"
                  placeholder="Enter school name"
                  value={formData.school}
                  onChange={(e) => setFormData(prev => ({ ...prev, school: e.target.value }))}
                  className="border-gray-200"
                />
              </div>
              <div>
                <Label htmlFor="grade" className="text-gray-700 font-medium">Class/Grade</Label>
                <Input
                  id="grade"
                  placeholder="Enter class or grade"
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
              Recurring Schedule
            </CardTitle>
            <CardDescription>Set up recurring classes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_recurring"
                checked={formData.is_recurring}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_recurring: checked }))}
              />
              <Label htmlFor="is_recurring" className="text-gray-700 font-medium">
                Make this a recurring class
              </Label>
            </div>

            {formData.is_recurring && (
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="recurrence_pattern" className="text-gray-700 font-medium">Repeat Pattern</Label>
                    <Select 
                      value={formData.recurrence_pattern} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, recurrence_pattern: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="number_of_occurrences" className="text-gray-700 font-medium">Number of Classes</Label>
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
                    <Label htmlFor="recurrence_end_date" className="text-gray-700 font-medium">End Date</Label>
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
                  <p className="text-sm text-red-600">End date must be after start date</p>
                )}

                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-sm text-purple-700">
                    <strong>Preview:</strong> {formData.number_of_occurrences} classes will be scheduled starting from {formData.class_date && new Date(formData.class_date).toLocaleDateString()} ({formData.recurrence_pattern}ly)
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="sticky bottom-4 z-10 pt-6">
          <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-xl">
            <Button 
              type="submit" 
              disabled={!isFormValid || !isRecurrenceEndDateValid || isSubmitting}
              size="lg"
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-6 text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Save className="w-6 h-6 mr-3" />
              {isSubmitting ? (
                "Scheduling..."
              ) : (
                formData.is_recurring ? 
                  `Schedule ${formData.number_of_occurrences} Classes` : 
                  "Schedule Class"
              )}
            </Button>
            
            {!isFormValid && (
              <p className="text-center text-sm text-red-600 mt-2">
                Please fill in all required fields to schedule a class
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default ClassScheduleForm;
