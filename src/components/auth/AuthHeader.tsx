
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const AuthHeader: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleBackToHome = () => {
    navigate("/");
  };

  return (
    <>
      <div className="absolute top-4 left-4">
        <Button
          variant="outline"
          onClick={handleBackToHome}
          className="flex items-center gap-2"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          {t('auth.backToHome') || 'Back to Home'}
        </Button>
      </div>
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
    </>
  );
};

export default AuthHeader;
