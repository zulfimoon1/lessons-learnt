
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, GraduationCap, Pause } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import MobileOptimizedButton from "@/components/mobile/MobileOptimizedButton";
import { cn } from "@/lib/utils";

interface DemoHeaderProps {
  isMobile: boolean;
  onBackToHome: () => void;
  onPauseDemo: () => void;
}

const DemoHeader: React.FC<DemoHeaderProps> = ({ 
  isMobile, 
  onBackToHome, 
  onPauseDemo 
}) => {
  const { t } = useLanguage();

  return (
    <div className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-gray-200/50">
      <div className={cn(
        'max-w-7xl mx-auto',
        isMobile ? 'px-4' : 'px-4 sm:px-6 lg:px-8'
      )}>
        <div className={cn(
          'flex items-center justify-between',
          isMobile ? 'h-14' : 'h-16'
        )}>
          <div className="flex items-center gap-4">
            <MobileOptimizedButton
              variant="ghost" 
              onClick={onBackToHome}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              {!isMobile && (t('navigation.backToHome') || 'Back to Home')}
            </MobileOptimizedButton>
            <div className="flex items-center gap-2">
              <GraduationCap className={cn(
                'text-brand-teal',
                isMobile ? 'h-5 w-5' : 'h-6 w-6'
              )} />
              <h1 className={cn(
                'font-semibold text-gray-900',
                isMobile ? 'text-lg' : 'text-xl'
              )}>
                {isMobile ? 'Demo' : (t('demo.page.title') || 'Interactive Demo')}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isMobile && (
              <MobileOptimizedButton
                variant="outline"
                onClick={onPauseDemo}
                className="flex items-center gap-2"
              >
                <Pause className="h-4 w-4" />
                {t('demo.page.pauseDemo') || 'Pause Demo'}
              </MobileOptimizedButton>
            )}
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoHeader;
