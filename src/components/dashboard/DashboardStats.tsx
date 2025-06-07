
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SchoolIcon, BookOpenIcon, CalendarIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Student {
  school?: string;
  grade?: string;
}

interface DashboardStatsProps {
  student: Student | null;
  upcomingClassesCount: number;
}

const DashboardStats = ({ student, upcomingClassesCount }: DashboardStatsProps) => {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('auth.school')}</CardTitle>
          <SchoolIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-semibold">{student?.school}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('dashboard.grade')}</CardTitle>
          <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-semibold">{student?.grade}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('dashboard.upcomingClasses')}</CardTitle>
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-semibold">{upcomingClassesCount}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
