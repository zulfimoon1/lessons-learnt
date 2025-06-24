
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, MessageCircle, AlertTriangle, Calendar, User, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface WeeklySummary {
  id: string;
  student_name: string;
  grade: string;
  emotional_concerns: string;
  academic_concerns: string;
  submitted_at: string;
  week_start_date: string;
}

interface MentalHealthAlert {
  id: string;
  student_name: string;
  grade: string;
  content: string;
  severity_level: number;
  created_at: string;
  is_reviewed: boolean;
  source_table: string;
}

interface ChatSession {
  id: string;
  student_name: string;
  grade: string;
  status: string;
  created_at: string;
  started_at: string;
  ended_at: string;
  is_anonymous: boolean;
}

interface DoctorMentalHealthDashboardProps {
  school: string;
  doctorId: string;
}

const DoctorMentalHealthDashboard: React.FC<DoctorMentalHealthDashboardProps> = ({ school, doctorId }) => {
  const [weeklySummaries, setWeeklySummaries] = useState<WeeklySummary[]>([]);
  const [alerts, setAlerts] = useState<MentalHealthAlert[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, [school, doctorId]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchWeeklySummaries(),
        fetchMentalHealthAlerts(),
        fetchChatSessions()
      ]);
    } catch (error) {
      console.error('Error fetching mental health data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklySummaries = async () => {
    const { data } = await supabase
      .from('weekly_summaries')
      .select('*')
      .eq('school', school)
      .order('submitted_at', { ascending: false })
      .limit(20);

    if (data) {
      setWeeklySummaries(data);
    }
  };

  const fetchMentalHealthAlerts = async () => {
    const { data } = await supabase
      .from('mental_health_alerts')
      .select('*')
      .eq('school', school)
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) {
      setAlerts(data);
    }
  };

  const fetchChatSessions = async () => {
    const { data } = await supabase
      .from('live_chat_sessions')
      .select('*')
      .eq('school', school)
      .order('created_at', { ascending: false })
      .limit(30);

    if (data) {
      setChatSessions(data);
    }
  };

  const markAlertAsReviewed = async (alertId: string) => {
    const { error } = await supabase
      .from('mental_health_alerts')
      .update({ 
        is_reviewed: true, 
        reviewed_at: new Date().toISOString(),
        reviewed_by: doctorId 
      })
      .eq('id', alertId);

    if (!error) {
      setAlerts(alerts.map(alert => 
        alert.id === alertId 
          ? { ...alert, is_reviewed: true }
          : alert
      ));
    }
  };

  const getSeverityColor = (level: number) => {
    switch (level) {
      case 5: return 'bg-red-100 text-red-800 border-red-200';
      case 4: return 'bg-orange-100 text-orange-800 border-orange-200';
      case 3: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 2: return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityLabel = (level: number) => {
    switch (level) {
      case 5: return 'Critical';
      case 4: return 'High';
      case 3: return 'Medium';
      case 2: return 'Low';
      default: return 'Info';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'waiting': return 'bg-yellow-100 text-yellow-800';
      case 'ended': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const unreviewedAlerts = alerts.filter(alert => !alert.is_reviewed);
  const criticalAlerts = alerts.filter(alert => alert.severity_level >= 4);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{unreviewedAlerts.length}</p>
                <p className="text-sm text-gray-600">Unreviewed Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{criticalAlerts.length}</p>
                <p className="text-sm text-gray-600">Critical Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{weeklySummaries.length}</p>
                <p className="text-sm text-gray-600">Weekly Summaries</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{chatSessions.length}</p>
                <p className="text-sm text-gray-600">Chat Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">Mental Health Alerts</TabsTrigger>
          <TabsTrigger value="summaries">Weekly Summaries</TabsTrigger>
          <TabsTrigger value="chats">Chat Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Mental Health Alerts
              </CardTitle>
              <CardDescription>
                Review and manage mental health alerts detected in student feedback and summaries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No mental health alerts found</p>
                ) : (
                  alerts.map((alert) => (
                    <Card key={alert.id} className={`${alert.is_reviewed ? 'opacity-75' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge className={getSeverityColor(alert.severity_level)}>
                                {getSeverityLabel(alert.severity_level)}
                              </Badge>
                              <span className="font-medium">{alert.student_name}</span>
                              <span className="text-sm text-gray-500">Grade {alert.grade}</span>
                            </div>
                            <p className="text-sm text-gray-600">
                              Source: {alert.source_table} • {format(new Date(alert.created_at), 'MMM dd, yyyy HH:mm')}
                            </p>
                          </div>
                          {!alert.is_reviewed && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => markAlertAsReviewed(alert.id)}
                            >
                              Mark as Reviewed
                            </Button>
                          )}
                        </div>
                        <div className="bg-gray-50 p-3 rounded text-sm">
                          {alert.content}
                        </div>
                        {alert.is_reviewed && (
                          <p className="text-xs text-green-600 mt-2">✓ Reviewed</p>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summaries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Weekly Summaries
              </CardTitle>
              <CardDescription>
                Review student weekly emotional and academic summaries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weeklySummaries.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No weekly summaries found</p>
                ) : (
                  weeklySummaries.map((summary) => (
                    <Card key={summary.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span className="font-medium">{summary.student_name}</span>
                              <span className="text-sm text-gray-500">Grade {summary.grade}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="h-3 w-3" />
                              Week of {format(new Date(summary.week_start_date), 'MMM dd, yyyy')}
                              <span>•</span>
                              <span>Submitted {format(new Date(summary.submitted_at), 'MMM dd, yyyy')}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          {summary.emotional_concerns && (
                            <div>
                              <h4 className="font-medium text-red-700 mb-1">Emotional Concerns:</h4>
                              <p className="text-sm text-gray-700 bg-red-50 p-2 rounded">{summary.emotional_concerns}</p>
                            </div>
                          )}
                          {summary.academic_concerns && (
                            <div>
                              <h4 className="font-medium text-blue-700 mb-1">Academic Concerns:</h4>
                              <p className="text-sm text-gray-700 bg-blue-50 p-2 rounded">{summary.academic_concerns}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Chat Sessions
              </CardTitle>
              <CardDescription>
                View and manage student mental health support chat sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {chatSessions.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No chat sessions found</p>
                ) : (
                  chatSessions.map((session) => (
                    <Card key={session.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(session.status)}>
                                {session.status}
                              </Badge>
                              <span className="font-medium">
                                {session.is_anonymous ? 'Anonymous Student' : session.student_name}
                              </span>
                              {session.grade && (
                                <span className="text-sm text-gray-500">Grade {session.grade}</span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              Created: {format(new Date(session.created_at), 'MMM dd, yyyy HH:mm')}
                              {session.ended_at && (
                                <span> • Ended: {format(new Date(session.ended_at), 'MMM dd, yyyy HH:mm')}</span>
                              )}
                            </div>
                          </div>
                          {session.status === 'waiting' && (
                            <Button size="sm">
                              Join Session
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DoctorMentalHealthDashboard;
