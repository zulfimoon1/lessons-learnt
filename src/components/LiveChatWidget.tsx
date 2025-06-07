
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircleIcon, XIcon, SendIcon, ShieldCheckIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface LiveChatWidgetProps {
  onClose?: () => void;
}

const LiveChatWidget = ({ onClose }: LiveChatWidgetProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [chatStarted, setChatStarted] = useState(false);

  const handleOpenChat = () => {
    setIsConnecting(true);
    
    // Simulate connection process
    setTimeout(() => {
      setIsConnecting(false);
      setIsOpen(true);
      setChatStarted(true);
      toast({
        title: "Connected to Live Chat",
        description: `A mental health professional will be with you shortly${isAnonymous ? ' (Anonymous mode)' : ''}`,
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
    setChatStarted(false);
    if (onClose) onClose();
  };

  const handleStartChat = () => {
    handleOpenChat();
  };

  if (isOpen && !chatStarted) {
    return (
      <Card className="fixed bottom-4 right-4 w-96 z-50 shadow-lg border-purple-200">
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
        <CardContent className="p-6 space-y-4">
          <div className="text-center">
            <h3 className="font-semibold text-lg mb-2">Chat Preferences</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Choose how you'd like to chat with our mental health professional
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-3">
              <Switch
                id="anonymous-mode"
                checked={isAnonymous}
                onCheckedChange={setIsAnonymous}
              />
              <div className="flex-1">
                <Label htmlFor="anonymous-mode" className="flex items-center gap-2 font-medium">
                  <ShieldCheckIcon className="w-4 h-4" />
                  Anonymous Chat
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  {isAnonymous 
                    ? "Your identity will be completely protected. The psychologist won't see your name or personal details."
                    : "Your name and school information will be visible to the psychologist for personalized support."
                  }
                </p>
              </div>
            </div>
          </div>

          {isAnonymous && (
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <p className="text-sm text-green-800 font-medium">
                <ShieldCheckIcon className="w-4 h-4 inline mr-1" />
                Privacy Protected
              </p>
              <p className="text-xs text-green-700">
                Your conversation is completely confidential and anonymous.
              </p>
            </div>
          )}

          <Button
            onClick={handleStartChat}
            disabled={isConnecting}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isConnecting ? "Connecting..." : "Start Chat"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isOpen && chatStarted) {
    return (
      <Card className="fixed bottom-4 right-4 w-96 h-96 z-50 shadow-lg border-purple-200">
        <CardHeader className="bg-purple-600 text-white p-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircleIcon className="w-5 h-5" />
              Ask the Doctor - Live Chat
              {isAnonymous && (
                <span className="text-xs bg-purple-800 px-2 py-1 rounded">Anonymous</span>
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
        <CardContent className="p-4 flex flex-col h-80">
          <div className="flex-1 bg-gray-50 rounded-lg p-4 mb-4 overflow-y-auto">
            <div className="text-center text-gray-500 mb-4">
              <p className="text-sm">Connected to Live Chat Support</p>
              <p className="text-xs">
                {isAnonymous 
                  ? "You are chatting anonymously - your identity is protected"
                  : "A mental health professional will respond shortly"
                }
              </p>
            </div>
            
            {/* Simulated chat messages */}
            <div className="space-y-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <p className="text-sm font-medium text-purple-800">Dr. Sarah</p>
                <p className="text-sm text-purple-700">
                  Hello! I'm here to help. How are you feeling today?
                  {isAnonymous && " Please know that our conversation is completely confidential."}
                </p>
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
      onClick={() => setIsOpen(true)}
      disabled={isConnecting}
      className="bg-purple-600 hover:bg-purple-700 text-white"
    >
      <MessageCircleIcon className="w-4 h-4 mr-2" />
      {isConnecting ? "Connecting..." : "Ask the Doctor - Live Chat"}
    </Button>
  );
};

export default LiveChatWidget;
