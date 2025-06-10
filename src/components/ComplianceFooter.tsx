
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Shield, Lock, FileText, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ComplianceFooter: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-50 border-t mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="flex items-start space-x-3">
            <Shield className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h3 className="font-semibold text-sm mb-2">{t('compliance.gdpr.title')}</h3>
              <p className="text-xs text-gray-600">{t('compliance.gdpr.description')}</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Lock className="w-6 h-6 text-green-600 mt-1" />
            <div>
              <h3 className="font-semibold text-sm mb-2">{t('compliance.soc2.title')}</h3>
              <p className="text-xs text-gray-600">{t('compliance.soc2.description')}</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <FileText className="w-6 h-6 text-purple-600 mt-1" />
            <div>
              <h3 className="font-semibold text-sm mb-2">{t('compliance.hipaa.title')}</h3>
              <p className="text-xs text-gray-600">{t('compliance.hipaa.description')}</p>
            </div>
          </div>
        </div>
        
        <div className="border-t pt-6">
          <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-4">
            <Button variant="link" className="h-auto p-0 text-xs">
              {t('compliance.privacyPolicy')}
            </Button>
            <Button variant="link" className="h-auto p-0 text-xs">
              {t('compliance.cookiePolicy')}
            </Button>
            <Button variant="link" className="h-auto p-0 text-xs">
              {t('compliance.dataProcessing')}
            </Button>
            <Button variant="link" className="h-auto p-0 text-xs">
              {t('compliance.dataRetention')}
            </Button>
            <Button variant="link" className="h-auto p-0 text-xs">
              {t('compliance.rightToDelete')}
            </Button>
          </div>
          
          <div className="mt-4 flex items-center space-x-2 text-xs text-gray-500">
            <Eye className="w-4 h-4" />
            <span>All data is encrypted in transit and at rest. Full audit logging enabled.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ComplianceFooter;
