
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Heart, BookOpen, EyeOff, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import VoiceInputToggle from '@/components/voice/VoiceInputToggle';
import AudioPlayer from '@/components/voice/AudioPlayer';

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
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    emotional_concerns: '',
    academic_concerns: ''
  });

  // Voice note states
  const [emotionalVoiceMode, setEmotionalVoiceMode] = useState<'text' | 'voice'>('text');
  const [academicVoiceMode, setAcademicVoiceMode] = useState<'text' | 'voice'>('text');
  const [emotionalAudioData, setEmotionalAudioData] = useState<{
    audioUrl?: string;
    transcription?: string;
    duration?: number;
  }>({});
  const [academicAudioData, setAcademicAudioData] = useState<{
    audioUrl?: string;
    transcription?: string;
    duration?: number;
  }>({});

  const { toast } = useToast();
  const { t } = useLanguage();

  const getWeekStartDate = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek;
    const weekStart = new Date(today.setDate(diff));
    return weekStart.toISOString().split('T')[0];
  };

  useEffect(() => {
    const checkExistingSubmission = async () => {
      try {
        const weekStartDate = getWeekStartDate();
        const { data, error } = await supabase
          .from('weekly_summaries')
          .select('id')
          .eq('student_id', student.id)
          .eq('week_start_date', weekStartDate);

        if (error) {
          console.error('Error checking existing submission:', error);
        } else {
          setHasSubmitted(data && data.length > 0);
        }
      } catch (error) {
        console.error('Error checking submission:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingSubmission();
  }, [student.id]);

  const handleEmotionalVoiceComplete = (audioUrl: string, transcription?: string, duration?: number) => {
    console.log('WeeklySummaryForm: Emotional voice recording completed:', { audioUrl, transcription, duration });
    setEmotionalAudioData({ audioUrl, transcription, duration });
    
    if (transcription) {
      setFormData(prev => ({ ...prev, emotional_concerns: transcription }));
    }
  };

  const handleAcademicVoiceComplete = (audioUrl: string, transcription?: string, duration?: number) => {
    console.log('WeeklySummaryForm: Academic voice recording completed:', { audioUrl, transcription, duration });
    setAcademicAudioData({ audioUrl, transcription, duration });
    
    if (transcription) {
      setFormData(prev => ({ ...prev, academic_concerns: transcription }));
    }
  };

  const handleEmotionalTextMode = () => {
    setEmotionalVoiceMode('text');
  };

  const handleAcademicTextMode = () => {
    setAcademicVoiceMode('text');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if we have either text input or voice notes
    const hasEmotionalInput = formData.emotional_concerns.trim() || emotionalAudioData.audioUrl;
    const hasAcademicInput = formData.academic_concerns.trim() || academicAudioData.audioUrl;

    if (!hasEmotionalInput && !hasAcademicInput) {
      toast({
        title: "Looks like you haven't shared anything yet!",
        description: "Tell us about your feelings or school stuff - we want to help you!",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const weekStartDate = getWeekStartDate();
      
      const summaryData = {
        student_id: isAnonymous ? null : student.id,
        student_name: isAnonymous ? 'Anonymous Student' : student.full_name,
        school: student.school,
        grade: student.grade,
        week_start_date: weekStartDate,
        emotional_concerns: formData.emotional_concerns.trim() || null,
        academic_concerns: formData.academic_concerns.trim() || null,
        is_anonymous: isAnonymous,
        // Emotional voice fields
        emotional_audio_url: emotionalAudioData.audioUrl || null,
        emotional_transcription: emotionalAudioData.transcription || null,
        // Academic voice fields
        academic_audio_url: academicAudioData.audioUrl || null,
        academic_transcription: academicAudioData.transcription || null,
        // Combined audio metadata
        audio_duration: Math.max(emotionalAudioData.duration || 0, academicAudioData.duration || 0) || null,
        audio_file_size: null // Could be added to voice service
      };

      console.log('WeeklySummaryForm: Submitting with voice data:', summaryData);

      const { error } = await supabase
        .from('weekly_summaries')
        .insert(summaryData);

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "You already told us about this week!",
            description: "Thanks for sharing - we got your thoughts already this week.",
            variant: "destructive",
          });
          setHasSubmitted(true);
        } else {
          throw error;
        }
      } else {
        const hasVoiceNotes = emotionalAudioData.audioUrl || academicAudioData.audioUrl;
        
        toast({
          title: "Thanks for sharing with us!",
          description: hasVoiceNotes ? 
            "We got your message and voice notes - thanks for telling us how you're doing!" :
            "We got your message - thanks for telling us how you're doing!",
        });

        // Reset form
        setFormData({
          emotional_concerns: '',
          academic_concerns: ''
        });
        setIsAnonymous(false);
        setEmotionalAudioData({});
        setAcademicAudioData({});
        setEmotionalVoiceMode('text');
        setAcademicVoiceMode('text');
        setHasSubmitted(true);
        onSubmitted?.();
      }
    } catch (error) {
      console.error('Error submitting weekly summary:', error);
      toast({
        title: "Oops! Something went wrong",
        description: "We couldn't save your message right now. Want to try again?",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-brand-teal/20 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hasSubmitted) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-brand-teal/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
            You Already Shared This Week!
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-brand-dark mb-2">
              Thanks for telling us how you're doing!
            </h3>
            <p className="text-brand-dark/70">
              You already shared your thoughts with us this week. 
              We've got your message and the right people will take a look to help you out.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-brand-teal/20 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-brand-teal to-brand-orange/20 rounded-t-lg">
        <CardTitle className="flex items-center gap-3 text-white">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          Tell Us About Your Week!
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <p className="text-brand-dark/80 mb-4 text-lg font-medium">
            Share your thoughts about this week to help us give you better support.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-orange-100 p-3 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 mb-1">
                <Heart className="w-4 h-4 text-orange-600" />
                <span className="font-semibold text-gray-800">How You're Feeling → School Doctor</span>
              </div>
              <p className="text-xs text-gray-700">
                Tell us about your emotions, friendships, stress, or anything that's on your mind
              </p>
            </div>
            <div className="bg-teal-100 p-3 rounded-lg border border-teal-200">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-4 h-4 text-teal-600" />
                <span className="font-semibold text-gray-800">School Stuff → Teachers</span>
              </div>
              <p className="text-xs text-gray-700">
                Share about your classes, homework, tests, or anything school-related
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Emotional Concerns Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500" />
              <Label htmlFor="emotional_concerns" className="text-base font-medium text-brand-dark">
                How are you feeling emotionally this week?
              </Label>
            </div>
            <p className="text-sm text-brand-dark/60 mb-2">
              This will be looked at by the school doctor to help you with your feelings and mental health.
            </p>

            <VoiceInputToggle
              onVoiceComplete={handleEmotionalVoiceComplete}
              onTextMode={handleEmotionalTextMode}
              disabled={isSubmitting}
              className="mb-4"
            />

            {emotionalAudioData.audioUrl && (
              <AudioPlayer
                audioUrl={emotionalAudioData.audioUrl}
                transcription={emotionalAudioData.transcription}
                duration={emotionalAudioData.duration}
                title="My feelings voice message"
                showTranscription={true}
                className="mb-4"
              />
            )}

            {(!emotionalAudioData.audioUrl || emotionalVoiceMode === 'text') && (
              <Textarea
                id="emotional_concerns"
                value={formData.emotional_concerns}
                onChange={(e) => setFormData(prev => ({ ...prev, emotional_concerns: e.target.value }))}
                placeholder="Share any feelings, worries, or thoughts you've had this week..."
                rows={4}
                className="resize-none border-brand-teal/20 focus:border-brand-teal"
              />
            )}
          </div>

          {/* Academic Concerns Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              <Label htmlFor="academic_concerns" className="text-base font-medium text-brand-dark">
                Any school challenges or difficulties?
              </Label>
            </div>
            <p className="text-sm text-brand-dark/60 mb-2">
              This will be looked at by your teachers to help you with school work and learning.
            </p>

            <VoiceInputToggle
              onVoiceComplete={handleAcademicVoiceComplete}
              onTextMode={handleAcademicTextMode}
              disabled={isSubmitting}
              className="mb-4"
            />

            {academicAudioData.audioUrl && (
              <AudioPlayer
                audioUrl={academicAudioData.audioUrl}
                transcription={academicAudioData.transcription}
                duration={academicAudioData.duration}
                title="My school concerns voice message"
                showTranscription={true}
                className="mb-4"
              />
            )}

            {(!academicAudioData.audioUrl || academicVoiceMode === 'text') && (
              <Textarea
                id="academic_concerns"
                value={formData.academic_concerns}
                onChange={(e) => setFormData(prev => ({ ...prev, academic_concerns: e.target.value }))}
                placeholder="Share any school challenges, trouble with subjects, or study concerns..."
                rows={4}
                className="resize-none border-brand-teal/20 focus:border-brand-teal"
              />
            )}
          </div>

          {/* Anonymous Option */}
          <div className="flex items-center space-x-2 p-4 bg-brand-teal/5 rounded-lg border border-brand-teal/20">
            <Checkbox
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
            />
            <Label htmlFor="anonymous" className="flex items-center gap-2 text-sm text-brand-dark">
              <EyeOff className="w-4 h-4 text-brand-dark/60" />
              Keep my name private (they won't know it's from me)
            </Label>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-gradient-to-r from-brand-teal to-brand-orange hover:from-brand-teal/90 hover:to-brand-orange/90 text-white px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isSubmitting ? 'Sending Your Message...' : 'Send My Thoughts!'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default WeeklySummaryForm;
