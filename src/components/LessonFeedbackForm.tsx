
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquareIcon, BookOpenIcon, EyeOffIcon, CheckCircle, AlertCircle } from "lucide-react";
import StarRating from "./StarRating";
import EmotionalStateSelector from "./EmotionalStateSelector";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStorage } from "@/hooks/useAuthStorage";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSearchParams } from "react-router-dom";

interface ClassWithFeedback {
  id: string;
  subject: string;
  lesson_topic: string;
  class_date: string;
  class_time: string;
  teacher_name?: string;
  has_feedback: boolean;
}

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
  const [availableClasses, setAvailableClasses] = useState<ClassWithFeedback[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const { toast } = useToast();
  const { student } = useAuthStorage();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();

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

  useEffect(() => {
    if (student) {
      fetchAvailableClasses();
    }
  }, [student]);

  useEffect(() => {
    const classId = searchParams.get('classId');
    if (classId && availableClasses.length > 0) {
      const targetClass = availableClasses.find(c => c.id === classId);
      if (targetClass && !targetClass.has_feedback) {
        setSelectedClassId(classId);
        setSelectedSubject(targetClass.subject);
        setLessonTopic(targetClass.lesson_topic);
      }
    }
  }, [searchParams, availableClasses]);

  const fetchAvailableClasses = async () => {
    if (!student) return;

    try {
      // Fetch classes for the last 30 days and upcoming classes
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
      
      const { data: classData, error } = await supabase
        .from('class_schedules')
        .select('*')
        .eq('school', student.school)
        .eq('grade', student.grade)
        .gte('class_date', thirtyDaysAgoStr)
        .order('class_date', { ascending: false });

      if (error) throw error;

      // Get existing feedback for this student
      const { data: feedbackData } = await supabase
        .from('feedback')
        .select('class_schedule_id')
        .eq('student_id', student.id);

      const feedbackClassIds = new Set(feedbackData?.map(f => f.class_schedule_id) || []);

      // Fetch teacher names and mark classes with existing feedback
      const classesWithDetails = await Promise.all(
        (classData || []).map(async (classItem) => {
          const { data: teacherData } = await supabase
            .from('teachers')
            .select('name')
            .eq('id', classItem.teacher_id)
            .single();

          return {
            id: classItem.id,
            subject: classItem.subject,
            lesson_topic: classItem.lesson_topic,
            class_date: classItem.class_date,
            class_time: classItem.class_time,
            teacher_name: teacherData?.name || t('student.defaultName'),
            has_feedback: feedbackClassIds.has(classItem.id)
          };
        })
      );

      setAvailableClasses(classesWithDetails);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

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

    // Check if feedback already exists for the selected class
    if (selectedClassId) {
      const selectedClass = availableClasses.find(c => c.id === selectedClassId);
      if (selectedClass?.has_feedback) {
        toast({
          title: t('common.error'),
          description: "Feedback has already been submitted for this class",
          variant: "destructive",
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      console.log('Feedback submission for:', { 
        isDemoStudent, 
        studentId: student?.id, 
        studentName: student?.full_name 
      });

      let classScheduleId = selectedClassId;

      // If no specific class selected, create a generic class entry
      if (!classScheduleId) {
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
        classScheduleId = scheduleData.id;
      }

      // Submit the feedback
      const { error } = await supabase
        .from('feedback')
        .insert({
          student_id: isAnonymous ? null : student?.id,
          student_name: isAnonymous ? t('demo.mockup.anonymousStudent') : student?.full_name || '',
          class_schedule_id: classScheduleId,
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
      setSelectedClassId("");
      
      // Refresh available classes
      fetchAvailableClasses();
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

      {/* Available Classes Section */}
      {availableClasses.length > 0 && (
        <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpenIcon className="w-5 h-5" />
              Select a Class (Optional)
            </CardTitle>
            <CardDescription>
              Choose a specific class to provide feedback for, or leave unselected for general feedback
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="grid gap-3 max-h-60 overflow-y-auto">
              {availableClasses.map((classItem) => (
                <div
                  key={classItem.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    selectedClassId === classItem.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                  } ${classItem.has_feedback ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => {
                    if (!classItem.has_feedback) {
                      setSelectedClassId(selectedClassId === classItem.id ? "" : classItem.id);
                      if (selectedClassId !== classItem.id) {
                        setSelectedSubject(classItem.subject);
                        setLessonTopic(classItem.lesson_topic);
                      } else {
                        setSelectedSubject("");
                        setLessonTopic("");
                      }
                    }
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{classItem.subject}</h4>
                        {classItem.has_feedback && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Completed
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{classItem.lesson_topic}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(classItem.class_date).toLocaleDateString()} at {classItem.class_time} - {classItem.teacher_name}
                      </p>
                      {classItem.has_feedback && (
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Feedback already submitted for this class
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
