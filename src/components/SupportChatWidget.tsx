
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HeadphonesIcon, XIcon, SendIcon, MessageCircleIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SupportMessage {
  id: string;
  sender_type: 'teacher' | 'admin';
  sender_name: string;
  message: string;
  sent_at: string;
}

interface SupportChatWidgetProps {
  teacherName: string;
  teacherEmail: string;
  schoolName: string;
  teacherRole: string;
}

const SupportChatWidget = ({ teacherName, teacherEmail, schoolName, teacherRole }: SupportChatWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();
  const { toast } = useToast();

  const startSupportSession = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
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

      setSessionId(data.id);
      setIsOpen(true);
      
      // Send initial message
      await sendMessage(`Hello, I need support. I'm ${teacherName} from ${schoolName} (${teacherRole}).`);
      
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

  const sendMessage = async (messageText: string) => {
    if (!sessionId || !messageText.trim()) return;

    try {
      const { error } = await supabase
        .from('support_chat_messages')
        .insert({
          session_id: sessionId,
          sender_type: 'teacher',
          sender_name: teacherName,
          message: messageText.trim()
        });

      if (error) throw error;

      // Add message to local state
      const newMsg: SupportMessage = {
        id: `temp-${Date.now()}`,
        sender_type: 'teacher',
        sender_name: teacherName,
        message: messageText.trim(),
        sent_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, newMsg]);
      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = () => {
    sendMessage(newMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const closeChat = () => {
    setIsOpen(false);
    if (sessionId) {
      // Mark session as ended
      supabase
        .from('support_chat_sessions')
        .update({ status: 'ended' })
        .eq('id', sessionId);
    }
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
            <Badge variant="secondary" className="bg-blue-800 text-white">
              {schoolName}
            </Badge>
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
            Connected to support team
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
                  Your message has been sent to our support team. We'll respond shortly.
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="flex justify-end">
                  <div className="max-w-[80%] p-3 rounded-lg bg-blue-600 text-white">
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
              onClick={handleSendMessage}
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
