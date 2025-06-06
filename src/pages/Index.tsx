
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HeartIcon, BookOpenIcon, TrendingUpIcon, UserIcon, GraduationCapIcon, ShieldIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const Index = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <GraduationCapIcon className="w-8 h-8 text-purple-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('app.title')}</h1>
              <p className="text-sm text-gray-600">{t('app.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <div className="flex gap-2">
              <Button
                onClick={() => navigate('/student-login')}
                variant="outline"
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <UserIcon className="w-4 h-4 mr-2" />
                {t('student.login')}
              </Button>
              <Button
                onClick={() => navigate('/teacher-login')}
                variant="outline"
                className="border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                <GraduationCapIcon className="w-4 h-4 mr-2" />
                {t('teacher.login')}
              </Button>
              <Button
                onClick={() => navigate('/admin-login')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <ShieldIcon className="w-4 h-4 mr-2" />
                Admin Login
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t('home.welcome')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            {t('home.description')}
          </p>
          <Button
            onClick={() => navigate('/student-login')}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8 py-3"
          >
            {t('home.giveFeedback')}
          </Button>
          <p className="text-sm text-gray-500 mt-4">
            {t('home.anonymousNotice')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="bg-white/60 backdrop-blur-sm border-blue-100 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <BookOpenIcon className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-blue-900">{t('feature.understanding.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                {t('feature.understanding.description')}
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-purple-100 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUpIcon className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle className="text-purple-900">{t('feature.engagement.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                {t('feature.engagement.description')}
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-pink-100 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <HeartIcon className="w-6 h-6 text-pink-600" />
              </div>
              <CardTitle className="text-pink-900">{t('feature.emotional.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                {t('feature.emotional.description')}
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-white/60 backdrop-blur-sm rounded-xl p-8 border border-blue-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h3>
          <p className="text-gray-600 mb-6">
            Join thousands of students and teachers improving education together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/student-login')}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <UserIcon className="w-5 h-5 mr-2" />
              Student Portal
            </Button>
            <Button
              onClick={() => navigate('/teacher-login')}
              size="lg"
              variant="outline"
              className="border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              <GraduationCapIcon className="w-5 h-5 mr-2" />
              Teacher Portal
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
