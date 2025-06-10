
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HeadphonesIcon, XIcon, SendIcon, MessageCircleIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SupportChatWidgetProps {
  teacherName: string;
  teacherEmail: string;
  schoolName: string;
  teacherRole: string;
}

interface SupportMessage {
  id: string;
  sender_type: string;
  sender_name: string;
  message: string;
  sent_at: string;
}

const SupportChatWidget = ({ teacherName, teacherEmail, schoolName, teacherRole }: SupportChatWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { t } = useLanguage();
  const { toast } = useToast();

  useEffect(() => {
    if (sessionId) {
      loadMessages();
      setupRealtimeSubscription();
    }
  }, [sessionId]);

  const loadMessages = async () => {
    if (!sessionId) return;

    try {
      const { data, error } = await supabase
        .from('support_chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('sent_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`support_chat_${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_chat_messages',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          console.log('New support message received:', payload);
          const newMessage = payload.new as SupportMessage;
          setMessages(current => [...current, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const startSupportSession = async () => {
    setIsLoading(true);
    try {
      console.log('Creating support session for:', { teacherName, teacherEmail, schoolName, teacherRole });
      
      const { data: session, error } = await supabase
        .from('support_chat_sessions')
        .insert({
          teacher_name: teacherName,
          teacher_email: teacherEmail,
          school_name: schoolName,
          teacher_role: teacherRole,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      console.log('Support session created:', session);
      setSessionId(session.id);
      setIsOpen(true);
      
      // Send initial message
      const { error: messageError } = await supabase
        .from('support_chat_messages')
        .insert({
          session_id: session.id,
          sender_type: 'teacher',
          sender_name: teacherName,
          message: `Hello, I need support. I'm ${teacherName} from ${schoolName} (${teacherRole}).`
        });

      if (messageError) throw messageError;

      toast({
        title: "Support Chat Started",
        description: "Your message has been sent to Lessons Learnt support team.",
      });
    } catch (error) {
      console.error('Error starting support session:', error);
      toast({
        title: "Error",
        description: "Failed to start support chat. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !sessionId) return;

    try {
      const { error } = await supabase
        .from('support_chat_messages')
        .insert({
          session_id: sessionId,
          sender_type: 'teacher',
          sender_name: teacherName,
          message: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage("");

      toast({
        title: "Message Sent",
        description: "Your message has been sent to support.",
      });
    } catch (error) {
      console.error('Error sending message:', error);
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

  const closeChat = async () => {
    if (sessionId) {
      try {
        await supabase
          .from('support_chat_sessions')
          .update({
            status: 'ended',
            ended_at: new Date().toISOString()
          })
          .eq('id', sessionId);
      } catch (error) {
        console.error('Error ending session:', error);
      }
    }
    
    setIsOpen(false);
    setMessages([]);
    setSessionId(null);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={startSupportSession}
        disabled={isLoading}
        className="bg-blue-600 hover:bg-blue-700 text-white"
        size="sm"
      >
        <HeadphonesIcon className="w-4 h-4 mr-2" />
        {isLoading ? "Starting..." : "Contact Support"}
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-96 z-50 shadow-lg border-blue-200">
      <CardHeader className="bg-blue-600 text-white p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <HeadphonesIcon className="w-5 h-5" />
            Lessons Learnt Support
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={closeChat}
            className="text-white hover:bg-blue-700"
          >
            <XIcon className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-sm">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            {schoolName} - {teacherRole}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex flex-col h-80">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <MessageCircleIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">
                  Start a conversation with our support team
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender_type === 'teacher' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${
                    message.sender_type === 'teacher' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-800'
                  }`}>
                    <p className="text-sm">{message.message}</p>
                    <span className="text-xs opacity-70">
                      {new Date(message.sent_at).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Textarea
              placeholder="Type your message to support..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 min-h-[60px] resize-none"
              maxLength={500}
            />
            <Button
              onClick={sendMessage}
              className="bg-blue-600 hover:bg-blue-700"
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

export default SupportChatWidget;
