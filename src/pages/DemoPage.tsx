
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftIcon, PlayIcon, BookOpenIcon, UserIcon, BarChart3Icon, HeartIcon, ShieldCheckIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import DemoSection from "@/components/DemoSection";

const DemoPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            {t('demo.page.backToHome')}
          </Button>
          
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-brand-dark mb-6">
              {t('demo.page.title')}
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8">
              {t('demo.page.subtitle')}
            </p>
            
            {/* Key Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="bg-white rounded-lg p-6 shadow-md border border-brand-teal/20">
                <div className="w-12 h-12 bg-brand-teal/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <UserIcon className="w-6 h-6 text-brand-teal" />
                </div>
                <h3 className="font-semibold text-brand-dark mb-2">{t('demo.userType.student')}</h3>
                <p className="text-sm text-gray-600">{t('demo.studentFeedback.description')}</p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-md border border-brand-orange/20">
                <div className="w-12 h-12 bg-brand-orange/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BookOpenIcon className="w-6 h-6 text-brand-orange" />
                </div>
                <h3 className="font-semibold text-brand-dark mb-2">{t('demo.userType.teacher')}</h3>
                <p className="text-sm text-gray-600">{t('demo.teacherAnalytics.description')}</p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-md border border-purple-200">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <HeartIcon className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-brand-dark mb-2">{t('demo.userType.psychologist')}</h3>
                <p className="text-sm text-gray-600">{t('demo.mentalHealthSupport.description')}</p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-md border border-green-200">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BarChart3Icon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-brand-dark mb-2">{t('demo.stats.features')}</h3>
                <p className="text-sm text-gray-600">{t('demo.classManagement.description')}</p>
              </div>
            </div>
            
            {/* Interactive Demo CTA */}
            <div className="bg-brand-gradient text-white rounded-xl p-8 max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-4">{t('demo.page.interactivePlatformDemo')}</h2>
              <p className="text-lg mb-6 opacity-90">
                {t('demo.interactive.student')}
              </p>
              <Button 
                onClick={() => window.open('/demo', '_blank')}
                className="bg-white text-brand-dark hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
              >
                <PlayIcon className="w-5 h-5 mr-2" />
                {t('demo.page.playDemo')}
              </Button>
            </div>
          </div>
        </div>

        <DemoSection />
      </div>
    </div>
  );
};

export default DemoPage;
