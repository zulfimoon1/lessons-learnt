
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { MessageSquare, TrendingUp, Users, Star, PlayCircle, FileText } from 'lucide-react';
import AudioPlayer from '@/components/voice/AudioPlayer';

interface FeedbackDashboardProps {
  teacher: {
    id: string;
    school: string;
    name: string;
    role: string;
  };
}

const FeedbackDashboard: React.FC<FeedbackDashboardProps> = ({ teacher }) => {
  const { t } = useLanguage();
  const [feedbackData, setFeedbackData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFeedback, setExpandedFeedback] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalFeedback: 0,
    avgUnderstanding: 0,
    avgInterest: 0,
    avgGrowth: 0
  });

  useEffect(() => {
    fetchFeedbackData();
  }, [teacher.school]);

  const fetchFeedbackData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('feedback')
        .select(`
          *,
          class_schedules!inner(
            school,
            subject,
            lesson_topic,
            class_date,
            class_time
          )
        `)
        .eq('class_schedules.school', teacher.school)
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      setFeedbackData(data || []);
      
      if (data && data.length > 0) {
        const totalFeedback = data.length;
        const avgUnderstanding = data.reduce((sum, item) => sum + (item.understanding || 0), 0) / totalFeedback;
        const avgInterest = data.reduce((sum, item) => sum + (item.interest || 0), 0) / totalFeedback;
        const avgGrowth = data.reduce((sum, item) => sum + (item.educational_growth || 0), 0) / totalFeedback;
        
        setStats({
          totalFeedback,
          avgUnderstanding: Math.round(avgUnderstanding * 10) / 10,
          avgInterest: Math.round(avgInterest * 10) / 10,
          avgGrowth: Math.round(avgGrowth * 10) / 10
        });
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFeedbackExpansion = (feedbackId: string) => {
    setExpandedFeedback(expandedFeedback === feedbackId ? null : feedbackId);
  };

  if (loading) {
    return <div className="text-center py-8">Loading feedback...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-brand-teal to-brand-orange flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Student Feedback Dashboard</h2>
            <p className="text-gray-600">
              Monitor student feedback and engagement insights
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-brand-teal/5 to-brand-teal/10 hover:from-brand-teal/10 hover:to-brand-teal/20">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-teal/10 flex items-center justify-center group-hover:bg-brand-teal/20 transition-colors">
                <Users className="w-4 h-4 text-brand-teal" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-900">Total Feedback</CardTitle>
                <CardDescription className="text-2xl font-bold text-brand-teal">{stats.totalFeedback}</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-brand-orange/5 to-brand-orange/10 hover:from-brand-orange/10 hover:to-brand-orange/20">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-orange/10 flex items-center justify-center group-hover:bg-brand-orange/20 transition-colors">
                <TrendingUp className="w-4 h-4 text-brand-orange" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-900">Understanding</CardTitle>
                <CardDescription className="text-2xl font-bold text-brand-orange">{stats.avgUnderstanding}/5</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-purple-500/5 to-purple-500/10 hover:from-purple-500/10 hover:to-purple-500/20">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                <Star className="w-4 h-4 text-purple-500" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-900">Interest</CardTitle>
                <CardDescription className="text-2xl font-bold text-purple-500">{stats.avgInterest}/5</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-green-500/5 to-green-500/10 hover:from-green-500/10 hover:to-green-500/20">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-900">Growth</CardTitle>
                <CardDescription className="text-2xl font-bold text-green-500">{stats.avgGrowth}/5</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Detailed Feedback */}
      <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-gray-50/50 to-white hover:from-gray-50 hover:to-gray-50/50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
              <MessageSquare className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <CardTitle className="text-lg text-gray-900">Detailed Feedback</CardTitle>
              <CardDescription className="text-sm">Student responses and comments</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {feedbackData.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No feedback received yet
            </p>
          ) : (
            <div className="space-y-6">
              {feedbackData.map((feedback) => (
                <div key={feedback.id} className="border rounded-lg p-4 bg-white shadow-sm">
                  {/* Feedback Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg text-gray-900">
                        {feedback.class_schedules?.lesson_topic || 'Class Feedback'}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {feedback.class_schedules?.subject} • {feedback.class_schedules?.class_date} • {feedback.class_schedules?.class_time}
                      </p>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Student: {feedback.is_anonymous ? 'Anonymous' : (feedback.student_name || 'Unknown')}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {feedback.emotional_state}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="bg-blue-50">U: {feedback.understanding}/5</Badge>
                      <Badge variant="outline" className="bg-purple-50">I: {feedback.interest}/5</Badge>
                      <Badge variant="outline" className="bg-green-50">G: {feedback.educational_growth}/5</Badge>
                    </div>
                  </div>

                  {/* Audio Player if available */}
                  {feedback.audio_url && (
                    <div className="mb-4">
                      <AudioPlayer
                        audioUrl={feedback.audio_url}
                        transcription={feedback.transcription}
                        duration={feedback.audio_duration}
                        title="Student's voice feedback"
                        showTranscription={true}
                        className="mb-2"
                      />
                    </div>
                  )}

                  {/* Quick Preview of Written Content */}
                  <div className="space-y-2 mb-3">
                    {feedback.what_went_well && (
                      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                        <p className="text-sm font-medium text-green-800 mb-1">What went well:</p>
                        <p className="text-sm text-green-700">
                          {expandedFeedback === feedback.id 
                            ? feedback.what_went_well 
                            : `${feedback.what_went_well.substring(0, 100)}${feedback.what_went_well.length > 100 ? '...' : ''}`
                          }
                        </p>
                      </div>
                    )}
                    
                    {feedback.suggestions && (
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <p className="text-sm font-medium text-blue-800 mb-1">Suggestions for improvement:</p>
                        <p className="text-sm text-blue-700">
                          {expandedFeedback === feedback.id 
                            ? feedback.suggestions 
                            : `${feedback.suggestions.substring(0, 100)}${feedback.suggestions.length > 100 ? '...' : ''}`
                          }
                        </p>
                      </div>
                    )}

                    {feedback.additional_comments && (
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <p className="text-sm font-medium text-gray-800 mb-1">Additional comments:</p>
                        <p className="text-sm text-gray-700">
                          {expandedFeedback === feedback.id 
                            ? feedback.additional_comments 
                            : `${feedback.additional_comments.substring(0, 100)}${feedback.additional_comments.length > 100 ? '...' : ''}`
                          }
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Expand/Collapse Button */}
                  {((feedback.what_went_well && feedback.what_went_well.length > 100) ||
                    (feedback.suggestions && feedback.suggestions.length > 100) ||
                    (feedback.additional_comments && feedback.additional_comments.length > 100)) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFeedbackExpansion(feedback.id)}
                      className="text-brand-teal hover:text-brand-teal/80"
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      {expandedFeedback === feedback.id ? 'Show Less' : 'Read Full Feedback'}
                    </Button>
                  )}

                  {/* Timestamp */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Submitted: {new Date(feedback.submitted_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackDashboard;
