
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
    navigate('/teacher-login');
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
                {t('demo.page.backToHome')}
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
                    <p>{t('demo.features.student.1')}</p>
                    <p>{t('demo.features.student.2')}</p>
                    <p>{t('demo.features.student.6')}</p>
                    <p>• {t('demo.interactive.student')}</p>
                  </div>
                  <Button 
                    onClick={handleStudentDemo}
                    className="w-full bg-brand-teal hover:bg-brand-dark text-white"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {t('demo.cta.studentAccess')}
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
                    <p>{t('demo.features.teacher.1')}</p>
                    <p>{t('demo.features.teacher.2')}</p>
                    <p>{t('demo.features.teacher.3')}</p>
                    <p>{t('demo.features.teacher.4')}</p>
                  </div>
                  <Button 
                    onClick={handleTeacherDemo}
                    className="w-full bg-brand-teal hover:bg-brand-dark text-white"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {t('demo.interactive.teacher')}
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
                    <p>{t('demo.features.mentalHealth.3')}</p>
                    <p>{t('demo.features.mentalHealth.2')}</p>
                    <p>{t('demo.features.mentalHealth.4')}</p>
                    <p>{t('demo.features.mentalHealth.5')}</p>
                  </div>
                  <Button 
                    onClick={() => setActiveDemo('mentalHealth')}
                    className="w-full bg-brand-teal hover:bg-brand-dark text-white"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {t('demo.features.mentalHealth.1')}
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
                  {t('demo.realUserExperience')}
                </p>
                <p className="text-xl font-bold mt-3 opacity-95 drop-shadow-md text-center">
                  {t('demo.signUpTestFeatures')}
                </p>
              </div>
            </div>

            {/* Key Features */}
            <div className="mt-16 bg-white rounded-lg p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-center mb-8">{t('demo.experienceCompletePlatform')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="h-8 w-8 text-blue-600" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">{t('demo.realAuthentication')}</h4>
                  <p className="text-gray-600">{t('demo.realAuthDescription')}</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">{t('demo.completeWorkflows')}</h4>
                  <p className="text-gray-600">{t('demo.completeWorkflowsDescription')}</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-8 w-8 text-purple-600" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">{t('demo.actualIntegration')}</h4>
                  <p className="text-gray-600">{t('demo.actualIntegrationDescription')}</p>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="mt-16 bg-brand-gradient text-white rounded-lg p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">{t('demo.readyToExperience')}</h3>
              <p className="text-lg mb-6 opacity-90">{t('demo.signUpNowTest')}</p>
              <Button 
                size="lg" 
                className="text-xl px-12 py-4 bg-brand-orange hover:bg-brand-orange/90 text-white transform scale-125"
                onClick={handleStartFreeTrial}
              >
                {t('demo.cta.startTrial')}
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
                      {t('demo.page.backToHome')}
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
                      {t('demo.simulation.reset')}
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
                        <h3 className="text-xl font-semibold mb-2">{t('demo.simulation.mentalHealth.title')}</h3>
                        <p className="text-gray-600">{t('demo.simulation.mentalHealth.description')}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Demo Information */}
              <div className="lg:col-span-4">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>{t('demo.keyFeaturesShown')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {activeDemo === 'student' && (
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                          {t('demo.simulation.student.description')}
                        </p>
                        <div className="space-y-2">
                          <h4 className="font-semibold">{t('demo.keyFeaturesShown')}:</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>{t('demo.features.student.1')}</li>
                            <li>{t('demo.features.student.2')}</li>
                            <li>{t('demo.features.student.6')}</li>
                            <li>• {t('demo.interactive.student')}</li>
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
                          <h4 className="font-semibold">{t('demo.keyFeaturesShown')}:</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>{t('demo.features.teacher.1')}</li>
                            <li>{t('demo.features.teacher.2')}</li>
                            <li>{t('demo.features.teacher.3')}</li>
                            <li>{t('demo.features.teacher.4')}</li>
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
