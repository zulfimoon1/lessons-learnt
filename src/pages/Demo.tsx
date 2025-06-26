
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
  Gift
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import StudentSimulation from "@/components/StudentSimulation";
import TeacherSimulation from "@/components/TeacherSimulation";
import AdminSimulation from "@/components/AdminSimulation";
import DoctorSimulation from "@/components/DoctorSimulation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ComplianceFooter from "@/components/ComplianceFooter";

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-teal/5 via-white to-brand-orange/5">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={handleBackToHome}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('navigation.backToHome') || 'Back to Home'}
              </Button>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-brand-teal" />
                <h1 className="text-xl font-semibold text-gray-900">
                  {t('demo.page.title') || 'Interactive Demo'}
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
                {t('demo.page.pauseDemo') || 'Pause Demo'}
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
            {t('demo.page.title') || 'Interactive Demo'}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('demo.page.subtitle') || 'Experience our platform with interactive demonstrations showcasing modern design and comprehensive features'}
          </p>
        </div>

        {/* Step Overview Section */}
        <div className="bg-brand-gradient text-white rounded-lg p-8 max-w-4xl mx-auto mb-12 shadow-xl">
          <p className="text-4xl font-black tracking-wide drop-shadow-lg mb-4 text-center">
            Real User Experience
          </p>
          <p className="text-xl font-bold opacity-95 drop-shadow-md mb-8 text-center">
            Sign up and test all features with authentic workflows
          </p>
          
          {/* Step Overview - Alternating Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                  Pause subscriptions during holidays? Pay only when you're actually educating minds
                </p>
              </div>
            </div>
          </div>
          
          {/* Register Now Button */}
          <div className="mt-6 text-center">
            <Button 
              onClick={handleStartFreeTrial}
              className="bg-brand-orange hover:bg-brand-orange/90 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Start Your Free Trial
            </Button>
          </div>
        </div>

        {!activeDemo ? (
          <>
            {/* Demo Selection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {/* Student Experience */}
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-brand-teal relative bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-brand-teal/10 rounded-lg flex items-center justify-center">
                      <GraduationCap className="h-6 w-6 text-brand-teal" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{t('demo.simulation.student.title') || 'Student Experience'}</CardTitle>
                      <Badge className="bg-brand-teal/10 text-brand-teal border-brand-teal/20">
                        {t('demo.userType.student') || 'Student'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    {t('demo.simulation.student.description') || 'Experience the platform from a student\'s perspective'}
                  </CardDescription>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p>• Complete student dashboard with modern design</p>
                    <p>• Interactive feedback forms with real-time updates</p>
                    <p>• Wellness tracking and support features</p>
                    <p>• Progress monitoring and achievements</p>
                  </div>
                  <Button 
                    onClick={() => handleDemoSelect('student')}
                    className="w-full bg-brand-teal hover:bg-brand-dark text-white"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Try Student Experience
                  </Button>
                </CardContent>
              </Card>

              {/* Teacher Experience */}
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-brand-orange relative bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-brand-orange/10 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-brand-orange" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{t('demo.simulation.teacher.title') || 'Teacher Experience'}</CardTitle>
                      <Badge className="bg-brand-orange/10 text-brand-orange border-brand-orange/20">
                        {t('demo.userType.teacher') || 'Teacher'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    {t('demo.simulation.teacher.description') || 'Explore comprehensive teaching tools and analytics'}
                  </CardDescription>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p>• Advanced analytics dashboard with insights</p>
                    <p>• Real-time student feedback monitoring</p>
                    <p>• Performance tracking and trends</p>
                    <p>• Student wellness alerts and support</p>
                  </div>
                  <Button 
                    onClick={() => handleDemoSelect('teacher')}
                    className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Try Teacher Experience
                  </Button>
                </CardContent>
              </Card>

              {/* School Administrator Experience */}
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-purple-500 relative bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Settings className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">School Administrator</CardTitle>
                      <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                        Administrator
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    Comprehensive school management and oversight tools
                  </CardDescription>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p>• School-wide performance analytics</p>
                    <p>• Teacher management and invitations</p>
                    <p>• System configuration and settings</p>
                    <p>• Compliance monitoring and reporting</p>
                  </div>
                  <Button 
                    onClick={() => handleDemoSelect('admin')}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Try Administrator Tools
                  </Button>
                </CardContent>
              </Card>

              {/* Doctor Experience */}
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-green-500 relative bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Heart className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Doctor Experience</CardTitle>
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        Medical Professional
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    Specialized medical support and mental health tools
                  </CardDescription>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p>• Mental health alert monitoring</p>
                    <p>• Secure live chat with students</p>
                    <p>• Wellness tracking and reports</p>
                    <p>• HIPAA-compliant data handling</p>
                  </div>
                  <Button 
                    onClick={() => handleDemoSelect('doctor')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Try Medical Tools
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Key Features */}
            <div className="mt-16 bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
              <h3 className="text-2xl font-bold text-center mb-8">Modern Design Meets Powerful Functionality</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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

            {/* Call to Action */}
            <div className="mt-16 bg-gradient-to-r from-brand-teal to-brand-orange text-white rounded-2xl p-8 text-center shadow-xl">
              <h3 className="text-3xl font-bold mb-4">Ready to Transform Your School?</h3>
              <p className="text-xl mb-6 opacity-90">Experience the future of educational technology with our comprehensive platform.</p>
              <Button 
                size="lg" 
                className="text-xl px-12 py-4 bg-brand-orange hover:bg-brand-orange/90 text-white transform hover:scale-105 transition-all shadow-lg"
                onClick={handleStartFreeTrial}
              >
                {t('pricing.startFreeTrial') || 'Start Free Trial'}
              </Button>
            </div>
          </>
        ) : (
          /* Active Demo Display */
          <div className="space-y-6">
            {/* Demo Controls */}
            <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
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
                      {activeDemo === 'student' && (t('demo.simulation.student.title') || 'Student Experience')}
                      {activeDemo === 'teacher' && (t('demo.simulation.teacher.title') || 'Teacher Experience')}
                      {activeDemo === 'admin' && 'School Administrator Experience'}
                      {activeDemo === 'doctor' && 'Doctor Experience'}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handlePlayPause}
                      className="flex items-center gap-2 bg-brand-teal hover:bg-brand-dark text-white"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      {isPlaying ? (t('demo.page.pauseDemo') || 'Pause Demo') : (t('demo.page.playDemo') || 'Play Demo')}
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
                <Card className="h-full bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
                  <CardContent className="p-6">
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
                  </CardContent>
                </Card>
              </div>

              {/* Demo Information */}
              <div className="lg:col-span-4">
                <Card className="h-full bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
                  <CardHeader>
                    <CardTitle>Demo Information</CardTitle>
                  </CardHeader>
                  <CardContent>
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
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Add Compliance Footer */}
      <ComplianceFooter />
    </div>
  );
};

export default Demo;
