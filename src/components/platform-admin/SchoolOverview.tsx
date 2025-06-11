
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface SchoolStats {
  school: string;
  total_teachers: number;
}

interface SchoolOverviewProps {
  schoolStats: SchoolStats[];
}

const SchoolOverview = ({ schoolStats }: SchoolOverviewProps) => {
  if (!schoolStats || schoolStats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>School Overview</CardTitle>
          <CardDescription>Statistics for all registered schools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No schools found in the database</p>
            <p className="text-xs text-muted-foreground mt-2">
              Schools will appear here once teachers register and create accounts
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>School Overview</CardTitle>
        <CardDescription>Statistics for all registered schools ({schoolStats.length} schools)</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>School Name</TableHead>
              <TableHead>Teachers</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schoolStats.map((school, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{school.school}</TableCell>
                <TableCell>{school.total_teachers}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SchoolOverview;
