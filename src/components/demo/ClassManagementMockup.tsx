
import { Badge } from "@/components/ui/badge";
import { ClockIcon, CalendarIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const ClassManagementMockup = () => {
  const { t } = useLanguage();
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{t('demo.mockups.classManagement.title')}</h3>
        <Badge className="bg-blue-100 text-blue-700">{t('demo.mockups.classManagement.grade')}</Badge>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
          <ClockIcon className="w-6 h-6 text-blue-600" />
          <div className="flex-1">
            <div className="font-medium text-sm">{t('demo.mockups.classManagement.math')}</div>
            <div className="text-xs text-gray-600">{t('demo.mockups.classManagement.mathTopic')}</div>
            <div className="text-xs text-blue-600 font-medium">{t('demo.mockups.classManagement.mathTime')}</div>
          </div>
          <Badge className="bg-blue-100 text-blue-700">{t('demo.mockups.classManagement.current')}</Badge>
        </div>
        
        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
          <ClockIcon className="w-6 h-6 text-green-600" />
          <div className="flex-1">
            <div className="font-medium text-sm">{t('demo.mockups.classManagement.science')}</div>
            <div className="text-xs text-gray-600">{t('demo.mockups.classManagement.scienceTopic')}</div>
            <div className="text-xs text-green-600 font-medium">{t('demo.mockups.classManagement.scienceTime')}</div>
          </div>
          <Badge className="bg-green-100 text-green-700">{t('demo.mockups.classManagement.next')}</Badge>
        </div>
        
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border-l-4 border-gray-300">
          <CalendarIcon className="w-6 h-6 text-gray-400" />
          <div className="flex-1">
            <div className="font-medium text-sm text-gray-500">{t('demo.mockups.classManagement.lunch')}</div>
            <div className="text-xs text-gray-400">{t('demo.mockups.classManagement.lunchDesc')}</div>
            <div className="text-xs text-gray-400">{t('demo.mockups.classManagement.lunchTime')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassManagementMockup;
