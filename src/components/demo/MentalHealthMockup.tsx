
import { Badge } from "@/components/ui/badge";
import { EyeOffIcon, ShieldIcon, LockIcon, FileCheckIcon, MessageCircleIcon } from "lucide-react";

const MentalHealthMockup = () => (
  <div className="bg-white p-6 rounded-lg shadow-sm border">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-800">Anonymous Mental Health Support</h3>
      <div className="flex items-center gap-1">
        <EyeOffIcon className="w-4 h-4 text-purple-600" />
        <Badge className="bg-purple-100 text-purple-700">100% Anonymous</Badge>
      </div>
    </div>
    
    {/* Compliance Badges */}
    <div className="flex gap-2 mb-4">
      <Badge className="bg-blue-50 text-blue-700 border border-blue-200">
        <ShieldIcon className="w-3 h-3 mr-1" />
        GDPR Compliant
      </Badge>
      <Badge className="bg-green-50 text-green-700 border border-green-200">
        <LockIcon className="w-3 h-3 mr-1" />
        SOC 2 Certified
      </Badge>
      <Badge className="bg-purple-50 text-purple-700 border border-purple-200">
        <FileCheckIcon className="w-3 h-3 mr-1" />
        HIPAA Compliant
      </Badge>
    </div>

    <div className="space-y-4">
      <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Dr. Sarah - Online Now</span>
          <Badge className="bg-white text-purple-700 text-xs">Licensed Therapist</Badge>
        </div>
        <p className="text-sm text-purple-700">Available for anonymous live chat support</p>
        <p className="text-xs text-purple-600 mt-1">🔒 Your identity remains completely private</p>
      </div>
      
      <div className="space-y-2">
        <button className="w-full bg-purple-600 text-white p-3 rounded-md text-sm font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
          <MessageCircleIcon className="w-4 h-4" />
          Start Anonymous Chat
        </button>
        <button className="w-full border border-purple-600 text-purple-600 p-3 rounded-md text-sm font-medium hover:bg-purple-50 transition-colors">
          Schedule Private Appointment
        </button>
      </div>
      
      <div className="bg-gray-50 p-3 rounded-lg border">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <p className="text-xs font-medium text-gray-700">24/7 Crisis Support Available</p>
        </div>
        <p className="text-xs text-gray-600">Emergency support with certified professionals</p>
      </div>
    </div>
  </div>
);

export default MentalHealthMockup;
