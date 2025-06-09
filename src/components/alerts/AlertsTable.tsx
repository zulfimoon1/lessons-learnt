
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangleIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import AlertTableRow from "./AlertTableRow";
import { MentalHealthAlert } from "@/hooks/useMentalHealthAlerts";

interface AlertsTableProps {
  alerts: MentalHealthAlert[];
  onMarkReviewed: (alertId: string) => void;
}

const AlertsTable = ({ alerts, onMarkReviewed }: AlertsTableProps) => {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangleIcon className="w-5 h-5 text-red-500" />
          {t('teacher.mentalHealthAlerts')}
        </CardTitle>
        <CardDescription>
          Automated detection of concerning language in student feedback and weekly summaries
        </CardDescription>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Alerts</h3>
            <p className="text-gray-600">No mental health concerns have been detected yet.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>School</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Content Preview</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.map((alert) => (
                <AlertTableRow
                  key={alert.id}
                  alert={alert}
                  onMarkReviewed={onMarkReviewed}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertsTable;
