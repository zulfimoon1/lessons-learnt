import { Button } from "@/components/ui/button";
import { SchoolIcon, LogOutIcon, RefreshCwIcon } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useState } from "react";

interface DashboardHeaderProps {
  adminName?: string;
  onRefresh: () => void;
  onLogout: () => void;
}

const DashboardHeader = ({ adminName, onRefresh, onLogout }: DashboardHeaderProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshClick = async () => {
    console.log('🔄 Refresh button clicked - starting refresh');
    setIsRefreshing(true);
    
    try {
      await onRefresh();
      console.log('🔄 Refresh completed successfully');
    } catch (error) {
      console.error('🔄 Refresh failed:', error);
    } finally {
      // Keep spinner for at least 1 second for visual feedback
      setTimeout(() => {
        setIsRefreshing(false);
        console.log('🔄 Refresh UI state reset');
      }, 1000);
    }
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
            disabled={isRefreshing}
            className="flex items-center gap-2 bg-green-50 hover:bg-green-100 border-green-200"
          >
            <RefreshCwIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
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
