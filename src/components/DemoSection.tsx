
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayCircleIcon, UserIcon, GraduationCapIcon, HeartIcon, CheckIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const DemoSection = () => {
  const { t } = useLanguage();

  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Feature Demonstration Button */}
        <div className="text-center mb-12">
          <Button 
            size="lg" 
            className="mb-8 bg-brand-teal hover:bg-brand-dark text-white px-8 py-3 text-lg font-semibold"
          >
            {t('demo.featureDemo') || 'Feature Demonstration'}
          </Button>
          
          <h2 className="text-4xl font-bold text-brand-dark mb-6">
            {t('demo.discoverFuture') || 'Discover the future of education in action - explore our innovative platform designed to transform learning for students, empower educators, and support mental health.'}
          </h2>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
          {/* Left Content - Takes up 3 columns */}
          <div className="lg:col-span-3">
            {/* Central Demo Call-to-Action Card - Much More Prominent */}
            <div className="mb-12">
              <div className="bg-gradient-to-r from-brand-orange to-brand-teal rounded-2xl p-12 text-center text-white shadow-xl">
                <h3 className="text-5xl font-bold mb-6">
                  {t('demo.featuresUserTypes') || '5+ Features, 3 User Types'}
                </h3>
                <p className="text-2xl mb-10 text-white/90 leading-relaxed">
                  {t('demo.experienceComplete') || 'Experience the complete platform'}
                </p>
                <Link to="/demo">
                  <Button 
                    size="lg" 
                    className="text-2xl px-12 py-6 bg-white text-brand-orange hover:bg-gray-100 font-bold shadow-lg h-20 rounded-xl"
                  >
                    <PlayCircleIcon className="w-8 h-8 mr-4" />
                    {t('demo.enterDemo') || 'Enter Demo'}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Demo Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          </div>

          {/* Right Sidebar - Demo Features */}
          <div className="lg:col-span-1">
            <Card className="bg-white shadow-lg border-brand-teal/20">
              <CardHeader>
                <CardTitle className="text-2xl text-brand-dark text-center mb-6">Demo Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-brand-teal rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700 font-medium">{t('demo.noRegistrationRequired') || 'No registration required'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-brand-teal rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700 font-medium">{t('demo.fullFeatureAccess') || 'Full feature access'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-brand-teal rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700 font-medium">{t('demo.sampleDataIncluded') || 'Sample data included'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;
