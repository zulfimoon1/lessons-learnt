
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  MessageSquareIcon,
  FilterIcon,
  EyeIcon,
  CalendarIcon,
  SchoolIcon,
  UserIcon,
  BookIcon,
  DownloadIcon
} from "lucide-react";

interface FeedbackResponse {
  id: string;
  student_name: string;
  understanding: number;
  interest: number;
  educational_growth: number;
  emotional_state: string;
  what_went_well: string;
  suggestions: string;
  additional_comments: string;
  submitted_at: string;
  is_anonymous: boolean;
  class_schedule: {
    school: string;
    grade: string;
    subject: string;
    lesson_topic: string;
    class_date: string;
    teacher: {
      name: string;
    };
  };
}

interface ClassSchedule {
  id: string;
  school: string;
  grade: string;
  subject: string;
  lesson_topic: string;
  class_date: string;
  class_time: string;
  duration_minutes: number;
  teacher: {
    name: string;
  };
}

const ResponsesManagement = () => {
  const { toast } = useToast();
  const [responses, setResponses] = useState<FeedbackResponse[]>([]);
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSchool, setSelectedSchool] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<string>("all");
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [activeTab, setActiveTab] = useState<"responses" | "schedules">("responses");
  const [selectedResponse, setSelectedResponse] = useState<FeedbackResponse | null>(null);

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
            class_schedule:class_schedules!inner (
              school,
              grade,
              subject,
              lesson_topic,
              class_date,
              teacher:teachers!inner (name)
            )
          `)
          .order('submitted_at', { ascending: false }),
        supabase
          .from('class_schedules')
          .select(`
            *,
            teacher:teachers!inner (name)
          `)
          .order('class_date', { ascending: false })
      ]);

      if (responsesResult.error) throw responsesResult.error;
      if (schedulesResult.error) throw schedulesResult.error;

      setResponses(responsesResult.data || []);
      setSchedules(schedulesResult.data || []);
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

  const filteredResponses = responses.filter(response => {
    if (selectedSchool !== "all" && response.class_schedule.school !== selectedSchool) return false;
    if (selectedStudent !== "all" && response.student_name !== selectedStudent) return false;
    if (selectedGrade !== "all" && response.class_schedule.grade !== selectedGrade) return false;
    if (selectedSubject !== "all" && response.class_schedule.subject !== selectedSubject) return false;
    
    if (dateRange.start || dateRange.end) {
      const responseDate = new Date(response.submitted_at);
      if (dateRange.start && responseDate < new Date(dateRange.start)) return false;
      if (dateRange.end && responseDate > new Date(dateRange.end)) return false;
    }
    
    return true;
  });

  const filteredSchedules = schedules.filter(schedule => {
    if (selectedSchool !== "all" && schedule.school !== selectedSchool) return false;
    if (selectedGrade !== "all" && schedule.grade !== selectedGrade) return false;
    if (selectedSubject !== "all" && schedule.subject !== selectedSubject) return false;
    
    if (dateRange.start || dateRange.end) {
      const scheduleDate = new Date(schedule.class_date);
      if (dateRange.start && scheduleDate < new Date(dateRange.start)) return false;
      if (dateRange.end && scheduleDate > new Date(dateRange.end)) return false;
    }
    
    return true;
  });

  const uniqueSchools = Array.from(new Set(responses.map(r => r.class_schedule.school)));
  const uniqueStudents = Array.from(new Set(responses.map(r => r.student_name).filter(Boolean)));
  const uniqueGrades = Array.from(new Set(responses.map(r => r.class_schedule.grade)));
  const uniqueSubjects = Array.from(new Set(responses.map(r => r.class_schedule.subject)));

  const exportData = () => {
    const data = activeTab === "responses" ? filteredResponses : filteredSchedules;
    const csv = convertToCSV(data);
    downloadCSV(csv, `${activeTab}-export-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return "";
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        return typeof value === 'object' ? JSON.stringify(value) : value;
      }).join(","))
    ].join("\n");
    
    return csvContent;
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
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
              <MessageSquareIcon className="w-5 h-5" />
              Responses & Schedule Management
            </CardTitle>
            <CardDescription>Filter and review student responses and class schedules</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={exportData} variant="outline" size="sm">
              <DownloadIcon className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6">
          <Button
            variant={activeTab === "responses" ? "default" : "outline"}
            onClick={() => setActiveTab("responses")}
          >
            Student Responses ({filteredResponses.length})
          </Button>
          <Button
            variant={activeTab === "schedules" ? "default" : "outline"}
            onClick={() => setActiveTab("schedules")}
          >
            Class Schedules ({filteredSchedules.length})
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <Label htmlFor="school-filter">School</Label>
            <Select value={selectedSchool} onValueChange={setSelectedSchool}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Schools</SelectItem>
                {uniqueSchools.map((school) => (
                  <SelectItem key={school} value={school}>
                    {school}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {activeTab === "responses" && (
            <div>
              <Label htmlFor="student-filter">Student</Label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  {uniqueStudents.map((student) => (
                    <SelectItem key={student} value={student}>
                      {student}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="grade-filter">Grade</Label>
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                {uniqueGrades.map((grade) => (
                  <SelectItem key={grade} value={grade}>
                    {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="subject-filter">Subject</Label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {uniqueSubjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="date-start">Start Date</Label>
            <Input
              id="date-start"
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="date-end">End Date</Label>
            <Input
              id="date-end"
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />
          </div>
        </div>

        {/* Content Tables */}
        {activeTab === "responses" ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>School</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Lesson</TableHead>
                <TableHead>Scores</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResponses.map((response) => (
                <TableRow key={response.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4" />
                      {response.is_anonymous ? (
                        <Badge variant="secondary">Anonymous</Badge>
                      ) : (
                        response.student_name
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <SchoolIcon className="w-4 h-4" />
                      {response.class_schedule.school}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <BookIcon className="w-4 h-4" />
                      {response.class_schedule.subject}
                    </div>
                  </TableCell>
                  <TableCell>{response.class_schedule.lesson_topic}</TableCell>
                  <TableCell>
                    <div className="text-xs space-y-1">
                      <div>Understanding: {response.understanding}/5</div>
                      <div>Interest: {response.interest}/5</div>
                      <div>Growth: {response.educational_growth}/5</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <CalendarIcon className="w-3 h-3" />
                      {new Date(response.submitted_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedResponse(response)}>
                          <EyeIcon className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Response Details</DialogTitle>
                          <DialogDescription>
                            {response.class_schedule.subject} - {response.class_schedule.lesson_topic}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label>Understanding</Label>
                              <div className="text-2xl font-bold">{response.understanding}/5</div>
                            </div>
                            <div>
                              <Label>Interest</Label>
                              <div className="text-2xl font-bold">{response.interest}/5</div>
                            </div>
                            <div>
                              <Label>Growth</Label>
                              <div className="text-2xl font-bold">{response.educational_growth}/5</div>
                            </div>
                          </div>
                          <div>
                            <Label>Emotional State</Label>
                            <Badge>{response.emotional_state}</Badge>
                          </div>
                          <div>
                            <Label>What Went Well</Label>
                            <p className="text-sm bg-gray-50 p-3 rounded">{response.what_went_well || "No comments"}</p>
                          </div>
                          <div>
                            <Label>Suggestions</Label>
                            <p className="text-sm bg-gray-50 p-3 rounded">{response.suggestions || "No suggestions"}</p>
                          </div>
                          <div>
                            <Label>Additional Comments</Label>
                            <p className="text-sm bg-gray-50 p-3 rounded">{response.additional_comments || "No additional comments"}</p>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>School</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Lesson Topic</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Duration</TableHead>
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
                  <TableCell>{schedule.grade}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <BookIcon className="w-4 h-4" />
                      {schedule.subject}
                    </div>
                  </TableCell>
                  <TableCell>{schedule.lesson_topic}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4" />
                      {schedule.teacher.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <CalendarIcon className="w-3 h-3" />
                      {new Date(schedule.class_date).toLocaleDateString()} at {schedule.class_time}
                    </div>
                  </TableCell>
                  <TableCell>{schedule.duration_minutes} min</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        
        {(activeTab === "responses" ? filteredResponses : filteredSchedules).length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No {activeTab} found matching the current filters.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResponsesManagement;
