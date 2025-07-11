
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Phone, Clock, MapPin, User, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import WellnessTracker from "@/components/dashboard/student/WellnessTracker";

interface Psychologist {
  id: string;
  name: string;
  email: string;
  phone?: string;
  availability_hours?: string;
  office_location?: string;
}

interface MentalHealthSupportTabProps {
  psychologists: Psychologist[];
  studentId: string;
  studentName: string;
  studentSchool: string;
  studentGrade: string;
  liveChatWidget?: React.ReactNode;
}

interface MoodEntry {
  mood: 'great' | 'good' | 'okay' | 'poor' | 'terrible';
  notes?: string;
  audioUrl?: string;
  transcription?: string;
  audioDuration?: number;
  timestamp: Date;
}

const MentalHealthSupportTab: React.FC<MentalHealthSupportTabProps> = ({
  psychologists,
  studentId,
  studentName,
  studentSchool,
  studentGrade,
  liveChatWidget
}) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [recentMoodEntries, setRecentMoodEntries] = useState<MoodEntry[]>([]);

  useEffect(() => {
    fetchRecentWellnessEntries();
  }, [studentId]);

  const fetchRecentWellnessEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('student_wellness')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching wellness entries:', error);
        return;
      }

      if (data) {
        const mappedEntries = data.map((entry: any) => ({
          mood: entry.mood as 'great' | 'good' | 'okay' | 'poor' | 'terrible',
          notes: entry.notes || undefined,
          timestamp: new Date(entry.created_at)
        }));
        setRecentMoodEntries(mappedEntries);
      }
    } catch (error) {
      console.error('Error fetching wellness entries:', error);
    }
  };

  const handleMoodSubmit = async (entry: MoodEntry) => {
    try {
      const { error } = await supabase
        .from('student_wellness')
        .insert({
          student_id: studentId,
          student_name: studentName,
          school: studentSchool,
          grade: studentGrade,
          mood: entry.mood,
          notes: entry.notes || null,
          audio_url: entry.audioUrl || null,
          transcription: entry.transcription || null,
          audio_duration: entry.audioDuration || null
        });

      if (error) {
        console.error('Error submitting wellness entry:', error);
        toast({
          title: "Error",
          description: "Failed to submit your wellness check. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Add to local state for immediate feedback
      setRecentMoodEntries(prev => [entry, ...prev].slice(0, 10));
      
      toast({
        title: "Thank you!",
        description: "Your wellness check has been submitted successfully.",
      });
    } catch (error) {
      console.error('Error submitting wellness entry:', error);
      toast({
        title: "Error",
        description: "Failed to submit your wellness check. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome and Information Card */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Heart className="w-5 h-5" />
            How Are You Feeling?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-purple-700">
            It's totally normal to have ups and downs! This is a safe space where you can check in 
            with yourself and get support when you need it. Everything here is private and confidential.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/60 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-800">Your Privacy</span>
              </div>
              <p className="text-sm text-green-700">
                What you share here is kept private. Only trained adults who help students will see it.
              </p>
            </div>
            
            <div className="bg-white/60 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-pink-600" />
                <span className="font-medium text-pink-800">You're Not Alone</span>
              </div>
              <p className="text-sm text-pink-700">
                Lots of students use this space. It's okay to ask for help - that's what we're here for!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wellness Tracker */}
      <WellnessTracker 
        onMoodSubmit={handleMoodSubmit}
        recentEntries={recentMoodEntries}
      />

      {/* Quick Support Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-brand-teal" />
            Need Someone to Talk To?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Sometimes it helps to talk to someone. Here are some ways you can get support:
          </p>
          
          <div className="grid gap-4">
            {liveChatWidget ? (
              <div className="w-full">
                {liveChatWidget}
              </div>
            ) : (
              <Button 
                className="w-full bg-brand-teal hover:bg-brand-teal/90 text-white p-4 h-auto"
              >
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-semibold">Chat With Someone Now</div>
                    <div className="text-sm opacity-90">Talk to a counselor right away</div>
                  </div>
                </div>
              </Button>
            )}
            
            {psychologists.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-800">School Counselors You Can Talk To:</h4>
                {psychologists.map((psychologist) => (
                  <Card key={psychologist.id} className="bg-gray-50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-600" />
                            <span className="font-medium">{psychologist.name}</span>
                          </div>
                          
                          {psychologist.office_location && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="w-3 h-3" />
                              <span>{psychologist.office_location}</span>
                            </div>
                          )}
                          
                          {psychologist.availability_hours && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-3 h-3" />
                              <span>{psychologist.availability_hours}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          {psychologist.phone && (
                            <Button size="sm" variant="outline">
                              <Phone className="w-3 h-3 mr-1" />
                              Call
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <MessageCircle className="w-3 h-3 mr-1" />
                            Message
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Crisis Resources */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800">
            Need Help Right Away?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-red-700 text-sm">
            If you're having thoughts of hurting yourself or others, or if you're in immediate danger, 
            please reach out for help right away:
          </p>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-3 h-3 text-red-600" />
              <span className="font-medium">European Emergency:</span>
              <span>112</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-3 h-3 text-red-600" />
              <span className="font-medium">Samaritans (UK/Ireland):</span>
              <span>116 123</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-3 h-3 text-red-600" />
              <span className="font-medium">Crisis Text Line Europe:</span>
              <span>Text HELLO to 50808</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MentalHealthSupportTab;
