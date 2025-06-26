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
  Heart
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import StudentSimulation from "@/components/StudentSimulation";
import TeacherSimulation from "@/components/TeacherSimulation";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const Demo = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
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
    // Reset logic for simulations
  };

  const handlePauseDemo = () => {
    setIsPlaying(false);
  };

  const handleStartFreeTrial = () => {
    navigate('/teacher-login?tab=signup');
  };

  const handleTeacherDemo = () => {
    setActiveDemo('teacher');
  };

  const handleStudentDemo = () => {
    setActiveDemo('student');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={handleBackToHome}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('navigation.backToHome')}
              </Button>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-semibold text-gray-900">
                  {t('demo.page.title')}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={handlePauseDemo}
                className="flex items-center gap-2"
              >
                <Pause className="h-4 w-4" />
                {t('demo.page.pauseDemo')}
              </Button>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Title */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t('demo.page.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('demo.page.subtitle')}
          </p>
        </div>

        {!activeDemo ? (
          <>
            {/* Demo Selection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {/* Student Experience */}
              <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-500 relative">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <GraduationCap className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{t('demo.simulation.student.title')}</CardTitle>
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                        {t('demo.userType.student')}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    {t('demo.simulation.student.description')}
                  </CardDescription>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p>• Experience the complete student dashboard</p>
                    <p>• Submit real feedback on lessons</p>
                    <p>• Access mental health support features</p>
                    <p>• Track your learning progress</p>
                  </div>
                  <Button 
                    onClick={handleStudentDemo}
                    className="w-full bg-brand-teal hover:bg-brand-dark text-white"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Try Student Experience
                  </Button>
                </CardContent>
              </Card>

              {/* Teacher Experience */}
              <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-green-500 relative">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{t('demo.simulation.teacher.title')}</CardTitle>
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        {t('demo.userType.teacher')}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    {t('demo.simulation.teacher.description')}
                  </CardDescription>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p>• Create and manage class schedules</p>
                    <p>• View real-time student feedback</p>
                    <p>• Access comprehensive analytics</p>
                    <p>• Monitor student well-being</p>
                  </div>
                  <Button 
                    onClick={handleTeacherDemo}
                    className="w-full bg-brand-teal hover:bg-brand-dark text-white"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Try Teacher Experience
                  </Button>
                </CardContent>
              </Card>

              {/* Mental Health Professional Experience */}
              <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-purple-500 relative">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Heart className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{t('demo.simulation.mentalHealth.title')}</CardTitle>
                      <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                        {t('demo.userType.psychologist')}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    {t('demo.simulation.mentalHealth.description')}
                  </CardDescription>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p>• Monitor student mental health alerts</p>
                    <p>• Access confidential support tools</p>
                    <p>• Create intervention strategies</p>
                    <p>• Collaborate with teaching staff</p>
                  </div>
                  <Button 
                    onClick={() => setActiveDemo('mentalHealth')}
                    className="w-full bg-brand-teal hover:bg-brand-dark text-white"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Try Mental Health Tools
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Platform Features Section */}
            <div className="mt-16 bg-white rounded-lg p-8 shadow-sm">
              <h3 className="text-3xl font-bold text-center mb-4 text-brand-dark">
                {t('demo.discoverFuture')}
              </h3>
              <p className="text-lg text-center text-gray-600 mb-8 max-w-4xl mx-auto">
                {t('demo.discoverDescription')}
              </p>
              
              <div className="bg-brand-gradient text-white rounded-lg p-8 max-w-md mx-auto mb-12 shadow-xl">
                <p className="text-4xl font-black tracking-wide drop-shadow-lg text-center">
                  Real User Experience
                </p>
                <p className="text-xl font-bold mt-3 opacity-95 drop-shadow-md text-center">
                  Sign up and test all features
                </p>
                
                {/* Updated Call to Action Button */}
                <div className="mt-6 text-center">
                  <Button 
                    onClick={handleStartFreeTrial}
                    className="bg-brand-orange hover:bg-brand-orange/90 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                  >
                    Sign Up to Test All Features
                  </Button>
                </div>
              </div>
            </div>

            {/* Key Features */}
            <div className="mt-16 bg-white rounded-lg p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-center mb-8">Experience the Complete Platform</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="h-8 w-8 text-blue-600" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">Real Authentication</h4>
                  <p className="text-gray-600">Sign up with real accounts and experience actual security flows</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">Complete Workflows</h4>
                  <p className="text-gray-600">Test the full teacher and student experience with real data</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-8 w-8 text-purple-600" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">Actual Integration</h4>
                  <p className="text-gray-600">Experience how all components work together in practice</p>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="mt-16 bg-brand-gradient text-white rounded-lg p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Ready to Experience the Real Platform?</h3>
              <p className="text-lg mb-6 opacity-90">Sign up now and test all features with real authentication and data flows.</p>
              <Button 
                size="lg" 
                className="text-xl px-12 py-4 bg-brand-orange hover:bg-brand-orange/90 text-white transform scale-125"
                onClick={handleStartFreeTrial}
              >
                {t('pricing.startFreeTrial')}
              </Button>
            </div>
          </>
        ) : (
          /* Active Demo Display */
          <div className="space-y-6">
            {/* Demo Controls */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setActiveDemo(null)}
                      className="flex items-center gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to Demos
                    </Button>
                    <h2 className="text-2xl font-bold">
                      {activeDemo === 'student' && t('demo.simulation.student.title')}
                      {activeDemo === 'teacher' && t('demo.simulation.teacher.title')}
                      {activeDemo === 'mentalHealth' && t('demo.simulation.mentalHealth.title')}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handlePlayPause}
                      className="flex items-center gap-2"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      {isPlaying ? t('demo.page.pauseDemo') : t('demo.page.playDemo')}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      className="flex items-center gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reset
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Demo Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Simulation Display */}
              <div className="lg:col-span-8">
                <Card className="h-full">
                  <CardContent className="p-6">
                    {activeDemo === 'student' && (
                      <StudentSimulation isPlaying={isPlaying} />
                    )}
                    {activeDemo === 'teacher' && (
                      <TeacherSimulation isPlaying={isPlaying} />
                    )}
                    {activeDemo === 'mentalHealth' && (
                      <div className="text-center py-12">
                        <Heart className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Mental Health Support Demo</h3>
                        <p className="text-gray-600">Coming soon...</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Demo Information */}
              <div className="lg:col-span-4">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Demo Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {activeDemo === 'student' && (
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                          {t('demo.simulation.student.description')}
                        </p>
                        <div className="space-y-2">
                          <h4 className="font-semibold">Key Features:</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Complete dashboard experience</li>
                            <li>• Interactive feedback forms</li>
                            <li>• Mental health support access</li>
                            <li>• Real-time progress tracking</li>
                          </ul>
                        </div>
                      </div>
                    )}
                    {activeDemo === 'teacher' && (
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                          {t('demo.simulation.teacher.description')}
                        </p>
                        <div className="space-y-2">
                          <h4 className="font-semibold">Key Features:</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Comprehensive analytics dashboard</li>
                            <li>• Student progress monitoring</li>
                            <li>• Mental health alerts</li>
                            <li>• Performance insights</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Demo;
