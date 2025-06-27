
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useDeviceType } from '@/hooks/use-device';
import { useMobileOptimization } from '@/hooks/useMobileOptimization';
import { MicIcon, GraduationCapIcon, VolumeIcon, TrendingUpIcon, HeartIcon } from 'lucide-react';

// Import focused feature components
import VoiceOverview from './features/VoiceOverview';
import VoiceStudentExperience from './features/VoiceStudentExperience';
import VoiceTeacherTools from './features/VoiceTeacherTools';
import VoiceAnalytics from './features/VoiceAnalytics';
import VoiceWellness from './features/VoiceWellness';
import VoiceFeatureNavigation from './VoiceFeatureNavigation';
import OptimizedCard from '../shared/OptimizedCard';

interface VoiceFeatureShowcaseProps {
  isPlaying?: boolean;
}

const VoiceFeatureShowcase: React.FC<VoiceFeatureShowcaseProps> = ({ 
  isPlaying = false 
}) => {
  const [selectedFeature, setSelectedFeature] = useState<string>('overview');
  const { isMobile } = useMobileOptimization();

  const features = [
    { id: 'overview', title: 'Voice Revolution', shortTitle: 'Overview', icon: <MicIcon className="w-4 h-4" /> },
    { id: 'student', title: 'Student Experience', shortTitle: 'Student', icon: <GraduationCapIcon className="w-4 h-4" /> },
    { id: 'teacher', title: 'Teacher Tools', shortTitle: 'Teacher', icon: <VolumeIcon className="w-4 h-4" /> },
    { id: 'analytics', title: 'Voice Analytics', shortTitle: 'Analytics', icon: <TrendingUpIcon className="w-4 h-4" /> },
    { id: 'wellness', title: 'Emotional Intelligence', shortTitle: 'Wellness', icon: <HeartIcon className="w-4 h-4" /> }
  ];

  // Auto-play through features when isPlaying is true
  useEffect(() => {
    if (!isPlaying) return;

    const featureIds = features.map(f => f.id);
    let currentIndex = featureIds.indexOf(selectedFeature);
    
    if (currentIndex === -1) {
      currentIndex = 0;
      setSelectedFeature('overview');
    }

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % featureIds.length;
      setSelectedFeature(featureIds[currentIndex]);
    }, 4000);

    return () => clearInterval(interval);
  }, [isPlaying, selectedFeature]);

  const renderFeatureContent = () => {
    switch (selectedFeature) {
      case 'overview': return <VoiceOverview />;
      case 'student': return <VoiceStudentExperience />;
      case 'teacher': return <VoiceTeacherTools />;
      case 'analytics': return <VoiceAnalytics />;
      case 'wellness': return <VoiceWellness />;
      default: return <VoiceOverview />;
    }
  };

  if (isMobile) {
    return (
      <div className="space-y-4">
        <Tabs value={selectedFeature} onValueChange={setSelectedFeature} className="w-full">
          <OptimizedCard>
            <TabsList className="grid w-full grid-cols-5 h-auto p-1">
              {features.map((feature) => (
                <TabsTrigger
                  key={feature.id}
                  value={feature.id}
                  className="flex flex-col items-center gap-1 p-2 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  disabled={isPlaying}
                >
                  {feature.icon}
                  <span className="hidden xs:inline">{feature.shortTitle}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            {isPlaying && (
              <div className="mt-2 text-center">
                <Badge variant="outline" className="text-brand-teal border-brand-teal animate-pulse text-xs">
                  Auto-playing: {features.find(f => f.id === selectedFeature)?.shortTitle}
                </Badge>
              </div>
            )}
          </OptimizedCard>

          {features.map((feature) => (
            <TabsContent key={feature.id} value={feature.id} className="mt-4">
              {renderFeatureContent()}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    );
  }

  // Desktop and tablet view
  return (
    <div className="space-y-4 md:space-y-6">
      <VoiceFeatureNavigation
        selectedFeature={selectedFeature}
        onFeatureSelect={setSelectedFeature}
        isPlaying={isPlaying}
        features={features}
      />
      {renderFeatureContent()}
    </div>
  );
};

export default React.memo(VoiceFeatureShowcase);
