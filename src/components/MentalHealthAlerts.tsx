
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangleIcon, CheckCircleIcon, EyeIcon, ClockIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";

interface MentalHealthAlert {
  id: string;
  student_name: string;
  school: string;
  grade: string;
  alert_type: string;
  content: string;
  source_table: string;
  severity_level: number;
  is_reviewed: boolean;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

const MentalHealthAlerts = () => {
  const [alerts, setAlerts] = useState<MentalHealthAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('mental_health_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('teacher.failedToLoadSummaries'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const markAsReviewed = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('mental_health_alerts')
        .update({
          is_reviewed: true,
          reviewed_by: 'Platform Admin',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) throw error;

      toast({
        title: t('common.success'),
        description: "The alert has been marked as reviewed",
      });

      fetchAlerts();
    } catch (error) {
      toast({
        title: t('common.error'),
        description: "Failed to mark alert as reviewed",
        variant: "destructive",
      });
    }
  };

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

  const breadcrumbItems = [
    { label: t('teacher.dashboard'), href: '/teacher' },
    { label: t('teacher.mentalHealthAlerts'), current: true }
  ];

  if (isLoading) {
    return (
      <div className="p-6">
        <Breadcrumbs items={breadcrumbItems} />
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangleIcon className="w-5 h-5 text-red-500" />
              {t('teacher.mentalHealthAlerts')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              <span className="ml-2">{t('common.loading')}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const unreviewed = alerts.filter(alert => !alert.is_reviewed);
  const critical = alerts.filter(alert => alert.severity_level >= 5);

  return (
    <div className="p-6">
      <Breadcrumbs items={breadcrumbItems} />
      
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-red-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangleIcon className="w-4 h-4 text-red-500" />
                Unreviewed Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{unreviewed.length}</div>
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
              <div className="text-2xl font-bold text-orange-600">{critical.length}</div>
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
              <div className="text-2xl font-bold text-blue-600">{alerts.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts Table */}
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
                    <TableRow key={alert.id} className={!alert.is_reviewed ? "bg-red-50" : ""}>
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
                            onClick={() => markAsReviewed(alert.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <EyeIcon className="w-3 h-3 mr-1" />
                            Mark Reviewed
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MentalHealthAlerts;
