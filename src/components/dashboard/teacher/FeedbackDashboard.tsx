
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Star, MessageSquare, TrendingUp, Users } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface FeedbackData {
  id: string;
  student_name: string;
  understanding: number;
  interest: number;
  educational_growth: number;
  emotional_state: string;
  what_went_well: string;
  suggestions: string;
  additional_comments: string;
  submitted_at: string;
  class_schedule: {
    subject: string;
    lesson_topic: string;
    class_date: string;
    grade: string;
  };
}

interface FeedbackDashboardProps {
  teacher: {
    id: string;
    name: string;
    school: string;
    role: string;
  };
}

const FeedbackDashboard: React.FC<FeedbackDashboardProps> = ({ teacher }) => {
  const [feedback, setFeedback] = useState<FeedbackData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalFeedback: 0,
    avgUnderstanding: 0,
    avgInterest: 0,
    avgGrowth: 0,
  });
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    fetchFeedback();
  }, [teacher.id]);

  const fetchFeedback = async () => {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select(`
          *,
          class_schedule:class_schedules(
            subject,
            lesson_topic,
            class_date,
            grade
          )
        `)
        .eq('class_schedules.teacher_id', teacher.id)
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      setFeedback(data || []);
      
      // Calculate stats
      if (data && data.length > 0) {
        const total = data.length;
        const avgUnderstanding = data.reduce((sum, f) => sum + f.understanding, 0) / total;
        const avgInterest = data.reduce((sum, f) => sum + f.interest, 0) / total;
        const avgGrowth = data.reduce((sum, f) => sum + f.educational_growth, 0) / total;
        
        setStats({
          totalFeedback: total,
          avgUnderstanding: Math.round(avgUnderstanding * 10) / 10,
          avgInterest: Math.round(avgInterest * 10) / 10,
          avgGrowth: Math.round(avgGrowth * 10) / 10,
        });
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast({
        title: t('common.error'),
        description: "Failed to fetch feedback data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading feedback...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalFeedback}</p>
                <p className="text-sm text-muted-foreground">Total Feedback</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <div>
                <div className="flex items-center gap-1">
                  {renderStars(Math.round(stats.avgUnderstanding))}
                </div>
                <p className="text-sm text-muted-foreground">Avg Understanding</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8 text-purple-500" />
              <div>
                <div className="flex items-center gap-1">
                  {renderStars(Math.round(stats.avgInterest))}
                </div>
                <p className="text-sm text-muted-foreground">Avg Interest</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-orange-500" />
              <div>
                <div className="flex items-center gap-1">
                  {renderStars(Math.round(stats.avgGrowth))}
                </div>
                <p className="text-sm text-muted-foreground">Avg Growth</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Student Feedback
          </CardTitle>
          <CardDescription>
            Recent feedback from your students on class lessons
          </CardDescription>
        </CardHeader>
        <CardContent>
          {feedback.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No feedback received yet. Students will see this once they start submitting feedback.
            </p>
          ) : (
            <div className="space-y-4">
              {feedback.map((item) => (
                <Card key={item.id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">
                          {item.class_schedule?.subject} - {item.class_schedule?.lesson_topic}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {item.student_name} • Grade {item.class_schedule?.grade} • {new Date(item.class_schedule?.class_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {item.emotional_state}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Understanding</p>
                        <div className="flex gap-1">{renderStars(item.understanding)}</div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Interest</p>
                        <div className="flex gap-1">{renderStars(item.interest)}</div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Growth</p>
                        <div className="flex gap-1">{renderStars(item.educational_growth)}</div>
                      </div>
                    </div>

                    {(item.what_went_well || item.suggestions || item.additional_comments) && (
                      <div className="space-y-2 text-sm">
                        {item.what_went_well && (
                          <div>
                            <p className="font-medium text-green-700">What went well:</p>
                            <p className="text-gray-600">{item.what_went_well}</p>
                          </div>
                        )}
                        {item.suggestions && (
                          <div>
                            <p className="font-medium text-blue-700">Suggestions:</p>
                            <p className="text-gray-600">{item.suggestions}</p>
                          </div>
                        )}
                        {item.additional_comments && (
                          <div>
                            <p className="font-medium text-purple-700">Additional comments:</p>
                            <p className="text-gray-600">{item.additional_comments}</p>
                          </div>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground mt-3">
                      Submitted: {new Date(item.submitted_at).toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackDashboard;
