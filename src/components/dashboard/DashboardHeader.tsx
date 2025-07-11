
import React from "react";
import { Button } from "@/components/ui/button";
import { SchoolIcon, LogOut, Menu } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import SupportButton from "@/components/support/SupportButton";

interface DashboardHeaderProps {
  title: string;
  userName: string;
  userEmail?: string;
  userRole?: string;
  userSchool?: string;
  onLogout: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  title, 
  userName, 
  userEmail = "user@example.com",
  userRole = "teacher",
  userSchool = "Example School",
  onLogout 
}) => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();

  return (
    <header className="bg-card/80 backdrop-blur-sm border-b border-border p-3 md:p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2 md:gap-4">
          <SchoolIcon className="w-6 h-6 md:w-8 md:h-8 text-primary" />
          <h1 className={`font-bold text-foreground ${isMobile ? 'text-lg' : 'text-2xl'}`}>
            {isMobile ? 'Dashboard' : title}
          </h1>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <LanguageSwitcher />
          {!isMobile && (
            <span className="text-sm text-muted-foreground hidden sm:block">
              {t('admin.welcome') || 'Welcome'}, {userName}
            </span>
          )}
          <SupportButton
            userEmail={userEmail}
            userName={userName}
            userRole={userRole}
            userSchool={userSchool}
            variant="ghost"
            size={isMobile ? "sm" : "default"}
            showText={!isMobile}
          />
          <Button
            onClick={onLogout}
            variant="outline"
            size={isMobile ? "sm" : "default"}
            className="flex items-center gap-1 md:gap-2"
            type="button"
          >
            <LogOut className="w-3 h-3 md:w-4 md:h-4" />
            {!isMobile && (t('auth.logout') || 'Logout')}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
