
import { Badge } from "@/components/ui/badge";
import { HeartIcon, ShieldIcon, MessageCircleIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const MentalHealthMockup = () => {
  const { t } = useLanguage();
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{t('demo.mockups.mentalHealth.title')}</h3>
        <Badge className="bg-purple-100 text-purple-700">{t('demo.mockups.mentalHealth.available')}</Badge>
      </div>
      
      <div className="space-y-4">
        <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
          <div className="flex items-center gap-2 mb-3">
            <ShieldIcon className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-semibold text-purple-800">{t('demo.mockups.mentalHealth.anonymous')}</span>
          </div>
          <p className="text-sm text-purple-700 mb-2">{t('demo.mockups.mentalHealth.description')}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge className="bg-green-100 text-green-700">GDPR</Badge>
            <Badge className="bg-blue-100 text-blue-700">SOC 2</Badge>
            <Badge className="bg-purple-100 text-purple-700">HIPAA</Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border">
          <HeartIcon className="w-5 h-5 text-green-600" />
          <div>
            <div className="text-sm font-medium text-green-800">{t('demo.mockups.mentalHealth.support')}</div>
            <div className="text-xs text-green-600">{t('demo.mockups.mentalHealth.psychologist')}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border">
          <MessageCircleIcon className="w-5 h-5 text-blue-600" />
          <div>
            <div className="text-sm font-medium text-blue-800">{t('demo.mockups.mentalHealth.chat')}</div>
            <div className="text-xs text-blue-600">{t('demo.mockups.mentalHealth.immediate')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentalHealthMockup;
