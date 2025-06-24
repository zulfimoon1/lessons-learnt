
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Heart, BookOpen } from "lucide-react";

interface WeeklySummaryFormProps {
  student: {
    id: string;
    full_name: string;
    school: string;
    grade: string;
  };
  onSubmitted?: () => void;
}

const WeeklySummaryForm: React.FC<WeeklySummaryFormProps> = ({ student, onSubmitted }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    emotional_concerns: '',
    academic_concerns: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.emotional_concerns.trim() && !formData.academic_concerns.trim()) {
      toast({
        title: "Please fill in at least one section",
        description: "Add either emotional or academic concerns to submit your weekly summary",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const weekStartDate = getWeekStartDate();
      
      const { error } = await supabase
        .from('weekly_summaries')
        .insert({
          student_id: student.id,
          student_name: student.full_name,
          school: student.school,
          grade: student.grade,
          week_start_date: weekStartDate,
          emotional_concerns: formData.emotional_concerns.trim() || null,
          academic_concerns: formData.academic_concerns.trim() || null
        });

      if (error) throw error;

      toast({
        title: "Weekly summary submitted",
        description: "Your weekly summary has been submitted successfully. The school doctor will review it.",
      });

      // Reset form
      setFormData({
        emotional_concerns: '',
        academic_concerns: ''
      });

      onSubmitted?.();
    } catch (error) {
      console.error('Error submitting weekly summary:', error);
      toast({
        title: "Error",
        description: "Failed to submit weekly summary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWeekStartDate = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek;
    const weekStart = new Date(today.setDate(diff));
    return weekStart.toISOString().split('T')[0];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Weekly Summary
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Share your thoughts about this week. This information will be reviewed by the school doctor to provide you with better support.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="emotional_concerns" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              How are you feeling emotionally this week?
            </Label>
            <Textarea
              id="emotional_concerns"
              value={formData.emotional_concerns}
              onChange={(e) => setFormData(prev => ({ ...prev, emotional_concerns: e.target.value }))}
              placeholder="Share any emotional concerns, feelings, or thoughts you've had this week..."
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              This is a safe space to share your feelings. Your privacy is protected.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="academic_concerns" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Any academic concerns or challenges?
            </Label>
            <Textarea
              id="academic_concerns"
              value={formData.academic_concerns}
              onChange={(e) => setFormData(prev => ({ ...prev, academic_concerns: e.target.value }))}
              placeholder="Share any academic challenges, difficulties with subjects, or study concerns..."
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Help us understand if you need additional academic support.
            </p>
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Weekly Summary'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default WeeklySummaryForm;
