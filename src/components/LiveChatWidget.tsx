
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircleIcon, XIcon, SendIcon, ShieldIcon, UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuthStorage } from "@/hooks/useAuthStorage";
import { supabase } from "@/integrations/supabase/client";

interface LiveChatWidgetProps {
  onClose?: () => void;
}

const LiveChatWidget = ({ onClose }: LiveChatWidgetProps) => {
  const { toast } = useToast();
  const { student } = useAuthStorage();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    sender: 'user' | 'doctor';
    content: string;
    timestamp: string;
    isAnonymous?: boolean;
  }>>([]);

  const handleOpenChat = () => {
    setIsConnecting(true);
    
    // Simulate connection process
    setTimeout(() => {
      setIsConnecting(false);
      setIsOpen(true);
      
      // Add welcome message
      const welcomeMessage = {
        id: `msg_${Date.now()}`,
        sender: 'doctor' as const,
        content: `Hello! I'm Dr. Sarah, a mental health professional. I'm here to help you. ${isAnonymous ? 'I can see you\'ve chosen to remain anonymous, which is perfectly fine.' : `Nice to meet you, ${student?.full_name}.`} How are you feeling today?`,
        timestamp: new Date().toLocaleTimeString(),
      };
      
      setChatMessages([welcomeMessage]);
      
      toast({
        title: "Connected to Live Chat",
        description: `Connected ${isAnonymous ? 'anonymously' : 'with your identity'} to mental health support`,
      });
    }, 2000);
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    const userMessage = {
      id: `msg_${Date.now()}_user`,
      sender: 'user' as const,
      content: message.trim(),
      timestamp: new Date().toLocaleTimeString(),
      isAnonymous,
    };
    
    setChatMessages(prev => [...prev, userMessage]);

    // Store the message for mental health monitoring
    try {
      const alertData = {
        student_id: isAnonymous ? null : student?.id,
        student_name: isAnonymous ? "Anonymous Student" : (student?.full_name || "Unknown"),
        school: student?.school || "",
        grade: student?.grade || "",
        content: `LIVE CHAT MESSAGE: ${message.trim()}`,
        source_table: 'live_chat',
        source_id: crypto.randomUUID(),
        severity_level: 1,
        alert_type: 'live_chat_message'
      };

      await supabase.from('mental_health_alerts').insert([alertData]);
    } catch (error) {
      console.error('Error storing chat message:', error);
    }

    toast({
      title: "Message Sent",
      description: isAnonymous ? "Your anonymous message has been sent" : "Your message has been sent",
    });
    
    setMessage("");
    
    // Simulate doctor response after a short delay
    setTimeout(() => {
      const responses = [
        "Thank you for sharing that with me. Can you tell me more about how you're feeling?",
        "I understand this might be difficult to talk about. Take your time, I'm here to listen.",
        "That sounds challenging. What kind of support do you think would be most helpful right now?",
        "It's brave of you to reach out. How long have you been feeling this way?",
        "I hear you. Remember that seeking help is a sign of strength, not weakness."
      ];
      
      const doctorResponse = {
        id: `msg_${Date.now()}_doctor`,
        sender: 'doctor' as const,
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date().toLocaleTimeString(),
      };
      
      setChatMessages(prev => [...prev, doctorResponse]);
      
      toast({
        title: "Dr. Sarah responded",
        description: "New message received",
      });
    }, 2000 + Math.random() * 3000);
  };

  const handleClose = () => {
    setIsOpen(false);
    setChatMessages([]);
    setMessage("");
    if (onClose) onClose();
  };

  if (isOpen) {
    return (
      <Card className="fixed bottom-4 right-4 w-96 h-[500px] z-50 shadow-lg border-purple-200">
        <CardHeader className="bg-purple-600 text-white p-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircleIcon className="w-5 h-5" />
              Ask the Doctor - Live Chat
              {isAnonymous && (
                <Badge variant="secondary" className="bg-purple-700 text-white">
                  <ShieldIcon className="w-3 h-3 mr-1" />
                  Anonymous
                </Badge>
              )}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-white hover:bg-purple-700"
            >
              <XIcon className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 flex flex-col h-[420px]">
          <div className="flex-1 bg-gray-50 rounded-lg p-4 mb-4 overflow-y-auto">
            <div className="space-y-3">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${
                    msg.sender === 'user' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-white border border-gray-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      {msg.sender === 'doctor' ? (
                        <>
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                            Dr
                          </div>
                          <span className="text-xs font-medium text-green-700">Dr. Sarah</span>
                        </>
                      ) : (
                        <>
                          {msg.isAnonymous ? (
                            <ShieldIcon className="w-4 h-4 text-purple-600" />
                          ) : (
                            <UserIcon className="w-4 h-4 text-purple-600" />
                          )}
                          <span className="text-xs font-medium text-purple-700">
                            {msg.isAnonymous ? 'Anonymous' : 'You'}
                          </span>
                        </>
                      )}
                      <span className="text-xs text-gray-500">{msg.timestamp}</span>
                    </div>
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <ShieldIcon className="w-4 h-4 text-gray-600" />
                <Label htmlFor="anonymous-mode" className="text-sm">Chat anonymously</Label>
              </div>
              <Switch
                id="anonymous-mode"
                checked={isAnonymous}
                onCheckedChange={setIsAnonymous}
                disabled={chatMessages.length > 1} // Disable after conversation starts
              />
            </div>
            
            <div className="flex gap-2">
              <Textarea
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 min-h-[60px] resize-none"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                onClick={handleSendMessage}
                className="bg-purple-600 hover:bg-purple-700"
                disabled={!message.trim()}
              >
                <SendIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
        <ShieldIcon className="w-4 h-4 text-gray-600" />
        <Label htmlFor="chat-anonymous-mode" className="text-sm">Start chat anonymously</Label>
        <Switch
          id="chat-anonymous-mode"
          checked={isAnonymous}
          onCheckedChange={setIsAnonymous}
        />
      </div>
      
      <Button
        onClick={handleOpenChat}
        disabled={isConnecting}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
      >
        <MessageCircleIcon className="w-4 h-4 mr-2" />
        {isConnecting ? "Connecting..." : `Ask the Doctor - Live Chat ${isAnonymous ? '(Anonymous)' : ''}`}
      </Button>
    </div>
  );
};

export default LiveChatWidget;
