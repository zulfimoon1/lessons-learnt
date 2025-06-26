
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpenIcon, UserIcon, BarChart3Icon, HeartIcon, PlayIcon, ShieldCheckIcon, Users, Calendar, MessageSquare, Heart, Gift, ExternalLink } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { useDeviceType } from "@/hooks/use-device";
import { cn } from "@/lib/utils";

const DemoSection = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';

  const handleRegisterNow = () => {
    navigate('/teacher-login?tab=signup');
  };

  const handleTryDemo = () => {
    // Smart demo routing - try internal first, fallback to external
    const internalDemo = '/demo';
    const externalDemo = 'https://lessonslearnt.eu/demo';
    
    // For now, prefer the external live demo as it's more comprehensive
    window.open(externalDemo, '_blank');
  };

  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          {/* Single, prominent demo button */}
          <div className="flex justify-center items-center mb-6">
            <Badge 
              variant="outline" 
              className="bg-brand-teal/10 border-brand-teal text-brand-teal px-8 py-4 cursor-pointer hover:bg-brand-teal hover:text-white transition-colors text-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
              onClick={handleTryDemo}
            >
              <PlayIcon className="w-6 h-6 mr-3" />
              Try Live Demo
            </Badge>
          </div>
          
          <h2 className="text-4xl font-bold text-brand-dark mb-6">
            Experience the Complete Platform
          </h2>
          
          <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-12">
            Test the full platform with real workflows and see how our intuitive design makes complex educational processes simple and efficient
          </p>
          
          {/* Enhanced visibility for the features section */}
          <div className="bg-brand-gradient text-white rounded-lg p-8 max-w-4xl mx-auto mb-12 shadow-xl">
            <p className="text-4xl font-black tracking-wide drop-shadow-lg mb-4">
              Real User Experience
            </p>
            <p className="text-xl font-bold opacity-95 drop-shadow-md mb-8">
              Access the live platform and test all features with authentic workflows
            </p>
            
            {/* Step Overview - Alternating Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-left">
              {/* Step 1 - Left */}
              <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Step 1</h3>
                  <p className="text-sm text-white/90">School administrator logins and invites teachers and school psychologist</p>
                </div>
              </div>
              
              {/* Step 2 - Right */}
              <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Step 2</h3>
                  <p className="text-sm text-white/90">Teachers can bulk upload class schedules along with any day trips</p>
                </div>
              </div>
              
              {/* Step 3 - Left */}
              <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Step 3</h3>
                  <p className="text-sm text-white/90">Student leave feedback</p>
                </div>
              </div>
              
              {/* Step 4 - Right */}
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
            
            {/* Enhanced Bonus Points */}
            <div className="bg-gradient-to-r from-brand-orange to-yellow-500 rounded-xl p-6 mb-6 shadow-2xl border-2 border-yellow-400/30">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Gift className="w-6 h-6 text-brand-orange" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">✨ Bonus Points</h3>
                  <p className="text-lg text-white/95 font-medium drop-shadow-md">
                    Pause subscriptions during holidays?<br />
                    Pay only when you're actually educating minds
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

        <div className={cn(
          'items-center',
          isMobile ? 'grid grid-cols-1 gap-8' : 'grid grid-cols-1 lg:grid-cols-1 gap-12 items-center'
        )}>
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
        </div>
      </div>
    </section>
  );
};

export default DemoSection;
