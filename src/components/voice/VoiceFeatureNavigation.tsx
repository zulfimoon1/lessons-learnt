
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  SparklesIcon, 
  MicIcon, 
  VolumeIcon, 
  TrendingUpIcon, 
  HeartIcon 
} from "lucide-react";
import { useDeviceType } from '@/hooks/use-device';

interface VoiceFeatureNavigationProps {
  selectedFeature: string;
  onFeatureSelect: (feature: string) => void;
  isPlaying: boolean;
  features: Array<{
    id: string;
    title: string;
    shortTitle: string;
    icon: React.ReactNode;
  }>;
}

const VoiceFeatureNavigation: React.FC<VoiceFeatureNavigationProps> = ({
  selectedFeature,
  onFeatureSelect,
  isPlaying,
  features
}) => {
  const deviceType = useDeviceType();
  const isTablet = deviceType === 'tablet';

  return (
    <Card>
      <CardContent className="p-3 md:p-4">
        <div className="space-y-3">
          {/* First Row - Overview and Primary Features */}
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              onClick={() => onFeatureSelect('overview')}
              variant={selectedFeature === 'overview' ? "default" : "outline"}
              className="flex items-center gap-2 text-sm"
              disabled={isPlaying}
              size={isTablet ? "sm" : "default"}
            >
              <SparklesIcon className="w-4 h-4 md:w-5 md:h-5" />
              <span className={`${isTablet ? 'hidden md:inline' : ''}`}>
                {isTablet ? 'Overview' : 'Voice Revolution'}
              </span>
            </Button>
            <Button
              onClick={() => onFeatureSelect('student')}
              variant={selectedFeature === 'student' ? "default" : "outline"}
              className="flex items-center gap-2 text-sm"
              disabled={isPlaying}
              size={isTablet ? "sm" : "default"}
            >
              <MicIcon className="w-4 h-4 md:w-5 md:h-5" />
              <span className={`${isTablet ? 'hidden md:inline' : ''}`}>
                {isTablet ? 'Student' : 'Student Experience'}
              </span>
            </Button>
            <Button
              onClick={() => onFeatureSelect('teacher')}
              variant={selectedFeature === 'teacher' ? "default" : "outline"}
              className="flex items-center gap-2 text-sm"
              disabled={isPlaying}
              size={isTablet ? "sm" : "default"}
            >
              <VolumeIcon className="w-4 h-4 md:w-5 md:h-5" />
              <span className={`${isTablet ? 'hidden md:inline' : ''}`}>
                {isTablet ? 'Teacher' : 'Teacher Tools'}
              </span>
            </Button>
          </div>
          
          {/* Second Row - Analytics and Wellness */}
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              onClick={() => onFeatureSelect('analytics')}
              variant={selectedFeature === 'analytics' ? "default" : "outline"}
              className="flex items-center gap-2 text-sm"
              disabled={isPlaying}
              size={isTablet ? "sm" : "default"}
            >
              <TrendingUpIcon className="w-4 h-4 md:w-5 md:h-5" />
              <span className={`${isTablet ? 'hidden md:inline' : ''}`}>
                {isTablet ? 'Analytics' : 'Voice Analytics'}
              </span>
            </Button>
            <Button
              onClick={() => onFeatureSelect('wellness')}
              variant={selectedFeature === 'wellness' ? "default" : "outline"}
              className="flex items-center gap-2 text-sm"
              disabled={isPlaying}
              size={isTablet ? "sm" : "default"}
            >
              <HeartIcon className="w-4 h-4 md:w-5 md:h-5" />
              <span className={`${isTablet ? 'hidden md:inline' : ''}`}>
                {isTablet ? 'Wellness' : 'Emotional Intelligence'}
              </span>
            </Button>
          </div>
        </div>
        
        {isPlaying && (
          <div className="mt-3 text-center">
            <Badge variant="outline" className="text-brand-teal border-brand-teal animate-pulse">
              Auto-playing demo: {features.find(f => f.id === selectedFeature)?.title}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default React.memo(VoiceFeatureNavigation);
