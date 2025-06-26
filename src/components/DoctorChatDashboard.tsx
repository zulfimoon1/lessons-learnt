
import { useState, useEffect, useRef } from "react";
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
  const channelRef = useRef<any>(null);

  useEffect(() => {
    console.log('DoctorChatDashboard: Initializing for doctor:', doctorName, 'at school:', school);
    loadSessions();
    setupRealtimeSubscription();
    
    return () => {
      if (channelRef.current) {
        console.log('DoctorChatDashboard: Cleaning up subscription');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [school, doctorId]);

  const loadSessions = async () => {
    try {
      console.log('DoctorChatDashboard: Loading chat sessions for doctor:', { doctorId, school });
      
      const { data: waiting, error: waitingError } = await supabase
        .from('live_chat_sessions')
        .select('*')
        .eq('school', school)
        .eq('status', 'waiting')
        .order('created_at', { ascending: true });

      if (waitingError) {
        console.error('DoctorChatDashboard: Error loading waiting sessions:', waitingError);
        throw waitingError;
      }

      const { data: active, error: activeError } = await supabase
        .from('live_chat_sessions')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('status', 'active')
        .order('started_at', { ascending: false });

      if (activeError) {
        console.error('DoctorChatDashboard: Error loading active sessions:', activeError);
        throw activeError;
      }

      console.log('DoctorChatDashboard: Loaded sessions:', { 
        waiting: waiting?.length || 0, 
        active: active?.length || 0 
      });
      
      const typedWaiting: LiveChatSession[] = (waiting || []).map(session => ({
        ...session,
        status: session.status as 'waiting' | 'active' | 'ended'
      }));
      
      const typedActive: LiveChatSession[] = (active || []).map(session => ({
        ...session,
        status: session.status as 'waiting' | 'active' | 'ended'
      }));
      
      setWaitingSessions(typedWaiting);
      setActiveSessions(typedActive);
      setIsLoading(false);
    } catch (error) {
      console.error('DoctorChatDashboard: Error loading sessions:', error);
      toast({
        title: "Error",
        description: "Failed to load chat sessions",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    console.log('DoctorChatDashboard: Setting up real-time subscription');
    
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    
    const channelName = `doctor_chat_${doctorId}_${Date.now()}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_chat_sessions',
          filter: `school=eq.${school}`
        },
        (payload) => {
          console.log('DoctorChatDashboard: Chat session updated:', payload);
          loadSessions();
        }
      )
      .subscribe((status) => {
        console.log('DoctorChatDashboard: Subscription status:', status);
      });

    channelRef.current = channel;
  };

  const handleJoinSession = async (session: LiveChatSession) => {
    try {
      console.log('DoctorChatDashboard: Doctor joining session:', session.id);
      
      const { error } = await joinChatSession(session.id, doctorId);
      
      if (error) {
        console.error('DoctorChatDashboard: Error joining session:', error);
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
      console.error('DoctorChatDashboard: Error joining session:', error);
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
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-teal"></div>
            <span className="ml-3 text-brand-dark">Loading chat sessions...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircleIcon className="w-5 h-5 text-brand-orange" />
          Live Chat Dashboard - Medical Support
        </CardTitle>
        <p className="text-sm text-gray-600">
          Manage student chat sessions and provide medical guidance
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Waiting Sessions */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <ClockIcon className="w-4 h-4" />
              Students Waiting ({waitingSessions.length})
            </h3>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {waitingSessions.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <MessageCircleIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm">No students waiting for medical support</p>
                  </div>
                ) : (
                  waitingSessions.map((session) => (
                    <Card key={session.id} className="border-orange-200 bg-orange-50/30">
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
                          size="sm"
                        >
                          <StethoscopeIcon className="w-4 h-4 mr-2" />
                          Provide Support
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
              Your Active Sessions ({activeSessions.length})
            </h3>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {activeSessions.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <StethoscopeIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm">No active medical support sessions</p>
                  </div>
                ) : (
                  activeSessions.map((session) => (
                    <Card key={session.id} className="border-green-200 bg-green-50/30">
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
                          size="sm"
                        >
                          Continue Session
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
  );
};

export default DoctorChatDashboard;
