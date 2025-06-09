
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ChatInputProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

const ChatInput = ({ newMessage, setNewMessage, onSendMessage, onKeyPress }: ChatInputProps) => {
  const { t } = useLanguage();

  return (
    <div className="p-4 border-t">
      <div className="flex gap-2">
        <Textarea
          placeholder={t('chat.typePlaceholder')}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={onKeyPress}
          className="flex-1 min-h-[60px] resize-none"
          maxLength={500}
        />
        <Button
          onClick={onSendMessage}
          className="bg-purple-600 hover:bg-purple-700"
          disabled={!newMessage.trim()}
        >
          <SendIcon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
