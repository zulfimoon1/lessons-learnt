
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Shield, Lock, FileText, Eye, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import PrivacyLinks from '@/components/privacy/PrivacyLinks';
import SOC2ComplianceIndicator from '@/components/security/SOC2ComplianceIndicator';

const ComplianceFooter: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-50 border-t mt-16">
      <div className="container mx-auto px-4 py-8">
        {/* SOC 2 Compliance Indicator */}
        <div className="mb-6">
          <SOC2ComplianceIndicator />
        </div>
        
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
              <Link 
                to="/soc2-compliance" 
                className="text-xs text-blue-600 hover:text-blue-800 underline mt-1 block"
              >
                View SOC 2 Dashboard
              </Link>
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
          {/* Privacy Links Section */}
          <div className="mb-4">
            <PrivacyLinks />
          </div>
          
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <Eye className="w-4 h-4" />
            <span>All data is encrypted in transit and at rest. Full audit logging enabled.</span>
            <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
            <span>SOC 2 Type II compliant security controls</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ComplianceFooter;
