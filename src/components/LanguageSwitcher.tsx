
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GlobeIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const LanguageSwitcher = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <GlobeIcon className="w-4 h-4 text-gray-600" />
      <Select value={language} onValueChange={(value: 'en' | 'lt') => setLanguage(value)}>
        <SelectTrigger className="w-32 border-gray-200">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
          <SelectItem value="en" className="hover:bg-gray-50">{t('english')}</SelectItem>
          <SelectItem value="lt" className="hover:bg-gray-50">{t('lithuanian')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSwitcher;
