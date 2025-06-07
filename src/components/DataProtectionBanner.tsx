
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Shield, Lock, Eye, FileCheck } from 'lucide-react';

const DataProtectionBanner: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center space-x-2 mb-3">
        <Shield className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-sm text-blue-900">Data Protection & Privacy</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="flex items-start space-x-2">
          <Lock className="w-4 h-4 text-green-600 mt-0.5" />
          <div>
            <p className="font-medium text-gray-900">End-to-End Encryption</p>
            <p className="text-gray-600">All data encrypted in transit and at rest</p>
          </div>
        </div>
        
        <div className="flex items-start space-x-2">
          <Eye className="w-4 h-4 text-purple-600 mt-0.5" />
          <div>
            <p className="font-medium text-gray-900">Access Control</p>
            <p className="text-gray-600">Role-based permissions and audit logging</p>
          </div>
        </div>
        
        <div className="flex items-start space-x-2">
          <FileCheck className="w-4 h-4 text-orange-600 mt-0.5" />
          <div>
            <p className="font-medium text-gray-900">Compliance Ready</p>
            <p className="text-gray-600">GDPR, HIPAA, and SOC 2 compliant</p>
          </div>
        </div>
      </div>
      
      <p className="text-xs text-gray-500 mt-3">
        Student data is anonymized by default. Personal information is protected under educational privacy laws.
      </p>
    </div>
  );
};

export default DataProtectionBanner;
