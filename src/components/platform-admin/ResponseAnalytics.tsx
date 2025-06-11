
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { BarChart3Icon } from "lucide-react";

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

interface ResponseAnalyticsProps {
  feedbackStats: FeedbackStats[];
}

const ResponseAnalytics = ({ feedbackStats }: ResponseAnalyticsProps) => {
  const chartConfig = {
    responses: {
      label: "Total Responses",
      color: "#94c270",
    },
  };

  const chartData = feedbackStats.slice(0, 10).map(stat => ({
    name: `${stat.school} - ${stat.subject}`,
    responses: stat.total_responses
  }));

  if (!feedbackStats || feedbackStats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3Icon className="w-5 h-5" />
            Response Analytics
          </CardTitle>
          <CardDescription>Student feedback responses by school and subject</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No response data available for chart</p>
            <p className="text-xs text-muted-foreground mt-2">
              Charts will appear here once students start submitting feedback
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3Icon className="w-5 h-5" />
          Response Analytics
        </CardTitle>
        <CardDescription>Student feedback responses by school and subject</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="responses" fill="var(--color-responses)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No data available for chart visualization</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResponseAnalytics;
