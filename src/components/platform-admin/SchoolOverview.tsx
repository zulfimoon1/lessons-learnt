
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface SchoolStats {
  school: string;
  total_grades: number;
  total_subjects: number;
  total_classes: number;
  total_teachers: number;
}

interface SchoolOverviewProps {
  schoolStats: SchoolStats[];
}

const SchoolOverview = ({ schoolStats }: SchoolOverviewProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>School Overview</CardTitle>
        <CardDescription>Statistics for all registered schools</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>School Name</TableHead>
              <TableHead>Teachers</TableHead>
              <TableHead>Grades</TableHead>
              <TableHead>Subjects</TableHead>
              <TableHead>Total Classes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schoolStats.map((school, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{school.school}</TableCell>
                <TableCell>{school.total_teachers}</TableCell>
                <TableCell>{school.total_grades}</TableCell>
                <TableCell>{school.total_subjects}</TableCell>
                <TableCell>{school.total_classes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SchoolOverview;
