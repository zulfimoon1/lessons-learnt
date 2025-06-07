
import { Badge } from "@/components/ui/badge";
import { ClockIcon, CalendarIcon } from "lucide-react";

const ClassManagementMockup = () => (
  <div className="bg-white p-6 rounded-lg shadow-sm border">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-800">Today's Schedule</h3>
      <Badge className="bg-blue-100 text-blue-700">Grade 8A</Badge>
    </div>
    <div className="space-y-3">
      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
        <ClockIcon className="w-6 h-6 text-blue-600" />
        <div className="flex-1">
          <div className="font-medium text-sm">Mathematics</div>
          <div className="text-xs text-gray-600">Algebra & Linear Equations</div>
          <div className="text-xs text-blue-600 font-medium">9:00 AM - 10:30 AM</div>
        </div>
        <Badge className="bg-blue-100 text-blue-700">Current</Badge>
      </div>
      
      <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
        <ClockIcon className="w-6 h-6 text-green-600" />
        <div className="flex-1">
          <div className="font-medium text-sm">Science Lab</div>
          <div className="text-xs text-gray-600">Chemical Reactions & Experiments</div>
          <div className="text-xs text-green-600 font-medium">11:00 AM - 12:30 PM</div>
        </div>
        <Badge className="bg-green-100 text-green-700">Next</Badge>
      </div>
      
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border-l-4 border-gray-300">
        <CalendarIcon className="w-6 h-6 text-gray-400" />
        <div className="flex-1">
          <div className="font-medium text-sm text-gray-500">Lunch Break</div>
          <div className="text-xs text-gray-400">Free time for students</div>
          <div className="text-xs text-gray-400">1:00 PM - 2:00 PM</div>
        </div>
      </div>
    </div>
  </div>
);

export default ClassManagementMockup;
