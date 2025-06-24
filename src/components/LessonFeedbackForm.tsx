
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquareIcon, BookOpenIcon, EyeOffIcon } from "lucide-react";
import StarRating from "./StarRating";
import EmotionalStateSelector from "./EmotionalStateSelector";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStorage } from "@/hooks/useAuthStorage";
import { useLanguage } from "@/contexts/LanguageContext";

const LessonFeedbackForm = () => {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [lessonTopic, setLessonTopic] = useState("");
  const [understanding, setUnderstanding] = useState(0);
  const [interest, setInterest] = useState(0);
  const [growth, setGrowth] = useState(0);
  const [emotionalState, setEmotionalState] = useState("");
  const [whatWentWell, setWhatWentWell] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [additionalComments, setAdditionalComments] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { student } = useAuthStorage();
  const { t } = useLanguage();

  // Common subjects for dropdown
  const subjects = [
    "Mathematics",
    "English",
    "Science", 
    "History",
    "Geography",
    "Physics",
    "Chemistry",
    "Biology",
    "Literature",
    "Art",
    "Music",
    "Physical Education",
    "Computer Science",
    "Foreign Languages"
  ];

  const isDemoStudent = student?.id?.includes('-') && student?.full_name?.toLowerCase().includes('demo');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSubject || !lessonTopic.trim()) {
      toast({
        title: t('common.error'),
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (understanding === 0 || interest === 0 || growth === 0) {
      toast({
        title: t('common.error'),
        description: "Please provide ratings for all assessment questions",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Feedback submission for:', { 
        isDemoStudent, 
        studentId: student?.id, 
        studentName: student?.full_name 
      });

      // Create a class schedule entry for the feedback
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('class_schedules')
        .insert({
          teacher_id: '00000000-0000-0000-0000-000000000000',
          subject: selectedSubject,
          lesson_topic: lessonTopic.trim(),
          description: additionalComments.trim() || null,
          grade: student?.grade || 'Unknown',
          school: student?.school || 'Unknown',
          class_date: new Date().toISOString().split('T')[0],
          class_time: '00:00:00'
        })
        .select()
        .single();

      if (scheduleError) throw scheduleError;

      // Submit the feedback
      const { error } = await supabase
        .from('feedback')
        .insert({
          student_id: isAnonymous ? null : student?.id,
          student_name: isAnonymous ? t('demo.mockup.anonymousStudent') : student?.full_name || '',
          class_schedule_id: scheduleData.id,
          understanding: understanding,
          interest: interest,
          educational_growth: growth,
          emotional_state: emotionalState || 'neutral',
          what_went_well: whatWentWell.trim() || null,
          suggestions: suggestions.trim() || null,
          additional_comments: additionalComments.trim() || null,
          is_anonymous: isAnonymous
        });

      if (error) throw error;

      toast({
        title: t('feedback.submitted'),
        description: t('feedback.submittedDescription'),
      });

      // Reset form
      setSelectedSubject("");
      setLessonTopic("");
      setUnderstanding(0);
      setInterest(0);
      setGrowth(0);
      setEmotionalState("");
      setWhatWentWell("");
      setSuggestions("");
      setAdditionalComments("");
      setIsAnonymous(false);
    } catch (error) {
      console.error('Feedback submission error:', error);
      toast({
        title: t('common.error'),
        description: t('feedback.submitError'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-brand-teal/20 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto flex items-center justify-center mb-4">
          <MessageSquareIcon className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Share Your Learning Experience</h1>
        <p className="text-lg text-gray-600 mb-4">Help your teacher understand how to make lessons even better</p>
        {isDemoStudent && (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            👤 test student
          </Badge>
        )}
      </div>

      <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpenIcon className="w-5 h-5" />
            Lesson Details
          </CardTitle>
          <CardDescription>
            Tell us about today's lesson
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Lesson Details Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-base font-medium">
                  Subject
                </Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lessonTopic" className="text-base font-medium">
                  Lesson Topic
                </Label>
                <Input
                  id="lessonTopic"
                  value={lessonTopic}
                  onChange={(e) => setLessonTopic(e.target.value)}
                  placeholder="e.g., Fractions, Photosynthesis, Shakespeare"
                  required
                />
              </div>
            </div>

            {/* Learning Assessment Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Learning Assessment</h3>
              <p className="text-sm text-gray-600 mb-6">Rate your learning experience</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Label className="text-base font-medium">How well did you understand the lesson content?</Label>
                  <StarRating rating={understanding} onRatingChange={setUnderstanding} />
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-medium">How interesting was the lesson?</Label>
                  <StarRating rating={interest} onRatingChange={setInterest} />
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-medium">How much do you feel you learned or grew from this lesson?</Label>
                  <StarRating rating={growth} onRatingChange={setGrowth} />
                </div>
              </div>
            </div>

            {/* Emotional State Section */}
            <div>
              <Label className="text-base font-medium">Emotional State</Label>
              <p className="text-sm text-gray-600 mb-4">
                How did you feel emotionally during the lesson?
              </p>
              <p className="text-sm text-gray-500 mb-3">
                Select how you felt emotionally during the lesson. This helps your teacher understand the classroom environment.
              </p>
              <EmotionalStateSelector 
                selectedState={emotionalState} 
                onStateChange={setEmotionalState} 
              />
            </div>

            {/* Detailed Feedback Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="whatWentWell" className="text-base font-medium">
                  What went well in this lesson?
                </Label>
                <Textarea
                  id="whatWentWell"
                  value={whatWentWell}
                  onChange={(e) => setWhatWentWell(e.target.value)}
                  placeholder="Share what you liked or found helpful in the lesson"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="suggestions" className="text-base font-medium">
                  Suggestions for improvement
                </Label>
                <Textarea
                  id="suggestions"
                  value={suggestions}
                  onChange={(e) => setSuggestions(e.target.value)}
                  placeholder="What could be improved in future lessons?"
                  rows={4}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalComments" className="text-base font-medium">
                Additional comments
              </Label>
              <Textarea
                id="additionalComments"
                value={additionalComments}
                onChange={(e) => setAdditionalComments(e.target.value)}
                placeholder="Do you have any other thoughts or feedback you'd like to share?"
                rows={3}
              />
            </div>

            {/* Anonymous Option */}
            <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
              <Checkbox
                id="anonymous"
                checked={isAnonymous}
                onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
              />
              <Label htmlFor="anonymous" className="flex items-center gap-2 text-sm">
                <EyeOffIcon className="w-4 h-4 text-gray-500" />
                {t('feedback.submitAnonymously')}
              </Label>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3"
              >
                {isSubmitting ? t('feedback.submitting') : t('feedback.submitFeedback')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LessonFeedbackForm;
