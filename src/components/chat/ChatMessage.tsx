
import { UserIcon, StethoscopeIcon } from "lucide-react";

interface ChatMessageData {
  id: string;
  session_id: string;
  sender_type: 'student' | 'doctor';
  sender_name: string;
  message: string;
  sent_at: string;
}

interface ChatMessageProps {
  message: ChatMessageData;
  isCurrentUser: boolean;
}

const ChatMessage = ({ message, isCurrentUser }: ChatMessageProps) => {
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] p-3 rounded-lg ${
          isCurrentUser
            ? 'bg-purple-600 text-white'
            : 'bg-gray-100 text-gray-800'
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          {message.sender_type === 'student' ? (
            <UserIcon className="w-3 h-3" />
          ) : (
            <StethoscopeIcon className="w-3 h-3" />
          )}
          <span className="text-xs font-medium">
            {message.sender_name}
          </span>
        </div>
        <p className="text-sm">{message.message}</p>
        <span className="text-xs opacity-70">
          {new Date(message.sent_at).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;
