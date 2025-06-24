
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Star, BookOpen, TrendingUp, Heart } from "lucide-react";

interface ClassSchedule {
  id: string;
  subject: string;
  lesson_topic: string;
  class_date: string;
  class_time: string;
  teacher_id: string;
  teacher_name?: string;
}

interface FeedbackFormProps {
  student: {
    id: string;
    full_name: string;
    school: string;
    grade: string;
  };
  classScheduleId?: string | null;
  onFeedbackSubmitted?: () => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ 
  student, 
  classScheduleId, 
  onFeedbackSubmitted 
}) => {
  const [selectedClass, setSelectedClass] = useState<ClassSchedule | null>(null);
  const [availableClasses, setAvailableClasses] = useState<ClassSchedule[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [formData, setFormData] = useState({
    understanding: '',
    interest: '',
    educational_growth: '',
    emotional_state: '',
    what_went_well: '',
    suggestions: '',
    additional_comments: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAvailableClasses();
  }, [student.school, student.grade]);

  useEffect(() => {
    if (classScheduleId && availableClasses.length > 0) {
      const targetClass = availableClasses.find(c => c.id === classScheduleId);
      if (targetClass) {
        setSelectedClass(targetClass);
      }
    }
  }, [classScheduleId, availableClasses]);

  const fetchAvailableClasses = async () => {
    try {
      // Fetch recent and upcoming classes for feedback
      const { data: classData, error } = await supabase
        .from('class_schedules')
        .select('*')
        .eq('school', student.school)
        .eq('grade', student.grade)
        .gte('class_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]) // Last 7 days
        .order('class_date', { ascending: false });

      if (error) throw error;

      // Fetch teacher names separately
      const classesWithTeachers = await Promise.all(
        (classData || []).map(async (classItem) => {
          const { data: teacherData } = await supabase
            .from('teachers')
            .select('name')
            .eq('id', classItem.teacher_id)
            .single();

          return {
            ...classItem,
            teacher_name: teacherData?.name || 'Unknown Teacher'
          };
        })
      );

      setAvailableClasses(classesWithTeachers);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClass) {
      toast({
        title: "Please select a class",
        description: "Choose which class you want to provide feedback for",
        variant: "destructive",
      });
      return;
    }

    if (!formData.understanding || !formData.interest || !formData.educational_growth || !formData.emotional_state) {
      toast({
        title: "Please complete all required fields",
        description: "All rating fields are required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('feedback')
        .insert({
          class_schedule_id: selectedClass.id,
          student_id: isAnonymous ? null : student.id,
          student_name: isAnonymous ? 'Anonymous Student' : student.full_name,
          is_anonymous: isAnonymous,
          understanding: parseInt(formData.understanding),
          interest: parseInt(formData.interest),
          educational_growth: parseInt(formData.educational_growth),
          emotional_state: formData.emotional_state,
          what_went_well: formData.what_went_well.trim() || null,
          suggestions: formData.suggestions.trim() || null,
          additional_comments: formData.additional_comments.trim() || null
        });

      if (error) throw error;

      toast({
        title: "Feedback submitted successfully",
        description: "Thank you for your feedback! It will help improve future classes.",
      });

      // Reset form
      setFormData({
        understanding: '',
        interest: '',
        educational_growth: '',
        emotional_state: '',
        what_went_well: '',
        suggestions: '',
        additional_comments: ''
      });
      setSelectedClass(null);
      setIsAnonymous(false);

      onFeedbackSubmitted?.();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Class Feedback
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Share your experience about a class to help improve teaching and learning
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Class Selection */}
          <div className="space-y-3">
            <Label>Select a class to provide feedback for:</Label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {availableClasses.map((classItem) => (
                <div
                  key={classItem.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    selectedClass?.id === classItem.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedClass(classItem)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{classItem.subject}</h4>
                      <p className="text-sm text-gray-600">{classItem.lesson_topic}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(classItem.class_date).toLocaleDateString()} at {classItem.class_time} - {classItem.teacher_name}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {availableClasses.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No recent classes available for feedback
                </p>
              )}
            </div>
          </div>

          {selectedClass && (
            <>
              {/* Anonymous Option */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="anonymous"
                  checked={isAnonymous}
                  onCheckedChange={setIsAnonymous}
                />
                <Label htmlFor="anonymous">Submit feedback anonymously</Label>
              </div>

              {/* Rating Questions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    How well did you understand the lesson? *
                  </Label>
                  <RadioGroup value={formData.understanding} onValueChange={(value) => setFormData(prev => ({ ...prev, understanding: value }))}>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <div key={rating} className="flex items-center space-x-2">
                        <RadioGroupItem value={rating.toString()} id={`understanding-${rating}`} />
                        <Label htmlFor={`understanding-${rating}`} className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {rating}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    How interesting was the lesson? *
                  </Label>
                  <RadioGroup value={formData.interest} onValueChange={(value) => setFormData(prev => ({ ...prev, interest: value }))}>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <div key={rating} className="flex items-center space-x-2">
                        <RadioGroupItem value={rating.toString()} id={`interest-${rating}`} />
                        <Label htmlFor={`interest-${rating}`} className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {rating}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    How much did you learn? *
                  </Label>
                  <RadioGroup value={formData.educational_growth} onValueChange={(value) => setFormData(prev => ({ ...prev, educational_growth: value }))}>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <div key={rating} className="flex items-center space-x-2">
                        <RadioGroupItem value={rating.toString()} id={`growth-${rating}`} />
                        <Label htmlFor={`growth-${rating}`} className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {rating}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>

              {/* Emotional State */}
              <div className="space-y-3">
                <Label>How did you feel during the lesson? *</Label>
                <RadioGroup value={formData.emotional_state} onValueChange={(value) => setFormData(prev => ({ ...prev, emotional_state: value }))}>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {['excited', 'focused', 'confused', 'bored', 'stressed', 'happy', 'frustrated', 'calm'].map((emotion) => (
                      <div key={emotion} className="flex items-center space-x-2">
                        <RadioGroupItem value={emotion} id={`emotion-${emotion}`} />
                        <Label htmlFor={`emotion-${emotion}`} className="capitalize">
                          {emotion}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              {/* Text Feedback */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="what_went_well">What went well in this lesson?</Label>
                  <Textarea
                    id="what_went_well"
                    value={formData.what_went_well}
                    onChange={(e) => setFormData(prev => ({ ...prev, what_went_well: e.target.value }))}
                    placeholder="Share what you enjoyed or found helpful..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="suggestions">Any suggestions for improvement?</Label>
                  <Textarea
                    id="suggestions"
                    value={formData.suggestions}
                    onChange={(e) => setFormData(prev => ({ ...prev, suggestions: e.target.value }))}
                    placeholder="How could the lesson be improved?"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additional_comments">Additional comments</Label>
                  <Textarea
                    id="additional_comments"
                    value={formData.additional_comments}
                    onChange={(e) => setFormData(prev => ({ ...prev, additional_comments: e.target.value }))}
                    placeholder="Any other thoughts or feedback..."
                    rows={3}
                  />
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default FeedbackForm;
