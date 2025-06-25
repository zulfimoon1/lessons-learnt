
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { usePlatformAdmin } from "@/contexts/PlatformAdminContext";
import { RefreshCwIcon, TrendingUpIcon } from "lucide-react";

interface FeedbackStats {
  school: string;
  grade: string;
  subject: string;
  lesson_topic: string;
  class_date: string;
  total_responses: number;
  avg_understanding: number;
  avg_interest: number;
  avg_growth: number;
  anonymous_responses: number;
  named_responses: number;
}

const FeedbackAnalytics = () => {
  const { toast } = useToast();
  const { isAuthenticated, admin } = usePlatformAdmin();
  const [feedbackStats, setFeedbackStats] = useState<FeedbackStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (isAuthenticated && admin) {
      loadFeedbackData();
    }
  }, [isAuthenticated, admin]);

  const loadFeedbackData = async () => {
    try {
      console.log('📊 Loading feedback analytics data...');
      setIsLoading(true);
      setError("");

      // Try to load from the feedback_analytics view first
      const { data: viewData, error: viewError } = await supabase
        .from('feedback_analytics')
        .select('*')
        .order('class_date', { ascending: false })
        .limit(50);

      if (!viewError && viewData && viewData.length > 0) {
        console.log('✅ Feedback analytics loaded from view:', viewData.length);
        setFeedbackStats(viewData);
      } else {
        // Fallback: Load data manually by joining tables
        console.log('📊 Loading feedback data manually...');
        const { data: feedbackData, error: feedbackError } = await supabase
          .from('feedback')
          .select(`
            *,
            class_schedules!inner(
              school,
              grade,
              subject,
              lesson_topic,
              class_date
            )
          `);

        if (feedbackError) {
          throw feedbackError;
        }

        // Process the data manually
        const processedData = processFeedbackData(feedbackData || []);
        console.log('✅ Processed feedback data:', processedData.length);
        setFeedbackStats(processedData);
      }

    } catch (error) {
      console.error('Error loading feedback data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load feedback analytics';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const processFeedbackData = (rawData: any[]): FeedbackStats[] => {
    const groupedData = rawData.reduce((acc, item) => {
      const key = `${item.class_schedules.school}-${item.class_schedules.grade}-${item.class_schedules.subject}-${item.class_schedules.lesson_topic}-${item.class_schedules.class_date}`;
      
      if (!acc[key]) {
        acc[key] = {
          school: item.class_schedules.school,
          grade: item.class_schedules.grade,
          subject: item.class_schedules.subject,
          lesson_topic: item.class_schedules.lesson_topic,
          class_date: item.class_schedules.class_date,
          total_responses: 0,
          anonymous_responses: 0,
          named_responses: 0,
          understanding_sum: 0,
          interest_sum: 0,
          growth_sum: 0
        };
      }
      
      acc[key].total_responses++;
      acc[key].understanding_sum += item.understanding || 0;
      acc[key].interest_sum += item.interest || 0;
      acc[key].growth_sum += item.educational_growth || 0;
      
      if (item.is_anonymous) {
        acc[key].anonymous_responses++;
      } else {
        acc[key].named_responses++;
      }
      
      return acc;
    }, {});

    return Object.values(groupedData).map((group: any) => ({
      school: group.school,
      grade: group.grade,
      subject: group.subject,
      lesson_topic: group.lesson_topic,
      class_date: group.class_date,
      total_responses: group.total_responses,
      anonymous_responses: group.anonymous_responses,
      named_responses: group.named_responses,
      avg_understanding: group.total_responses > 0 ? group.understanding_sum / group.total_responses : 0,
      avg_interest: group.total_responses > 0 ? group.interest_sum / group.total_responses : 0,
      avg_growth: group.total_responses > 0 ? group.growth_sum / group.total_responses : 0
    }));
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="text-lg text-red-600 mb-4">Access Denied</div>
            <p className="text-gray-600">Please log in as a platform administrator</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUpIcon className="w-5 h-5" />
            Detailed Feedback Analytics
          </CardTitle>
          <Button
            onClick={loadFeedbackData}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCwIcon className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-red-800 font-medium">Error:</div>
            <div className="text-red-600 text-sm mt-1">{error}</div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
            <span>Loading feedback analytics...</span>
          </div>
        )}

        {/* Content when loaded */}
        {!isLoading && !error && (
          <>
            {feedbackStats.length > 0 ? (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Showing {feedbackStats.length} feedback analytics records
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>School</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Lesson Topic</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Responses</TableHead>
                      <TableHead>Avg Understanding</TableHead>
                      <TableHead>Avg Interest</TableHead>
                      <TableHead>Avg Growth</TableHead>
                      <TableHead>Anonymous</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feedbackStats.slice(0, 20).map((stat, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{stat.school}</TableCell>
                        <TableCell>{stat.subject}</TableCell>
                        <TableCell>{stat.grade}</TableCell>
                        <TableCell className="max-w-48 truncate">{stat.lesson_topic}</TableCell>
                        <TableCell>{new Date(stat.class_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{stat.total_responses}</span>
                            <span className="text-xs text-muted-foreground">
                              ({stat.anonymous_responses}A / {stat.named_responses}N)
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className={`${stat.avg_understanding >= 4 ? 'text-green-600' : stat.avg_understanding >= 3 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {stat.avg_understanding?.toFixed(1) || 'N/A'}
                            </span>
                            <span className="text-xs text-muted-foreground">/5</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className={`${stat.avg_interest >= 4 ? 'text-green-600' : stat.avg_interest >= 3 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {stat.avg_interest?.toFixed(1) || 'N/A'}
                            </span>
                            <span className="text-xs text-muted-foreground">/5</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className={`${stat.avg_growth >= 4 ? 'text-green-600' : stat.avg_growth >= 3 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {stat.avg_growth?.toFixed(1) || 'N/A'}
                            </span>
                            <span className="text-xs text-muted-foreground">/5</span>
                          </div>
                        </TableCell>
                        <TableCell>{stat.anonymous_responses}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {feedbackStats.length > 20 && (
                  <div className="text-sm text-muted-foreground text-center pt-4">
                    Showing first 20 of {feedbackStats.length} records
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-lg font-medium mb-2">No feedback data found</div>
                <p className="text-sm">
                  Feedback analytics will appear here once students start submitting feedback for lessons.
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default FeedbackAnalytics;
