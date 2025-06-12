import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { FileTextIcon, EyeIcon, AlertTriangleIcon, DownloadIcon } from "lucide-react";
import { toast } from "sonner";
import { getTrafficLightColor } from "@/components/EmotionalStateSelector";

interface FeedbackResponse {
  id: string;
  student_name: string;
  school: string;
  grade: string;
  subject: string;
  class_date: string;
  understanding: number;
  interest: number;
  educational_growth: number;
  emotional_state: string;
  what_went_well: string;
  suggestions: string;
  additional_comments: string;
  is_anonymous: boolean;
  submitted_at: string;
}

interface MentalHealthAlert {
  id: string;
  student_name: string;
  school: string;
  grade: string;
  content: string;
  severity_level: number;
  source_table: string;
  created_at: string;
  is_reviewed: boolean;
}

const ResponsesManagement = () => {
  const [view, setView] = useState<'responses' | 'alerts'>('responses');
  const [responses, setResponses] = useState<FeedbackResponse[]>([]);
  const [alerts, setAlerts] = useState<MentalHealthAlert[]>([]);
  const [schools, setSchools] = useState<string[]>([]);
  const [students, setStudents] = useState<string[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchResponses();
    fetchAlerts();
    fetchSchools();
    fetchStudents();
  }, []);

  const fetchResponses = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Fetching feedback responses...');
      
      const { data, error } = await supabase
        .from('feedback')
        .select(`
          id,
          student_name,
          understanding,
          interest,
          educational_growth,
          emotional_state,
          what_went_well,
          suggestions,
          additional_comments,
          is_anonymous,
          submitted_at,
          class_schedules!inner(
            subject,
            class_date,
            school,
            grade
          )
        `)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching responses:', error);
        toast.error('Failed to fetch responses');
        return;
      }

      const formattedResponses = data?.map(response => ({
        id: response.id,
        student_name: response.student_name || 'Anonymous',
        school: response.class_schedules.school,
        grade: response.class_schedules.grade,
        subject: response.class_schedules.subject,
        class_date: response.class_schedules.class_date,
        understanding: response.understanding,
        interest: response.interest,
        educational_growth: response.educational_growth,
        emotional_state: response.emotional_state,
        what_went_well: response.what_went_well || '',
        suggestions: response.suggestions || '',
        additional_comments: response.additional_comments || '',
        is_anonymous: response.is_anonymous,
        submitted_at: response.submitted_at
      })) || [];

      setResponses(formattedResponses);
      console.log('✅ Responses loaded:', formattedResponses.length);
      
    } catch (error) {
      console.error('❌ Error in fetchResponses:', error);
      toast.error('Failed to load responses');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      console.log('🔄 Fetching mental health alerts...');
      
      const { data, error } = await supabase
        .from('mental_health_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching alerts:', error);
        toast.error('Failed to fetch mental health alerts');
        return;
      }

      setAlerts(data || []);
      console.log('✅ Mental health alerts loaded:', data?.length || 0);
      
    } catch (error) {
      console.error('❌ Error in fetchAlerts:', error);
      toast.error('Failed to load mental health alerts');
    }
  };

  const fetchSchools = async () => {
    try {
      const { data, error } = await supabase
        .from('class_schedules')
        .select('school')
        .not('school', 'is', null);

      if (error) {
        console.error('Error fetching schools:', error);
        return;
      }

      const uniqueSchools = [...new Set(data?.map(item => item.school))];
      setSchools(uniqueSchools);
    } catch (error) {
      console.error('Error fetching schools:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('student_name')
        .not('student_name', 'is', null);

      if (error) {
        console.error('Error fetching students:', error);
        return;
      }

      const uniqueStudents = [...new Set(data?.map(item => item.student_name))];
      setStudents(uniqueStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const markAlertAsReviewed = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('mental_health_alerts')
        .update({ is_reviewed: true, reviewed_at: new Date().toISOString() })
        .eq('id', alertId);

      if (error) {
        console.error('Error marking alert as reviewed:', error);
        toast.error('Failed to mark alert as reviewed');
        return;
      }

      toast.success('Alert marked as reviewed');
      fetchAlerts(); // Refresh the alerts
    } catch (error) {
      console.error('Error marking alert as reviewed:', error);
      toast.error('Failed to mark alert as reviewed');
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

  const getEmotionalStateDisplay = (state: string) => {
    const colorClasses = getTrafficLightColor(state);
    
    return (
      <span className={`px-2 py-1 rounded-md text-xs font-medium border ${colorClasses}`}>
        {state}
      </span>
    );
  };

  const filteredResponses = responses.filter(response => {
    if (selectedSchool !== 'all' && response.school !== selectedSchool) return false;
    if (selectedStudent !== 'all' && response.student_name !== selectedStudent) return false;
    return true;
  });

  const filteredAlerts = alerts.filter(alert => {
    if (selectedSchool !== 'all' && alert.school !== selectedSchool) return false;
    if (selectedStudent !== 'all' && alert.student_name !== selectedStudent) return false;
    return true;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileTextIcon className="w-5 h-5" />
              Responses & Schedule Management
            </CardTitle>
            <CardDescription>
              View and manage student feedback responses, class schedules, and mental health alerts
            </CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <DownloadIcon className="w-4 h-4 mr-2" />
            Export responses
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Filter Controls */}
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">View:</span>
              <Select value={view} onValueChange={(value) => setView(value as 'responses' | 'alerts')}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="responses">Responses</SelectItem>
                  <SelectItem value="alerts">Mental Health Alerts</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">School:</span>
              <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Schools" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Schools</SelectItem>
                  {schools.map(school => (
                    <SelectItem key={school} value={school}>{school}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Student:</span>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Students" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  {students.map(student => (
                    <SelectItem key={student} value={student}>{student}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Responses Table */}
          {view === 'responses' && (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>School</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Emotional State</TableHead>
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
                          <span className="font-medium">{response.student_name}</span>
                          {response.is_anonymous && (
                            <Badge variant="secondary" className="text-xs">Anonymous</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{response.school}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{response.grade}</Badge>
                      </TableCell>
                      <TableCell>{response.subject}</TableCell>
                      <TableCell>{new Date(response.class_date).toLocaleDateString()}</TableCell>
                      <TableCell>{getEmotionalStateDisplay(response.emotional_state)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{response.understanding}/5</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{response.interest}/5</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{response.educational_growth}/5</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <EyeIcon className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredResponses.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8">
                        <div className="text-muted-foreground">
                          {isLoading ? 'Loading responses...' : 'No responses found'}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Mental Health Alerts Table */}
          {view === 'alerts' && (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>School</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Content Preview</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlerts.map((alert) => (
                    <TableRow key={alert.id} className={!alert.is_reviewed ? "bg-red-50" : ""}>
                      <TableCell>
                        <div className="font-medium">{alert.student_name}</div>
                      </TableCell>
                      <TableCell>{alert.school}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{alert.grade}</Badge>
                      </TableCell>
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
                        {new Date(alert.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {alert.is_reviewed ? (
                          <Badge className="bg-green-100 text-green-800">Reviewed</Badge>
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
                            onClick={() => markAlertAsReviewed(alert.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <EyeIcon className="w-3 h-3 mr-1" />
                            Mark Reviewed
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredAlerts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <div className="text-muted-foreground">
                          No mental health alerts found
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ResponsesManagement;
