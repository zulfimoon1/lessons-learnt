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
import { secureSessionService } from "@/services/secureSessionService";
import { BookOpenIcon, StarIcon, LightbulbIcon, MessageCircleIcon, EyeOffIcon, AlertCircleIcon, CheckCircle } from "lucide-react";
import VoiceInputToggle from '@/components/voice/VoiceInputToggle';
import AudioPlayer from '@/components/voice/AudioPlayer';
import EmotionalStateSelector from '@/components/EmotionalStateSelector';

const LessonFeedbackForm = () => {
  const [classes, setClasses] = useState([]);
  const [allClassesCount, setAllClassesCount] = useState(0);
  const [feedbackSubmittedCount, setFeedbackSubmittedCount] = useState(0);
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
  const [debugInfo, setDebugInfo] = useState("");

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

  // Helper function to normalize grades for comparison
  const normalizeGrade = (grade: string): string => {
    if (!grade) return '';
    // Remove common prefixes and convert to lowercase for comparison
    return grade.toLowerCase().replace(/^(grade\s*|class\s*)/i, '').trim();
  };

  // Helper function to check if grades match
  const gradesMatch = (grade1: string, grade2: string): boolean => {
    const normalized1 = normalizeGrade(grade1);
    const normalized2 = normalizeGrade(grade2);
    return normalized1 === normalized2;
  };

  useEffect(() => {
    const loadClasses = async () => {
      if (!student) {
        setDebugInfo("No student information found");
        return;
      }
      
      try {
        setIsLoading(true);
        console.log('🔍 Loading classes for student:', { 
          school: student.school, 
          grade: student.grade,
          studentId: student.id 
        });
        
        const response = await classScheduleService.getSchedulesBySchool(student.school);
        console.log('📋 Raw class schedules response:', response);
        
        if (response.data) {
          const today = new Date();
          
          // Expand time window to 30 days instead of 7
          const relevantClasses = response.data.filter((classItem: any) => {
            const classDate = new Date(classItem.class_date);
            const daysDiff = Math.abs(today.getTime() - classDate.getTime()) / (1000 * 3600 * 24);
            const isRelevantGrade = gradesMatch(classItem.grade, student.grade);
            
            console.log('🎯 Class filter check:', {
              classDate: classItem.class_date,
              classGrade: classItem.grade,
              studentGrade: student.grade,
              normalizedClassGrade: normalizeGrade(classItem.grade),
              normalizedStudentGrade: normalizeGrade(student.grade),
              gradesMatch: isRelevantGrade,
              daysDiff,
              withinTimeWindow: daysDiff <= 30
            });
            
            return daysDiff <= 30 && isRelevantGrade;
          });
          
          setAllClassesCount(relevantClasses.length);
          console.log('📊 Relevant classes found:', relevantClasses.length);

          // Get existing feedback for this student
          const { data: feedbackData, error: feedbackError } = await supabase
            .from('feedback')
            .select('class_schedule_id')
            .eq('student_id', student.id);

          if (feedbackError) {
            console.error('❌ Error fetching feedback:', feedbackError);
          } else {
            console.log('✅ Existing feedback:', feedbackData);
          }

          const feedbackClassIds = new Set(feedbackData?.map(f => f.class_schedule_id) || []);
          setFeedbackSubmittedCount(feedbackClassIds.size);

          // Filter out classes that already have feedback
          const classesNeedingFeedback = relevantClasses.filter(classItem => {
            const needsFeedback = !feedbackClassIds.has(classItem.id);
            console.log('🔄 Feedback check for class:', {
              classId: classItem.id,
              subject: classItem.subject,
              date: classItem.class_date,
              hasFeedback: feedbackClassIds.has(classItem.id),
              needsFeedback
            });
            return needsFeedback;
          });

          setClasses(classesNeedingFeedback);
          
          const debugMessage = `
            Student: ${student.school} - Grade ${student.grade} (normalized: ${normalizeGrade(student.grade)})
            Total classes in last 30 days: ${relevantClasses.length}
            Classes with feedback: ${feedbackClassIds.size}
            Classes needing feedback: ${classesNeedingFeedback.length}
            
            Grade matching examples:
            ${response.data.slice(0, 3).map(c => 
              `- Class grade: "${c.grade}" (normalized: "${normalizeGrade(c.grade)}") → Match: ${gradesMatch(c.grade, student.grade)}`
            ).join('\n            ')}
          `;
          setDebugInfo(debugMessage);
          
          console.log('📝 Final classes needing feedback:', classesNeedingFeedback);
        } else {
          setDebugInfo("No class schedule data returned from server");
        }
      } catch (error) {
        console.error('💥 Error loading classes:', error);
        setDebugInfo(`Error loading classes: ${error.message}`);
        toast({
          title: t('common.error'),
          description: "Couldn't load your classes. Please try again!",
          variant: "destructive",
        });
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
    
    console.log('🚀 LessonFeedbackForm: Form submission started');
    
    if (!selectedClass) {
      console.log('❌ No class selected');
      toast({
        title: "Pick a class first!",
        description: "Please choose which class you want to tell us about.",
        variant: "destructive",
      });
      return;
    }

    // Check if we have either text input or voice note
    const hasTextInput = whatWentWell.trim() || suggestions.trim() || additionalComments.trim();
    const hasVoiceInput = audioData.audioUrl;

    console.log('✅ Input validation:', { hasTextInput, hasVoiceInput });

    if (!hasTextInput && !hasVoiceInput) {
      console.log('❌ No input provided');
      toast({
        title: "Tell us something!",
        description: "Please write about your class or record a voice note to share your thoughts.",
        variant: "destructive",
      });
      return;
    }

    console.log('🔄 Setting submitting state to true');
    setIsSubmitting(true);

    try {
      console.log('🔐 Enhanced authentication check...');
      
      // Multiple authentication validation approaches
      let authenticatedUserId = null;
      let authMethod = '';
      
      // First try: Get Supabase session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (session?.user) {
        authenticatedUserId = session.user.id;
        authMethod = 'supabase_session';
        console.log('✅ Found Supabase session:', session.user.id);
      } else {
        console.log('⚠️ No Supabase session found');
      }
      
      // Second try: Use student context
      if (!authenticatedUserId && student?.id) {
        authenticatedUserId = student.id;
        authMethod = 'student_context';
        console.log('✅ Using student context:', student.id);
      }
      
      // Third try: Check secure session storage
      if (!authenticatedUserId) {
        const storedStudent = secureSessionService.securelyRetrieveUserData('student');
        if (storedStudent?.id) {
          authenticatedUserId = storedStudent.id;
          authMethod = 'secure_storage';
          console.log('✅ Found student in secure storage:', storedStudent.id);
        }
      }
      
      if (!authenticatedUserId) {
        console.error('❌ No valid authentication found');
        throw new Error('Please log in to submit feedback. Try refreshing the page and logging in again.');
      }
      
      console.log(`✅ Authentication validated via ${authMethod}:`, authenticatedUserId);
      
      // Prepare feedback data with enhanced error handling
      const feedbackData = {
        class_schedule_id: selectedClass,
        student_id: isAnonymous ? null : authenticatedUserId,
        student_name: isAnonymous ? 'Anonymous Student' : (student?.full_name || 'Student'),
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

      console.log('📤 Submitting feedback with data:', JSON.stringify(feedbackData, null, 2));

      // Test database connectivity first
      console.log('🔍 Testing database connectivity...');
      const { data: testQuery, error: testError } = await supabase
        .from('feedback')
        .select('id')
        .limit(1);
        
      console.log('🔍 Database test result:', { testQuery, testError });
      
      if (testError && testError.code !== 'PGRST116') { // PGRST116 is "no rows returned" which is fine
        console.error('❌ Cannot access feedback table:', testError);
        throw new Error(`Database access error: ${testError.message}`);
      }

      // Insert feedback with comprehensive error handling
      console.log('💾 About to insert feedback into database...');
      
      const insertResult = await supabase
        .from('feedback')
        .insert(feedbackData)
        .select()
        .single();

      console.log('📊 Database insert result:', insertResult);

      if (insertResult.error) {
        console.error('❌ Database error details:', {
          code: insertResult.error.code,
          message: insertResult.error.message,
          details: insertResult.error.details,
          hint: insertResult.error.hint
        });
        
        // More specific error messages
        let errorMessage = 'Oops! Something went wrong. ';
        
        switch (insertResult.error.code) {
          case '23503':
            errorMessage += 'The class you picked isn\'t valid anymore. Please refresh and try again.';
            break;
          case '23505':
            errorMessage += 'You\'ve already shared your thoughts about this class!';
            break;
          case '42501':
            errorMessage += 'You don\'t have permission to do this. Please check if you\'re logged in.';
            break;
          default:
            if (insertResult.error.message?.includes('violates row-level security policy')) {
              errorMessage += 'Access denied. Please check your login and try again.';
            } else {
              errorMessage += insertResult.error.message || 'Something unexpected happened.';
            }
        }
        
        throw new Error(errorMessage);
      }

      console.log('✅ Submission successful! Data:', insertResult.data);

      // Show success message with enhanced visibility
      toast({
        title: "🎉 Thanks for sharing!",
        description: hasVoiceInput ? 
          "Your thoughts and voice note have been saved! Your teacher will check them out soon." :
          "Your thoughts have been saved! Your teacher will read them soon.",
        variant: "default",
        className: "bg-green-50 border-green-200 text-green-800"
      });

      // Show a temporary success indicator
      const successIndicator = document.createElement('div');
      successIndicator.className = 'fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2';
      successIndicator.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>Your thoughts were shared successfully!</span>
      `;
      document.body.appendChild(successIndicator);
      
      setTimeout(() => {
        document.body.removeChild(successIndicator);
      }, 5000);

      // Reset form
      console.log('🔄 Resetting form...');
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

      console.log('✅ Form reset complete');

    } catch (error) {
      console.error('💥 Submission failed with error:', {
        message: error?.message,
        stack: error?.stack,
        type: typeof error,
        constructor: error?.constructor?.name
      });
      
      // Check if it's an auth-related error and provide helpful guidance
      let errorMessage = error instanceof Error ? error.message : "Couldn't share your thoughts right now. Please try again!";
      
      if (errorMessage.includes('session') || errorMessage.includes('auth') || errorMessage.includes('log in')) {
        // Already includes guidance in the error message
      } else {
        errorMessage += " If this keeps happening, try refreshing the page and logging in again.";
      }
      
      toast({
        title: "Oops! Something went wrong",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      console.log('🔄 Setting submitting state to false');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal"></div>
            <span className="ml-3">Loading your classes...</span>
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
          Tell Us About Your Class!
        </CardTitle>
        <CardDescription className="text-white/90">
          Share how your class went - your thoughts help make school even better!
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Debug Information */}
        {debugInfo && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircleIcon className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Class Loading Information:</span>
            </div>
            <div className="text-xs text-blue-700 whitespace-pre-line">{debugInfo}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Class Selection */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">
              Which class do you want to tell us about? 
              {classes.length === 0 && allClassesCount > 0 && (
                <span className="text-sm text-green-600 ml-2">
                  (You've shared thoughts about all {allClassesCount} recent classes! ✓)
                </span>
              )}
            </Label>
            
            {classes.length === 0 ? (
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                <div className="text-gray-600 mb-2">
                  {allClassesCount === 0 
                    ? "No classes found for your grade in the last 30 days" 
                    : `Awesome! You've shared your thoughts about all ${allClassesCount} recent classes.`
                  }
                </div>
                <div className="text-sm text-gray-500">
                  {allClassesCount === 0 && "Classes for your grade will show up here once they're scheduled."}
                  {feedbackSubmittedCount > 0 && `You've shared thoughts about ${feedbackSubmittedCount} classes!`}
                </div>
              </div>
            ) : (
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
            )}
          </div>

          {/* Only show the rest of the form if there are classes to provide feedback for */}
          {classes.length > 0 && (
            <>
              {/* Rating Sliders */}
              <div className="grid gap-6">
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-base font-semibold">
                    <BookOpenIcon className="w-5 h-5 text-blue-500" />
                    How well did you understand the lesson?: {understanding[0]}/5
                  </Label>
                  <div className="px-3">
                    <Slider
                      value={understanding}
                      onValueChange={setUnderstanding}
                      max={5}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Didn't get it</span>
                      <span>Got it perfectly!</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-base font-semibold">
                    <StarIcon className="w-5 h-5 text-yellow-500" />
                    How interesting was it?: {interest[0]}/5
                  </Label>
                  <div className="px-3">
                    <Slider
                      value={interest}
                      onValueChange={setInterest}
                      max={5}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Pretty boring</span>
                      <span>Super interesting!</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-base font-semibold">
                    <LightbulbIcon className="w-5 h-5 text-green-500" />
                    How much did you learn?: {educationalGrowth[0]}/5
                  </Label>
                  <div className="px-3">
                    <Slider
                      value={educationalGrowth}
                      onValueChange={setEducationalGrowth}
                      max={5}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Didn't learn much</span>
                      <span>Learned lots!</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Emotional State */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">How were you feeling during class?</Label>
                <EmotionalStateSelector
                  selectedState={emotionalState}
                  onStateChange={setEmotionalState}
                />
              </div>

              {/* Voice Input Toggle */}
              <div className="border-t pt-6">
                <Label className="text-base font-semibold mb-4 block">
                  Want to tell us more? You can write or record a voice note:
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
                      title="Your voice note about class"
                      showTranscription={true}
                    />
                  </div>
                )}

                {/* Text input fields - only show if not in voice mode or if we have voice but want to add text */}
                {(!audioData.audioUrl || voiceMode === 'text') && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="whatWentWell">What went really well in class?</Label>
                      <Textarea
                        id="whatWentWell"
                        placeholder="Tell us about the cool stuff that happened or what you enjoyed..."
                        value={whatWentWell}
                        onChange={(e) => setWhatWentWell(e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="suggestions">What could make class even better?</Label>
                      <Textarea
                        id="suggestions"
                        placeholder="Any ideas to make the lesson more fun or easier to understand?"
                        value={suggestions}
                        onChange={(e) => setSuggestions(e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="additionalComments">Anything else you want to share?</Label>
                      <Textarea
                        id="additionalComments"
                        placeholder="Tell us anything else about how class went..."
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
                  Share my thoughts without using my name
                </Label>
              </div>

              {/* Submit Button with enhanced feedback */}
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-brand-teal to-brand-orange hover:from-brand-teal/90 hover:to-brand-orange/90 text-white font-semibold py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sharing your thoughts...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Share My Thoughts!
                  </div>
                )}
              </Button>
            </>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default LessonFeedbackForm;
