
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircleIcon, XIcon, ShieldCheckIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { createChatSession, endChatSession } from "@/services/liveChatService";
import { LiveChatSession } from "@/types/auth";
import RealtimeChat from "./RealtimeChat";

interface LiveChatWidgetProps {
  studentId?: string;
  studentName: string;
  school: string;
  grade: string;
  onClose?: () => void;
}

const LiveChatWidget = ({ studentId, studentName, school, grade, onClose }: LiveChatWidgetProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [currentSession, setCurrentSession] = useState<LiveChatSession | null>(null);

  const handleOpenChat = async () => {
    setIsConnecting(true);
    
    try {
      console.log('LiveChatWidget: Starting chat session for:', { studentId, studentName, school, grade, isAnonymous });
      
      const { error, session } = await createChatSession(
        isAnonymous ? null : studentId || null,
        isAnonymous ? 'Anonymous Student' : studentName,
        school,
        grade,
        isAnonymous
      );

      if (error) {
        toast({
          title: "Connection Failed",
          description: error,
          variant: "destructive",
        });
        setIsConnecting(false);
        return;
      }

      setCurrentSession(session || null);
      setIsConnecting(false);
      
      toast({
        title: "Chat Session Created",
        description: "A doctor from your school will join the conversation shortly.",
      });
    } catch (error) {
      console.error('LiveChatWidget: Error starting chat:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to start chat session. Please try again.",
        variant: "destructive",
      });
      setIsConnecting(false);
    }
  };

  const handleClose = async () => {
    if (currentSession) {
      await endChatSession(currentSession.id);
    }
    
    setIsOpen(false);
    setCurrentSession(null);
    if (onClose) onClose();
  };

  if (currentSession) {
    return (
      <RealtimeChat
        session={currentSession}
        studentName={studentName}
        isAnonymous={isAnonymous}
        onClose={handleClose}
      />
    );
  }

  if (isOpen) {
    return (
      <Card className="fixed bottom-4 right-4 w-96 z-50 shadow-lg border-purple-200">
        <CardHeader className="bg-purple-600 text-white p-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircleIcon className="w-5 h-5" />
              Start Live Chat with Doctor
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
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
              Connect with a qualified doctor from your school for mental health support
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
                    ? "Your identity will be completely protected. The doctor won't see your name or personal details."
                    : "Your name and school information will be visible to the doctor for personalized support."
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
            onClick={handleOpenChat}
            disabled={isConnecting}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isConnecting ? "Creating Session..." : "Start Chat with Doctor"}
          </Button>
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
      Chat with Doctor
    </Button>
  );
};

export default LiveChatWidget;
