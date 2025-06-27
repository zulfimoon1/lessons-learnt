
import React, { useState, lazy, Suspense } from 'react';
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMobileOptimization } from "@/hooks/useMobileOptimization";
import { cn } from "@/lib/utils";

// Core components - loaded immediately
import ComplianceFooter from "@/components/ComplianceFooter";
import MobileOptimizedLayout from "@/components/mobile/MobileOptimizedLayout";
import OptimizedCard from "@/components/shared/OptimizedCard";
import OptimizedButton from "@/components/shared/OptimizedButton";
import EnhancedLazyLoader from "@/components/performance/EnhancedLazyLoader";
import DemoHeader from "@/components/demo/DemoHeader";

// Lazy-loaded demo components for code splitting
const VoiceFeatureShowcase = lazy(() => import("@/components/voice/VoiceFeatureShowcase"));
const StudentSimulation = lazy(() => import("@/components/StudentSimulation"));
const TeacherSimulation = lazy(() => import("@/components/TeacherSimulation"));
const AdminSimulation = lazy(() => import("@/components/AdminSimulation"));
const DoctorSimulation = lazy(() => import("@/components/DoctorSimulation"));
const DemoSelectionCards = lazy(() => import("@/components/demo/DemoSelectionCards"));
const DemoCallToAction = lazy(() => import("@/components/demo/DemoCallToAction"));

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
  const { isMobile, getResponsiveClasses } = useMobileOptimization();
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Core navigation functions - preserving authentication flow
  const handleBackToHome = () => navigate('/');
  const handleDemoSelect = (demoType: string) => {
    setActiveDemo(demoType);
    setIsPlaying(false);
  };
  const handlePlayPause = () => setIsPlaying(!isPlaying);
  const handleReset = () => setIsPlaying(false);
  const handlePauseDemo = () => setIsPlaying(false);
  const handleStartFreeTrial = () => navigate('/teacher-login?tab=signup');

  // Demo simulation mapping with lazy loading
  const renderDemoContent = () => {
    const commonProps = { isPlaying };
    
    switch (activeDemo) {
      case 'voice':
        return (
          <Suspense fallback={<div className="animate-pulse bg-gray-200 h-64 rounded-lg" />}>
            <VoiceFeatureShowcase {...commonProps} />
          </Suspense>
        );
      case 'student':
        return (
          <Suspense fallback={<div className="animate-pulse bg-gray-200 h-64 rounded-lg" />}>
            <StudentSimulation {...commonProps} />
          </Suspense>
        );
      case 'teacher':
        return (
          <Suspense fallback={<div className="animate-pulse bg-gray-200 h-64 rounded-lg" />}>
            <TeacherSimulation {...commonProps} />
          </Suspense>
        );
      case 'admin':
        return (
          <Suspense fallback={<div className="animate-pulse bg-gray-200 h-64 rounded-lg" />}>
            <AdminSimulation {...commonProps} />
          </Suspense>
        );
      case 'doctor':
        return (
          <Suspense fallback={<div className="animate-pulse bg-gray-200 h-64 rounded-lg" />}>
            <DoctorSimulation {...commonProps} />
          </Suspense>
        );
      default:
        return null;
    }
  };

  const getDemoTitle = () => {
    const titles = {
      voice: '🎤 Voice Features Demo',
      student: t('demo.simulation.student.title') || 'Student Experience',
      teacher: t('demo.simulation.teacher.title') || 'Teacher Experience',
      admin: 'School Administrator Experience',
      doctor: 'Doctor Experience'
    };
    return titles[activeDemo as keyof typeof titles] || '';
  };

  const containerClasses = getResponsiveClasses({
    mobile: 'px-4 py-4',
    tablet: 'px-6 py-6',
    desktop: 'px-4 sm:px-6 lg:px-8 py-8'
  });

  const titleClasses = getResponsiveClasses({
    mobile: 'text-2xl mb-6',
    tablet: 'text-3xl mb-8',
    desktop: 'text-4xl mb-12'
  });

  return (
    <MobileOptimizedLayout>
      {/* Header - Preserving language switching and navigation */}
      <DemoHeader 
        isMobile={isMobile}
        onBackToHome={handleBackToHome}
        onPauseDemo={handlePauseDemo}
      />

      <div className={cn('max-w-7xl mx-auto', containerClasses.combined)}>
        {/* Main Title - Preserving translation context */}
        <div className={cn('text-center', titleClasses.combined)}>
          <h2 className={cn('font-bold text-gray-900 mb-4', titleClasses.combined)}>
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
            {/* Demo Selection - Lazy loaded for performance */}
            <EnhancedLazyLoader minHeight={isMobile ? "600px" : "400px"}>
              <div className={cn('mb-16', isMobile ? 'grid grid-cols-1 gap-6' : 'space-y-8')}>
                <Suspense fallback={<div className="animate-pulse bg-gray-200 h-96 rounded-lg" />}>
                  <DemoSelectionCards 
                    isMobile={isMobile}
                    onDemoSelect={handleDemoSelect}
                  />
                </Suspense>
              </div>
            </EnhancedLazyLoader>

            {/* Call to Action - Lazy loaded */}
            <EnhancedLazyLoader minHeight={isMobile ? "300px" : "400px"}>
              <Suspense fallback={<div className="animate-pulse bg-gray-200 h-64 rounded-lg" />}>
                <DemoCallToAction 
                  isMobile={isMobile}
                  onStartFreeTrial={handleStartFreeTrial}
                />
              </Suspense>
            </EnhancedLazyLoader>

            {/* Key Features - Desktop only, optimized */}
            {!isMobile && (
              <EnhancedLazyLoader minHeight="300px">
                <OptimizedCard
                  variant="gradient"
                  size="lg"
                  className="mt-16"
                  title="Modern Design Meets Powerful Functionality"
                >
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                    {[
                      { icon: MicIcon, title: 'Voice-First Platform', desc: 'Revolutionary voice recording and analysis technology', color: 'purple' },
                      { icon: GraduationCap, title: 'Student-Centric Design', desc: 'Intuitive interfaces that make learning and feedback engaging', color: 'brand-teal' },
                      { icon: Users, title: 'Teacher Empowerment', desc: 'Comprehensive tools that enhance teaching effectiveness', color: 'brand-orange' },
                      { icon: Settings, title: 'Administrative Control', desc: 'Complete oversight with streamlined management workflows', color: 'purple' },
                      { icon: Heart, title: 'Health & Wellness', desc: 'Comprehensive support for student mental health and wellbeing', color: 'green' }
                    ].map((feature, index) => (
                      <div key={index} className="text-center">
                        <div className={`w-16 h-16 bg-${feature.color}-100 rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                          <feature.icon className={`h-8 w-8 text-${feature.color}-600`} />
                        </div>
                        <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                        <p className="text-gray-600">{feature.desc}</p>
                      </div>
                    ))}
                  </div>
                </OptimizedCard>
              </EnhancedLazyLoader>
            )}

            {/* Final CTA - Preserving navigation flow */}
            <div className={cn(
              'mt-16 bg-gradient-to-r from-brand-teal to-brand-orange text-white rounded-2xl text-center shadow-xl',
              isMobile ? 'p-6' : 'p-8'
            )}>
              <h3 className={cn('font-bold mb-4', isMobile ? 'text-2xl' : 'text-3xl')}>
                Ready to Transform Your School?
              </h3>
              <p className={cn('mb-6 opacity-90', isMobile ? 'text-lg' : 'text-xl')}>
                Experience the future of educational technology with our comprehensive platform.
              </p>
              <OptimizedButton 
                size="lg" 
                className={cn(
                  'bg-brand-orange hover:bg-brand-orange/90 text-white transform hover:scale-105 transition-all shadow-lg',
                  isMobile ? 'text-lg px-8 py-4' : 'text-xl px-12 py-4'
                )}
                onClick={handleStartFreeTrial}
                touchOptimized={true}
              >
                {t('pricing.startFreeTrial') || 'Start Free Trial'}
              </OptimizedButton>
            </div>
          </>
        ) : (
          /* Active Demo - Preserving all simulation functionality */
          <div className="space-y-6">
            {/* Demo Controls - Maintaining state management */}
            <OptimizedCard className="shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <OptimizedButton
                    variant="outline"
                    onClick={() => setActiveDemo(null)}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {!isMobile && 'Back to Demos'}
                  </OptimizedButton>
                  <h2 className={cn('font-bold', isMobile ? 'text-lg' : 'text-2xl')}>
                    {getDemoTitle()}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <OptimizedButton
                    onClick={handlePlayPause}
                    className="flex items-center gap-2 bg-brand-teal hover:bg-brand-dark text-white"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {!isMobile && (isPlaying ? (t('demo.page.pauseDemo') || 'Pause Demo') : (t('demo.page.playDemo') || 'Play Demo'))}
                  </OptimizedButton>
                  <OptimizedButton
                    variant="outline"
                    onClick={handleReset}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    {!isMobile && 'Reset'}
                  </OptimizedButton>
                </div>
              </div>
            </OptimizedCard>

            {/* Demo Content Layout */}
            <OptimizedCard className="shadow-lg">
              <EnhancedLazyLoader>
                {renderDemoContent()}
              </EnhancedLazyLoader>
            </OptimizedCard>
          </div>
        )}
      </div>
      
      <ComplianceFooter />
    </MobileOptimizedLayout>
  );
};

export default React.memo(Demo);
