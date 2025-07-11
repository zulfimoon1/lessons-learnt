
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { GraduationCapIcon, Menu, X, PlayCircleIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const MobileOptimizedHeader: React.FC = () => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-border shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <GraduationCapIcon className="w-6 h-6 md:w-8 md:h-8 text-brand-teal" />
            <h1 className={cn(
              'font-bold text-brand-dark',
              isMobile ? 'text-lg' : 'text-2xl'
            )}>
              {isMobile ? t('common.lessonsShort') : t('welcome.title')}
            </h1>
          </Link>

          {/* Desktop Navigation */}
          {!isMobile && (
            <div className="flex items-center gap-4">
              <Link to="/pricing-showcase">
                <Button variant="outline" size="sm" className="bg-brand-orange/10 border-brand-orange hover:bg-brand-orange/20 text-brand-orange">
                  {t('pricing.title')}
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2 border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white"
                onClick={() => {
                  const demoSection = document.querySelector('section:has(.bg-brand-gradient)');
                  if (demoSection) {
                    demoSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <PlayCircleIcon className="w-4 h-4" />
                {t('demo.title')}
              </Button>
              <LanguageSwitcher />
            </div>
          )}

          {/* Mobile Navigation */}
          {isMobile && (
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 touch-manipulation"
                    aria-label="Open menu"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 bg-white/95 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-brand-dark">{t('common.menu')}</h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={closeMenu}
                      className="h-8 w-8"
                      aria-label="Close menu"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <nav className="space-y-4">
                    <Link to="/pricing-showcase" onClick={closeMenu}>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start bg-brand-orange/10 border-brand-orange text-brand-orange hover:bg-brand-orange/20 min-h-12"
                      >
                        {t('pricing.title')}
                      </Button>
                    </Link>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white min-h-12"
                      onClick={() => {
                        closeMenu();
                        const demoSection = document.querySelector('section:has(.bg-brand-gradient)');
                        if (demoSection) {
                          demoSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                    >
                      <PlayCircleIcon className="w-4 h-4 mr-2" />
                      {t('demo.title')}
                    </Button>
                    
                    <div className="pt-6 border-t">
                      <h3 className="text-sm font-medium text-gray-600 mb-3">{t('common.getStarted')}</h3>
                      <div className="space-y-3">
                        <Link to="/student-login" onClick={closeMenu}>
                          <Button className="w-full bg-brand-teal hover:bg-brand-dark text-white min-h-12">
                            {t('common.studentLogin')}
                          </Button>
                        </Link>
                        <Link to="/teacher-login" onClick={closeMenu}>
                          <Button variant="outline" className="w-full border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white min-h-12">
                            {t('common.teacherLogin')}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default MobileOptimizedHeader;
