
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircleIcon, XIcon, SendIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

interface LiveChatWidgetProps {
  onClose?: () => void;
}

const LiveChatWidget = ({ onClose }: LiveChatWidgetProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  const handleOpenChat = () => {
    setIsConnecting(true);
    
    // Simulate connection process
    setTimeout(() => {
      setIsConnecting(false);
      setIsOpen(true);
      toast({
        title: "Connected to Live Chat",
        description: "A mental health professional will be with you shortly",
      });
    }, 2000);
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    toast({
      title: "Message Sent",
      description: "Your message has been sent to the mental health professional",
    });
    
    setMessage("");
    
    // Simulate response after a short delay
    setTimeout(() => {
      toast({
        title: "Dr. Sarah is typing...",
        description: "Please wait while our specialist prepares a response",
      });
    }, 1000);
  };

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  if (isOpen) {
    return (
      <Card className="fixed bottom-4 right-4 w-96 h-96 z-50 shadow-lg border-purple-200">
        <CardHeader className="bg-purple-600 text-white p-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircleIcon className="w-5 h-5" />
              Ask the Doctor - Live Chat
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
        <CardContent className="p-4 flex flex-col h-80">
          <div className="flex-1 bg-gray-50 rounded-lg p-4 mb-4 overflow-y-auto">
            <div className="text-center text-gray-500 mb-4">
              <p className="text-sm">Connected to Live Chat Support</p>
              <p className="text-xs">A mental health professional will respond shortly</p>
            </div>
            
            {/* Simulated chat messages */}
            <div className="space-y-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <p className="text-sm font-medium text-purple-800">Dr. Sarah</p>
                <p className="text-sm text-purple-700">Hello! I'm here to help. How are you feeling today?</p>
              </div>
            </div>
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
        </CardContent>
      </Card>
    );
  }

  return (
    <Button
      onClick={handleOpenChat}
      disabled={isConnecting}
      className="bg-purple-600 hover:bg-purple-700 text-white"
    >
      <MessageCircleIcon className="w-4 h-4 mr-2" />
      {isConnecting ? "Connecting..." : "Ask the Doctor - Live Chat"}
    </Button>
  );
};

export default LiveChatWidget;
