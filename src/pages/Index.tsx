
import { useLanguage } from "@/contexts/LanguageContext";
import DemoSection from "@/components/DemoSection";
import ComplianceFooter from "@/components/ComplianceFooter";
import CookieConsent from "@/components/CookieConsent";
import DataProtectionBanner from "@/components/DataProtectionBanner";

const Index = () => {
  const { t, language } = useLanguage();

  console.log('Index page rendering, current language:', language);
  console.log('Title translation:', t('welcome.title'));
  console.log('Subtitle translation:', t('welcome.subtitle'));

  return (
    <div className="min-h-screen bg-background">
      <DataProtectionBanner />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6">
              {t('welcome.title')}
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              {t('welcome.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="/student-login"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors duration-200"
              >
                {t('auth.studentLogin')}
              </a>
              <a
                href="/teacher-login"
                className="inline-flex items-center justify-center px-8 py-3 border border-primary text-base font-medium rounded-md text-primary bg-background hover:bg-accent transition-colors duration-200"
              >
                {t('auth.teacherLogin')}
              </a>
            </div>
          </div>
        </div>
      </section>

      <DemoSection />
      <ComplianceFooter />
      <CookieConsent />
    </div>
  );
};

export default Index;
