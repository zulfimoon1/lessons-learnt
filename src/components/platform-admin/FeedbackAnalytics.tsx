
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

interface FeedbackAnalyticsProps {
  feedbackStats: FeedbackStats[];
}

const FeedbackAnalytics = ({ feedbackStats }: FeedbackAnalyticsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detailed Feedback Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>School</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Responses</TableHead>
              <TableHead>Avg Understanding</TableHead>
              <TableHead>Avg Interest</TableHead>
              <TableHead>Avg Growth</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {feedbackStats.slice(0, 20).map((stat, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{stat.school}</TableCell>
                <TableCell>{stat.subject}</TableCell>
                <TableCell>{stat.grade}</TableCell>
                <TableCell>{stat.total_responses}</TableCell>
                <TableCell>{stat.avg_understanding?.toFixed(1) || 'N/A'}</TableCell>
                <TableCell>{stat.avg_interest?.toFixed(1) || 'N/A'}</TableCell>
                <TableCell>{stat.avg_growth?.toFixed(1) || 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default FeedbackAnalytics;
