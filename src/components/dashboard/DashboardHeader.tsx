
import React from "react";
import { Button } from "@/components/ui/button";
import { SchoolIcon, LogOutIcon } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";

interface DashboardHeaderProps {
  title: string;
  userName: string;
  onLogout: () => void;
  subtitle?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title, userName, onLogout, subtitle }) => {
  const { t } = useLanguage();

  return (
    <header className="bg-card/80 backdrop-blur-sm border-b border-border p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <SchoolIcon className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <span className="text-sm text-muted-foreground">{t('admin.welcome')}, {userName}</span>
          <Button
            onClick={onLogout}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOutIcon className="w-4 h-4" />
            {t('auth.logout')}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
