
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LiveChatSession } from "@/types/auth";
import { useRealtimeChatSession } from "@/hooks/useChatSession";
import { useLanguage } from "@/contexts/LanguageContext";
import ChatHeader from "./chat/ChatHeader";
import ChatMessages from "./chat/ChatMessages";
import ChatInput from "./chat/ChatInput";

interface RealtimeChatProps {
  session: LiveChatSession;
  studentName: string;
  isAnonymous: boolean;
  onClose: () => void;
  isDoctorView?: boolean;
}

const RealtimeChat = ({ session, studentName, isAnonymous, onClose, isDoctorView = false }: RealtimeChatProps) => {
  const [newMessage, setNewMessage] = useState("");
  const { t } = useLanguage();
  const { messages, isConnected, doctorInfo, sendMessage } = useRealtimeChatSession(session, isDoctorView, studentName);

  const handleSendMessage = async () => {
    await sendMessage(newMessage, isAnonymous);
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const currentUserType = isDoctorView ? 'doctor' : 'student';

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-96 z-50 shadow-lg border-purple-200">
      <ChatHeader
        isDoctorView={isDoctorView}
        isAnonymous={isAnonymous}
        isConnected={isConnected}
        studentName={session.student_name}
        doctorName={doctorInfo?.name}
        onClose={onClose}
      />
      <CardContent className="p-0 flex flex-col h-80">
        <ChatMessages
          messages={messages}
          currentUserType={currentUserType}
          isConnected={isConnected}
          isDoctorView={isDoctorView}
        />
        <ChatInput
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          onSendMessage={handleSendMessage}
          onKeyPress={handleKeyPress}
        />
      </CardContent>
    </Card>
  );
};

export default RealtimeChat;
