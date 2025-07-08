import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Heart, Star, Lightbulb, EyeOff, MessageSquare } from "lucide-react";
import VoiceInputToggle from '@/components/voice/VoiceInputToggle';
import AudioPlayer from '@/components/voice/AudioPlayer';
import EmotionalStateSelector from '@/components/EmotionalStateSelector';

interface SimpleFeedbackFormProps {
  classInfo: {
    id: string;
    lesson_topic: string;
    subject: string;
    class_date: string;
    class_time: string;
  };
  onSuccess: () => void;
  onBack: () => void;
}

const SimpleFeedbackForm: React.FC<SimpleFeedbackFormProps> = ({
  classInfo,
  onSuccess,
  onBack
}) => {
  const [understanding, setUnderstanding] = useState([3]);
  const [interest, setInterest] = useState([3]);
  const [educationalGrowth, setEducationalGrowth] = useState([3]);
  const [emotionalState, setEmotionalState] = useState("");
  const [whatWentWell, setWhatWentWell] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [additionalComments, setAdditionalComments] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Voice note states
  const [audioData, setAudioData] = useState<{
    audioUrl?: string;
    transcription?: string;
    duration?: number;
  }>({});

  const { toast } = useToast();
  const { student } = useAuth();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleVoiceComplete = (audioUrl: string, transcription?: string, duration?: number) => {
    setAudioData({ audioUrl, transcription, duration });
    if (transcription) {
      setAdditionalComments(transcription);
    }
  };

  const handleTextMode = () => {
    // Reset voice data when switching to text mode
    setAudioData({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const hasTextInput = whatWentWell.trim() || suggestions.trim() || additionalComments.trim();
    const hasVoiceInput = audioData.audioUrl;

    if (!hasTextInput && !hasVoiceInput) {
      toast({
        title: "Tell us something!",
        description: "Please share your thoughts about the class.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const feedbackData = {
        class_schedule_id: classInfo.id,
        student_id: isAnonymous ? null : student?.id,
        student_name: isAnonymous ? 'Anonymous Student' : (student?.full_name || 'Student'),
        understanding: understanding[0],
        interest: interest[0],
        educational_growth: educationalGrowth[0],
        emotional_state: emotionalState || null,
        what_went_well: whatWentWell.trim() || null,
        suggestions: suggestions.trim() || null,
        additional_comments: additionalComments.trim() || null,
        is_anonymous: isAnonymous,
        audio_url: audioData.audioUrl || null,
        transcription: audioData.transcription || null,
        audio_duration: audioData.duration || null,
        audio_file_size: null
      };

      const { error } = await supabase
        .from('feedback')
        .insert(feedbackData);

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Already shared!",
            description: "You've already shared your thoughts about this class.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Thanks for sharing! 🎉",
          description: "Your teacher will read your thoughts soon.",
        });
        onSuccess();
      }
    } catch (error) {
      console.error('Feedback submission error:', error);
      toast({
        title: "Something went wrong",
        description: "Couldn't save your feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6" />
          How was this class?
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-lg mb-1">{classInfo.lesson_topic}</h3>
          <p className="text-gray-600">{classInfo.subject}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Quick Ratings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                How well did you understand?
              </Label>
              <Slider
                value={understanding}
                onValueChange={setUnderstanding}
                max={5}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Confused</span>
                <span>Got it!</span>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Star className="w-4 h-4 text-orange-500" />
                How interesting was it?
              </Label>
              <Slider
                value={interest}
                onValueChange={setInterest}
                max={5}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Boring</span>
                <span>Amazing!</span>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                Did you learn something new?
              </Label>
              <Slider
                value={educationalGrowth}
                onValueChange={setEducationalGrowth}
                max={5}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Not really</span>
                <span>So much!</span>
              </div>
            </div>
          </div>

          {/* Emotional State */}
          <div className="space-y-3">
            <Label>How did you feel during class?</Label>
            <EmotionalStateSelector
              selectedState={emotionalState}
              onStateChange={setEmotionalState}
            />
          </div>

          {/* Text Feedback */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="whatWentWell">What went well in this class?</Label>
              <Textarea
                id="whatWentWell"
                value={whatWentWell}
                onChange={(e) => setWhatWentWell(e.target.value)}
                placeholder="Tell us what you enjoyed or what worked well..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="suggestions">What could be better?</Label>
              <Textarea
                id="suggestions"
                value={suggestions}
                onChange={(e) => setSuggestions(e.target.value)}
                placeholder="Any suggestions to make the class even better..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalComments">Anything else you want to share?</Label>
              
              <VoiceInputToggle
                onVoiceComplete={handleVoiceComplete}
                onTextMode={handleTextMode}
                disabled={isSubmitting}
                className="mb-4"
              />

              {audioData.audioUrl && (
                <AudioPlayer
                  audioUrl={audioData.audioUrl}
                  transcription={audioData.transcription}
                  duration={audioData.duration}
                  title="Your voice message"
                  showTranscription={true}
                  className="mb-4"
                />
              )}

              <Textarea
                id="additionalComments"
                value={additionalComments}
                onChange={(e) => setAdditionalComments(e.target.value)}
                placeholder="Any other thoughts or feelings about the class..."
                rows={3}
              />
            </div>
          </div>

          {/* Anonymous Option */}
          <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
            <Checkbox
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
            />
            <Label htmlFor="anonymous" className="flex items-center gap-2">
              <EyeOff className="w-4 h-4" />
              Keep my name private
            </Label>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Sharing...' : 'Share My Thoughts'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SimpleFeedbackForm;