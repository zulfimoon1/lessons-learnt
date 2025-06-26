
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCapIcon, UsersIcon, BookOpenIcon, HeartIcon, BarChart3Icon, ShieldCheckIcon, PlayCircleIcon, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import DemoSection from "@/components/DemoSection";
import ComplianceFooter from "@/components/ComplianceFooter";
import CookieConsent from "@/components/CookieConsent";
import MobileOptimizedLayout from "@/components/mobile/MobileOptimizedLayout";
import MobileOptimizedHeader from "@/components/mobile/MobileOptimizedHeader";
import MobileOptimizedHero from "@/components/mobile/MobileOptimizedHero";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const Index = () => {
  const { t, isLoading } = useLanguage();
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <MobileOptimizedLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <GraduationCapIcon className="w-12 h-12 text-brand-teal mx-auto mb-4" />
            <p className="text-muted-foreground">{t('common.loading')}</p>
          </div>
        </div>
      </MobileOptimizedLayout>
    );
  }

  return (
    <MobileOptimizedLayout>
      <CookieConsent />
      
      {/* Mobile-Optimized Header */}
      <MobileOptimizedHeader />

      {/* Mobile-Optimized Hero Section */}
      <MobileOptimizedHero />

      {/* Demo Section */}
      <DemoSection />

      {/* Features Section */}
      <section className={cn(
        'max-w-7xl mx-auto',
        isMobile ? 'px-4 py-8' : 'px-4 sm:px-6 lg:px-8 py-12'
      )}>
        <div className={cn(
          'grid gap-6',
          isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3 gap-8'
        )}>
          <Card className="bg-white/90 backdrop-blur-sm border-brand-teal/20 hover:shadow-lg transition-shadow">
            <CardHeader className={isMobile ? 'p-4' : undefined}>
              <div className="w-12 h-12 bg-brand-teal/20 rounded-lg flex items-center justify-center mb-4">
                <UsersIcon className="w-6 h-6 text-brand-teal" />
              </div>
              <CardTitle className={cn(
                'text-brand-dark',
                isMobile ? 'text-lg' : 'text-xl'
              )}>
                {t('features.studentFeedback.title')}
              </CardTitle>
              <CardDescription className={cn(
                'text-gray-600',
                isMobile ? 'text-sm' : undefined
              )}>
                {t('features.studentFeedback.description')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-brand-teal/20 hover:shadow-lg transition-shadow">
            <CardHeader className={isMobile ? 'p-4' : undefined}>
              <div className="w-12 h-12 bg-brand-teal/20 rounded-lg flex items-center justify-center mb-4">
                <BookOpenIcon className="w-6 h-6 text-brand-teal" />
              </div>
              <CardTitle className={cn(
                'text-brand-dark',
                isMobile ? 'text-lg' : 'text-xl'
              )}>
                {t('features.teacherInsights.title')}
              </CardTitle>
              <CardDescription className={cn(
                'text-gray-600',
                isMobile ? 'text-sm' : undefined
              )}>
                {t('features.teacherInsights.description')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-brand-teal/20 hover:shadow-lg transition-shadow">
            <CardHeader className={isMobile ? 'p-4' : undefined}>
              <div className="w-12 h-12 bg-brand-orange/20 rounded-lg flex items-center justify-center mb-4">
                <HeartIcon className="w-6 h-6 text-brand-orange" />
              </div>
              <CardTitle className={cn(
                'text-brand-dark',
                isMobile ? 'text-lg' : 'text-xl'
              )}>
                {t('features.mentalHealth.title')}
              </CardTitle>
              <CardDescription className={cn(
                'text-gray-600',
                isMobile ? 'text-sm' : undefined
              )}>
                {t('features.mentalHealth.description')}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Platform Overview Section */}
      <section className="bg-brand-gradient-soft py-12 md:py-20">
        <div className={cn(
          'max-w-7xl mx-auto',
          isMobile ? 'px-4' : 'px-4 sm:px-6 lg:px-8'
        )}>
          <div className={cn(
            'text-center',
            isMobile ? 'mb-8' : 'mb-16'
          )}>
            <h2 className={cn(
              'font-bold text-brand-dark mb-4',
              isMobile ? 'text-2xl mb-3' : 'text-4xl mb-6'
            )}>
              {t('platform.whySchools')}
            </h2>
            <p className={cn(
              'text-gray-600 max-w-3xl mx-auto',
              isMobile ? 'text-lg' : 'text-xl'
            )}>
              {t('platform.whySchoolsSubtitle')}
            </p>
          </div>

          <div className={cn(
            'items-center mb-12',
            isMobile ? 'space-y-8' : 'grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16'
          )}>
            <div>
              <h3 className={cn(
                'font-bold text-brand-dark mb-4',
                isMobile ? 'text-2xl' : 'text-3xl mb-6'
              )}>
                {t('platform.studentInsights')}
              </h3>
              <div className={cn(
                'space-y-4',
                isMobile ? 'space-y-4' : 'space-y-6'
              )}>
                <div className="flex items-start gap-4">
                  <BarChart3Icon className="w-6 h-6 text-brand-teal mt-1 flex-shrink-0" />
                  <div>
                    <h4 className={cn(
                      'font-semibold mb-2 text-brand-dark',
                      isMobile ? 'text-base' : 'text-lg'
                    )}>
                      {t('platform.realTimeAnalytics')}
                    </h4>
                    <p className={cn(
                      'text-gray-600',
                      isMobile ? 'text-sm' : undefined
                    )}>
                      {t('platform.realTimeAnalyticsDesc')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <HeartIcon className="w-6 h-6 text-brand-orange mt-1 flex-shrink-0" />
                  <div>
                    <h4 className={cn(
                      'font-semibold mb-2 text-brand-dark',
                      isMobile ? 'text-base' : 'text-lg'
                    )}>
                      {t('platform.mentalHealthMonitoring')}
                    </h4>
                    <p className={cn(
                      'text-gray-600',
                      isMobile ? 'text-sm' : undefined
                    )}>
                      {t('platform.mentalHealthMonitoringDesc')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <ShieldCheckIcon className="w-6 h-6 text-brand-teal mt-1 flex-shrink-0" />
                  <div>
                    <h4 className={cn(
                      'font-semibold mb-2 text-brand-dark',
                      isMobile ? 'text-base' : 'text-lg'
                    )}>
                      {t('platform.privacySecurity')}
                    </h4>
                    <p className={cn(
                      'text-gray-600',
                      isMobile ? 'text-sm' : undefined
                    )}>
                      {t('platform.privacySecurityDesc')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className={cn(
              'bg-brand-gradient rounded-2xl text-white',
              isMobile ? 'p-6' : 'p-8'
            )}>
              <div className="text-center">
                <div className={cn(
                  'font-bold mb-4',
                  isMobile ? 'text-4xl' : 'text-6xl'
                )}>
                  {t('platform.improvementPercent')}
                </div>
                <p className={cn(
                  'font-semibold mb-2',
                  isMobile ? 'text-lg' : 'text-xl'
                )}>
                  {t('platform.improvementTitle')}
                </p>
                <p className={cn(
                  'text-white/90',
                  isMobile ? 'text-sm' : undefined
                )}>
                  {t('platform.improvementDesc')}
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <h3 className={cn(
              'font-bold text-brand-dark mb-4',
              isMobile ? 'text-xl' : 'text-2xl'
            )}>
              {t('platform.readyToTransform')}
            </h3>
            <p className={cn(
              'text-gray-600 mb-6',
              isMobile ? 'text-base mb-6' : 'text-lg mb-8'
            )}>
              {t('platform.readyToTransformDesc')}
            </p>
            <Link to="/teacher-login?tab=signup">
              <Button 
                size="lg" 
                className={cn(
                  'bg-brand-orange hover:bg-brand-orange/90 text-white touch-manipulation',
                  isMobile ? 'text-lg px-8 py-4' : 'text-xl px-12 py-4 transform scale-125'
                )}
              >
                {t('navigation.signUpNow')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Compliance Footer */}
      <ComplianceFooter />
    </MobileOptimizedLayout>
  );
};

export default Index;
