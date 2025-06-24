
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MessageSquare, TrendingUp } from "lucide-react";

interface FeedbackData {
  teacher_name: string;
  lesson_topic: string;
  class_date: string;
  subject: string;
  avg_understanding: number;
  avg_interest: number;
  avg_growth: number;
  total_responses: number;
}

interface FeedbackAnalyticsProps {
  school: string;
}

const FeedbackAnalytics: React.FC<FeedbackAnalyticsProps> = ({ school }) => {
  const [feedbackData, setFeedbackData] = useState<FeedbackData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchFeedbackData();
  }, [school]);

  const fetchFeedbackData = async () => {
    try {
      setIsLoading(true);

      const { data: feedbackAnalytics, error } = await supabase
        .from('feedback')
        .select(`
          *,
          class_schedules!inner(
            teacher_id,
            lesson_topic,
            class_date,
            subject,
            school,
            teachers!inner(name)
          )
        `)
        .eq('class_schedules.school', school);

      if (error) throw error;

      const processedData = processFeedbackData(feedbackAnalytics || []);
      setFeedbackData(processedData);

    } catch (error) {
      console.error('Error fetching feedback data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch feedback analytics",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const processFeedbackData = (rawData: any[]): FeedbackData[] => {
    const groupedData = rawData.reduce((acc, item) => {
      const key = `${item.class_schedules.teacher_id}-${item.class_schedules.lesson_topic}-${item.class_schedules.class_date}`;
      
      if (!acc[key]) {
        acc[key] = {
          teacher_name: item.class_schedules.teachers.name,
          lesson_topic: item.class_schedules.lesson_topic,
          class_date: item.class_schedules.class_date,
          subject: item.class_schedules.subject,
          understanding_scores: [],
          interest_scores: [],
          growth_scores: [],
          total_responses: 0
        };
      }
      
      acc[key].understanding_scores.push(item.understanding);
      acc[key].interest_scores.push(item.interest);
      acc[key].growth_scores.push(item.educational_growth);
      acc[key].total_responses++;
      
      return acc;
    }, {});

    return Object.values(groupedData).map((group: any) => ({
      teacher_name: group.teacher_name,
      lesson_topic: group.lesson_topic,
      class_date: group.class_date,
      subject: group.subject,
      avg_understanding: group.understanding_scores.reduce((a: number, b: number) => a + b, 0) / group.understanding_scores.length,
      avg_interest: group.interest_scores.reduce((a: number, b: number) => a + b, 0) / group.interest_scores.length,
      avg_growth: group.growth_scores.reduce((a: number, b: number) => a + b, 0) / group.growth_scores.length,
      total_responses: group.total_responses
    }));
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading feedback analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Teacher Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={feedbackData.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="teacher_name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="avg_understanding" fill="#8884d8" name="Understanding" />
              <Bar dataKey="avg_interest" fill="#82ca9d" name="Interest" />
              <Bar dataKey="avg_growth" fill="#ffc658" name="Growth" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Detailed Feedback per Teacher per Lesson
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {feedbackData.map((item, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{item.teacher_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.subject} - {item.lesson_topic}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.class_date).toLocaleDateString()} | {item.total_responses} responses
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <div className="font-medium">{item.avg_understanding.toFixed(1)}</div>
                        <div className="text-xs text-muted-foreground">Understanding</div>
                      </div>
                      <div>
                        <div className="font-medium">{item.avg_interest.toFixed(1)}</div>
                        <div className="text-xs text-muted-foreground">Interest</div>
                      </div>
                      <div>
                        <div className="font-medium">{item.avg_growth.toFixed(1)}</div>
                        <div className="text-xs text-muted-foreground">Growth</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {feedbackData.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No feedback data available yet. Feedback will appear here as students submit responses.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackAnalytics;
