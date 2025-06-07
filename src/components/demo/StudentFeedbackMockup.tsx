
import { Badge } from "@/components/ui/badge";
import { StarIcon, ThumbsUpIcon, MessageCircleIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const StudentFeedbackMockup = () => {
  const { t } = useLanguage();
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{t('demo.mockups.studentFeedback.title')}</h3>
        <Badge className="bg-blue-100 text-blue-700">{t('demo.mockups.studentFeedback.live')}</Badge>
      </div>
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex">
              {[1,2,3,4,5].map((star) => (
                <StarIcon key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-sm font-medium text-blue-800">{t('demo.mockups.studentFeedback.rating')}</span>
          </div>
          <p className="text-sm text-blue-700 mb-2">{t('demo.mockups.studentFeedback.subject')}</p>
          <p className="text-xs text-blue-600">{t('demo.mockups.studentFeedback.comment')}</p>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border">
          <div className="flex items-center gap-3">
            <ThumbsUpIcon className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">{t('demo.mockups.studentFeedback.understood')}</span>
          </div>
          <Badge className="bg-green-100 text-green-700">{t('demo.mockups.studentFeedback.excellent')}</Badge>
        </div>
        
        <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg border">
          <MessageCircleIcon className="w-5 h-5 text-purple-600" />
          <span className="text-sm text-purple-700">{t('demo.mockups.studentFeedback.anonymous')}</span>
        </div>
      </div>
    </div>
  );
};

export default StudentFeedbackMockup;
