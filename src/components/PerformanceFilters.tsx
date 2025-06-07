
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FilterIcon, TrendingUpIcon, UsersIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface PerformanceData {
  school: string;
  teacher_name: string;
  total_classes: number;
  total_responses: number;
  avg_understanding: number;
  avg_interest: number;
  avg_growth: number;
  response_rate: number;
}

const PerformanceFilters = () => {
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [filteredData, setFilteredData] = useState<PerformanceData[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("response_rate");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    loadPerformanceData();
  }, []);

  useEffect(() => {
    filterAndSortData();
  }, [performanceData, selectedSchool, sortBy]);

  const loadPerformanceData = async () => {
    try {
      // Get performance data by joining multiple tables
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedback_analytics')
        .select('*');

      if (feedbackError) throw feedbackError;

      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .select('id, name, school');

      if (teacherError) throw teacherError;

      const { data: scheduleData, error: scheduleError } = await supabase
        .from('class_schedules')
        .select('teacher_id, school');

      if (scheduleError) throw scheduleError;

      // Process and combine the data
      const performanceMap = new Map<string, PerformanceData>();

      teacherData.forEach(teacher => {
        const teacherSchedules = scheduleData.filter(s => s.teacher_id === teacher.id);
        const teacherFeedback = feedbackData.filter(f => f.school === teacher.school);
        
        const totalClasses = teacherSchedules.length;
        const totalResponses = teacherFeedback.reduce((sum, f) => sum + (f.total_responses || 0), 0);
        const avgUnderstanding = teacherFeedback.reduce((sum, f) => sum + (f.avg_understanding || 0), 0) / Math.max(teacherFeedback.length, 1);
        const avgInterest = teacherFeedback.reduce((sum, f) => sum + (f.avg_interest || 0), 0) / Math.max(teacherFeedback.length, 1);
        const avgGrowth = teacherFeedback.reduce((sum, f) => sum + (f.avg_growth || 0), 0) / Math.max(teacherFeedback.length, 1);
        const responseRate = totalClasses > 0 ? (totalResponses / totalClasses) * 100 : 0;

        performanceMap.set(teacher.id, {
          school: teacher.school,
          teacher_name: teacher.name,
          total_classes: totalClasses,
          total_responses: totalResponses,
          avg_understanding: Math.round(avgUnderstanding * 10) / 10,
          avg_interest: Math.round(avgInterest * 10) / 10,
          avg_growth: Math.round(avgGrowth * 10) / 10,
          response_rate: Math.round(responseRate * 10) / 10
        });
      });

      setPerformanceData(Array.from(performanceMap.values()));
    } catch (error) {
      console.error('Error loading performance data:', error);
      toast({
        title: t('common.error'),
        description: "Failed to load performance data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortData = () => {
    let filtered = performanceData;

    // Filter by school
    if (selectedSchool !== "all") {
      filtered = filtered.filter(item => item.school === selectedSchool);
    }

    // Sort by selected metric
    filtered.sort((a, b) => {
      const aValue = a[sortBy as keyof PerformanceData] as number;
      const bValue = b[sortBy as keyof PerformanceData] as number;
      return bValue - aValue; // Descending order
    });

    setFilteredData(filtered);
  };

  const getUniqueSchools = () => {
    const schools = [...new Set(performanceData.map(item => item.school))];
    return schools.sort();
  };

  const getPerformanceBadge = (value: number, type: string) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
    
    if (type === 'response_rate') {
      if (value >= 80) variant = "default";
      else if (value >= 60) variant = "secondary";
      else variant = "destructive";
    } else {
      if (value >= 4) variant = "default";
      else if (value >= 3) variant = "secondary";
      else variant = "destructive";
    }

    return <Badge variant={variant}>{value}</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
          <p>Loading performance data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUpIcon className="w-5 h-5" />
          School & Teacher Performance Analysis
        </CardTitle>
        <CardDescription>
          Analyze and filter performance metrics by school and individual teachers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <FilterIcon className="w-4 h-4" />
            <Select value={selectedSchool} onValueChange={setSelectedSchool}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select school" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Schools</SelectItem>
                {getUniqueSchools().map(school => (
                  <SelectItem key={school} value={school}>{school}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="response_rate">Response Rate</SelectItem>
                <SelectItem value="avg_understanding">Avg Understanding</SelectItem>
                <SelectItem value="avg_interest">Avg Interest</SelectItem>
                <SelectItem value="avg_growth">Avg Growth</SelectItem>
                <SelectItem value="total_classes">Total Classes</SelectItem>
                <SelectItem value="total_responses">Total Responses</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredData.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredData.length > 0 
                  ? Math.round((filteredData.reduce((sum, item) => sum + item.response_rate, 0) / filteredData.length) * 10) / 10
                  : 0}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredData.reduce((sum, item) => sum + item.total_classes, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredData.reduce((sum, item) => sum + item.total_responses, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>School</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Classes</TableHead>
                <TableHead>Responses</TableHead>
                <TableHead>Response Rate</TableHead>
                <TableHead>Understanding</TableHead>
                <TableHead>Interest</TableHead>
                <TableHead>Growth</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.school}</TableCell>
                  <TableCell>{item.teacher_name}</TableCell>
                  <TableCell>{item.total_classes}</TableCell>
                  <TableCell>{item.total_responses}</TableCell>
                  <TableCell>{getPerformanceBadge(item.response_rate, 'response_rate')}</TableCell>
                  <TableCell>{getPerformanceBadge(item.avg_understanding, 'rating')}</TableCell>
                  <TableCell>{getPerformanceBadge(item.avg_interest, 'rating')}</TableCell>
                  <TableCell>{getPerformanceBadge(item.avg_growth, 'rating')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-8">
            <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No performance data found for the selected filters</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PerformanceFilters;
