
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangleIcon, CheckCircleIcon, EyeIcon } from "lucide-react";
import { MentalHealthAlert } from "@/hooks/useMentalHealthAlerts";

interface AlertTableRowProps {
  alert: MentalHealthAlert;
  onMarkReviewed: (alertId: string) => void;
}

const AlertTableRow = ({ alert, onMarkReviewed }: AlertTableRowProps) => {
  const getSeverityBadge = (severity: number) => {
    if (severity >= 5) {
      return <Badge variant="destructive">Critical</Badge>;
    } else if (severity >= 3) {
      return <Badge className="bg-orange-500 text-white">High</Badge>;
    } else {
      return <Badge className="bg-yellow-500 text-white">Medium</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <TableRow className={!alert.is_reviewed ? "bg-red-50" : ""}>
      <TableCell>
        <div>
          <div className="font-medium">{alert.student_name}</div>
          <div className="text-sm text-gray-500">{alert.grade}</div>
        </div>
      </TableCell>
      <TableCell>{alert.school}</TableCell>
      <TableCell>{getSeverityBadge(alert.severity_level)}</TableCell>
      <TableCell>
        <Badge variant="outline">
          {alert.source_table === 'feedback' ? 'Lesson Feedback' : 'Weekly Summary'}
        </Badge>
      </TableCell>
      <TableCell className="max-w-xs">
        <div className="truncate text-sm">
          {alert.content.substring(0, 100)}...
        </div>
      </TableCell>
      <TableCell className="text-sm">
        {formatDate(alert.created_at)}
      </TableCell>
      <TableCell>
        {alert.is_reviewed ? (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Reviewed
          </Badge>
        ) : (
          <Badge variant="destructive">
            <AlertTriangleIcon className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )}
      </TableCell>
      <TableCell>
        {!alert.is_reviewed && (
          <Button
            size="sm"
            onClick={() => onMarkReviewed(alert.id)}
            className="bg-green-600 hover:bg-green-700"
          >
            <EyeIcon className="w-3 h-3 mr-1" />
            Mark Reviewed
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
};

export default AlertTableRow;
