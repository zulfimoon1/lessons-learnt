
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlayIcon, PauseIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface DemoFeature {
  id: string;
  titleKey: string;
  descriptionKey: string;
  userType: "student" | "teacher" | "psychologist";
  icon: any;
  voiceoverKey: string;
  mockupComponent: React.ReactNode;
}

interface DemoVideoAreaProps {
  currentDemo: DemoFeature;
  isPlaying: boolean;
  currentUtterance: any;
  isReady: boolean;
  hasUserInteracted: boolean;
  onPlayPause: () => void;
}

const DemoVideoArea: React.FC<DemoVideoAreaProps> = ({
  currentDemo,
  isPlaying,
  currentUtterance,
  isReady,
  hasUserInteracted,
  onPlayPause
}) => {
  const { t } = useLanguage();

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case "student": return "bg-blue-100 text-blue-700 border-blue-200";
      case "teacher": return "bg-green-100 text-green-700 border-green-200";
      case "psychologist": return "bg-purple-100 text-purple-700 border-purple-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <>
      <Card className="overflow-hidden border-2 border-primary/20">
        <CardContent className="p-0">
          <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 aspect-video p-6 flex items-center justify-center">
            <div className="w-full max-w-md">
              {currentDemo.mockupComponent}
            </div>
            
            <div className="absolute top-4 right-4">
              <Badge className={getUserTypeColor(currentDemo.userType)}>
                {t(`demo.userType.${currentDemo.userType}`)}
              </Badge>
            </div>

            <div className="absolute bottom-4 left-4">
              <Button
                onClick={onPlayPause}
                size="sm"
                className={`${
                  isPlaying 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-primary/90 hover:bg-primary'
                }`}
                disabled={!currentUtterance && !isReady}
              >
                {isPlaying ? (
                  <PauseIcon className="w-4 h-4" />
                ) : (
                  <PlayIcon className="w-4 h-4" />
                )}
              </Button>
            </div>

            {!hasUserInteracted && (
              <div className="absolute bottom-4 right-4 bg-yellow-100 border border-yellow-300 rounded-lg px-3 py-1">
                <span className="text-xs text-yellow-800">Click play for audio</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4 border border-purple-200 bg-purple-50/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-purple-600 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-sm font-medium text-purple-700">
              {isPlaying ? t('demo.liveVoiceover') : 'Click play to hear voiceover'}
            </span>
            {currentUtterance && !isPlaying && (
              <Button
                onClick={onPlayPause}
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-xs"
              >
                <PlayIcon className="w-3 h-3 mr-1" />
                Play
              </Button>
            )}
          </div>
          <p className="text-sm text-purple-600 italic">
            "{t(currentDemo.voiceoverKey)}"
          </p>
          {!hasUserInteracted && (
            <p className="text-xs text-purple-500 mt-2">
              🔊 Audio requires user interaction. Click the play button to enable sound.
            </p>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default DemoVideoArea;
