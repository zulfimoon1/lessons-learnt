
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Smile, Meh, Frown, AlertTriangle, Calendar, User } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

interface WellnessEntry {
  id: string;
  student_id?: string;
  student_name: string;
  school: string;
  grade: string;
  mood: 'great' | 'good' | 'okay' | 'poor' | 'terrible';
  notes?: string;
  audio_url?: string;
  transcription?: string;
  audio_duration?: number;
  created_at: string;
  updated_at?: string;
}

interface WellnessCheckCardProps {
  school: string;
}

const WellnessCheckCard: React.FC<WellnessCheckCardProps> = ({ school }) => {
  const { t } = useLanguage();
  const [wellnessEntries, setWellnessEntries] = useState<WellnessEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWellnessEntries();
  }, [school]);

  const fetchWellnessEntries = async () => {
    try {
      setIsLoading(true);
      console.log('WellnessCheckCard: Fetching wellness entries for school:', school);
      
      // Fetch wellness data and weekly summary emotional concerns
      const [wellnessResponse, summaryResponse] = await Promise.all([
        supabase
          .from('student_wellness')
          .select('*')
          .eq('school', school)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('weekly_summaries')
          .select('*')
          .eq('school', school)
          .not('emotional_concerns', 'is', null)
          .order('submitted_at', { ascending: false })
          .limit(10)
      ]);

      // Check for errors in both responses
      if (wellnessResponse.error) {
        console.error('WellnessCheckCard: Error fetching wellness entries:', wellnessResponse.error);
        throw wellnessResponse.error;
      }
      
      if (summaryResponse.error) {
        console.error('WellnessCheckCard: Error fetching weekly summaries:', summaryResponse.error);
        throw summaryResponse.error;
      }

      // Process wellness entries
      const wellnessEntries = (wellnessResponse.data || []).map(entry => ({
        ...entry,
        mood: entry.mood as 'great' | 'good' | 'okay' | 'poor' | 'terrible'
      }));
      
      // Process weekly summary emotional concerns as wellness entries
      const emotionalEntries = (summaryResponse.data || []).map(summary => ({
        id: summary.id,
        student_id: summary.student_id,
        student_name: summary.student_name,
        school: summary.school,
        grade: summary.grade,
        mood: 'okay' as const, // Default mood for weekly summaries
        notes: summary.emotional_concerns,
        created_at: summary.submitted_at || new Date().toISOString(),
        updated_at: summary.submitted_at || new Date().toISOString(),
        audio_url: summary.emotional_audio_url,
        transcription: summary.emotional_transcription,
        audio_duration: summary.audio_duration
      }));

      // Combine and sort all entries by date
      const allEntries = [...wellnessEntries, ...emotionalEntries]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      console.log('WellnessCheckCard: Loaded wellness entries:', wellnessEntries.length, 'emotional entries:', emotionalEntries.length);
      setWellnessEntries(allEntries);
    } catch (error) {
      console.error('WellnessCheckCard: Error fetching wellness entries:', error);
      setWellnessEntries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'great': return <Smile className="w-4 h-4 text-green-500" />;
      case 'good': return <Smile className="w-4 h-4 text-blue-500" />;
      case 'okay': return <Meh className="w-4 h-4 text-yellow-500" />;
      case 'poor': return <Frown className="w-4 h-4 text-orange-500" />;
      case 'terrible': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Meh className="w-4 h-4 text-gray-500" />;
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'great': return 'bg-green-100 text-green-800 border-green-200';
      case 'good': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'okay': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'poor': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'terrible': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityLevel = (mood: string) => {
    switch (mood) {
      case 'terrible': return 'High Priority';
      case 'poor': return 'Medium Priority';
      default: return 'Low Priority';
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-brand-orange" />
            Student Wellness Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-teal"></div>
            <span className="ml-3 text-brand-dark">Loading wellness data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-brand-orange" />
          Student Wellness Monitor
        </CardTitle>
        <p className="text-sm text-gray-600">
          Recent wellness check-ins requiring medical attention ({wellnessEntries.length} entries)
        </p>
      </CardHeader>
      <CardContent>
        {wellnessEntries.length === 0 ? (
          <div className="text-center py-8">
            <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No wellness check-ins yet</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {wellnessEntries.map((entry) => (
              <div key={entry.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-brand-dark">{entry.student_name}</span>
                    <Badge variant="outline" className="text-xs">
                      {entry.grade}
                    </Badge>
                    {(entry.mood === 'poor' || entry.mood === 'terrible') && (
                      <Badge variant="destructive" className="text-xs">
                        {getPriorityLevel(entry.mood)}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-gray-400" />
                     <span className="text-xs text-gray-500">
                       {new Date(entry.created_at).toLocaleString()}
                     </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  {getMoodIcon(entry.mood)}
                  <Badge variant="outline" className={getMoodColor(entry.mood)}>
                    {entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}
                  </Badge>
                </div>
                
                {entry.notes && (
                  <div className={`p-3 rounded border-l-4 ${
                    entry.mood === 'terrible' ? 'bg-red-50 border-red-300' :
                    entry.mood === 'poor' ? 'bg-orange-50 border-orange-300' :
                    'bg-gray-50 border-brand-teal'
                  }`}>
                    <p className="text-sm text-gray-700">"{entry.notes}"</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WellnessCheckCard;
