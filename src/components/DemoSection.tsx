
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpenIcon, UserIcon, BarChart3Icon, HeartIcon, PlayIcon, ShieldCheckIcon, Users, Calendar, MessageSquare, Heart, Gift, ExternalLink } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

const DemoSection = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleRegisterNow = () => {
    navigate('/teacher-login?tab=signup');
  };

  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex justify-center items-center gap-3 mb-6">
            <Badge 
              variant="outline" 
              className="bg-brand-teal/10 border-brand-teal text-brand-teal px-6 py-3 cursor-pointer hover:bg-brand-teal hover:text-white transition-colors text-lg font-semibold"
              onClick={() => window.open('/demo', '_blank')}
            >
              <PlayIcon className="w-5 h-5 mr-2" />
              {t('demo.featureDemo')}
            </Badge>
            
            <Badge 
              variant="outline" 
              className="bg-brand-orange/10 border-brand-orange text-brand-orange px-6 py-3 cursor-pointer hover:bg-brand-orange hover:text-white transition-colors text-lg font-semibold"
              onClick={() => window.open('https://lessonslearnt.eu/demo', '_blank')}
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              Live Demo
            </Badge>
          </div>
          <h2 className="text-4xl font-bold text-brand-dark mb-6">
            Experience the Complete Platform
          </h2>
          
          <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-12">
            Our interactive demos showcase the modern, intuitive design that makes complex educational workflows simple and efficient
          </p>
          
          {/* Enhanced visibility for the features section */}
          <div className="bg-brand-gradient text-white rounded-lg p-8 max-w-4xl mx-auto mb-12 shadow-xl">
            <p className="text-4xl font-black tracking-wide drop-shadow-lg mb-4">
              Real User Experience
            </p>
            <p className="text-xl font-bold opacity-95 drop-shadow-md mb-8">
              Sign up and test all features with authentic workflows
            </p>
            
            {/* Step Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-left">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Step 1</h3>
                    <p className="text-sm text-white/90">School administrator logins and invites teachers and school psychologist</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Step 2</h3>
                    <p className="text-sm text-white/90">Teachers can bulk upload class schedules along with any day trips</p>
                  </div>
                </div>
              </div>
              
              {/* Right Column */}
              <div className="space-y-4">
                <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Step 3</h3>
                    <p className="text-sm text-white/90">Student leave feedback</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Step 4</h3>
                    <p className="text-sm text-white/90">School psychologist has access to live chat and emotional wellbeing</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bonus Points */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-brand-orange rounded-full flex items-center justify-center flex-shrink-0">
                  <Gift className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Bonus Points</h3>
                  <p className="text-sm text-white/90">
                    Pause subscriptions during holidays? That's next-level budget optimization. Pay only when you're actually educating minds
                  </p>
                </div>
              </div>
            </div>
            
            {/* Register Now Button */}
            <div className="mt-6">
              <Button 
                onClick={handleRegisterNow}
                className="bg-brand-orange hover:bg-brand-orange/90 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                Start Your Free Trial
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-brand-teal/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <UserIcon className="w-6 h-6 text-brand-teal" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-brand-dark mb-2">{t('demo.studentExperience')}</h3>
                <p className="text-gray-600">
                  {t('demo.studentExperienceDesc')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-brand-teal/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpenIcon className="w-6 h-6 text-brand-teal" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-brand-dark mb-2">{t('demo.teacherDashboard')}</h3>
                <p className="text-gray-600">
                  {t('demo.teacherDashboardDesc')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-brand-orange/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <BarChart3Icon className="w-6 h-6 text-brand-orange" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-brand-dark mb-2">{t('demo.adminOverview')}</h3>
                <p className="text-gray-600">
                  {t('demo.adminOverviewDesc')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <HeartIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-brand-dark mb-2">{t('demo.schoolPsychologist')}</h3>
                <p className="text-gray-600">
                  {t('demo.schoolPsychologistDesc')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-brand-gradient-soft rounded-2xl p-8">
            <Card className="bg-white/90 backdrop-blur-sm border-brand-teal/20">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-brand-teal rounded-full flex items-center justify-center">
                    <HeartIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-brand-dark">{t('demo.demoFeatures')}</CardTitle>
                    <CardDescription className="text-gray-600">{t('demo.tryBeforeCommit')}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <ShieldCheckIcon className="w-5 h-5 text-brand-teal" />
                  <span className="text-brand-dark">{t('demo.noRegistrationRequired')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheckIcon className="w-5 h-5 text-brand-teal" />
                  <span className="text-brand-dark">{t('demo.fullFeatureAccess')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheckIcon className="w-5 h-5 text-brand-teal" />
                  <span className="text-brand-dark">{t('demo.sampleDataIncluded')}</span>
                </div>
                
                <div className="pt-4">
                  <Button 
                    className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white"
                    onClick={() => window.open('/demo', '_blank')}
                  >
                    <PlayIcon className="w-4 h-4 mr-2" />
                    {t('demo.enterDemo')}
                  </Button>
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
