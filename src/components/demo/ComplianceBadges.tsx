
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { ShieldIcon, LockIcon, FileCheckIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const ComplianceBadges: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="text-center mb-12">
      <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
        {t('demo.subtitle')}
      </p>
      
      <div className="flex justify-center gap-3 mt-6">
        <Badge className="bg-blue-50 text-blue-700 border border-blue-200">
          <ShieldIcon className="w-3 h-3 mr-1" />
          {t('demo.compliance.gdpr')}
        </Badge>
        <Badge className="bg-green-50 text-green-700 border border-green-200">
          <LockIcon className="w-3 h-3 mr-1" />
          {t('demo.compliance.soc2')}
        </Badge>
        <Badge className="bg-purple-50 text-purple-700 border border-purple-200">
          <FileCheckIcon className="w-3 h-3 mr-1" />
          {t('demo.compliance.hipaa')}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground mt-2">
        {t('demo.compliance.description')}
      </p>
    </div>
  );
};

export default ComplianceBadges;
