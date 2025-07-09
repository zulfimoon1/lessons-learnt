
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircleIcon, XIcon, ShieldCheckIcon, Loader2 } from "lucide-react";
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
  const [error, setError] = useState<string | null>(null);

  console.log('LiveChatWidget: Rendering with props:', { studentId, studentName, school, grade });

  const handleOpenChat = async () => {
    console.log('LiveChatWidget: Starting chat session...');
    setIsConnecting(true);
    setError(null);
    
    try {
      const sessionData = {
        studentId: isAnonymous ? null : studentId || null,
        studentName: isAnonymous ? 'Anonymous Student' : studentName,
        school,
        grade,
        isAnonymous
      };
      
      console.log('LiveChatWidget: Creating session with data:', sessionData);
      
      const { error, session } = await createChatSession(
        sessionData.studentId,
        sessionData.studentName,
        sessionData.school,
        sessionData.grade,
        sessionData.isAnonymous
      );

      if (error) {
        console.error('LiveChatWidget: Error creating session:', error);
        setError(error);
        toast({
          title: t('chat.connectionFailed') || 'Connection Failed',
          description: error,
          variant: "destructive",
        });
        return;
      }

      if (!session) {
        console.error('LiveChatWidget: No session returned');
        const errorMsg = 'Failed to create chat session';
        setError(errorMsg);
        toast({
          title: t('chat.connectionFailed') || 'Connection Failed',
          description: errorMsg,
          variant: "destructive",
        });
        return;
      }

      console.log('LiveChatWidget: Session created successfully with ID:', session.id);
      setCurrentSession(session);
      
      toast({
        title: t('chat.chatStarted') || 'Chat Started',
        description: t('chat.doctorWillJoin') || 'A doctor will join shortly to help you.',
      });
    } catch (error) {
      console.error('LiveChatWidget: Unexpected error:', error);
      const errorMsg = 'An unexpected error occurred. Please try again.';
      setError(errorMsg);
      toast({
        title: t('chat.connectionFailed') || 'Connection Failed',
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleClose = async () => {
    console.log('LiveChatWidget: Closing chat session');
    if (currentSession) {
      console.log('LiveChatWidget: Ending session:', currentSession.id);
      try {
        await endChatSession(currentSession.id);
      } catch (error) {
        console.error('LiveChatWidget: Error ending session:', error);
      }
    }
    
    setIsOpen(false);
    setCurrentSession(null);
    setError(null);
    if (onClose) onClose();
  };

  if (currentSession) {
    console.log('LiveChatWidget: Rendering RealtimeChat with session:', currentSession.id);
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
              {t('chat.startLiveChatWithDoctor') || 'Start Live Chat with Doctor'}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsOpen(false);
                setError(null);
              }}
              className="text-white hover:bg-purple-700"
            >
              <XIcon className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="text-center">
            <h3 className="font-semibold text-lg mb-2">{t('chat.chatPreferences') || 'Chat Preferences'}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t('chat.connectWithDoctor') || 'Connect with a qualified medical professional'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 p-3 rounded-lg border border-red-200 mb-4">
              <p className="text-sm text-red-800 font-medium">Error</p>
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

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
                  {t('chat.anonymousChat') || 'Anonymous Chat'}
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  {isAnonymous 
                    ? (t('chat.identityProtected') || 'Your identity will be protected')
                    : (t('chat.nameVisible') || 'Your name will be visible to the doctor')
                  }
                </p>
              </div>
            </div>
          </div>

          {isAnonymous && (
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <p className="text-sm text-green-800 font-medium">
                <ShieldCheckIcon className="w-4 h-4 inline mr-1" />
                {t('chat.privacyProtected') || 'Privacy Protected'}
              </p>
              <p className="text-xs text-green-700">
                {t('chat.conversationConfidential') || 'Your conversation will remain completely confidential'}
              </p>
            </div>
          )}

          <Button
            onClick={handleOpenChat}
            disabled={isConnecting}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('chat.creatingSession') || 'Creating Session...'}
              </>
            ) : (
              <>
                <MessageCircleIcon className="w-4 h-4 mr-2" />
                {t('chat.startChatWithDoctor') || 'Start Chat with Doctor'}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Main chat button - this should always be visible
  return (
    <div className="w-full">
      <Button
        onClick={() => {
          console.log('LiveChatWidget: Opening chat interface');
          setIsOpen(true);
          setError(null);
        }}
        disabled={isConnecting}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 text-lg font-medium"
      >
        <MessageCircleIcon className="w-5 h-5 mr-2" />
        {t('chat.chatWithDoctor') || 'Chat with Doctor'}
      </Button>
    </div>
  );
};

export default LiveChatWidget;
