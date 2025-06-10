
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SystemInfoCardProps {
  totalSchools: number;
  totalTeachers: number;
  totalStudents: number;
  totalResponses: number;
  subscriptionsCount: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
}

const SystemInfoCard = ({
  totalSchools,
  totalTeachers,
  totalStudents,
  totalResponses,
  subscriptionsCount,
  activeSubscriptions,
  monthlyRevenue
}: SystemInfoCardProps) => {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-blue-800">System Information</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-blue-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p><strong>Schools:</strong> {totalSchools}</p>
            <p><strong>Teachers:</strong> {totalTeachers}</p>
          </div>
          <div>
            <p><strong>Students:</strong> {totalStudents}</p>
            <p><strong>Responses:</strong> {totalResponses}</p>
          </div>
          <div>
            <p><strong>Subscriptions:</strong> {subscriptionsCount}</p>
            <p><strong>Active:</strong> {activeSubscriptions}</p>
          </div>
          <div>
            <p><strong>Revenue:</strong> ${monthlyRevenue.toFixed(2)}/month</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemInfoCard;
