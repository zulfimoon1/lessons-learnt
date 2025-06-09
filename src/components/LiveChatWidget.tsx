
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
import { useLanguage } from "@/contexts/LanguageContext";

interface LiveChatWidgetProps {
  studentId?: string;
  studentName: string;
  school: string;
  grade: string;
  onClose?: () => void;
}

const LiveChatWidget = ({ studentId, studentName, school, grade, onClose }: LiveChatWidgetProps) => {
  const { toast } = useToast();
  const { t } = useLanguage();
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
        isAnonymous ? t('demo.mockup.anonymousStudent') : studentName,
        school,
        grade,
        isAnonymous
      );

      if (error) {
        toast({
          title: t('chat.connectionFailed'),
          description: error,
          variant: "destructive",
        });
        setIsConnecting(false);
        return;
      }

      setCurrentSession(session || null);
      setIsConnecting(false);
      
      toast({
        title: t('chat.chatStarted'),
        description: t('chat.doctorWillJoin'),
      });
    } catch (error) {
      console.error('LiveChatWidget: Error starting chat:', error);
      toast({
        title: t('chat.connectionFailed'),
        description: t('chat.connectionFailed'),
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
              {t('chat.startLiveChatWithDoctor')}
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
            <h3 className="font-semibold text-lg mb-2">{t('chat.chatPreferences')}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t('chat.connectWithDoctor')}
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
                  {t('chat.anonymousChat')}
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  {isAnonymous 
                    ? t('chat.identityProtected')
                    : t('chat.nameVisible')
                  }
                </p>
              </div>
            </div>
          </div>

          {isAnonymous && (
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <p className="text-sm text-green-800 font-medium">
                <ShieldCheckIcon className="w-4 h-4 inline mr-1" />
                {t('chat.privacyProtected')}
              </p>
              <p className="text-xs text-green-700">
                {t('chat.conversationConfidential')}
              </p>
            </div>
          )}

          <Button
            onClick={handleOpenChat}
            disabled={isConnecting}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isConnecting ? t('chat.creatingSession') : t('chat.startChatWithDoctor')}
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
      {t('chat.chatWithDoctor')}
    </Button>
  );
};

export default LiveChatWidget;
