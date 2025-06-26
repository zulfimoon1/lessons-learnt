
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Smile, Meh, Frown, AlertTriangle, Calendar, User } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

interface WellnessEntry {
  id: string;
  student_name: string;
  school: string;
  grade: string;
  mood: 'great' | 'good' | 'okay' | 'poor' | 'terrible';
  notes?: string;
  submitted_at: string;
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
      
      // For now, we'll simulate wellness data since the table might not exist yet
      // In a real implementation, this would fetch from a wellness_entries table
      const mockData: WellnessEntry[] = [
        {
          id: '1',
          student_name: 'Emma Johnson',
          school: school,
          grade: '9th',
          mood: 'good',
          notes: 'Feeling better after talking to friends',
          submitted_at: new Date().toISOString()
        },
        {
          id: '2',
          student_name: 'Michael Chen',
          school: school,
          grade: '10th',
          mood: 'okay',
          notes: 'A bit stressed about upcoming exams',
          submitted_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          student_name: 'Sarah Wilson',
          school: school,
          grade: '11th',
          mood: 'poor',
          notes: 'Having trouble sleeping lately',
          submitted_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      setWellnessEntries(mockData);
    } catch (error) {
      console.error('Error fetching wellness entries:', error);
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

  if (isLoading) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-brand-orange" />
            {t('wellness.tracker') || 'Wellness Check-ins'}
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
          {t('wellness.tracker') || 'Student Wellness Check-ins'}
        </CardTitle>
        <p className="text-sm text-gray-600">
          Recent wellness submissions from students
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
                      Grade {entry.grade}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {new Date(entry.submitted_at).toLocaleString()}
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
                  <div className="bg-gray-50 p-3 rounded border-l-4 border-brand-teal">
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
