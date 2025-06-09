
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpenIcon, 
  GraduationCapIcon, 
  MessageCircleIcon, 
  BarChart3Icon, 
  ShieldCheckIcon,
  UsersIcon,
  HeartHandshakeIcon,
  TrendingUpIcon,
  ChevronRightIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from "lucide-react";
import DemoSection from "@/components/DemoSection";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import ComplianceFooter from "@/components/ComplianceFooter";
import CookieConsent from "@/components/CookieConsent";

const Index = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <CookieConsent />
      
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <BookOpenIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Lesson Lens
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <Button 
              variant="outline"
              onClick={() => navigate("/how-it-works")}
              className="hidden md:flex"
            >
              How It Works
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate("/pricing")}
              className="hidden md:flex"
            >
              Pricing
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge variant="outline" className="mb-6 px-4 py-2">
            <ShieldCheckIcon className="w-4 h-4 mr-2" />
            Secure & GDPR Compliant
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent leading-tight">
            {t('hero.title')}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            {t('hero.subtitle')}
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              onClick={() => navigate("/student-login")}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg"
            >
              <BookOpenIcon className="w-5 h-5 mr-2" />
              {t('hero.studentPortal')}
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              onClick={() => navigate("/teacher-login")}
              variant="outline"
              size="lg"
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg"
            >
              <GraduationCapIcon className="w-5 h-5 mr-2" />
              {t('hero.teacherPortal')}
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center">
              <CheckCircleIcon className="w-4 h-4 mr-2 text-green-600" />
              GDPR Compliant
            </div>
            <div className="flex items-center">
              <ShieldCheckIcon className="w-4 h-4 mr-2 text-blue-600" />
              Secure Authentication
            </div>
            <div className="flex items-center">
              <HeartHandshakeIcon className="w-4 h-4 mr-2 text-purple-600" />
              Mental Health Support
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">{t('features.title')}</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive tools for modern education with built-in security and compliance
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="hover:shadow-lg transition-shadow border-0 bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <MessageCircleIcon className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-xl">{t('features.feedback.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                {t('features.feedback.description')}
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-0 bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3Icon className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle className="text-xl">{t('features.analytics.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                {t('features.analytics.description')}
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-0 bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <HeartHandshakeIcon className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-xl">{t('features.wellness.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                {t('features.wellness.description')}
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-0 bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <UsersIcon className="w-6 h-6 text-teal-600" />
              </div>
              <CardTitle className="text-xl">{t('features.collaboration.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                {t('features.collaboration.description')}
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-0 bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUpIcon className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle className="text-xl">{t('features.growth.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                {t('features.growth.description')}
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-0 bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <ShieldCheckIcon className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-xl">Secure & Compliant</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Enterprise-grade security with GDPR compliance and secure authentication built-in
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Demo Section */}
      <DemoSection />

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">{t('cta.title')}</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            {t('cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate("/student-login")}
              size="lg"
              variant="secondary"
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              <BookOpenIcon className="w-5 h-5 mr-2" />
              {t('cta.getStarted')}
              <ChevronRightIcon className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              onClick={() => navigate("/pricing")}
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              {t('cta.learnMore')}
            </Button>
          </div>
        </div>
      </section>

      <ComplianceFooter />
    </div>
  );
};

export default Index;
