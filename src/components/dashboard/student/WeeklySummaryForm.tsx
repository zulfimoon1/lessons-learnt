
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
        title: t('weeklySummary.fillAtLeastOne'),
        description: t('weeklySummary.fillAtLeastOneDescription'),
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
        title: t('weeklySummary.submitted'),
        description: t('weeklySummary.submittedDescription'),
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
        title: t('common.error'),
        description: t('feedback.submitError'),
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
          {t('weeklySummary.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <p className="text-brand-dark/80 mb-2">
            {t('weeklySummary.description')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-brand-dark/60">
            <div className="flex items-center gap-2 justify-center">
              <Heart className="w-4 h-4 text-pink-500" />
              <span>{t('weeklySummary.emotionalRoute')}</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <BookOpen className="w-4 h-4 text-blue-500" />
              <span>{t('weeklySummary.academicRoute')}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="emotional_concerns" className="flex items-center gap-2 text-base font-medium text-brand-dark">
              <Heart className="w-4 h-4 text-pink-500" />
              {t('weeklySummary.emotionalLabel')}
            </Label>
            <p className="text-sm text-brand-dark/60 mb-2">
              {t('weeklySummary.emotionalDescription')}
            </p>
            <Textarea
              id="emotional_concerns"
              value={formData.emotional_concerns}
              onChange={(e) => setFormData(prev => ({ ...prev, emotional_concerns: e.target.value }))}
              placeholder={t('weeklySummary.emotionalPlaceholder')}
              rows={4}
              className="resize-none border-brand-teal/20 focus:border-brand-teal"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="academic_concerns" className="flex items-center gap-2 text-base font-medium text-brand-dark">
              <BookOpen className="w-4 h-4 text-blue-500" />
              {t('weeklySummary.academicLabel')}
            </Label>
            <p className="text-sm text-brand-dark/60 mb-2">
              {t('weeklySummary.academicDescription')}
            </p>
            <Textarea
              id="academic_concerns"
              value={formData.academic_concerns}
              onChange={(e) => setFormData(prev => ({ ...prev, academic_concerns: e.target.value }))}
              placeholder={t('weeklySummary.academicPlaceholder')}
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
              {t('weeklySummary.submitAnonymously')}
            </Label>
          </div>

          <div className="flex justify-center pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-gradient-to-r from-brand-teal to-brand-orange hover:from-brand-teal/90 hover:to-brand-orange/90 text-white px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isSubmitting ? t('weeklySummary.submitting') : t('weeklySummary.submitButton')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default WeeklySummaryForm;
