import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { classScheduleService } from "@/services/classScheduleService";
import { BookOpenIcon, StarIcon, LightbulbIcon, MessageCircleIcon, EyeOffIcon } from "lucide-react";
import VoiceInputToggle from '@/components/voice/VoiceInputToggle';
import AudioPlayer from '@/components/voice/AudioPlayer';
import EmotionalStateSelector from '@/components/EmotionalStateSelector';

const LessonFeedbackForm = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [understanding, setUnderstanding] = useState([3]);
  const [interest, setInterest] = useState([3]);
  const [educationalGrowth, setEducationalGrowth] = useState([3]);
  const [emotionalState, setEmotionalState] = useState("");
  const [whatWentWell, setWhatWentWell] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [additionalComments, setAdditionalComments] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Voice note states
  const [voiceMode, setVoiceMode] = useState<'text' | 'voice'>('text');
  const [audioData, setAudioData] = useState<{
    audioUrl?: string;
    transcription?: string;
    duration?: number;
  }>({});

  const { toast } = useToast();
  const { t } = useLanguage();
  const { student } = useAuth();

  useEffect(() => {
    const loadClasses = async () => {
      if (!student) return;
      
      try {
        setIsLoading(true);
        const response = await classScheduleService.getSchedulesBySchool(student.school);
        if (response.data) {
          const today = new Date();
          const relevantClasses = response.data.filter((classItem: any) => {
            const classDate = new Date(classItem.class_date);
            const daysDiff = Math.abs(today.getTime() - classDate.getTime()) / (1000 * 3600 * 24);
            return daysDiff <= 7 && classItem.grade === student.grade;
          });
          setClasses(relevantClasses);
        }
      } catch (error) {
        console.error('Error loading classes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadClasses();
  }, [student]);

  const handleVoiceComplete = (audioUrl: string, transcription?: string, duration?: number) => {
    console.log('LessonFeedbackForm: Voice recording completed:', { audioUrl, transcription, duration });
    setAudioData({ audioUrl, transcription, duration });
    
    // If we have transcription, populate the text fields
    if (transcription) {
      setAdditionalComments(transcription);
    }
  };

  const handleTextMode = () => {
    console.log('LessonFeedbackForm: Switched to text mode');
    setVoiceMode('text');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('LessonFeedbackForm: Form submission started');
    console.log('Selected class:', selectedClass);
    console.log('Audio data:', audioData);
    console.log('Text data:', { whatWentWell, suggestions, additionalComments });
    console.log('Student info:', student);
    
    if (!selectedClass) {
      toast({
        title: t('feedback.selectClass'),
        description: t('feedback.selectClassDesc'),
        variant: "destructive",
      });
      return;
    }

    // Check if we have either text input or voice note
    const hasTextInput = whatWentWell.trim() || suggestions.trim() || additionalComments.trim();
    const hasVoiceInput = audioData.audioUrl;

    console.log('LessonFeedbackForm: Input validation:', { hasTextInput, hasVoiceInput });

    if (!hasTextInput && !hasVoiceInput) {
      toast({
        title: "Please provide feedback",
        description: "Please either write your feedback or record a voice note.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('LessonFeedbackForm: Preparing feedback data...');
      
      // Get the current user from Supabase auth
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('LessonFeedbackForm: Auth error:', authError);
        throw new Error(`Authentication error: ${authError.message}`);
      }
      
      if (!user) {
        console.error('LessonFeedbackForm: No authenticated user found');
        throw new Error('You must be logged in to submit feedback');
      }
      
      console.log('LessonFeedbackForm: Authenticated user:', user.id);
      
      // Prepare feedback data with better error handling
      const feedbackData = {
        class_schedule_id: selectedClass,
        student_id: isAnonymous ? null : (student?.id || user.id),
        student_name: isAnonymous ? t('feedback.anonymous') : (student?.full_name || 'Unknown Student'),
        understanding: understanding[0] || 3,
        interest: interest[0] || 3,
        educational_growth: educationalGrowth[0] || 3,
        emotional_state: emotionalState || null,
        what_went_well: whatWentWell.trim() || null,
        suggestions: suggestions.trim() || null,
        additional_comments: additionalComments.trim() || null,
        is_anonymous: isAnonymous,
        // Voice note fields
        audio_url: audioData.audioUrl || null,
        transcription: audioData.transcription || null,
        audio_duration: audioData.duration || null,
        audio_file_size: null
      };

      console.log('LessonFeedbackForm: Submitting feedback with data:', feedbackData);

      // First, let's test if we can access the feedback table at all
      const { data: testQuery, error: testError } = await supabase
        .from('feedback')
        .select('id')
        .limit(1);
        
      console.log('LessonFeedbackForm: Test query result:', { testQuery, testError });
      
      if (testError) {
        console.error('LessonFeedbackForm: Cannot access feedback table:', testError);
        throw new Error(`Database access error: ${testError.message}`);
      }

      // Insert feedback with better error handling
      console.log('LessonFeedbackForm: About to insert feedback...');
      const insertResult = await supabase
        .from('feedback')
        .insert(feedbackData)
        .select()
        .single();

      console.log('LessonFeedbackForm: Insert result:', insertResult);

      if (insertResult.error) {
        console.error('LessonFeedbackForm: Database error details:', insertResult.error);
        console.error('LessonFeedbackForm: Error code:', insertResult.error.code);
        console.error('LessonFeedbackForm: Error message:', insertResult.error.message);
        console.error('LessonFeedbackForm: Error details:', insertResult.error.details);
        console.error('LessonFeedbackForm: Error hint:', insertResult.error.hint);
        
        // More specific error messages
        if (insertResult.error.code === '23503') {
          throw new Error('Invalid class selection. Please refresh the page and try again.');
        } else if (insertResult.error.code === '23505') {
          throw new Error('You have already submitted feedback for this class.');
        } else if (insertResult.error.code === '42501') {
          throw new Error('Permission denied. Please check your access rights.');
        } else if (insertResult.error.message.includes('violates row-level security policy')) {
          throw new Error('Access denied. Please check your login status and try again.');
        } else {
          throw new Error(`Database error: ${insertResult.error.message || 'Unknown database error'}`);
        }
      }

      console.log('LessonFeedbackForm: Submission successful:', insertResult.data);

      toast({
        title: t('feedback.submitted'),
        description: hasVoiceInput ? 
          "Your feedback and voice note have been submitted successfully!" :
          t('feedback.submittedDesc'),
      });

      // Reset form
      console.log('LessonFeedbackForm: Resetting form...');
      setSelectedClass("");
      setUnderstanding([3]);
      setInterest([3]);
      setEducationalGrowth([3]);
      setEmotionalState("");
      setWhatWentWell("");
      setSuggestions("");
      setAdditionalComments("");
      setIsAnonymous(false);
      setAudioData({});
      setVoiceMode('text');

    } catch (error) {
      console.error('LessonFeedbackForm: Submission failed:', error);
      console.error('LessonFeedbackForm: Error type:', typeof error);
      console.error('LessonFeedbackForm: Error constructor:', error?.constructor?.name);
      console.error('LessonFeedbackForm: Full error object:', JSON.stringify(error, null, 2));
      
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-brand-teal to-brand-orange text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-3">
          <MessageCircleIcon className="w-6 h-6" />
          {t('feedback.title')}
        </CardTitle>
        <CardDescription className="text-white/90">
          {t('feedback.description')}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Class Selection */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">{t('feedback.selectClass')}</Label>
            <RadioGroup value={selectedClass} onValueChange={setSelectedClass}>
              {classes.map((classItem: any) => (
                <div key={classItem.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value={classItem.id} id={classItem.id} />
                  <label htmlFor={classItem.id} className="flex-1 cursor-pointer">
                    <div className="font-medium">{classItem.subject} - {classItem.lesson_topic}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(classItem.class_date).toLocaleDateString()} at {classItem.class_time}
                    </div>
                  </label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Rating Sliders */}
          <div className="grid gap-6">
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-base font-semibold">
                <BookOpenIcon className="w-5 h-5 text-blue-500" />
                {t('feedback.understanding')}: {understanding[0]}/5
              </Label>
              <Slider
                value={understanding}
                onValueChange={setUnderstanding}
                max={5}
                min={1}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-base font-semibold">
                <StarIcon className="w-5 h-5 text-yellow-500" />
                {t('feedback.interest')}: {interest[0]}/5
              </Label>
              <Slider
                value={interest}
                onValueChange={setInterest}
                max={5}
                min={1}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-base font-semibold">
                <LightbulbIcon className="w-5 h-5 text-green-500" />
                {t('feedback.growth')}: {educationalGrowth[0]}/5
              </Label>
              <Slider
                value={educationalGrowth}
                onValueChange={setEducationalGrowth}
                max={5}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          {/* Emotional State - Using the proper EmotionalStateSelector component */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">{t('feedback.emotionalState')}</Label>
            <EmotionalStateSelector
              selectedState={emotionalState}
              onStateChange={setEmotionalState}
            />
          </div>

          {/* Voice Input Toggle */}
          <div className="border-t pt-6">
            <Label className="text-base font-semibold mb-4 block">
              Choose how to share your detailed feedback:
            </Label>
            
            <VoiceInputToggle
              onVoiceComplete={handleVoiceComplete}
              onTextMode={handleTextMode}
              disabled={isSubmitting}
              className="mb-4"
            />

            {/* Show audio player if voice note exists */}
            {audioData.audioUrl && (
              <div className="mb-4">
                <AudioPlayer
                  audioUrl={audioData.audioUrl}
                  transcription={audioData.transcription}
                  duration={audioData.duration}
                  title="Your feedback voice note"
                  showTranscription={true}
                />
              </div>
            )}

            {/* Text input fields - only show if not in voice mode or if we have voice but want to add text */}
            {(!audioData.audioUrl || voiceMode === 'text') && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="whatWentWell">{t('feedback.whatWentWell')}</Label>
                  <Textarea
                    id="whatWentWell"
                    placeholder={t('feedback.whatWentWellPlaceholder')}
                    value={whatWentWell}
                    onChange={(e) => setWhatWentWell(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                <div>
                  <Label htmlFor="suggestions">{t('feedback.suggestions')}</Label>
                  <Textarea
                    id="suggestions"
                    placeholder={t('feedback.suggestionsPlaceholder')}
                    value={suggestions}
                    onChange={(e) => setSuggestions(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                <div>
                  <Label htmlFor="additionalComments">{t('feedback.additionalComments')}</Label>
                  <Textarea
                    id="additionalComments"
                    placeholder={t('feedback.additionalCommentsPlaceholder')}
                    value={additionalComments}
                    onChange={(e) => setAdditionalComments(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Anonymous Option */}
          <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
            <Checkbox
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
            />
            <Label htmlFor="anonymous" className="flex items-center gap-2">
              <EyeOffIcon className="w-4 h-4" />
              {t('feedback.submitAnonymously')}
            </Label>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-brand-teal to-brand-orange hover:from-brand-teal/90 hover:to-brand-orange/90"
          >
            {isSubmitting ? t('feedback.submitting') : t('feedback.submit')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default LessonFeedbackForm;
