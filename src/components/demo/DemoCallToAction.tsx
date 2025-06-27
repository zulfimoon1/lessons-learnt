
import React from 'react';
import { 
  Users,
  Calendar,
  MessageSquare,
  Heart,
  Gift
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import OptimizedButton from "@/components/shared/OptimizedButton";
import OptimizedCard from "@/components/shared/OptimizedCard";
import { useMobileOptimization } from "@/hooks/useMobileOptimization";
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
  const { getResponsiveClasses } = useMobileOptimization();

  const titleClasses = getResponsiveClasses({
    mobile: 'text-2xl',
    tablet: 'text-3xl',
    desktop: 'text-4xl'
  });

  const steps = [
    {
      icon: Users,
      title: 'Step 1',
      description: 'School administrator logins and invites teachers and school psychologist'
    },
    {
      icon: Calendar,
      title: 'Step 2', 
      description: 'Teachers can bulk upload class schedules along with any day trips'
    },
    {
      icon: MessageSquare,
      title: 'Step 3',
      description: 'Student leave feedback'
    },
    {
      icon: Heart,
      title: 'Step 4',
      description: 'School psychologist has access to live chat and emotional wellbeing'
    }
  ];

  return (
    <OptimizedCard 
      variant="gradient"
      className="bg-brand-gradient text-white max-w-4xl mx-auto mb-12 shadow-xl"
      size="lg"
    >
      <p className={cn(
        'font-black tracking-wide drop-shadow-lg mb-4 text-center',
        titleClasses.combined
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
        {steps.map((step, index) => (
          <div key={index} className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <step.icon className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">{step.title}</h3>
              <p className={cn('text-white/90', isMobile ? 'text-sm' : 'text-sm')}>
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Enhanced Bonus Points */}
      <OptimizedCard 
        className="bg-gradient-to-r from-brand-orange to-yellow-500 rounded-xl mb-6 shadow-2xl border-2 border-yellow-400/30"
        variant="gradient"
      >
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
      </OptimizedCard>
      
      {/* Register Now Button */}
      <div className="mt-6 text-center">
        <OptimizedButton 
          onClick={onStartFreeTrial}
          className="bg-brand-orange hover:bg-brand-orange/90 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          touchOptimized={isMobile}
          size="lg"
        >
          Start Your Free Trial
        </OptimizedButton>
      </div>
    </OptimizedCard>
  );
};

export default React.memo(DemoCallToAction);
