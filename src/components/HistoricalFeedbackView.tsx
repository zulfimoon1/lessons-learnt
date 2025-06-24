
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, User, BookOpen, Star, MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface FeedbackRecord {
  id: string;
  submitted_at: string;
  understanding: number;
  interest: number;
  educational_growth: number;
  emotional_state: string;
  what_went_well: string;
  suggestions: string;
  additional_comments: string;
  is_anonymous: boolean;
  class_schedule: {
    subject: string;
    lesson_topic: string;
    class_date: string;
    class_time: string;
    school: string;
    grade: string;
    teacher?: {
      name: string;
    };
  };
}

const HistoricalFeedbackView: React.FC = () => {
  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { student } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    if (student?.id) {
      fetchFeedbackHistory();
    }
  }, [student?.id]);

  const fetchFeedbackHistory = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('feedback')
        .select(`
          id,
          submitted_at,
          understanding,
          interest,
          educational_growth,
          emotional_state,
          what_went_well,
          suggestions,
          additional_comments,
          is_anonymous,
          class_schedules!inner (
            subject,
            lesson_topic,
            class_date,
            class_time,
            school,
            grade,
            teachers (
              name
            )
          )
        `)
        .eq('student_id', student?.id)
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our interface
      const transformedData = data?.map(item => ({
        ...item,
        class_schedule: {
          ...item.class_schedules,
          teacher: item.class_schedules.teachers
        }
      })) || [];

      setFeedbackHistory(transformedData);
    } catch (error) {
      console.error('Error fetching feedback history:', error);
      toast({
        title: t('common.error'),
        description: 'Failed to load feedback history',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-brand-teal/20">
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal"></div>
          <span className="ml-3 text-brand-dark">{t('common.loading')}</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-brand-teal/20 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-brand-teal to-brand-orange/20 rounded-t-lg">
        <CardTitle className="flex items-center gap-3 text-white">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
          Historical Feedback
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {feedbackHistory.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-brand-teal/10 rounded-full mx-auto mb-4 flex items-center justify-center">
              <MessageSquare className="w-10 h-10 text-brand-teal" />
            </div>
            <p className="text-brand-dark font-medium mb-2">No feedback submitted yet</p>
            <p className="text-brand-dark/60 text-sm">
              Your submitted feedback will appear here for review
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {feedbackHistory.map((feedback) => (
              <div 
                key={feedback.id} 
                className="border border-brand-teal/20 rounded-lg p-5 hover:bg-brand-teal/5 transition-all duration-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-brand-orange/20 rounded-full flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-brand-orange" />
                      </div>
                      <h3 className="font-semibold text-brand-dark text-lg">
                        {feedback.class_schedule.subject}
                      </h3>
                      <Badge variant="outline" className="border-brand-teal text-brand-teal">
                        {feedback.class_schedule.grade}
                      </Badge>
                      {feedback.is_anonymous && (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
                          Anonymous
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-brand-dark/80 mb-3 font-medium">
                      {feedback.class_schedule.lesson_topic}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                      <div className="flex items-center gap-2 text-brand-dark/70">
                        <Calendar className="w-4 h-4 text-brand-teal" />
                        <span className="text-sm font-medium">
                          {new Date(feedback.class_schedule.class_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-brand-dark/70">
                        <Clock className="w-4 h-4 text-brand-orange" />
                        <span className="text-sm font-medium">
                          {feedback.class_schedule.class_time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-brand-dark/70">
                        <User className="w-4 h-4 text-brand-teal" />
                        <span className="text-sm font-medium">
                          {feedback.class_schedule.teacher?.name || 'Teacher'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-brand-dark/70">
                        <MessageSquare className="w-4 h-4 text-brand-teal" />
                        <span className="text-sm font-medium">
                          {new Date(feedback.submitted_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ratings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-brand-teal/5 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-brand-dark mb-1">Understanding</p>
                    {renderStarRating(feedback.understanding)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-brand-dark mb-1">Interest</p>
                    {renderStarRating(feedback.interest)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-brand-dark mb-1">Educational Growth</p>
                    {renderStarRating(feedback.educational_growth)}
                  </div>
                </div>

                {/* Emotional State */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-brand-dark mb-2">Emotional State:</p>
                  <Badge variant="outline" className="text-sm">
                    {feedback.emotional_state}
                  </Badge>
                </div>

                {/* Written Feedback */}
                <div className="space-y-3">
                  {feedback.what_went_well && (
                    <div>
                      <p className="text-sm font-medium text-brand-dark mb-1">What went well:</p>
                      <p className="text-sm text-brand-dark/80 bg-green-50 p-3 rounded-lg">
                        {feedback.what_went_well}
                      </p>
                    </div>
                  )}
                  
                  {feedback.suggestions && (
                    <div>
                      <p className="text-sm font-medium text-brand-dark mb-1">Suggestions:</p>
                      <p className="text-sm text-brand-dark/80 bg-blue-50 p-3 rounded-lg">
                        {feedback.suggestions}
                      </p>
                    </div>
                  )}
                  
                  {feedback.additional_comments && (
                    <div>
                      <p className="text-sm font-medium text-brand-dark mb-1">Additional Comments:</p>
                      <p className="text-sm text-brand-dark/80 bg-gray-50 p-3 rounded-lg">
                        {feedback.additional_comments}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HistoricalFeedbackView;
