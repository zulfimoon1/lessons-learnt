
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
            
            {/* Interactive Experience Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-gray-800 rounded-lg p-8 text-white relative overflow-hidden">
                <div className="absolute top-4 left-4">
                  <div className="w-10 h-10 bg-brand-teal rounded-lg flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge className="bg-brand-teal text-white">Student</Badge>
                </div>
                <div className="mt-16 mb-8">
                  <Button className="w-full bg-brand-teal hover:bg-brand-teal/90 text-white">
                    <PlayIcon className="w-4 h-4 mr-2" />
                    Try Student Experience
                  </Button>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-8 text-white relative overflow-hidden">
                <div className="absolute top-4 left-4">
                  <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                    <BookOpenIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge className="bg-gray-600 text-white">Teacher</Badge>
                </div>
                <div className="mt-16 mb-8">
                  <Button className="w-full bg-brand-teal hover:bg-brand-teal/90 text-white">
                    <PlayIcon className="w-4 h-4 mr-2" />
                    Try Teacher Experience
                  </Button>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-8 text-white relative overflow-hidden">
                <div className="absolute top-4 left-4">
                  <div className="w-10 h-10 bg-brand-orange rounded-lg flex items-center justify-center">
                    <HeartIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge className="bg-brand-orange text-white">Psychologist</Badge>
                </div>
                <div className="mt-16 mb-8">
                  <Button className="w-full bg-brand-teal hover:bg-brand-teal/90 text-white">
                    <PlayIcon className="w-4 h-4 mr-2" />
                    Try Mental Health Tools
                  </Button>
                </div>
              </div>
            </div>

            {/* Real User Experience Section */}
            <div className="bg-white rounded-xl p-8 shadow-lg mb-12">
              <h2 className="text-3xl font-bold text-brand-dark mb-4">
                {t('demo.discoverFuture')}
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                {t('demo.discoverDescription')}
              </p>
              
              <div className="bg-brand-gradient text-white rounded-xl p-8 max-w-md mx-auto">
                <h3 className="text-2xl font-bold mb-4">
                  {t('demo.realUserExperience')}
                </h3>
                <p className="text-lg mb-6 opacity-90">
                  {t('demo.signUpTestFeatures')}
                </p>
                <Button 
                  onClick={() => navigate('/teacher-login')}
                  className="bg-white text-brand-dark hover:bg-gray-100 px-8 py-3 text-lg font-semibold w-full"
                >
                  {t('demo.experienceCompletePlatform')}
                </Button>
              </div>
            </div>

            {/* Experience the Complete Platform */}
            <div className="bg-white rounded-xl p-8 shadow-lg mb-16">
              <h2 className="text-3xl font-bold text-brand-dark mb-8">
                Experience the Complete Platform
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-brand-teal rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheckIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-brand-dark mb-2">
                    {t('demo.realAuthentication')}
                  </h3>
                  <p className="text-gray-600">
                    {t('demo.realAuthDescription')}
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-brand-orange rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-brand-dark mb-2">
                    {t('demo.completeWorkflows')}
                  </h3>
                  <p className="text-gray-600">
                    {t('demo.completeWorkflowsDescription')}
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HeartIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-brand-dark mb-2">
                    {t('demo.actualIntegration')}
                  </h3>
                  <p className="text-gray-600">
                    {t('demo.actualIntegrationDescription')}
                  </p>
                </div>
              </div>

              <div className="mt-12 text-center">
                <h3 className="text-2xl font-bold text-brand-dark mb-4">
                  {t('demo.readyToExperience')}
                </h3>
                <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                  {t('demo.signUpNowTest')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={() => navigate('/teacher-login')}
                    className="bg-brand-orange hover:bg-brand-orange/90 text-white px-8 py-3 text-lg font-semibold"
                  >
                    Teacher Registration
                  </Button>
                  <Button 
                    onClick={() => navigate('/student-login')}
                    className="bg-brand-teal hover:bg-brand-teal/90 text-white px-8 py-3 text-lg font-semibold"
                  >
                    {t('demo.cta.studentAccess')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DemoSection />
      </div>
    </div>
  );
};

export default DemoPage;
