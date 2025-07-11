
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpenIcon, UserIcon, BarChart3Icon, HeartIcon, PlayIcon, ShieldCheckIcon, Users, Calendar, MessageSquare, Heart, Gift, ExternalLink } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { useDeviceType } from "@/hooks/use-device";
import { cn } from "@/lib/utils";
import EmailGateForm from "@/components/demo/EmailGateForm";
import VideoPlayer from "@/components/demo/VideoPlayer";
import { useState } from "react";

const DemoSection = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';
  const [showEmailGate, setShowEmailGate] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'lt'>('en');

  const handleRegisterNow = () => {
    navigate('/teacher-login?tab=signup');
  };

  const handleTryDemo = () => {
    setShowEmailGate(true);
  };

  const handleEmailGateSubmit = async (data: { email: string; language: 'en' | 'lt'; marketingConsent: boolean }) => {
    setIsSubmitting(true);
    try {
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSelectedLanguage(data.language);
      setShowEmailGate(false);
      setShowVideo(true);
    } catch (error) {
      console.error('Error processing form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVideoEnd = () => {
    // Video ended - could trigger additional actions
    console.log('Demo video completed');
  };

  const handleBackToForm = () => {
    setShowVideo(false);
    setShowEmailGate(true);
  };

  const handleBackToMain = () => {
    setShowVideo(false);
    setShowEmailGate(false);
  };

  // Render email gate when requested
  if (showEmailGate) {
    return (
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-brand-dark mb-6">
              {t('demo.emailGate.mainTitle') || 'Watch Our Live Demo'}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('demo.emailGate.mainSubtitle') || 'Get exclusive access to our comprehensive platform demonstration'}
            </p>
          </div>
          
          <EmailGateForm 
            onFormSubmit={handleEmailGateSubmit}
            isSubmitting={isSubmitting}
          />
          
          <div className="text-center mt-8">
            <Button 
              variant="outline" 
              onClick={handleBackToMain}
              className="text-gray-600 hover:text-brand-teal"
            >
              ← {t('demo.emailGate.backToMain') || 'Back to Main Page'}
            </Button>
          </div>
        </div>
      </section>
    );
  }

  // Render video player when form is submitted
  if (showVideo) {
    return (
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-brand-dark mb-4">
              {t('demo.video.welcomeTitle') || 'Welcome to Your Demo Experience'}
            </h2>
            <p className="text-lg text-gray-600">
              {t('demo.video.welcomeSubtitle') || 'Enjoy this comprehensive walkthrough of our educational platform'}
            </p>
          </div>
          
          <VideoPlayer 
            language={selectedLanguage}
            onVideoEnd={handleVideoEnd}
            autoPlay={true}
            className="mb-8"
          />
          
          <div className="text-center space-x-4">
            <Button 
              onClick={handleRegisterNow}
              className="bg-brand-teal hover:bg-brand-dark text-white px-8 py-3 text-lg font-semibold"
            >
              {t('demo.startFreeTrial') || 'Start Free Trial'}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleBackToMain}
              className="text-gray-600 hover:text-brand-teal"
            >
              {t('demo.video.backToMain') || 'Back to Home'}
            </Button>
          </div>
        </div>
      </section>
    );
  }

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
              {t('demo.tryLiveDemo')}
            </Badge>
          </div>
          
          <h2 className="text-4xl font-bold text-brand-dark mb-6">
            {t('demo.experienceComplete')}
          </h2>
          
          <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-12">
            {t('demo.testFullPlatform')}
          </p>
          
          {/* Enhanced visibility for the features section */}
          <div className="bg-brand-gradient text-white rounded-lg p-8 max-w-4xl mx-auto mb-12 shadow-xl">
            <p className="text-4xl font-black tracking-wide drop-shadow-lg mb-4">
              {t('demo.realUserExperience')}
            </p>
            <p className="text-xl font-bold opacity-95 drop-shadow-md mb-8">
              {t('demo.accessLivePlatform')}
            </p>
            
            {/* Step Overview - Alternating Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-left">
              {/* Step 1 - Left */}
              <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{t('demo.step1')}</h3>
                  <p className="text-sm text-white/90">{t('demo.step1Description')}</p>
                </div>
              </div>
              
              {/* Step 2 - Right */}
              <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{t('demo.step2')}</h3>
                  <p className="text-sm text-white/90">{t('demo.step2Description')}</p>
                </div>
              </div>
              
              {/* Step 3 - Left */}
              <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{t('demo.step3')}</h3>
                  <p className="text-sm text-white/90">{t('demo.step3Description')}</p>
                </div>
              </div>
              
              {/* Step 4 - Right */}
              <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{t('demo.step4')}</h3>
                  <p className="text-sm text-white/90">{t('demo.step4Description')}</p>
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
                  <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">{t('demo.bonusPoints')}</h3>
                  <p className="text-lg text-white/95 font-medium drop-shadow-md">
                    {t('demo.pauseSubscriptions')}<br />
                    {t('demo.payOnlyEducating')}
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
                {t('demo.startFreeTrial')}
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
