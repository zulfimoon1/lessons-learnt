
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangleIcon, ClockIcon } from "lucide-react";

interface AlertSummaryCardsProps {
  unreviewed: number;
  critical: number;
  total: number;
}

const AlertSummaryCards = ({ unreviewed, critical, total }: AlertSummaryCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="border-red-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertTriangleIcon className="w-4 h-4 text-red-500" />
            Unreviewed Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{unreviewed}</div>
        </CardContent>
      </Card>

      <Card className="border-orange-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertTriangleIcon className="w-4 h-4 text-orange-500" />
            Critical Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{critical}</div>
        </CardContent>
      </Card>

      <Card className="border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ClockIcon className="w-4 h-4 text-blue-500" />
            Total Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{total}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlertSummaryCards;
