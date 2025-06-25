
import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Shield, FileText, Settings } from 'lucide-react';

const PrivacyLinks: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
      <Link 
        to="/privacy-policy" 
        className="flex items-center gap-1 hover:text-blue-600 transition-colors"
      >
        <Shield className="w-3 h-3" />
        {t('privacy.title')}
      </Link>
      <Link 
        to="/privacy-policy" 
        className="flex items-center gap-1 hover:text-blue-600 transition-colors"
      >
        <FileText className="w-3 h-3" />
        {t('compliance.privacyPolicy')}
      </Link>
      <Link 
        to="/privacy-policy" 
        className="flex items-center gap-1 hover:text-blue-600 transition-colors"
      >
        <Settings className="w-3 h-3" />
        {t('privacy.managePreferences')}
      </Link>
    </div>
  );
};

export default PrivacyLinks;
