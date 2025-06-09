
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, UserIcon, AlertTriangleIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

interface WeeklySummary {
  id: string;
  student_id: string | null;
  student_name: string;
  school: string;
  grade: string;
  emotional_concerns: string | null;
  academic_concerns: string | null;
  week_start_date: string;
  submitted_at: string;
  is_anonymous: boolean;
}

interface WeeklySummaryReviewProps {
  school: string;
}

const WeeklySummaryReview = ({ school }: WeeklySummaryReviewProps) => {
  const [summaries, setSummaries] = useState<WeeklySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    loadWeeklySummaries();
  }, [school]);

  const loadWeeklySummaries = async () => {
    try {
      const { data, error } = await supabase
        .from('weekly_summaries')
        .select('*')
        .eq('school', school)
        .order('submitted_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setSummaries(data || []);
    } catch (error) {
      console.error('Error loading weekly summaries:', error);
      toast({
        title: t('common.error'),
        description: t('teacher.failedToLoadSummaries'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getWeekRange = (weekStartDate: string) => {
    const start = new Date(weekStartDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  };

  const hasConcerns = (summary: WeeklySummary) => {
    return summary.emotional_concerns || summary.academic_concerns;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <Card className="border-green-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          {t('dashboard.weeklySummaries')}
        </CardTitle>
        <CardDescription>
          {t('teacher.reviewStudentSummaries')} {school}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {summaries.map((summary) => (
            <div 
              key={summary.id} 
              className={`p-4 border rounded-lg ${
                hasConcerns(summary) ? 'border-orange-200 bg-orange-50' : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">
                    {summary.is_anonymous ? t('weekly.anonymous') : summary.student_name}
                  </span>
                  <Badge variant="outline">{summary.grade}</Badge>
                  {hasConcerns(summary) && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertTriangleIcon className="w-3 h-3" />
                      {t('teacher.needsAttention')}
                    </Badge>
                  )}
                </div>
                <div className="text-right text-sm text-gray-500">
                  <div>{getWeekRange(summary.week_start_date)}</div>
                  <div>{t('teacher.submitted')}: {formatDate(summary.submitted_at)}</div>
                </div>
              </div>

              {summary.emotional_concerns && (
                <div className="mb-3">
                  <h4 className="font-medium text-sm text-pink-700 mb-1">
                    {t('weekly.emotional')}:
                  </h4>
                  <p className="text-gray-700 text-sm bg-white p-2 rounded border">
                    {summary.emotional_concerns}
                  </p>
                </div>
              )}

              {summary.academic_concerns && (
                <div>
                  <h4 className="font-medium text-sm text-blue-700 mb-1">
                    {t('weekly.academic')}:
                  </h4>
                  <p className="text-gray-700 text-sm bg-white p-2 rounded border">
                    {summary.academic_concerns}
                  </p>
                </div>
              )}

              {!hasConcerns(summary) && (
                <p className="text-gray-500 text-sm italic">
                  {t('teacher.noSpecificConcerns')}
                </p>
              )}
            </div>
          ))}

          {summaries.length === 0 && (
            <div className="text-center py-8">
              <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">{t('teacher.noWeeklySummaries')}</p>
              <p className="text-sm text-gray-400 mt-2">
                {t('teacher.summariesWillAppearHere')}
              </p>
            </div>
          )}
        </div>

        {summaries.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <Button
              onClick={loadWeeklySummaries}
              variant="outline"
              className="w-full"
            >
              {t('common.refresh')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeeklySummaryReview;
