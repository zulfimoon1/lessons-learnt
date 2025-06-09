
import { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/contexts/LanguageContext";
import ChatMessage from "./ChatMessage";

interface ChatMessageData {
  id: string;
  session_id: string;
  sender_type: 'student' | 'doctor';
  sender_name: string;
  message: string;
  sent_at: string;
}

interface ChatMessagesProps {
  messages: ChatMessageData[];
  currentUserType: 'student' | 'doctor';
  isConnected: boolean;
  isDoctorView: boolean;
}

const ChatMessages = ({ messages, currentUserType, isConnected, isDoctorView }: ChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p className="text-sm">
              {isConnected 
                ? t('chat.startConversation')
                : isDoctorView
                ? t('chat.waitingConnection')
                : t('chat.doctorWillJoin')
              }
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              isCurrentUser={message.sender_type === currentUserType}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};

export default ChatMessages;
