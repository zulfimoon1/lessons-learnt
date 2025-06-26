import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play,
  Pause,
  RotateCcw,
  ArrowLeft,
  GraduationCap,
  Users,
  Heart,
  Settings,
  Calendar,
  MessageSquare,
  Gift,
  MicIcon
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import StudentSimulation from "@/components/StudentSimulation";
import TeacherSimulation from "@/components/TeacherSimulation";
import AdminSimulation from "@/components/AdminSimulation";
import DoctorSimulation from "@/components/DoctorSimulation";
import VoiceFeatureShowcase from "@/components/voice/VoiceFeatureShowcase";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ComplianceFooter from "@/components/ComplianceFooter";
import MobileOptimizedLayout from "@/components/mobile/MobileOptimizedLayout";
import MobileOptimizedCard from "@/components/mobile/MobileOptimizedCard";
import MobileOptimizedButton from "@/components/mobile/MobileOptimizedButton";
import EnhancedLazyLoader from "@/components/performance/EnhancedLazyLoader";
import { useDeviceType } from "@/hooks/use-device";
import { cn } from "@/lib/utils";

const Demo = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleDemoSelect = (demoType: string) => {
    setActiveDemo(demoType);
    setIsPlaying(false);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
  };

  const handlePauseDemo = () => {
    setIsPlaying(false);
  };

  const handleStartFreeTrial = () => {
    navigate('/teacher-login?tab=signup');
  };

  return (
    <MobileOptimizedLayout>
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-gray-200/50">
        <div className={cn(
          'max-w-7xl mx-auto',
          isMobile ? 'px-4' : 'px-4 sm:px-6 lg:px-8'
        )}>
          <div className={cn(
            'flex items-center justify-between',
            isMobile ? 'h-14' : 'h-16'
          )}>
            <div className="flex items-center gap-4">
              <MobileOptimizedButton
                variant="ghost" 
                onClick={handleBackToHome}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                {!isMobile && (t('navigation.backToHome') || 'Back to Home')}
              </MobileOptimizedButton>
              <div className="flex items-center gap-2">
                <GraduationCap className={cn(
                  'text-brand-teal',
                  isMobile ? 'h-5 w-5' : 'h-6 w-6'
                )} />
                <h1 className={cn(
                  'font-semibold text-gray-900',
                  isMobile ? 'text-lg' : 'text-xl'
                )}>
                  {isMobile ? 'Demo' : (t('demo.page.title') || 'Interactive Demo')}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isMobile && (
                <MobileOptimizedButton
                  variant="outline"
                  onClick={handlePauseDemo}
                  className="flex items-center gap-2"
                >
                  <Pause className="h-4 w-4" />
                  {t('demo.page.pauseDemo') || 'Pause Demo'}
                </MobileOptimizedButton>
              )}
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>

      <div className={cn(
        'max-w-7xl mx-auto',
        isMobile ? 'px-4 py-4' : 'px-4 sm:px-6 lg:px-8 py-8'
      )}>
        {/* Main Title */}
        <div className={cn(
          'text-center',
          isMobile ? 'mb-6' : 'mb-12'
        )}>
          <h2 className={cn(
            'font-bold text-gray-900 mb-4',
            isMobile ? 'text-2xl' : 'text-4xl'
          )}>
            {t('demo.page.title') || 'Interactive Demo'}
          </h2>
          <p className={cn(
            'text-gray-600 max-w-3xl mx-auto',
            isMobile ? 'text-base' : 'text-xl'
          )}>
            {t('demo.page.subtitle') || 'Experience our platform with interactive demonstrations showcasing modern design and comprehensive features'}
          </p>
        </div>

        {/* Step Overview Section */}
        <EnhancedLazyLoader minHeight={isMobile ? "300px" : "400px"}>
          <div className="bg-brand-gradient text-white rounded-lg p-8 max-w-4xl mx-auto mb-12 shadow-xl">
            <p className={cn(
              'font-black tracking-wide drop-shadow-lg mb-4 text-center',
              isMobile ? 'text-2xl' : 'text-4xl'
            )}>
              Real User Experience
            </p>
            <p className={cn(
              'font-bold opacity-95 drop-shadow-md mb-8 text-center',
              isMobile ? 'text-lg' : 'text-xl'
            )}>
              Sign up and test all features with authentic workflows
            </p>
            
            {/* Step Overview - Grid Layout */}
            <div className={cn(
              'gap-6 mb-8',
              isMobile ? 'grid grid-cols-1 gap-4' : 'grid grid-cols-1 md:grid-cols-2 gap-6'
            )}>
              {/* Step 1 */}
              <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Step 1</h3>
                  <p className={cn(
                    'text-white/90',
                    isMobile ? 'text-sm' : 'text-sm'
                  )}>School administrator logins and invites teachers and school psychologist</p>
                </div>
              </div>
              
              {/* Step 2 */}
              <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Step 2</h3>
                  <p className={cn(
                    'text-white/90',
                    isMobile ? 'text-sm' : 'text-sm'
                  )}>Teachers can bulk upload class schedules along with any day trips</p>
                </div>
              </div>
              
              {/* Step 3 */}
              <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Step 3</h3>
                  <p className={cn(
                    'text-white/90',
                    isMobile ? 'text-sm' : 'text-sm'
                  )}>Student leave feedback</p>
                </div>
              </div>
              
              {/* Step 4 */}
              <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Step 4</h3>
                  <p className={cn(
                    'text-white/90',
                    isMobile ? 'text-sm' : 'text-sm'
                  )}>School psychologist has access to live chat and emotional wellbeing</p>
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
                  <h3 className={cn(
                    'font-bold text-white mb-2 drop-shadow-lg',
                    isMobile ? 'text-xl' : 'text-2xl'
                  )}>✨ Bonus Points</h3>
                  <p className={cn(
                    'text-white/95 font-medium drop-shadow-md',
                    isMobile ? 'text-base' : 'text-lg'
                  )}>
                    Pause subscriptions during holidays?<br />
                    Pay only when you're actually educating minds
                  </p>
                </div>
              </div>
            </div>
            
            {/* Register Now Button */}
            <div className="mt-6 text-center">
              <MobileOptimizedButton 
                onClick={handleStartFreeTrial}
                className="bg-brand-orange hover:bg-brand-orange/90 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                touchOptimized={true}
              >
                Start Your Free Trial
              </MobileOptimizedButton>
            </div>
          </div>
        </EnhancedLazyLoader>

        {!activeDemo ? (
          <>
            {/* Demo Selection Cards */}
            <EnhancedLazyLoader minHeight={isMobile ? "600px" : "400px"}>
              <div className={cn(
                'gap-8 mb-16',
                isMobile ? 'grid grid-cols-1 gap-6' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8'
              )}>
                {/* Voice Features - NEW! */}
                <MobileOptimizedCard
                  title="🎤 Voice Features"
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-purple-500 relative"
                  icon={<MicIcon className="h-6 w-6 text-purple-600" />}
                  actions={
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white animate-pulse">
                      NEW!
                    </Badge>
                  }
                >
                  <CardDescription className="mb-4">
                    Experience revolutionary voice-powered education
                  </CardDescription>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p>• Student voice feedback and recording</p>
                    <p>• Teacher voice message management</p>
                    <p>• AI-powered emotional analysis</p>
                    <p>• Voice accessibility features</p>
                  </div>
                  <MobileOptimizedButton 
                    onClick={() => handleDemoSelect('voice')}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    fullWidth={true}
                  >
                    <MicIcon className="w-4 h-4 mr-2" />
                    Try Voice Revolution
                  </MobileOptimizedButton>
                </MobileOptimizedCard>

                {/* Student Experience */}
                <MobileOptimizedCard
                  title={t('demo.simulation.student.title') || 'Student Experience'}
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-brand-teal relative"
                  icon={<GraduationCap className="h-6 w-6 text-brand-teal" />}
                  actions={
                    <Badge className="bg-brand-teal/10 text-brand-teal border-brand-teal/20">
                      {t('demo.userType.student') || 'Student'}
                    </Badge>
                  }
                >
                  <CardDescription className="mb-4">
                    {t('demo.simulation.student.description') || 'Experience the platform from a student\'s perspective'}
                  </CardDescription>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p>• Complete student dashboard with modern design</p>
                    <p>• Interactive feedback forms with real-time updates</p>
                    <p>• Wellness tracking and support features</p>
                    <p>• Progress monitoring and achievements</p>
                  </div>
                  <MobileOptimizedButton 
                    onClick={() => handleDemoSelect('student')}
                    className="bg-brand-teal hover:bg-brand-dark text-white"
                    fullWidth={true}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Try Student Experience
                  </MobileOptimizedButton>
                </MobileOptimizedCard>

                {/* Teacher Experience */}
                <MobileOptimizedCard
                  title={t('demo.simulation.teacher.title') || 'Teacher Experience'}
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-brand-orange relative"
                  icon={<Users className="h-6 w-6 text-brand-orange" />}
                  actions={
                    <Badge className="bg-brand-orange/10 text-brand-orange border-brand-orange/20">
                      {t('demo.userType.teacher') || 'Teacher'}
                    </Badge>
                  }
                >
                  <CardDescription className="mb-4">
                    {t('demo.simulation.teacher.description') || 'Explore comprehensive teaching tools and analytics'}
                  </CardDescription>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p>• Advanced analytics dashboard with insights</p>
                    <p>• Real-time student feedback monitoring</p>
                    <p>• Performance tracking and trends</p>
                    <p>• Student wellness alerts and support</p>
                  </div>
                  <MobileOptimizedButton 
                    onClick={() => handleDemoSelect('teacher')}
                    className="bg-brand-orange hover:bg-brand-orange/90 text-white"
                    fullWidth={true}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Try Teacher Experience
                  </MobileOptimizedButton>
                </MobileOptimizedCard>

                {/* School Administrator Experience */}
                <MobileOptimizedCard
                  title="School Administrator"
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-purple-500 relative"
                  icon={<Settings className="h-6 w-6 text-purple-600" />}
                  actions={
                    <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                      Administrator
                    </Badge>
                  }
                >
                  <CardDescription className="mb-4">
                    Comprehensive school management and oversight tools
                  </CardDescription>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p>• School-wide performance analytics</p>
                    <p>• Teacher management and invitations</p>
                    <p>• System configuration and settings</p>
                    <p>• Compliance monitoring and reporting</p>
                  </div>
                  <MobileOptimizedButton 
                    onClick={() => handleDemoSelect('admin')}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                    fullWidth={true}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Try Administrator Tools
                  </MobileOptimizedButton>
                </MobileOptimizedCard>

                {/* Doctor Experience */}
                <MobileOptimizedCard
                  title="Doctor Experience"
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-green-500 relative"
                  icon={<Heart className="h-6 w-6 text-green-600" />}
                  actions={
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      Medical Professional
                    </Badge>
                  }
                >
                  <CardDescription className="mb-4">
                    Specialized medical support and mental health tools
                  </CardDescription>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p>• Mental health alert monitoring</p>
                    <p>• Secure live chat with students</p>
                    <p>• Wellness tracking and reports</p>
                    <p>• HIPAA-compliant data handling</p>
                  </div>
                  <MobileOptimizedButton 
                    onClick={() => handleDemoSelect('doctor')}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    fullWidth={true}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Try Medical Tools
                  </MobileOptimizedButton>
                </MobileOptimizedCard>
              </div>
            </EnhancedLazyLoader>

            {/* Key Features - Hidden on Mobile as requested */}
            {!isMobile && (
              <EnhancedLazyLoader minHeight="300px">
                <div className="mt-16 bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
                  <h3 className="text-2xl font-bold text-center mb-8">Modern Design Meets Powerful Functionality</h3>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <MicIcon className="h-8 w-8 text-purple-600" />
                      </div>
                      <h4 className="text-lg font-semibold mb-2">Voice-First Platform</h4>
                      <p className="text-gray-600">Revolutionary voice recording and analysis technology</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-brand-teal/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <GraduationCap className="h-8 w-8 text-brand-teal" />
                      </div>
                      <h4 className="text-lg font-semibold mb-2">Student-Centric Design</h4>
                      <p className="text-gray-600">Intuitive interfaces that make learning and feedback engaging</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-brand-orange/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Users className="h-8 w-8 text-brand-orange" />
                      </div>
                      <h4 className="text-lg font-semibold mb-2">Teacher Empowerment</h4>
                      <p className="text-gray-600">Comprehensive tools that enhance teaching effectiveness</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Settings className="h-8 w-8 text-purple-600" />
                      </div>
                      <h4 className="text-lg font-semibold mb-2">Administrative Control</h4>
                      <p className="text-gray-600">Complete oversight with streamlined management workflows</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Heart className="h-8 w-8 text-green-600" />
                      </div>
                      <h4 className="text-lg font-semibold mb-2">Health & Wellness</h4>
                      <p className="text-gray-600">Comprehensive support for student mental health and wellbeing</p>
                    </div>
                  </div>
                </div>
              </EnhancedLazyLoader>
            )}

            {/* Call to Action */}
            <div className={cn(
              'mt-16 bg-gradient-to-r from-brand-teal to-brand-orange text-white rounded-2xl text-center shadow-xl',
              isMobile ? 'p-6' : 'p-8'
            )}>
              <h3 className={cn(
                'font-bold mb-4',
                isMobile ? 'text-2xl' : 'text-3xl'
              )}>Ready to Transform Your School?</h3>
              <p className={cn(
                'mb-6 opacity-90',
                isMobile ? 'text-lg' : 'text-xl'
              )}>Experience the future of educational technology with our comprehensive platform.</p>
              <MobileOptimizedButton 
                size="lg" 
                className={cn(
                  'bg-brand-orange hover:bg-brand-orange/90 text-white transform hover:scale-105 transition-all shadow-lg',
                  isMobile ? 'text-lg px-8 py-4' : 'text-xl px-12 py-4'
                )}
                onClick={handleStartFreeTrial}
                touchOptimized={true}
              >
                {t('pricing.startFreeTrial') || 'Start Free Trial'}
              </MobileOptimizedButton>
            </div>
          </>
        ) : (
          /* Active Demo Display */
          <div className="space-y-6">
            {/* Demo Controls */}
            <MobileOptimizedCard className="shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <MobileOptimizedButton
                    variant="outline"
                    onClick={() => setActiveDemo(null)}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {!isMobile && 'Back to Demos'}
                  </MobileOptimizedButton>
                  <h2 className={cn(
                    'font-bold',
                    isMobile ? 'text-lg' : 'text-2xl'
                  )}>
                    {activeDemo === 'voice' && '🎤 Voice Features Demo'}
                    {activeDemo === 'student' && (t('demo.simulation.student.title') || 'Student Experience')}
                    {activeDemo === 'teacher' && (t('demo.simulation.teacher.title') || 'Teacher Experience')}
                    {activeDemo === 'admin' && 'School Administrator Experience'}
                    {activeDemo === 'doctor' && 'Doctor Experience'}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <MobileOptimizedButton
                    onClick={handlePlayPause}
                    className="flex items-center gap-2 bg-brand-teal hover:bg-brand-dark text-white"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {!isMobile && (isPlaying ? (t('demo.page.pauseDemo') || 'Pause Demo') : (t('demo.page.playDemo') || 'Play Demo'))}
                  </MobileOptimizedButton>
                  <MobileOptimizedButton
                    variant="outline"
                    onClick={handleReset}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    {!isMobile && 'Reset'}
                  </MobileOptimizedButton>
                </div>
              </div>
            </MobileOptimizedCard>

            {/* Demo Content */}
            <div className={cn(
              'gap-6',
              isMobile ? 'grid grid-cols-1' : 'grid grid-cols-1 lg:grid-cols-12 gap-6'
            )}>
              {/* Simulation Display */}
              <div className={cn(isMobile ? '' : 'lg:col-span-8')}>
                <MobileOptimizedCard className="h-full shadow-lg">
                  <EnhancedLazyLoader>
                    {activeDemo === 'voice' && (
                      <VoiceFeatureShowcase />
                    )}
                    {activeDemo === 'student' && (
                      <StudentSimulation isPlaying={isPlaying} />
                    )}
                    {activeDemo === 'teacher' && (
                      <TeacherSimulation isPlaying={isPlaying} />
                    )}
                    {activeDemo === 'admin' && (
                      <AdminSimulation isPlaying={isPlaying} />
                    )}
                    {activeDemo === 'doctor' && (
                      <DoctorSimulation isPlaying={isPlaying} />
                    )}
                  </EnhancedLazyLoader>
                </MobileOptimizedCard>
              </div>

              {/* Demo Information - Show on tablet and desktop only */}
              {!isMobile && (
                <div className="lg:col-span-4">
                  <MobileOptimizedCard 
                    title="Demo Information"
                    className="h-full shadow-lg"
                  >
                    {activeDemo === 'voice' && (
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                          Experience the revolutionary voice-powered features that transform educational feedback.
                        </p>
                        <div className="space-y-2">
                          <h4 className="font-semibold">Key Voice Features:</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Student voice recording and feedback</li>
                            <li>• Teacher voice message management tools</li>
                            <li>• AI-powered emotional tone analysis</li>
                            <li>• Automatic voice transcription</li>
                            <li>• Voice accessibility for all students</li>
                          </ul>
                        </div>
                      </div>
                    )}
                    {activeDemo === 'student' && (
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                          Experience our student-focused design with intuitive navigation and engaging interactions.
                        </p>
                        <div className="space-y-2">
                          <h4 className="font-semibold">Key Features:</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Modern dashboard with glass-morphism design</li>
                            <li>• Interactive feedback forms with visual progress</li>
                            <li>• Wellness tracking with mood indicators</li>
                            <li>• Real-time progress monitoring</li>
                          </ul>
                        </div>
                      </div>
                    )}
                    {activeDemo === 'teacher' && (
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                          Explore powerful teaching tools with comprehensive analytics and real-time insights.
                        </p>
                        <div className="space-y-2">
                          <h4 className="font-semibold">Key Features:</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Advanced analytics with visual trends</li>
                            <li>• Live student feedback monitoring</li>
                            <li>• Mental health alert system</li>
                            <li>• Performance insights and recommendations</li>
                          </ul>
                        </div>
                      </div>
                    )}
                    {activeDemo === 'admin' && (
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                          Comprehensive school management with oversight tools and system configuration.
                        </p>
                        <div className="space-y-2">
                          <h4 className="font-semibold">Key Features:</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• School-wide analytics dashboard</li>
                            <li>• Teacher management and invitations</li>
                            <li>• System settings and compliance</li>
                            <li>• Performance tracking across departments</li>
                          </ul>
                        </div>
                      </div>
                    )}
                    {activeDemo === 'doctor' && (
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                          Specialized medical tools for student health support with privacy compliance.
                        </p>
                        <div className="space-y-2">
                          <h4 className="font-semibold">Key Features:</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Mental health alert monitoring</li>
                            <li>• Secure live chat with students</li>
                            <li>• Wellness check-in reviews</li>
                            <li>• HIPAA-compliant reporting</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </MobileOptimizedCard>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Add Compliance Footer */}
      <ComplianceFooter />
    </MobileOptimizedLayout>
  );
};

export default Demo;
