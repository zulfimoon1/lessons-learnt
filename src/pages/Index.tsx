
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCapIcon, UsersIcon, BookOpenIcon, HeartIcon, BarChart3Icon, ShieldCheckIcon, PlayCircleIcon } from "lucide-react";
import { Link } from "react-router-dom";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import DemoSection from "@/components/DemoSection";
import ComplianceFooter from "@/components/ComplianceFooter";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <GraduationCapIcon className="w-8 h-8 text-brand-teal" />
              <h1 className="text-2xl font-bold text-brand-dark">{t('welcome.title') || 'Lessons Learnt'}</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/pricing-showcase">
                <Button variant="outline" size="sm" className="bg-brand-orange/10 border-brand-orange hover:bg-brand-orange/20 text-brand-orange hover:text-brand-orange">
                  {t('pricing.title') || 'Pricing'}
                </Button>
              </Link>
              <Link to="/demo">
                <Button variant="outline" size="sm" className="flex items-center gap-2 border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white">
                  <PlayCircleIcon className="w-4 h-4" />
                  {t('demo.title') || 'Demo'}
                </Button>
              </Link>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Enhanced Gradient */}
      <section className="relative bg-hero-gradient py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-dark/80 via-brand-teal/60 to-brand-orange/40"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-5xl font-bold text-white mb-2">
              {t('welcome.heroTitle1') || 'Collaborative classrooms'}
            </h2>
            <h2 className="text-5xl font-bold text-white mb-6">
              {t('welcome.heroTitle2') || 'Unstoppable minds'}
            </h2>
            <p className="text-xl text-white/90 mb-12">
              {t('welcome.subtitle') || 'Empower students, support teachers, and enhance learning with our comprehensive education platform'}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-md mx-auto">
              <Link to="/student-login">
                <Button 
                  size="lg" 
                  className="w-full min-h-16 py-3 px-4 text-base flex items-center justify-center bg-brand-teal hover:bg-brand-dark text-white"
                >
                  <UsersIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span className="text-center leading-tight whitespace-normal">{t('auth.studentLogin') || 'Student Login'}</span>
                </Button>
              </Link>
              
              <Link to="/teacher-login">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full border-2 border-white text-white hover:bg-white hover:text-brand-dark min-h-16 py-3 px-4 text-base flex items-center justify-center"
                >
                  <BookOpenIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span className="text-center leading-tight whitespace-normal">{t('auth.teacherLogin') || 'Teacher Login'}</span>
                </Button>
              </Link>
            </div>
            
            <div className="max-w-2xl mx-auto mt-6">
              <p className="text-5xl font-bold text-brand-orange mt-2">
                {t('welcome.freeForStudents') || 'Always free for students!'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <DemoSection />

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-white/90 backdrop-blur-sm border-brand-teal/20 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-brand-teal/20 rounded-lg flex items-center justify-center mb-4">
                <UsersIcon className="w-6 h-6 text-brand-teal" />
              </div>
              <CardTitle className="text-xl text-brand-dark">{t('features.studentFeedback.title') || 'Student Feedback Collection'}</CardTitle>
              <CardDescription className="text-gray-600">
                {t('features.studentFeedback.description') || 'Collect direct feedback on lessons and experiences'}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-brand-teal/20 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-brand-teal/20 rounded-lg flex items-center justify-center mb-4">
                <BookOpenIcon className="w-6 h-6 text-brand-teal" />
              </div>
              <CardTitle className="text-xl text-brand-dark">{t('features.teacherInsights.title') || 'Teacher Analytics Dashboard'}</CardTitle>
              <CardDescription className="text-gray-600">
                {t('features.teacherInsights.description') || 'Monitor student progress and classroom dynamics'}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-brand-teal/20 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-brand-orange/20 rounded-lg flex items-center justify-center mb-4">
                <HeartIcon className="w-6 h-6 text-brand-orange" />
              </div>
              <CardTitle className="text-xl text-brand-dark">{t('features.mentalHealth.title') || 'Mental Health Support'}</CardTitle>
              <CardDescription className="text-gray-600">
                {t('features.mentalHealth.description') || 'Anonymous chat with school psychologists'}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Platform Overview Section */}
      <section className="bg-brand-gradient-soft py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-brand-dark mb-6">
              {t('platform.whySchools') || 'Why Schools Choose Lessons Learnt'}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('platform.whySchoolsSubtitle') || 'Comprehensive education technology that puts student wellbeing first'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-3xl font-bold text-brand-dark mb-6">
                {t('platform.studentInsights') || 'Real-time Student Insights'}
              </h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <BarChart3Icon className="w-6 h-6 text-brand-teal mt-1" />
                  <div>
                    <h4 className="font-semibold text-lg mb-2 text-brand-dark">{t('platform.realTimeAnalytics') || 'Real-time Analytics'}</h4>
                    <p className="text-gray-600">
                      {t('platform.realTimeAnalyticsDesc') || 'Get instant feedback on lesson effectiveness and student understanding'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <HeartIcon className="w-6 h-6 text-brand-orange mt-1" />
                  <div>
                    <h4 className="font-semibold text-lg mb-2 text-brand-dark">{t('platform.mentalHealthMonitoring') || 'Mental Health Monitoring'}</h4>
                    <p className="text-gray-600">
                      {t('platform.mentalHealthMonitoringDesc') || 'Early identification of students who may need additional support'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <ShieldCheckIcon className="w-6 h-6 text-brand-teal mt-1" />
                  <div>
                    <h4 className="font-semibold text-lg mb-2 text-brand-dark">{t('platform.privacySecurity') || 'Privacy & Security'}</h4>
                    <p className="text-gray-600">
                      {t('platform.privacySecurityDesc') || 'GDPR compliant with enterprise-grade security measures'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-brand-gradient p-8 rounded-2xl text-white">
              <div className="text-center">
                <div className="text-6xl font-bold mb-4">{t('platform.improvementPercent') || '25%+'}</div>
                <p className="text-xl font-semibold mb-2">{t('platform.improvementTitle') || 'Improvement in Student Engagement'}</p>
                <p className="text-white/90">
                  {t('platform.improvementDesc') || 'Schools report significant improvements within the first month'}
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-2xl font-bold text-brand-dark mb-4">
              {t('platform.readyToTransform') || 'Ready to Transform Your School?'}
            </h3>
            <p className="text-lg text-gray-600 mb-8">
              {t('platform.readyToTransformDesc') || 'Join thousands of educators already using our platform'}
            </p>
            <Link to="/teacher-login">
              <Button size="lg" className="text-lg px-8 py-3 bg-brand-orange hover:bg-brand-orange/90 text-white">
                {t('auth.signUpNow') || 'Sign Up Now'}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Compliance Footer */}
      <ComplianceFooter />
    </div>
  );
};

export default Index;
