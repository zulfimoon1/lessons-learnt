
import { Badge } from "@/components/ui/badge";
import { StarIcon } from "lucide-react";

const StudentFeedbackMockup = () => (
  <div className="bg-white p-6 rounded-lg shadow-sm border">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-800">Today's Lesson Feedback</h3>
      <Badge className="bg-blue-100 text-blue-700">Mathematics - Grade 8</Badge>
    </div>
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <label className="text-sm font-medium text-blue-900 mb-2 block">How well did you understand today's lesson?</label>
        <div className="flex gap-1">
          {[1,2,3,4,5].map(star => (
            <StarIcon key={star} className="w-6 h-6 fill-yellow-400 text-yellow-400 cursor-pointer" />
          ))}
        </div>
      </div>
      <div className="bg-green-50 p-4 rounded-lg">
        <label className="text-sm font-medium text-green-900 mb-2 block">How are you feeling emotionally?</label>
        <div className="flex gap-2 flex-wrap">
          <div className="bg-green-200 px-3 py-2 rounded-full text-sm border-2 border-green-400">😊 Happy</div>
          <div className="bg-gray-100 px-3 py-2 rounded-full text-sm cursor-pointer hover:bg-gray-200">😐 Neutral</div>
          <div className="bg-gray-100 px-3 py-2 rounded-full text-sm cursor-pointer hover:bg-gray-200">😔 Overwhelmed</div>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">What went well in today's lesson?</label>
        <textarea 
          className="w-full p-3 border border-gray-300 rounded-md text-sm resize-none" 
          placeholder="The algebra examples were really clear and helped me understand..."
          rows={3}
          value="The algebra examples were really clear and helped me understand the concepts better."
          readOnly
        ></textarea>
      </div>
      <button className="w-full bg-green-600 text-white px-4 py-3 rounded-md text-sm font-medium hover:bg-green-700 transition-colors">
        Submit Anonymous Feedback
      </button>
    </div>
  </div>
);

export default StudentFeedbackMockup;
