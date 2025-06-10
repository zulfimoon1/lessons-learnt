
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangleIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import { useMentalHealthAlerts } from "@/hooks/useMentalHealthAlerts";
import AlertSummaryCards from "@/components/alerts/AlertSummaryCards";
import AlertsTable from "@/components/alerts/AlertsTable";

const MentalHealthAlerts = () => {
  const { t } = useLanguage();
  const { teacher } = useAuth();
  const {
    alerts,
    isLoading,
    unreviewed,
    critical,
    markAsReviewed
  } = useMentalHealthAlerts();

  const breadcrumbItems = [
    { label: t('teacher.dashboard'), href: '/teacher' },
    { label: t('teacher.mentalHealthAlerts'), current: true }
  ];

  // Check authorization
  if (!teacher || !['doctor', 'admin'].includes(teacher.role)) {
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
            <div className="text-center py-8">
              <p className="text-gray-600">
                You are not authorized to view mental health alerts. Only mental health professionals and administrators can access this information.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  return (
    <div className="p-6">
      <Breadcrumbs items={breadcrumbItems} />
      
      <div className="space-y-6">
        <AlertSummaryCards
          unreviewed={unreviewed.length}
          critical={critical.length}
          total={alerts.length}
        />

        <AlertsTable
          alerts={alerts}
          onMarkReviewed={markAsReviewed}
        />
      </div>
    </div>
  );
};

export default MentalHealthAlerts;
