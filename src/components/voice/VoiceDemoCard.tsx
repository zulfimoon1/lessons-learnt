
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MicIcon, PlayIcon, VolumeIcon, AudioWaveformIcon } from "lucide-react";
import AudioPlayer from './AudioPlayer';

interface VoiceDemoCardProps {
  title: string;
  description: string;
  mockAudioUrl?: string;
  mockTranscription?: string;
  variant?: 'student' | 'teacher' | 'doctor' | 'admin';
  className?: string;
}

const VoiceDemoCard: React.FC<VoiceDemoCardProps> = ({
  title,
  description,
  mockAudioUrl,
  mockTranscription = "This is a sample voice message showing how students can easily share their thoughts using voice recording.",
  variant = 'student',
  className
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);

  const getVariantStyles = () => {
    switch (variant) {
      case 'teacher':
        return 'border-brand-orange/20 bg-brand-orange/5';
      case 'doctor':
        return 'border-green-500/20 bg-green-50';
      case 'admin':
        return 'border-purple-500/20 bg-purple-50';
      default:
        return 'border-brand-teal/20 bg-brand-teal/5';
    }
  };

  const getButtonColor = () => {
    switch (variant) {
      case 'teacher':
        return 'bg-brand-orange hover:bg-brand-orange/90';
      case 'doctor':
        return 'bg-green-600 hover:bg-green-700';
      case 'admin':
        return 'bg-purple-600 hover:bg-purple-700';
      default:
        return 'bg-brand-teal hover:bg-brand-dark';
    }
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    // Simulate recording for 2 seconds
    setTimeout(() => {
      setIsRecording(false);
      setShowAudioPlayer(true);
    }, 2000);
  };

  return (
    <Card className={`${getVariantStyles()} ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <MicIcon className="w-4 h-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">{description}</p>
        
        {!showAudioPlayer ? (
          <div className="space-y-3">
            <Button
              onClick={handleStartRecording}
              disabled={isRecording}
              className={`w-full text-white ${getButtonColor()}`}
            >
              {isRecording ? (
                <>
                  <AudioWaveformIcon className="w-4 h-4 mr-2 animate-pulse" />
                  Recording... (Demo)
                </>
              ) : (
                <>
                  <MicIcon className="w-4 h-4 mr-2" />
                  Try Voice Recording
                </>
              )}
            </Button>
            
            {isRecording && (
              <div className="text-center">
                <div className="flex justify-center items-center gap-1 mb-2">
                  <div className="w-2 h-4 bg-red-500 rounded animate-pulse"></div>
                  <div className="w-2 h-6 bg-red-500 rounded animate-pulse delay-100"></div>
                  <div className="w-2 h-3 bg-red-500 rounded animate-pulse delay-200"></div>
                  <div className="w-2 h-5 bg-red-500 rounded animate-pulse delay-300"></div>
                </div>
                <Badge variant="outline" className="text-red-600 border-red-200">
                  🎤 Recording Voice Message
                </Badge>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <AudioPlayer
              audioUrl="/mock-audio-demo.mp3"
              transcription={mockTranscription}
              title="Demo Voice Message"
              showTranscription={true}
              className="bg-white"
            />
            <Button
              variant="outline"
              onClick={() => setShowAudioPlayer(false)}
              className="w-full"
            >
              Try Recording Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VoiceDemoCard;
