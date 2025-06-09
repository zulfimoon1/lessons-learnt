
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { XIcon, SendIcon, UserIcon, StethoscopeIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LiveChatSession } from "@/types/auth";

interface ChatMessage {
  id: string;
  session_id: string;
  sender_type: 'student' | 'doctor';
  sender_name: string;
  message: string;
  sent_at: string;
}

interface RealtimeChatProps {
  session: LiveChatSession;
  studentName: string;
  isAnonymous: boolean;
  onClose: () => void;
  isDoctorView?: boolean;
}

const RealtimeChat = ({ session, studentName, isAnonymous, onClose, isDoctorView = false }: RealtimeChatProps) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('RealtimeChat: Setting up real-time chat for session:', session.id);
    loadMessages();
    setupRealtimeSubscription();
    
    if (session.status === 'active' && session.doctor_id) {
      setIsConnected(true);
      if (!isDoctorView) {
        loadDoctorInfo(session.doctor_id);
      }
    }

    if (isDoctorView && !session.doctor_id) {
      notifyStudentDoctorJoined();
    }

    return () => {
      console.log('RealtimeChat: Cleaning up chat subscription');
    };
  }, [session.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = async () => {
    try {
      console.log('RealtimeChat: Loading messages for session:', session.id);
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', session.id)
        .order('sent_at', { ascending: true });

      if (error) throw error;
      console.log('RealtimeChat: Loaded messages:', data);
      setMessages(data || []);
    } catch (error) {
      console.error('RealtimeChat: Error loading messages:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    console.log('RealtimeChat: Setting up real-time subscription');
    const channel = supabase
      .channel(`chat_${session.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `session_id=eq.${session.id}`
        },
        (payload) => {
          console.log('RealtimeChat: New message received:', payload);
          setMessages(current => [...current, payload.new as ChatMessage]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'live_chat_sessions',
          filter: `id=eq.${session.id}`
        },
        (payload) => {
          console.log('RealtimeChat: Session updated:', payload);
          if (payload.new.status === 'active' && payload.new.doctor_id) {
            setIsConnected(true);
            if (!isDoctorView) {
              loadDoctorInfo(payload.new.doctor_id);
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('RealtimeChat: Subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const loadDoctorInfo = async (doctorId: string) => {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('name, email')
        .eq('id', doctorId)
        .eq('role', 'doctor')
        .single();

      if (error) throw error;
      console.log('RealtimeChat: Loaded doctor info:', data);
      setDoctorInfo(data);
    } catch (error) {
      console.error('RealtimeChat: Error loading doctor info:', error);
    }
  };

  const notifyStudentDoctorJoined = async () => {
    try {
      console.log('RealtimeChat: Sending doctor joined notification');
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          session_id: session.id,
          sender_type: 'doctor',
          sender_name: 'System',
          message: `Dr. ${studentName} has joined the conversation. How can I help you today?`
        });

      if (error) throw error;
    } catch (error) {
      console.error('RealtimeChat: Error sending doctor joined notification:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      console.log('RealtimeChat: Sending message:', newMessage);
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          session_id: session.id,
          sender_type: isDoctorView ? 'doctor' : 'student',
          sender_name: isDoctorView ? `Dr. ${studentName}` : (isAnonymous ? 'Anonymous Student' : studentName),
          message: newMessage.trim()
        });

      if (error) throw error;
      setNewMessage("");
    } catch (error) {
      console.error('RealtimeChat: Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const currentUserType = isDoctorView ? 'doctor' : 'student';

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-96 z-50 shadow-lg border-purple-200">
      <CardHeader className="bg-purple-600 text-white p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <StethoscopeIcon className="w-5 h-5" />
            {isDoctorView ? 'Chat with Student' : 'Live Chat with Doctor'}
            {isAnonymous && !isDoctorView && (
              <Badge variant="secondary" className="bg-purple-800 text-white">
                Anonymous
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-purple-700"
          >
            <XIcon className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-sm">
          {isConnected ? (
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              {isDoctorView 
                ? `Connected with ${isAnonymous ? 'Anonymous Student' : session.student_name}`
                : `Connected with Dr. ${doctorInfo?.name || 'Doctor'}`
              }
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              {isDoctorView ? "Connecting..." : "Waiting for doctor..."}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0 flex flex-col h-80">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p className="text-sm">
                  {isConnected 
                    ? "Start the conversation by sending a message below"
                    : isDoctorView
                    ? "Waiting for connection..."
                    : "Your chat session has been created. A doctor will join shortly."
                  }
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_type === currentUserType ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.sender_type === currentUserType
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {message.sender_type === 'student' ? (
                        <UserIcon className="w-3 h-3" />
                      ) : (
                        <StethoscopeIcon className="w-3 h-3" />
                      )}
                      <span className="text-xs font-medium">
                        {message.sender_name}
                      </span>
                    </div>
                    <p className="text-sm">{message.message}</p>
                    <span className="text-xs opacity-70">
                      {new Date(message.sent_at).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Textarea
              placeholder="Type your message here..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 min-h-[60px] resize-none"
              maxLength={500}
            />
            <Button
              onClick={sendMessage}
              className="bg-purple-600 hover:bg-purple-700"
              disabled={!newMessage.trim()}
            >
              <SendIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RealtimeChat;
