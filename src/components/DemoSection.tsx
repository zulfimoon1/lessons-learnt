
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayCircleIcon, UserIcon, GraduationCapIcon, HeartIcon, ClockIcon, ShieldIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const DemoSection = () => {
  const { t } = useLanguage();

  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-brand-dark mb-6">
            {t('demo.featureDemo') || 'Feature Demonstration'}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            {t('demo.discoverFuture') || 'Discover the future of education in action - explore our innovative platform designed to transform learning for students, empower educators, and support mental health.'}
          </p>
        </div>

        {/* Central Demo Call-to-Action Card */}
        <div className="max-w-lg mx-auto mb-16">
          <div className="bg-gradient-to-r from-brand-orange to-brand-teal rounded-2xl p-8 text-center text-white shadow-xl">
            <h3 className="text-3xl font-bold mb-3">
              {t('demo.featuresUserTypes') || '5+ Features, 3 User Types'}
            </h3>
            <p className="text-xl mb-8 text-white/90">
              {t('demo.experienceComplete') || 'Experience the complete platform'}
            </p>
            <Link to="/demo">
              <Button 
                size="lg" 
                className="w-full text-xl px-8 py-4 bg-white text-brand-orange hover:bg-gray-100 font-bold shadow-lg h-16"
              >
                <PlayCircleIcon className="w-6 h-6 mr-3" />
                {t('demo.enterDemo') || 'Enter Demo'}
              </Button>
            </Link>
          </div>
        </div>

        {/* Demo Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="bg-white border-brand-teal/20 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-brand-teal/20 rounded-xl flex items-center justify-center mb-6 mx-auto">
                <UserIcon className="w-8 h-8 text-brand-teal" />
              </div>
              <CardTitle className="text-xl text-brand-dark mb-4">{t('demo.studentExperience') || 'Student Experience'}</CardTitle>
              <CardDescription className="text-gray-600">
                {t('demo.studentExperienceDesc') || 'Submit lesson feedback, share weekly summaries, and access mental health support - all in a safe, anonymous environment.'}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white border-brand-teal/20 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-brand-teal/20 rounded-xl flex items-center justify-center mb-6 mx-auto">
                <GraduationCapIcon className="w-8 h-8 text-brand-teal" />
              </div>
              <CardTitle className="text-xl text-brand-dark mb-4">{t('demo.teacherDashboard') || 'Teacher Dashboard'}</CardTitle>
              <CardDescription className="text-gray-600">
                {t('demo.teacherDashboardDesc') || 'Monitor student engagement, track learning progress, and identify students who need additional support.'}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white border-brand-orange/20 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-brand-orange/20 rounded-xl flex items-center justify-center mb-6 mx-auto">
                <HeartIcon className="w-8 h-8 text-brand-orange" />
              </div>
              <CardTitle className="text-xl text-brand-dark mb-4">{t('demo.adminOverview') || 'Admin Overview'}</CardTitle>
              <CardDescription className="text-gray-600">
                {t('demo.adminOverviewDesc') || 'School-wide analytics, teacher management, and comprehensive insights into educational outcomes.'}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Bottom features list */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-3">
            <ClockIcon className="w-5 h-5 text-brand-teal flex-shrink-0" />
            <span className="text-gray-600">{t('demo.noRegistrationRequired') || 'No registration required'}</span>
          </div>
          <div className="flex items-center justify-center gap-3">
            <ShieldIcon className="w-5 h-5 text-brand-teal flex-shrink-0" />
            <span className="text-gray-600">{t('demo.fullFeatureAccess') || 'Full feature access'}</span>
          </div>
          <div className="flex items-center justify-center gap-3">
            <UserIcon className="w-5 h-5 text-brand-teal flex-shrink-0" />
            <span className="text-gray-600">{t('demo.sampleDataIncluded') || 'Sample data included'}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;
