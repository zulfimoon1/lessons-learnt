
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { UserIcon } from "lucide-react";
import { StudentStatistics as StudentStats } from "@/services/platformAdminService";

interface SchoolStats {
  school: string;
  total_teachers: number;
}

interface StudentStatisticsProps {
  studentStats: StudentStats[];
  schoolStats: SchoolStats[];
}

const StudentStatistics = ({ studentStats, schoolStats }: StudentStatisticsProps) => {
  const studentChartData = studentStats.map(stat => ({
    name: stat.school,
    students: stat.total_students,
    responseRate: stat.student_response_rate
  }));

  const studentChartConfig = {
    students: {
      label: "Total Students",
      color: "#94c270",
    },
    responseRate: {
      label: "Response Rate (%)",
      color: "#6b7280",
    },
  };

  if (!studentStats || studentStats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            Student Statistics by School
          </CardTitle>
          <CardDescription>Students enrolled and their response rates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No student data found in the database</p>
            <p className="text-xs text-muted-foreground mt-2">
              Student statistics will appear here once students register and create accounts
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
          <UserIcon className="w-5 h-5" />
          Student Statistics by School
        </CardTitle>
        <CardDescription>Students enrolled and their response rates ({studentStats.length} schools)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {studentChartData.length > 0 ? (
            <ChartContainer config={studentChartConfig} className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studentChartData} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis yAxisId="left" orientation="left" stroke="#94c270" />
                  <YAxis yAxisId="right" orientation="right" stroke="#6b7280" domain={[0, 100]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="students" fill="var(--color-students)" yAxisId="left" />
                  <Bar dataKey="responseRate" fill="var(--color-responseRate)" yAxisId="right" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No data available for chart visualization</p>
            </div>
          )}
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>School</TableHead>
                <TableHead>Total Students</TableHead>
                <TableHead>Response Rate</TableHead>
                <TableHead>Teachers</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentStats.map((stat, index) => {
                const schoolTeacherCount = schoolStats.find(s => s.school === stat.school)?.total_teachers || 0;
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{stat.school}</TableCell>
                    <TableCell>{stat.total_students}</TableCell>
                    <TableCell>{stat.student_response_rate}%</TableCell>
                    <TableCell>{schoolTeacherCount}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentStatistics;
