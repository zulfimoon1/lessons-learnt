
import React from 'react';
import { useLanguage } from "@/contexts/LanguageContext";

const DemoStats: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="mt-16 text-center">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary mb-2">5+</div>
          <p className="text-muted-foreground">{t('demo.stats.coreFeatures')}</p>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-primary mb-2">3</div>
          <p className="text-muted-foreground">{t('demo.stats.userTypes')}</p>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-primary mb-2">24/7</div>
          <p className="text-muted-foreground">{t('demo.stats.mentalHealthSupport')}</p>
        </div>
      </div>
    </div>
  );
};

export default DemoStats;
