
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
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
          
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-brand-dark mb-4">
              {t('demo.page.title')}
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t('demo.page.subtitle')}
            </p>
          </div>
        </div>

        <DemoSection />
      </div>
    </div>
  );
};

export default DemoPage;
