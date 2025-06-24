
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const LanguageSwitcher = () => {
  const [language, setLanguage] = useState<'en' | 'lt'>('en');

  return (
    <div className="flex items-center gap-2">
      <Select value={language} onValueChange={(value: 'en' | 'lt') => setLanguage(value)}>
        <SelectTrigger className="w-20 border-gray-200">
          <SelectValue>
            {language === 'en' ? '🇬🇧' : '🇱🇹'}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
          <SelectItem value="en" className="hover:bg-gray-50">
            <div className="flex items-center gap-2">
              <span className="text-lg">🇬🇧</span>
              <span>English</span>
            </div>
          </SelectItem>
          <SelectItem value="lt" className="hover:bg-gray-50">
            <div className="flex items-center gap-2">
              <span className="text-lg">🇱🇹</span>
              <span>Lietuvių</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSwitcher;
