
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { XIcon, StethoscopeIcon } from "lucide-react";

interface ChatHeaderProps {
  isDoctorView: boolean;
  isAnonymous: boolean;
  isConnected: boolean;
  studentName?: string;
  doctorName?: string;
  onClose: () => void;
}

const ChatHeader = ({ 
  isDoctorView, 
  isAnonymous, 
  isConnected, 
  studentName, 
  doctorName, 
  onClose 
}: ChatHeaderProps) => {
  return (
    <div className="bg-purple-600 text-white p-4">
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <StethoscopeIcon className="w-5 h-5" />
          {isDoctorView ? 'Chat with Student' : 'Live Chat with Doctor'}
          {isAnonymous && !isDoctorView && (
            <Badge variant="secondary" className="bg-purple-800 text-white">
              Anonymous
            </Badge>
          )}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-white hover:bg-purple-700"
        >
          <XIcon className="w-4 h-4" />
        </Button>
      </div>
      <div className="text-sm">
        {isConnected ? (
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            {isDoctorView 
              ? `Connected with ${isAnonymous ? 'Anonymous Student' : studentName}`
              : `Connected with Dr. ${doctorName || 'Doctor'}`
            }
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            {isDoctorView ? "Connecting..." : "Waiting for doctor..."}
          </span>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
