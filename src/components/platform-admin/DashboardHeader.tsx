
import { Button } from "@/components/ui/button";
import { SchoolIcon, LogOutIcon, RefreshCwIcon } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";

interface DashboardHeaderProps {
  adminName?: string;
  onRefresh: () => void;
  onLogout: () => void;
}

const DashboardHeader = ({ adminName, onRefresh, onLogout }: DashboardHeaderProps) => {
  const handleRefreshClick = () => {
    console.log('🔄 DashboardHeader: Refresh button clicked!');
    onRefresh();
  };

  return (
    <header className="bg-card/80 backdrop-blur-sm border-b border-border p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <SchoolIcon className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Platform Admin</h1>
          </div>
          <Button 
            onClick={handleRefreshClick} 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
          >
            <RefreshCwIcon className="w-4 h-4" />
            Refresh
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <span className="text-sm text-muted-foreground">Welcome, {adminName}</span>
          <Button
            onClick={onLogout}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOutIcon className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
