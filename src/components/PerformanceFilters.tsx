
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUpIcon, TrendingDownIcon, StarIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface PerformanceData {
  school: string;
  teacher_name?: string;
  avg_understanding: number;
  avg_interest: number;
  avg_growth: number;
  total_responses: number;
  overall_score: number;
}

const PerformanceFilters = () => {
  const [schoolData, setSchoolData] = useState<PerformanceData[]>([]);
  const [teacherData, setTeacherData] = useState<PerformanceData[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<PerformanceData[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<PerformanceData[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('overall_score');
  const [minResponses, setMinResponses] = useState<string>('5');
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    loadPerformanceData();
  }, []);

  useEffect(() => {
    filterAndSortData();
  }, [schoolData, teacherData, selectedSchool, sortBy, minResponses]);

  const loadPerformanceData = async () => {
    try {
      // Load school performance
      const { data: schoolPerformance, error: schoolError } = await supabase
        .from('feedback_analytics')
        .select('*');

      if (schoolError) throw schoolError;

      // Aggregate school data
      const schoolMap = new Map<string, {
        understanding: number[];
        interest: number[];
        growth: number[];
        responses: number;
      }>();

      schoolPerformance?.forEach(item => {
        if (!schoolMap.has(item.school)) {
          schoolMap.set(item.school, {
            understanding: [],
            interest: [],
            growth: [],
            responses: 0
          });
        }
        const school = schoolMap.get(item.school)!;
        if (item.avg_understanding) school.understanding.push(item.avg_understanding);
        if (item.avg_interest) school.interest.push(item.avg_interest);
        if (item.avg_growth) school.growth.push(item.avg_growth);
        school.responses += item.total_responses || 0;
      });

      const schoolResults: PerformanceData[] = Array.from(schoolMap.entries()).map(([school, data]) => {
        const avgUnderstanding = data.understanding.length > 0 ? 
          data.understanding.reduce((a, b) => a + b, 0) / data.understanding.length : 0;
        const avgInterest = data.interest.length > 0 ? 
          data.interest.reduce((a, b) => a + b, 0) / data.interest.length : 0;
        const avgGrowth = data.growth.length > 0 ? 
          data.growth.reduce((a, b) => a + b, 0) / data.growth.length : 0;
        
        return {
          school,
          avg_understanding: avgUnderstanding,
          avg_interest: avgInterest,
          avg_growth: avgGrowth,
          total_responses: data.responses,
          overall_score: (avgUnderstanding + avgInterest + avgGrowth) / 3
        };
      });

      // Load teacher performance
      const { data: teachers, error: teacherError } = await supabase
        .from('teachers')
        .select('id, name, school');

      if (teacherError) throw teacherError;

      const { data: teacherFeedback, error: feedbackError } = await supabase
        .from('feedback')
        .select(`
          understanding,
          interest,
          educational_growth,
          class_schedule_id,
          class_schedules (
            teacher_id,
            school
          )
        `);

      if (feedbackError) throw feedbackError;

      // Aggregate teacher data
      const teacherMap = new Map<string, {
        name: string;
        school: string;
        understanding: number[];
        interest: number[];
        growth: number[];
        responses: number;
      }>();

      teachers?.forEach(teacher => {
        teacherMap.set(teacher.id, {
          name: teacher.name,
          school: teacher.school,
          understanding: [],
          interest: [],
          growth: [],
          responses: 0
        });
      });

      teacherFeedback?.forEach(feedback => {
        const teacherId = feedback.class_schedules?.teacher_id;
        if (teacherId && teacherMap.has(teacherId)) {
          const teacher = teacherMap.get(teacherId)!;
          teacher.understanding.push(feedback.understanding);
          teacher.interest.push(feedback.interest);
          teacher.growth.push(feedback.educational_growth);
          teacher.responses++;
        }
      });

      const teacherResults: PerformanceData[] = Array.from(teacherMap.entries())
        .filter(([_, data]) => data.responses > 0)
        .map(([teacherId, data]) => {
          const avgUnderstanding = data.understanding.reduce((a, b) => a + b, 0) / data.understanding.length;
          const avgInterest = data.interest.reduce((a, b) => a + b, 0) / data.interest.length;
          const avgGrowth = data.growth.reduce((a, b) => a + b, 0) / data.growth.length;
          
          return {
            school: data.school,
            teacher_name: data.name,
            avg_understanding: avgUnderstanding,
            avg_interest: avgInterest,
            avg_growth: avgGrowth,
            total_responses: data.responses,
            overall_score: (avgUnderstanding + avgInterest + avgGrowth) / 3
          };
        });

      setSchoolData(schoolResults);
      setTeacherData(teacherResults);
    } catch (error) {
      console.error('Error loading performance data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortData = () => {
    const minResponsesNum = parseInt(minResponses) || 0;
    
    // Filter and sort schools
    let filteredSchoolData = schoolData.filter(school => 
      school.total_responses >= minResponsesNum
    );
    
    if (sortBy === 'overall_score') {
      filteredSchoolData.sort((a, b) => b.overall_score - a.overall_score);
    } else if (sortBy === 'total_responses') {
      filteredSchoolData.sort((a, b) => b.total_responses - a.total_responses);
    }
    
    setFilteredSchools(filteredSchoolData);
    
    // Filter and sort teachers
    let filteredTeacherData = teacherData.filter(teacher => 
      teacher.total_responses >= minResponsesNum &&
      (selectedSchool === 'all' || teacher.school === selectedSchool)
    );
    
    if (sortBy === 'overall_score') {
      filteredTeacherData.sort((a, b) => b.overall_score - a.overall_score);
    } else if (sortBy === 'total_responses') {
      filteredTeacherData.sort((a, b) => b.total_responses - a.total_responses);
    }
    
    setFilteredTeachers(filteredTeacherData);
  };

  const getPerformanceBadge = (score: number) => {
    if (score >= 4.5) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (score >= 4.0) return <Badge className="bg-blue-100 text-blue-800">Good</Badge>;
    if (score >= 3.5) return <Badge className="bg-yellow-100 text-yellow-800">Average</Badge>;
    return <Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>{t('common.loading')}</p>
        </CardContent>
      </Card>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>{t('performance.school')}</Label>
              <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('performance.allSchools')}</SelectItem>
                  {schoolData.map(school => (
                    <SelectItem key={school.school} value={school.school}>
                      {school.school}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>{t('performance.sortBy')}</Label>
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
              <Label>{t('performance.minResponses')}</Label>
              <Input
                type="number"
                value={minResponses}
                onChange={(e) => setMinResponses(e.target.value)}
                min="0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('performance.topSchools')}</CardTitle>
            <CardDescription>
              {t('performance.schoolPerformance')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('performance.school')}</TableHead>
                  <TableHead>{t('performance.score')}</TableHead>
                  <TableHead>{t('performance.responses')}</TableHead>
                  <TableHead>{t('performance.rating')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchools.slice(0, 10).map((school, index) => (
                  <TableRow key={school.school}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {index < 3 && <StarIcon className="w-4 h-4 text-yellow-500" />}
                        {school.school}
                      </div>
                    </TableCell>
                    <TableCell>{school.overall_score.toFixed(2)}</TableCell>
                    <TableCell>{school.total_responses}</TableCell>
                    <TableCell>{getPerformanceBadge(school.overall_score)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('performance.topTeachers')}</CardTitle>
            <CardDescription>
              {selectedSchool === 'all' ? 
                t('performance.allTeachers') : 
                t('performance.teachersFromSchool', { school: selectedSchool })
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('performance.teacher')}</TableHead>
                  <TableHead>{t('performance.school')}</TableHead>
                  <TableHead>{t('performance.score')}</TableHead>
                  <TableHead>{t('performance.rating')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.slice(0, 10).map((teacher, index) => (
                  <TableRow key={`${teacher.school}-${teacher.teacher_name}`}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {index < 3 && <StarIcon className="w-4 h-4 text-yellow-500" />}
                        {teacher.teacher_name}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{teacher.school}</TableCell>
                    <TableCell>{teacher.overall_score.toFixed(2)}</TableCell>
                    <TableCell>{getPerformanceBadge(teacher.overall_score)}</TableCell>
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
