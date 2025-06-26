
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlayIcon, PauseIcon, Volume2Icon, VolumeXIcon, RotateCcwIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AudioPlayerProps {
  audioUrl: string;
  transcription?: string;
  duration?: number;
  title?: string;
  showTranscription?: boolean;
  className?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  transcription,
  duration,
  title = "Your Voice Message",
  showTranscription = false,
  className
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration || 0);
  const [isMuted, setIsMuted] = useState(false);
  const [showTranscriptionText, setShowTranscriptionText] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setTotalDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const restart = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = 0;
    setCurrentTime(0);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <Card className={cn("bg-purple-50 border-purple-200", className)}>
      <CardContent className="p-4">
        <audio ref={audioRef} src={audioUrl} preload="metadata" />
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-purple-800">{title}</h4>
            <span className="text-xs text-purple-600">
              {formatTime(currentTime)} / {formatTime(totalDuration)}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-purple-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <Button
              onClick={togglePlay}
              size="sm"
              variant="outline"
              className="flex items-center gap-1 text-purple-700 border-purple-300"
            >
              {isPlaying ? (
                <>
                  <PauseIcon className="w-3 h-3" />
                  Pause
                </>
              ) : (
                <>
                  <PlayIcon className="w-3 h-3" />
                  Play My Recording
                </>
              )}
            </Button>

            <Button
              onClick={restart}
              size="sm"
              variant="ghost"
              className="text-purple-600"
            >
              <RotateCcwIcon className="w-3 h-3" />
            </Button>

            <Button
              onClick={toggleMute}
              size="sm"
              variant="ghost"
              className="text-purple-600"
            >
              {isMuted ? <VolumeXIcon className="w-3 h-3" /> : <Volume2Icon className="w-3 h-3" />}
            </Button>

            {showTranscription && transcription && (
              <Button
                onClick={() => setShowTranscriptionText(!showTranscriptionText)}
                size="sm"
                variant="ghost"
                className="text-purple-600 text-xs"
              >
                {showTranscriptionText ? 'Hide What I Said' : 'Show What I Said'}
              </Button>
            )}
          </div>

          {/* Transcription */}
          {showTranscriptionText && transcription && (
            <div className="mt-3 p-3 bg-white rounded border border-purple-200">
              <p className="text-xs font-medium text-purple-800 mb-1">What I said:</p>
              <p className="text-sm text-gray-700">{transcription}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AudioPlayer;
