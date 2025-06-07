
import { Badge } from "@/components/ui/badge";
import { EyeOffIcon, LockIcon } from "lucide-react";

const LiveChatMockup = () => (
  <div className="bg-white p-6 rounded-lg shadow-sm border">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-800">Anonymous Live Chat</h3>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-xs text-green-600 font-medium">Secure Connection</span>
      </div>
    </div>
    
    <div className="bg-gray-50 rounded-lg p-4 h-48 mb-4 overflow-y-auto border">
      <div className="space-y-3">
        <div className="bg-purple-100 p-3 rounded-lg max-w-xs border">
          <p className="text-sm">Hello! I'm Dr. Sarah. This is a completely anonymous and secure space. How can I help you today?</p>
          <div className="flex items-center gap-1 mt-1">
            <LockIcon className="w-3 h-3 text-purple-600" />
            <span className="text-xs text-purple-600">Licensed Therapist</span>
          </div>
        </div>
        
        <div className="bg-blue-100 p-3 rounded-lg max-w-xs ml-auto border">
          <p className="text-sm">I'm feeling overwhelmed with my studies and social pressure...</p>
          <span className="text-xs text-blue-600">Anonymous Student</span>
        </div>
        
        <div className="bg-purple-100 p-3 rounded-lg max-w-xs border">
          <p className="text-sm">I understand completely. Those feelings are very common. Let's explore some coping strategies together...</p>
          <span className="text-xs text-purple-600">Dr. Sarah</span>
        </div>
      </div>
    </div>
    
    <div className="flex gap-2">
      <input 
        className="flex-1 p-3 border border-gray-300 rounded-md text-sm" 
        placeholder="Type your message... (completely anonymous)"
        readOnly
      />
      <button className="bg-purple-600 text-white px-4 py-3 rounded-md text-sm font-medium hover:bg-purple-700 transition-colors">
        Send
      </button>
    </div>
    
    <div className="flex items-center gap-1 mt-2">
      <EyeOffIcon className="w-3 h-3 text-gray-500" />
      <span className="text-xs text-gray-500">Your identity is completely protected and anonymous</span>
    </div>
  </div>
);

export default LiveChatMockup;
