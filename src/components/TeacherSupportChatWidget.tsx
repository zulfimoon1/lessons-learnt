import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquareIcon, UserIcon, ClockIcon, HeartHandshakeIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import RealtimeChat from "./RealtimeChat";
import { LiveChatSession } from "@/types/auth";

interface TeacherSupportChatWidgetProps {
  teacher: {
    id: string;
    name: string;
    email: string;
    school: string;
  };
}

const TeacherSupportChatWidget: React.FC<TeacherSupportChatWidgetProps> = ({ teacher }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState<LiveChatSession | null>(null);
  const [activeSessions, setActiveSessions] = useState<LiveChatSession[]>([]);

  useEffect(() => {
    loadSessions();
  }, [teacher.email]);

  const loadSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('live_chat_sessions')
        .select('*')
        .eq('student_id', teacher.id)
        .eq('grade', 'Teacher Support')
        .eq('status', 'waiting')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActiveSessions((data || []).map(session => ({
        ...session,
        status: session.status as 'waiting' | 'active' | 'ended'
      })));
    } catch (error) {
      console.error('Error loading support sessions:', error);
    }
  };

  const startNewSupportSession = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('live_chat_sessions')
        .insert({
          student_id: teacher.id, // Using teacher as "student" for support chat
          student_name: teacher.name,
          school: teacher.school,
          grade: 'Teacher Support',
          is_anonymous: false,
          status: 'waiting'
        })
        .select()
        .single();

      if (error) throw error;
      
      setCurrentSession({
        ...data,
        status: data.status as 'waiting' | 'active' | 'ended'
      });
      toast({
        title: "Support Session Started",
        description: "You are now connected to mental health support",
      });
    } catch (error) {
      console.error('Error starting support session:', error);
      toast({
        title: "Error",
        description: "Failed to start support session",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const handleCloseChat = () => {
    setCurrentSession(null);
    loadSessions();
  };

  if (currentSession) {
    // Convert to the format expected by RealtimeChat
    const chatSession = {
      id: currentSession.id,
      student_id: teacher.id,
      student_name: teacher.name,
      school: teacher.school,
      grade: 'Teacher',
      status: 'active' as const,
      is_anonymous: false,
      created_at: currentSession.created_at,
      started_at: currentSession.created_at,
      ended_at: null,
      doctor_id: null
    };

    return (
      <RealtimeChat
        session={chatSession}
        studentName={teacher.name}
        isAnonymous={false}
        onClose={handleCloseChat}
        isDoctorView={false}
      />
    );
  }

  return (
    <Card className="border-teal-200 bg-teal-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-teal-800">
          <HeartHandshakeIcon className="h-5 w-5" />
          Mental Health Support Chat
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activeSessions.length > 0 ? (
          <div className="space-y-3">
            <p className="text-teal-700 mb-3">You have active support sessions:</p>
            {activeSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div className="flex items-center gap-2">
                  <MessageSquareIcon className="h-4 w-4 text-teal-600" />
                  <span className="text-sm font-medium">Support Session</span>
                  <Badge variant="outline">Active</Badge>
                </div>
                <Button
                  onClick={() => setCurrentSession(session)}
                  size="sm"
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  Continue Chat
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-teal-700 mb-4">
              Need mental health support? Start a confidential chat session with a school psychologist.
            </p>
            <Button
              onClick={startNewSupportSession}
              disabled={isLoading}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Starting...
                </>
              ) : (
                <>
                  <MessageSquareIcon className="h-4 w-4 mr-2" />
                  Start Support Chat
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeacherSupportChatWidget;