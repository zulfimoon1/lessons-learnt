
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Heart, BookOpen, EyeOff } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [formData, setFormData] = useState({
    emotional_concerns: '',
    academic_concerns: ''
  });
  const { toast } = useToast();
  const { t } = useLanguage();

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
      
      // Submit emotional concerns to doctors/mental health system
      if (formData.emotional_concerns.trim()) {
        const { error: emotionalError } = await supabase
          .from('weekly_summaries')
          .insert({
            student_id: isAnonymous ? null : student.id,
            student_name: isAnonymous ? 'Anonymous Student' : student.full_name,
            school: student.school,
            grade: student.grade,
            week_start_date: weekStartDate,
            emotional_concerns: formData.emotional_concerns.trim(),
            academic_concerns: null,
            is_anonymous: isAnonymous
          });

        if (emotionalError) throw emotionalError;
      }

      // Submit academic concerns to teachers
      if (formData.academic_concerns.trim()) {
        const { error: academicError } = await supabase
          .from('weekly_summaries')
          .insert({
            student_id: isAnonymous ? null : student.id,
            student_name: isAnonymous ? 'Anonymous Student' : student.full_name,
            school: student.school,
            grade: student.grade,
            week_start_date: weekStartDate,
            emotional_concerns: null,
            academic_concerns: formData.academic_concerns.trim(),
            is_anonymous: isAnonymous
          });

        if (academicError) throw academicError;
      }

      toast({
        title: "Weekly summary submitted",
        description: "Your weekly summary has been submitted successfully. The relevant staff will review it.",
      });

      // Reset form
      setFormData({
        emotional_concerns: '',
        academic_concerns: ''
      });
      setIsAnonymous(false);

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
    <Card className="bg-white/80 backdrop-blur-sm border-brand-teal/20 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-brand-teal to-brand-orange/20 rounded-t-lg">
        <CardTitle className="flex items-center gap-3 text-white">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          Weekly Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <p className="text-brand-dark/80 mb-2">
            Share your thoughts about this week to help us provide better support.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-brand-dark/60">
            <div className="flex items-center gap-2 justify-center">
              <Heart className="w-4 h-4 text-pink-500" />
              <span>Emotional concerns → School Doctor</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <BookOpen className="w-4 h-4 text-blue-500" />
              <span>Academic concerns → Teachers</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="emotional_concerns" className="flex items-center gap-2 text-base font-medium text-brand-dark">
              <Heart className="w-4 h-4 text-pink-500" />
              How are you feeling emotionally this week?
            </Label>
            <p className="text-sm text-brand-dark/60 mb-2">
              This will be reviewed by the school doctor to provide you with mental health support.
            </p>
            <Textarea
              id="emotional_concerns"
              value={formData.emotional_concerns}
              onChange={(e) => setFormData(prev => ({ ...prev, emotional_concerns: e.target.value }))}
              placeholder="Share any emotional concerns, feelings, or thoughts you've had this week..."
              rows={4}
              className="resize-none border-brand-teal/20 focus:border-brand-teal"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="academic_concerns" className="flex items-center gap-2 text-base font-medium text-brand-dark">
              <BookOpen className="w-4 h-4 text-blue-500" />
              Any academic concerns or challenges?
            </Label>
            <p className="text-sm text-brand-dark/60 mb-2">
              This will be reviewed by your teachers to provide academic support.
            </p>
            <Textarea
              id="academic_concerns"
              value={formData.academic_concerns}
              onChange={(e) => setFormData(prev => ({ ...prev, academic_concerns: e.target.value }))}
              placeholder="Share any academic challenges, difficulties with subjects, or study concerns..."
              rows={4}
              className="resize-none border-brand-teal/20 focus:border-brand-teal"
            />
          </div>

          <div className="flex items-center space-x-2 p-4 bg-brand-teal/5 rounded-lg border border-brand-teal/20">
            <Checkbox
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
            />
            <Label htmlFor="anonymous" className="flex items-center gap-2 text-sm text-brand-dark">
              <EyeOff className="w-4 h-4 text-brand-dark/60" />
              Submit anonymously (your identity will not be shared)
            </Label>
          </div>

          <div className="flex justify-center pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-gradient-to-r from-brand-teal to-brand-orange hover:from-brand-teal/90 hover:to-brand-orange/90 text-white px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Weekly Summary'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default WeeklySummaryForm;
