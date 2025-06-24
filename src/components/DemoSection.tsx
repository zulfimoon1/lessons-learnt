
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
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-brand-dark mb-6">
            {t('demo.featureDemo') || 'Feature Demonstration'}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('demo.discoverFuture') || 'Discover the future of education in action - explore our innovative platform designed to transform learning for students, empower educators, and support mental health.'}
          </p>
        </div>

        {/* Main Demo Call-to-Action */}
        <div className="bg-gradient-to-br from-brand-orange to-brand-teal rounded-3xl p-12 text-center text-white mb-16">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-3xl font-bold mb-4">
              {t('demo.featuresUserTypes') || '5+ Features, 3 User Types'}
            </h3>
            <p className="text-xl mb-8 text-white/90">
              {t('demo.experienceComplete') || 'Experience the complete platform'}
            </p>
            <Link to="/demo">
              <Button 
                size="lg" 
                className="text-lg px-12 py-4 bg-white text-brand-orange hover:bg-gray-100 font-semibold shadow-lg"
              >
                <PlayCircleIcon className="w-6 h-6 mr-2" />
                {t('demo.enterDemo') || 'Enter Demo'}
              </Button>
            </Link>
            
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-white/80">
              <div className="flex items-center justify-center gap-2">
                <ClockIcon className="w-4 h-4" />
                {t('demo.noRegistrationRequired') || 'No registration required'}
              </div>
              <div className="flex items-center justify-center gap-2">
                <ShieldIcon className="w-4 h-4" />
                {t('demo.fullFeatureAccess') || 'Full feature access'}
              </div>
              <div className="flex items-center justify-center gap-2">
                <UserIcon className="w-4 h-4" />
                {t('demo.sampleDataIncluded') || 'Sample data included'}
              </div>
            </div>
          </div>
        </div>

        {/* Demo Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-white border-brand-teal/20 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-brand-teal/20 rounded-lg flex items-center justify-center mb-4">
                <UserIcon className="w-6 h-6 text-brand-teal" />
              </div>
              <CardTitle className="text-xl text-brand-dark">{t('demo.studentExperience') || 'Student Experience'}</CardTitle>
              <CardDescription className="text-gray-600">
                {t('demo.studentExperienceDesc') || 'Submit lesson feedback, share weekly summaries, and access mental health support - all in a safe, anonymous environment.'}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white border-brand-teal/20 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-brand-teal/20 rounded-lg flex items-center justify-center mb-4">
                <GraduationCapIcon className="w-6 h-6 text-brand-teal" />
              </div>
              <CardTitle className="text-xl text-brand-dark">{t('demo.teacherDashboard') || 'Teacher Dashboard'}</CardTitle>
              <CardDescription className="text-gray-600">
                {t('demo.teacherDashboardDesc') || 'Monitor student engagement, track learning progress, and identify students who need additional support.'}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white border-brand-orange/20 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-brand-orange/20 rounded-lg flex items-center justify-center mb-4">
                <HeartIcon className="w-6 h-6 text-brand-orange" />
              </div>
              <CardTitle className="text-xl text-brand-dark">{t('demo.adminOverview') || 'Admin Overview'}</CardTitle>
              <CardDescription className="text-gray-600">
                {t('demo.adminOverviewDesc') || 'School-wide analytics, teacher management, and comprehensive insights into educational outcomes.'}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;
