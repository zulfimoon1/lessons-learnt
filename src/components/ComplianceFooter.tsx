
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Shield, Lock, FileText, Eye, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import PrivacyLinks from '@/components/privacy/PrivacyLinks';
import SOC2ComplianceIndicator from '@/components/security/SOC2ComplianceIndicator';
import { useAuth } from '@/contexts/AuthContext';
import { usePlatformAdmin } from '@/contexts/PlatformAdminContext';

const ComplianceFooter: React.FC = () => {
  const { t } = useLanguage();
  
  // Safe check for auth context
  let teacher = null;
  let admin = null;
  let canViewSOC2Dashboard = false;

  try {
    const authContext = useAuth();
    teacher = authContext?.teacher;
  } catch (error) {
    // AuthProvider not available, continue without auth features
    console.log('Auth context not available in ComplianceFooter');
  }

  try {
    admin = usePlatformAdmin()?.admin;
    canViewSOC2Dashboard = admin || (teacher && teacher.role === 'admin');
  } catch (error) {
    // If PlatformAdminProvider is not available, fall back to teacher-only check
    console.log('Platform admin context not available, using fallback');
    canViewSOC2Dashboard = teacher && teacher.role === 'admin';
  }

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
              {canViewSOC2Dashboard && (
                <Link 
                  to="/soc2-compliance" 
                  className="text-xs text-blue-600 hover:text-blue-800 underline mt-1 block"
                >
                  {t('compliance.viewSOC2Dashboard')}
                </Link>
              )}
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
            <span>{t('compliance.dataEncrypted')}</span>
            <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
            <span>{t('compliance.soc2Controls')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ComplianceFooter;
