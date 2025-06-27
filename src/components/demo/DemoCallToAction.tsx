import React from 'react';
import { Badge } from "@/components/ui/badge";
import { 
  Users,
  Calendar,
  MessageSquare,
  Heart,
  Gift
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import MobileOptimizedButton from "@/components/mobile/MobileOptimizedButton";
import { cn } from "@/lib/utils";

interface DemoCallToActionProps {
  isMobile: boolean;
  onStartFreeTrial: () => void;
}

const DemoCallToAction: React.FC<DemoCallToActionProps> = ({ 
  isMobile, 
  onStartFreeTrial 
}) => {
  const { t } = useLanguage();

  return (
    <div className="bg-brand-gradient text-white rounded-lg p-8 max-w-4xl mx-auto mb-12 shadow-xl">
      <p className={cn(
        'font-black tracking-wide drop-shadow-lg mb-4 text-center',
        isMobile ? 'text-2xl' : 'text-4xl'
      )}>
        Real User Experience
      </p>
      <p className={cn(
        'font-bold opacity-95 drop-shadow-md mb-8 text-center',
        isMobile ? 'text-lg' : 'text-xl'
      )}>
        Sign up and test all features with authentic workflows
      </p>
      
      {/* Step Overview - Grid Layout */}
      <div className={cn(
        'gap-6 mb-8',
        isMobile ? 'grid grid-cols-1 gap-4' : 'grid grid-cols-1 md:grid-cols-2 gap-6'
      )}>
        {/* Step 1 */}
        <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white mb-1">Step 1</h3>
            <p className={cn(
              'text-white/90',
              isMobile ? 'text-sm' : 'text-sm'
            )}>School administrator logins and invites teachers and school psychologist</p>
          </div>
        </div>
        
        {/* Step 2 */}
        <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white mb-1">Step 2</h3>
            <p className={cn(
              'text-white/90',
              isMobile ? 'text-sm' : 'text-sm'
            )}>Teachers can bulk upload class schedules along with any day trips</p>
          </div>
        </div>
        
        {/* Step 3 */}
        <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white mb-1">Step 3</h3>
            <p className={cn(
              'text-white/90',
              isMobile ? 'text-sm' : 'text-sm'
            )}>Student leave feedback</p>
          </div>
        </div>
        
        {/* Step 4 */}
        <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Heart className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white mb-1">Step 4</h3>
            <p className={cn(
              'text-white/90',
              isMobile ? 'text-sm' : 'text-sm'
            )}>School psychologist has access to live chat and emotional wellbeing</p>
          </div>
        </div>
      </div>
      
      {/* Enhanced Bonus Points */}
      <div className="bg-gradient-to-r from-brand-orange to-yellow-500 rounded-xl p-6 mb-6 shadow-2xl border-2 border-yellow-400/30">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
            <Gift className="w-6 h-6 text-brand-orange" />
          </div>
          <div>
            <h3 className={cn(
              'font-bold text-white mb-2 drop-shadow-lg',
              isMobile ? 'text-xl' : 'text-2xl'
            )}>✨ Bonus Points</h3>
            <p className={cn(
              'text-white/95 font-medium drop-shadow-md',
              isMobile ? 'text-base' : 'text-lg'
            )}>
              Pause subscriptions during holidays?<br />
              Pay only when you're actually educating minds
            </p>
          </div>
        </div>
      </div>
      
      {/* Register Now Button */}
      <div className="mt-6 text-center">
        <MobileOptimizedButton 
          onClick={onStartFreeTrial}
          className="bg-brand-orange hover:bg-brand-orange/90 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          touchOptimized={true}
        >
          Start Your Free Trial
        </MobileOptimizedButton>
      </div>
    </div>
  );
};

export default DemoCallToAction;
