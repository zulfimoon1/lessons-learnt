
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircleIcon, UserIcon, ClockIcon, StethoscopeIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LiveChatSession } from "@/types/auth";
import { joinChatSession } from "@/services/liveChatService";
import RealtimeChat from "./RealtimeChat";

interface DoctorChatDashboardProps {
  doctorId: string;
  doctorName: string;
  school: string;
}

const DoctorChatDashboard = ({ doctorId, doctorName, school }: DoctorChatDashboardProps) => {
  const { toast } = useToast();
  const [waitingSessions, setWaitingSessions] = useState<LiveChatSession[]>([]);
  const [activeSessions, setActiveSessions] = useState<LiveChatSession[]>([]);
  const [currentChatSession, setCurrentChatSession] = useState<LiveChatSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSessions();
    setupRealtimeSubscription();
  }, [school, doctorId]);

  const loadSessions = async () => {
    try {
      console.log('Loading chat sessions for doctor:', { doctorId, school });
      
      // Load waiting sessions
      const { data: waiting, error: waitingError } = await supabase
        .from('live_chat_sessions')
        .select('*')
        .eq('school', school)
        .eq('status', 'waiting')
        .order('created_at', { ascending: true });

      if (waitingError) throw waitingError;

      // Load active sessions for this doctor
      const { data: active, error: activeError } = await supabase
        .from('live_chat_sessions')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('status', 'active')
        .order('started_at', { ascending: false });

      if (activeError) throw activeError;

      console.log('Loaded sessions:', { waiting, active });
      setWaitingSessions(waiting || []);
      setActiveSessions(active || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast({
        title: "Error",
        description: "Failed to load chat sessions",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    console.log('Setting up real-time subscription for doctor chat dashboard');
    
    const channel = supabase
      .channel(`doctor_chat_${doctorId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_chat_sessions',
          filter: `school=eq.${school}`
        },
        (payload) => {
          console.log('Chat session updated:', payload);
          loadSessions();
        }
      )
      .subscribe((status) => {
        console.log('Doctor chat subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleJoinSession = async (session: LiveChatSession) => {
    try {
      console.log('Doctor joining session:', session.id);
      
      const { error } = await joinChatSession(session.id, doctorId);
      
      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
        return;
      }

      setCurrentChatSession({ ...session, doctor_id: doctorId, status: 'active' });
      
      toast({
        title: "Joined Chat",
        description: `You are now chatting with ${session.is_anonymous ? 'Anonymous Student' : session.student_name}`,
      });
    } catch (error) {
      console.error('Error joining session:', error);
      toast({
        title: "Error",
        description: "Failed to join chat session",
        variant: "destructive",
      });
    }
  };

  const handleCloseChat = () => {
    setCurrentChatSession(null);
    loadSessions();
  };

  if (currentChatSession) {
    return (
      <RealtimeChat
        session={currentChatSession}
        studentName={doctorName}
        isAnonymous={false}
        onClose={handleCloseChat}
        isDoctorView={true}
      />
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading chat sessions...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircleIcon className="w-5 h-5" />
            Doctor Chat Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Waiting Sessions */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <ClockIcon className="w-4 h-4" />
                Waiting for Doctor ({waitingSessions.length})
              </h3>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {waitingSessions.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      No students waiting for chat
                    </div>
                  ) : (
                    waitingSessions.map((session) => (
                      <Card key={session.id} className="border-orange-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <UserIcon className="w-4 h-4" />
                              <span className="font-medium">
                                {session.is_anonymous ? 'Anonymous Student' : session.student_name}
                              </span>
                              {session.is_anonymous && (
                                <Badge variant="secondary">Anonymous</Badge>
                              )}
                            </div>
                            <Badge variant="outline">{session.grade}</Badge>
                          </div>
                          <div className="text-sm text-gray-600 mb-3">
                            Waiting since: {new Date(session.created_at!).toLocaleTimeString()}
                          </div>
                          <Button
                            onClick={() => handleJoinSession(session)}
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            Join Chat
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Active Sessions */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <StethoscopeIcon className="w-4 h-4" />
                Your Active Chats ({activeSessions.length})
              </h3>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {activeSessions.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      No active chat sessions
                    </div>
                  ) : (
                    activeSessions.map((session) => (
                      <Card key={session.id} className="border-green-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <UserIcon className="w-4 h-4" />
                              <span className="font-medium">
                                {session.is_anonymous ? 'Anonymous Student' : session.student_name}
                              </span>
                              {session.is_anonymous && (
                                <Badge variant="secondary">Anonymous</Badge>
                              )}
                            </div>
                            <Badge variant="outline">{session.grade}</Badge>
                          </div>
                          <div className="text-sm text-gray-600 mb-3">
                            Started: {new Date(session.started_at!).toLocaleTimeString()}
                          </div>
                          <Button
                            onClick={() => setCurrentChatSession(session)}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                          >
                            Continue Chat
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorChatDashboard;
