
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  FileTextIcon,
  FilterIcon,
  DownloadIcon,
  EyeIcon,
  CalendarIcon,
  SchoolIcon,
  UserIcon,
  ClockIcon
} from "lucide-react";

interface Teacher {
  name: string;
}

interface ClassScheduleWithTeacher {
  id: string;
  teacher_id: string;
  school: string;
  grade: string;
  subject: string;
  lesson_topic: string;
  class_date: string;
  class_time: string;
  duration_minutes: number;
  description: string | null;
  created_at: string;
  teacher: Teacher | null;
}

interface FeedbackResponseWithSchedule {
  id: string;
  class_schedule_id: string;
  student_id: string | null;
  student_name: string | null;
  is_anonymous: boolean;
  understanding: number;
  interest: number;
  educational_growth: number;
  emotional_state: string;
  what_went_well: string | null;
  suggestions: string | null;
  additional_comments: string | null;
  submitted_at: string;
  class_schedule: ClassScheduleWithTeacher | null;
}

const ResponsesManagement = () => {
  const { toast } = useToast();
  const [responses, setResponses] = useState<FeedbackResponseWithSchedule[]>([]);
  const [schedules, setSchedules] = useState<ClassScheduleWithTeacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSchool, setSelectedSchool] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<string>("all");
  const [selectedView, setSelectedView] = useState<string>("responses");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [responsesResult, schedulesResult] = await Promise.all([
        supabase
          .from('feedback')
          .select(`
            *,
            class_schedule:class_schedules(
              *,
              teacher:teachers(name)
            )
          `)
          .order('submitted_at', { ascending: false }),
        supabase
          .from('class_schedules')
          .select(`
            *,
            teacher:teachers(name)
          `)
          .order('created_at', { ascending: false })
      ]);

      if (responsesResult.error) throw responsesResult.error;
      if (schedulesResult.error) throw schedulesResult.error;

      // Process the data with proper type handling
      const processedResponses = (responsesResult.data || []).map(response => ({
        ...response,
        class_schedule: response.class_schedule ? {
          ...response.class_schedule,
          teacher: response.class_schedule.teacher || null
        } : null
      }));

      const processedSchedules = (schedulesResult.data || []).map(schedule => ({
        ...schedule,
        teacher: schedule.teacher || null
      }));

      setResponses(processedResponses);
      setSchedules(processedSchedules);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load responses and schedules",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const dataToExport = selectedView === 'responses' ? responses : schedules;
      const csvContent = convertToCSV(dataToExport);
      downloadCSV(csvContent, `${selectedView}_export_${new Date().toISOString().split('T')[0]}.csv`);
      
      toast({
        title: "Export Successful",
        description: `${selectedView} data exported successfully`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  const convertToCSV = (data: any[]) => {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]).filter(key => typeof data[0][key] !== 'object');
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => 
          JSON.stringify(row[header] || '')
        ).join(',')
      )
    ];
    
    return csvRows.join('\n');
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredResponses = responses.filter(response => {
    if (selectedSchool !== "all" && response.class_schedule?.school !== selectedSchool) return false;
    if (selectedStudent !== "all" && response.student_name !== selectedStudent) return false;
    return true;
  });

  const filteredSchedules = schedules.filter(schedule => {
    if (selectedSchool !== "all" && schedule.school !== selectedSchool) return false;
    return true;
  });

  const uniqueSchools = Array.from(new Set([
    ...responses.map(r => r.class_schedule?.school).filter(Boolean),
    ...schedules.map(s => s.school)
  ]));

  const uniqueStudents = Array.from(new Set(
    responses.map(r => r.student_name).filter(Boolean)
  ));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileTextIcon className="w-5 h-5" />
              Responses & Schedule Management
            </CardTitle>
            <CardDescription>View and manage student feedback responses and class schedules</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleExportData}
              variant="outline"
              size="sm"
            >
              <DownloadIcon className="w-3 h-3 mr-1" />
              Export {selectedView}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* View Toggle and Filters */}
        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Label htmlFor="view-select">View:</Label>
            <Select value={selectedView} onValueChange={setSelectedView}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="responses">Responses</SelectItem>
                <SelectItem value="schedules">Schedules</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <FilterIcon className="w-4 h-4" />
            <Label htmlFor="school-filter">School:</Label>
            <Select value={selectedSchool} onValueChange={setSelectedSchool}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Schools</SelectItem>
                {uniqueSchools.map((school) => (
                  <SelectItem key={school} value={school!}>
                    {school}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedView === 'responses' && (
            <div className="flex items-center gap-2">
              <Label htmlFor="student-filter">Student:</Label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  {uniqueStudents.map((student) => (
                    <SelectItem key={student} value={student!}>
                      {student}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Responses Table */}
        {selectedView === 'responses' && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>School</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Understanding</TableHead>
                <TableHead>Interest</TableHead>
                <TableHead>Growth</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResponses.map((response) => (
                <TableRow key={response.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4" />
                      {response.is_anonymous ? 'Anonymous' : response.student_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <SchoolIcon className="w-4 h-4" />
                      {response.class_schedule?.school}
                    </div>
                  </TableCell>
                  <TableCell>{response.class_schedule?.subject}</TableCell>
                  <TableCell>{formatDate(response.submitted_at)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {response.understanding}/5
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {response.interest}/5
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {response.educational_growth}/5
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <EyeIcon className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Response Details</DialogTitle>
                          <DialogDescription>
                            Detailed feedback from {response.is_anonymous ? 'Anonymous Student' : response.student_name}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <strong>What went well:</strong>
                            <p className="text-sm text-gray-600 mt-1">{response.what_went_well || 'No response'}</p>
                          </div>
                          <div>
                            <strong>Suggestions:</strong>
                            <p className="text-sm text-gray-600 mt-1">{response.suggestions || 'No response'}</p>
                          </div>
                          <div>
                            <strong>Additional comments:</strong>
                            <p className="text-sm text-gray-600 mt-1">{response.additional_comments || 'No response'}</p>
                          </div>
                          <div>
                            <strong>Emotional state:</strong>
                            <Badge className="ml-2">{response.emotional_state}</Badge>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Schedules Table */}
        {selectedView === 'schedules' && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>School</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Topic</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSchedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <SchoolIcon className="w-4 h-4" />
                      {schedule.school}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4" />
                      {schedule.teacher?.name || 'Unknown Teacher'}
                    </div>
                  </TableCell>
                  <TableCell>{schedule.subject}</TableCell>
                  <TableCell>{schedule.grade}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      {formatDate(schedule.class_date)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <ClockIcon className="w-4 h-4" />
                      {formatTime(schedule.class_time)}
                    </div>
                  </TableCell>
                  <TableCell>{schedule.lesson_topic}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <EyeIcon className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Class Schedule Details</DialogTitle>
                          <DialogDescription>
                            {schedule.subject} - {schedule.lesson_topic}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <strong>School:</strong>
                              <p className="text-sm text-gray-600">{schedule.school}</p>
                            </div>
                            <div>
                              <strong>Teacher:</strong>
                              <p className="text-sm text-gray-600">{schedule.teacher?.name || 'Unknown'}</p>
                            </div>
                            <div>
                              <strong>Grade:</strong>
                              <p className="text-sm text-gray-600">{schedule.grade}</p>
                            </div>
                            <div>
                              <strong>Duration:</strong>
                              <p className="text-sm text-gray-600">{schedule.duration_minutes} minutes</p>
                            </div>
                          </div>
                          {schedule.description && (
                            <div>
                              <strong>Description:</strong>
                              <p className="text-sm text-gray-600 mt-1">{schedule.description}</p>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        
        {((selectedView === 'responses' && filteredResponses.length === 0) || 
          (selectedView === 'schedules' && filteredSchedules.length === 0)) && (
          <div className="text-center py-8 text-muted-foreground">
            No {selectedView} found matching the current filters.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResponsesManagement;
