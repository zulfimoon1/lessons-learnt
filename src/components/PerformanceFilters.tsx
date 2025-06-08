import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { TrendingUpIcon, UserIcon, SchoolIcon } from "lucide-react";

interface SchoolPerformance {
  school: string;
  total_responses: number;
  avg_understanding: number;
  avg_interest: number;
  avg_growth: number;
  overall_score: number;
  total_teachers: number;
}

interface TeacherPerformance {
  teacher_name: string;
  school: string;
  subject: string;
  total_responses: number;
  avg_understanding: number;
  avg_interest: number;
  avg_growth: number;
  overall_score: number;
}

const PerformanceFilters = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [schoolPerformance, setSchoolPerformance] = useState<SchoolPerformance[]>([]);
  const [teacherPerformance, setTeacherPerformance] = useState<TeacherPerformance[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("overall_score");
  const [minResponses, setMinResponses] = useState<string>("5");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPerformanceData();
  }, [selectedSchool, sortBy, minResponses]);

  const loadPerformanceData = async () => {
    try {
      setIsLoading(true);

      // Load school performance data
      const { data: schoolData, error: schoolError } = await supabase
        .from('feedback_analytics')
        .select('*');

      if (schoolError) throw schoolError;

      // Process school performance
      const schoolStats = schoolData?.reduce((acc: any, curr: any) => {
        if (!acc[curr.school]) {
          acc[curr.school] = {
            school: curr.school,
            total_responses: 0,
            understanding_sum: 0,
            interest_sum: 0,
            growth_sum: 0,
            count: 0
          };
        }
        
        acc[curr.school].total_responses += curr.total_responses || 0;
        acc[curr.school].understanding_sum += (curr.avg_understanding || 0) * (curr.total_responses || 0);
        acc[curr.school].interest_sum += (curr.avg_interest || 0) * (curr.total_responses || 0);
        acc[curr.school].growth_sum += (curr.avg_growth || 0) * (curr.total_responses || 0);
        acc[curr.school].count += 1;
        
        return acc;
      }, {}) || {};

      const processedSchoolData = Object.values(schoolStats).map((school: any) => {
        const avgUnderstanding = school.total_responses > 0 ? school.understanding_sum / school.total_responses : 0;
        const avgInterest = school.total_responses > 0 ? school.interest_sum / school.total_responses : 0;
        const avgGrowth = school.total_responses > 0 ? school.growth_sum / school.total_responses : 0;
        const overallScore = (avgUnderstanding + avgInterest + avgGrowth) / 3;

        return {
          ...school,
          avg_understanding: avgUnderstanding,
          avg_interest: avgInterest,
          avg_growth: avgGrowth,
          overall_score: overallScore,
          total_teachers: school.count
        };
      }).filter((school: any) => school.total_responses >= parseInt(minResponses));

      // Sort school data
      processedSchoolData.sort((a: any, b: any) => {
        if (sortBy === 'total_responses') return b.total_responses - a.total_responses;
        return b.overall_score - a.overall_score;
      });

      setSchoolPerformance(processedSchoolData);

      // Load teacher performance data
      const { data: teacherData, error: teacherError } = await supabase
        .from('feedback')
        .select(`
          *,
          class_schedules!inner(
            teacher_id,
            subject,
            school,
            teachers!inner(name)
          )
        `);

      if (teacherError) throw teacherError;

      // Process teacher performance
      const teacherStats = teacherData?.reduce((acc: any, curr: any) => {
        const teacherKey = `${curr.class_schedules.teacher_id}-${curr.class_schedules.subject}`;
        
        if (!acc[teacherKey]) {
          acc[teacherKey] = {
            teacher_name: curr.class_schedules.teachers.name,
            school: curr.class_schedules.school,
            subject: curr.class_schedules.subject,
            total_responses: 0,
            understanding_sum: 0,
            interest_sum: 0,
            growth_sum: 0
          };
        }
        
        acc[teacherKey].total_responses += 1;
        acc[teacherKey].understanding_sum += curr.understanding || 0;
        acc[teacherKey].interest_sum += curr.interest || 0;
        acc[teacherKey].growth_sum += curr.educational_growth || 0;
        
        return acc;
      }, {}) || {};

      const processedTeacherData = Object.values(teacherStats).map((teacher: any) => {
        const avgUnderstanding = teacher.total_responses > 0 ? teacher.understanding_sum / teacher.total_responses : 0;
        const avgInterest = teacher.total_responses > 0 ? teacher.interest_sum / teacher.total_responses : 0;
        const avgGrowth = teacher.total_responses > 0 ? teacher.growth_sum / teacher.total_responses : 0;
        const overallScore = (avgUnderstanding + avgInterest + avgGrowth) / 3;

        return {
          ...teacher,
          avg_understanding: avgUnderstanding,
          avg_interest: avgInterest,
          avg_growth: avgGrowth,
          overall_score: overallScore
        };
      }).filter((teacher: any) => {
        const meetsMinResponses = teacher.total_responses >= parseInt(minResponses);
        const meetsSchoolFilter = selectedSchool === "all" || teacher.school === selectedSchool;
        return meetsMinResponses && meetsSchoolFilter;
      });

      // Sort teacher data
      processedTeacherData.sort((a: any, b: any) => {
        if (sortBy === 'total_responses') return b.total_responses - a.total_responses;
        return b.overall_score - a.overall_score;
      });

      setTeacherPerformance(processedTeacherData);

    } catch (error) {
      console.error('Error loading performance data:', error);
      toast({
        title: "Error loading performance data",
        description: "Failed to load performance analytics",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const uniqueSchools = [...new Set(schoolPerformance.map(s => s.school))];

  const getRatingBadge = (score: number) => {
    if (score >= 4.5) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (score >= 4.0) return <Badge className="bg-blue-100 text-blue-800">Good</Badge>;
    if (score >= 3.5) return <Badge className="bg-yellow-100 text-yellow-800">Average</Badge>;
    return <Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>;
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
        <p className="text-sm text-muted-foreground">Loading performance data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUpIcon className="w-5 h-5" />
            {t('performance.filters')}
          </CardTitle>
          <CardDescription>
            {t('performance.filtersDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium">{t('performance.school')}</label>
              <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('performance.allSchools')}</SelectItem>
                  {uniqueSchools.map((school) => (
                    <SelectItem key={school} value={school}>{school}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">{t('performance.sortBy')}</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overall_score">{t('performance.overallScore')}</SelectItem>
                  <SelectItem value="total_responses">{t('performance.totalResponses')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">{t('performance.minResponses')}</label>
              <Select value={minResponses} onValueChange={setMinResponses}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="5">5+</SelectItem>
                  <SelectItem value="10">10+</SelectItem>
                  <SelectItem value="20">20+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SchoolIcon className="w-5 h-5" />
              {t('performance.topSchools')}
            </CardTitle>
            <CardDescription>
              {t('performance.schoolPerformance')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School</TableHead>
                  <TableHead>{t('performance.score')}</TableHead>
                  <TableHead>{t('performance.responses')}</TableHead>
                  <TableHead>{t('performance.rating')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schoolPerformance.slice(0, 10).map((school, index) => (
                  <TableRow key={school.school}>
                    <TableCell className="font-medium">{school.school}</TableCell>
                    <TableCell>{school.overall_score.toFixed(2)}</TableCell>
                    <TableCell>{school.total_responses}</TableCell>
                    <TableCell>{getRatingBadge(school.overall_score)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              {t('performance.topTeachers')}
            </CardTitle>
            <CardDescription>
              {selectedSchool === "all" 
                ? t('performance.allTeachers')
                : `${t('performance.teachersFromSchool')} ${selectedSchool}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('performance.teacher')}</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>{t('performance.score')}</TableHead>
                  <TableHead>{t('performance.responses')}</TableHead>
                  <TableHead>{t('performance.rating')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teacherPerformance.slice(0, 10).map((teacher, index) => (
                  <TableRow key={`${teacher.teacher_name}-${teacher.subject}`}>
                    <TableCell className="font-medium">{teacher.teacher_name}</TableCell>
                    <TableCell>{teacher.subject}</TableCell>
                    <TableCell>{teacher.overall_score.toFixed(2)}</TableCell>
                    <TableCell>{teacher.total_responses}</TableCell>
                    <TableCell>{getRatingBadge(teacher.overall_score)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PerformanceFilters;
