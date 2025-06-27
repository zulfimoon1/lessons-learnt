
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDeviceType } from "@/hooks/use-device";
import { cn } from "@/lib/utils";

// Core simulation components
import StudentSimulation from "@/components/StudentSimulation";
import TeacherSimulation from "@/components/TeacherSimulation";
import AdminSimulation from "@/components/AdminSimulation";
import DoctorSimulation from "@/components/DoctorSimulation";
import VoiceFeatureShowcase from "@/components/voice/VoiceFeatureShowcase";

// Layout and optimization components
import ComplianceFooter from "@/components/ComplianceFooter";
import MobileOptimizedLayout from "@/components/mobile/MobileOptimizedLayout";
import MobileOptimizedCard from "@/components/mobile/MobileOptimizedCard";
import MobileOptimizedButton from "@/components/mobile/MobileOptimizedButton";
import EnhancedLazyLoader from "@/components/performance/EnhancedLazyLoader";

// Focused demo components
import DemoHeader from "@/components/demo/DemoHeader";
import DemoSelectionCards from "@/components/demo/DemoSelectionCards";
import DemoCallToAction from "@/components/demo/DemoCallToAction";

import { 
  Play,
  Pause,
  RotateCcw,
  ArrowLeft,
  GraduationCap,
  Users,
  Heart,
  Settings,
  MicIcon
} from "lucide-react";

const Demo = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Core navigation functions - preserving authentication flow
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

  // Demo simulation mapping - preserving core functionality
  const renderDemoContent = () => {
    switch (activeDemo) {
      case 'voice':
        return <VoiceFeatureShowcase isPlaying={isPlaying} />;
      case 'student':
        return <StudentSimulation isPlaying={isPlaying} />;
      case 'teacher':
        return <TeacherSimulation isPlaying={isPlaying} />;
      case 'admin':
        return <AdminSimulation isPlaying={isPlaying} />;
      case 'doctor':
        return <DoctorSimulation isPlaying={isPlaying} />;
      default:
        return null;
    }
  };

  const getDemoTitle = () => {
    switch (activeDemo) {
      case 'voice': return '🎤 Voice Features Demo';
      case 'student': return t('demo.simulation.student.title') || 'Student Experience';
      case 'teacher': return t('demo.simulation.teacher.title') || 'Teacher Experience';
      case 'admin': return 'School Administrator Experience';
      case 'doctor': return 'Doctor Experience';
      default: return '';
    }
  };

  const getDemoInfo = () => {
    const demoInfoMap = {
      voice: {
        description: 'Experience the revolutionary voice-powered features that transform educational feedback.',
        features: [
          'Student voice recording and feedback',
          'Teacher voice message management tools',
          'AI-powered emotional tone analysis',
          'Automatic voice transcription',
          'Voice accessibility for all students'
        ]
      },
      student: {
        description: 'Experience our student-focused design with intuitive navigation and engaging interactions.',
        features: [
          'Modern dashboard with glass-morphism design',
          'Interactive feedback forms with visual progress',
          'Wellness tracking with mood indicators',
          'Real-time progress monitoring'
        ]
      },
      teacher: {
        description: 'Explore powerful teaching tools with comprehensive analytics and real-time insights.',
        features: [
          'Advanced analytics with visual trends',
          'Live student feedback monitoring',
          'Mental health alert system',
          'Performance insights and recommendations'
        ]
      },
      admin: {
        description: 'Comprehensive school management with oversight tools and system configuration.',
        features: [
          'School-wide analytics dashboard',
          'Teacher management and invitations',
          'System settings and compliance',
          'Performance tracking across departments'
        ]
      },
      doctor: {
        description: 'Specialized medical tools for student health support with privacy compliance.',
        features: [
          'Mental health alert monitoring',
          'Secure live chat with students',
          'Wellness check-in reviews',
          'HIPAA-compliant reporting'
        ]
      }
    };
    
    return demoInfoMap[activeDemo as keyof typeof demoInfoMap];
  };

  return (
    <MobileOptimizedLayout>
      {/* Header - Preserving language switching and navigation */}
      <DemoHeader 
        isMobile={isMobile}
        onBackToHome={handleBackToHome}
        onPauseDemo={handlePauseDemo}
      />

      <div className={cn(
        'max-w-7xl mx-auto',
        isMobile ? 'px-4 py-4' : 'px-4 sm:px-6 lg:px-8 py-8'
      )}>
        {/* Main Title - Preserving translation context */}
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

        {!activeDemo ? (
          <>
            {/* Demo Selection - Preserving all demo functionality */}
            <EnhancedLazyLoader minHeight={isMobile ? "600px" : "400px"}>
              <div className={cn(
                'mb-16',
                isMobile ? 'grid grid-cols-1 gap-6' : 'space-y-8'
              )}>
                <DemoSelectionCards 
                  isMobile={isMobile}
                  onDemoSelect={handleDemoSelect}
                />
              </div>
            </EnhancedLazyLoader>

            {/* Call to Action - Preserving signup flow */}
            <EnhancedLazyLoader minHeight={isMobile ? "300px" : "400px"}>
              <DemoCallToAction 
                isMobile={isMobile}
                onStartFreeTrial={handleStartFreeTrial}
              />
            </EnhancedLazyLoader>

            {/* Key Features - Desktop only as requested */}
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

            {/* Final CTA - Preserving navigation flow */}
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
          /* Active Demo - Preserving all simulation functionality */
          <div className="space-y-6">
            {/* Demo Controls - Maintaining state management */}
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
                    {getDemoTitle()}
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

            {/* Demo Content Layout */}
            <div className={cn(
              'gap-6',
              isMobile ? 'grid grid-cols-1' : 'grid grid-cols-1 lg:grid-cols-12 gap-6'
            )}>
              {/* Simulation Display - Core functionality preserved */}
              <div className={cn(isMobile ? '' : 'lg:col-span-8')}>
                <MobileOptimizedCard className="h-full shadow-lg">
                  <EnhancedLazyLoader>
                    {renderDemoContent()}
                  </EnhancedLazyLoader>
                </MobileOptimizedCard>
              </div>

              {/* Demo Information - Tablet/Desktop only */}
              {!isMobile && activeDemo && (
                <div className="lg:col-span-4">
                  <MobileOptimizedCard 
                    title="Demo Information"
                    className="h-full shadow-lg"
                  >
                    {(() => {
                      const info = getDemoInfo();
                      return info ? (
                        <div className="space-y-4">
                          <p className="text-sm text-gray-600">
                            {info.description}
                          </p>
                          <div className="space-y-2">
                            <h4 className="font-semibold">Key Features:</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {info.features.map((feature, index) => (
                                <li key={index}>• {feature}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </MobileOptimizedCard>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <ComplianceFooter />
    </MobileOptimizedLayout>
  );
};

export default Demo;
