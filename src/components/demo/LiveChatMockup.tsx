
import { Badge } from "@/components/ui/badge";
import { MessageCircleIcon, SendIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const LiveChatMockup = () => {
  const { t } = useLanguage();
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{t('demo.mockups.liveChat.title')}</h3>
        <Badge className="bg-green-100 text-green-700">{t('demo.mockups.liveChat.online')}</Badge>
      </div>
      
      <div className="space-y-3 mb-4">
        <div className="flex gap-3">
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
            Dr
          </div>
          <div className="flex-1 bg-purple-50 p-3 rounded-lg">
            <p className="text-sm text-purple-800">Hello! I'm Dr. Sarah, a licensed psychologist. How are you feeling today? This is a safe, anonymous space.</p>
            <span className="text-xs text-purple-600">2 min</span>
          </div>
        </div>
        
        <div className="flex gap-3 justify-end">
          <div className="flex-1 bg-gray-100 p-3 rounded-lg max-w-xs ml-8">
            <p className="text-sm text-gray-800">I've been feeling really anxious about my upcoming exams. I can't seem to focus and I'm worried I'll fail.</p>
            <span className="text-xs text-gray-600">1 min</span>
          </div>
          <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-medium">
            A
          </div>
        </div>
        
        <div className="flex gap-3">
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
            Dr
          </div>
          <div className="flex-1 bg-purple-50 p-3 rounded-lg">
            <p className="text-sm text-purple-800">Thank you for sharing that with me. Exam anxiety is very common and completely understandable. Let's work through some coping strategies together.</p>
            <span className="text-xs text-purple-600">{t('demo.mockups.liveChat.now')}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border">
        <MessageCircleIcon className="w-4 h-4 text-gray-400" />
        <input 
          type="text" 
          placeholder="Type your message anonymously..."
          className="flex-1 bg-transparent text-sm border-none outline-none"
          disabled
        />
        <SendIcon className="w-4 h-4 text-purple-500" />
      </div>
      
      <div className="mt-3 text-center">
        <div className="text-xs text-gray-500">
          🔒 Anonymous • End-to-end encrypted • HIPAA compliant
        </div>
      </div>
    </div>
  );
};

export default LiveChatMockup;
