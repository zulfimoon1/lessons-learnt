
import React from 'react';
import { Button } from '@/components/ui/button';
import { UsersIcon, BookOpenIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const MobileOptimizedHero: React.FC = () => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();

  return (
    <section className="relative bg-hero-gradient overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-dark/80 via-brand-teal/60 to-brand-orange/40"></div>
      <div className={cn(
        'relative max-w-7xl mx-auto text-center',
        isMobile ? 'px-4 py-12' : 'px-4 sm:px-6 lg:px-8 py-20'
      )}>
        <div className="max-w-4xl mx-auto">
          {/* Hero Titles - Updated for comprehensive messaging */}
          <h2 className={cn(
            'font-bold text-white mb-2 leading-tight',
            isMobile ? 'text-2xl' : 'text-4xl lg:text-5xl'
          )}>
            {t('welcome.heroTitle1')}
          </h2>
          <h2 className={cn(
            'font-bold text-white mb-4 leading-tight',
            isMobile ? 'text-2xl mb-6' : 'text-4xl lg:text-5xl mb-8'
          )}>
            {t('welcome.heroTitle2')}
          </h2>
          
          {/* Subtitle - Enhanced for comprehensive value proposition */}
          <p className={cn(
            'text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto',
            isMobile ? 'text-base px-2' : 'text-lg lg:text-xl mb-12'
          )}>
            {t('welcome.subtitle')}
          </p>
          
          {/* Action Buttons */}
          <div className={cn(
            'max-w-md mx-auto',
            isMobile ? 'space-y-4' : 'grid grid-cols-1 sm:grid-cols-2 gap-6'
          )}>
            <Link to="/student-login">
              <Button 
                size="lg" 
                className={cn(
                  'w-full bg-brand-teal hover:bg-brand-dark text-white touch-manipulation transition-all duration-200',
                  isMobile ? 'min-h-14 py-4 text-lg' : 'min-h-16 py-3 px-4 text-base'
                )}
              >
                <UsersIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="text-center leading-tight whitespace-normal">
                  {t('navigation.studentLogin')}
                </span>
              </Button>
            </Link>
            
            <Link to="/teacher-login">
              <Button 
                size="lg" 
                variant="outline" 
                className={cn(
                  'w-full border-2 border-white text-white hover:bg-white hover:text-brand-dark touch-manipulation transition-all duration-200',
                  isMobile ? 'min-h-14 py-4 text-lg' : 'min-h-16 py-3 px-4 text-base'
                )}
              >
                <BookOpenIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="text-center leading-tight whitespace-normal">
                  {t('navigation.teacherLogin')}
                </span>
              </Button>
            </Link>
          </div>
          
          {/* Free for Students */}
          <div className={cn(
            'max-w-2xl mx-auto',
            isMobile ? 'mt-8' : 'mt-8 lg:mt-12'
          )}>
            <p className={cn(
              'font-bold text-brand-orange',
              isMobile ? 'text-2xl leading-tight' : 'text-3xl lg:text-4xl mt-2'
            )}>
              {t('welcome.freeForStudents')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MobileOptimizedHero;
