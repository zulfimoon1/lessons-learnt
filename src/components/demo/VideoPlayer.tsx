import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  language: 'en' | 'lt';
  onVideoEnd?: () => void;
  autoPlay?: boolean;
  className?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  language,
  onVideoEnd,
  autoPlay = true,
  className
}) => {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Video source URLs - these would be replaced with actual hosted video URLs
  const videoSources = {
    en: '/videos/demo-english.mp4', // Replace with actual English video URL
    lt: '/videos/demo-lithuanian.mp4' // Replace with actual Lithuanian video URL
  };

  const currentVideoSrc = videoSources[language];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      setIsLoading(false);
      setDuration(video.duration);
      if (autoPlay) {
        video.play().then(() => {
          setIsPlaying(true);
        }).catch((error) => {
          console.warn('Auto-play failed:', error);
          setError('Auto-play was blocked. Please click play to start the video.');
        });
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setProgress((video.currentTime / video.duration) * 100);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(100);
      onVideoEnd?.();
    };

    const handleError = () => {
      setIsLoading(false);
      setError('Failed to load video. Please try again or contact support.');
    };

    const handleLoadStart = () => {
      setIsLoading(true);
      setError(null);
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    video.addEventListener('loadstart', handleLoadStart);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadstart', handleLoadStart);
    };
  }, [autoPlay, onVideoEnd]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().then(() => {
        setIsPlaying(true);
        setError(null);
      }).catch((error) => {
        console.error('Play failed:', error);
        setError('Failed to play video. Please try again.');
      });
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const progressBar = e.currentTarget;
    if (!video || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progressBarWidth = rect.width;
    const clickProgress = (clickX / progressBarWidth) * 100;
    const newTime = (clickProgress / 100) * duration;

    video.currentTime = newTime;
    setProgress(clickProgress);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!document.fullscreenElement) {
      video.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(console.error);
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(console.error);
    }
  };

  const resetVideo = () => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;
    setProgress(0);
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const downloadVideo = () => {
    const link = document.createElement('a');
    link.href = currentVideoSrc;
    link.download = `lessonslearnt-demo-${language}.mp4`;
    link.click();
  };

  if (error) {
    return (
      <Card className={cn('max-w-4xl mx-auto', className)}>
        <CardContent className="p-8 text-center">
          <div className="text-red-600 mb-4">
            <RotateCcw className="w-12 h-12 mx-auto mb-2" />
            <h3 className="text-lg font-semibold">Video Error</h3>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Refresh Page
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('max-w-4xl mx-auto shadow-xl', className)}>
      <CardContent className="p-0">
        {/* Video Header */}
        <div className="p-4 bg-brand-teal text-white">
          <h3 className="text-xl font-semibold">
            {t('demo.video.title') || 'Platform Demo'} - {language === 'en' ? 'English' : 'Lietuvių kalba'}
          </h3>
          <p className="text-brand-teal-light text-sm mt-1">
            {t('demo.video.subtitle') || 'Comprehensive platform walkthrough'}
          </p>
        </div>

        {/* Video Container */}
        <div className="relative bg-black">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p>{t('demo.video.loading') || 'Loading video...'}</p>
              </div>
            </div>
          )}

          <video
            ref={videoRef}
            src={currentVideoSrc}
            className="w-full aspect-video"
            preload="metadata"
            playsInline
            onLoadStart={() => setIsLoading(true)}
          />

          {/* Video Controls Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            {/* Progress Bar */}
            <div 
              className="w-full h-2 bg-white/30 rounded-full cursor-pointer mb-3 group"
              onClick={handleProgressClick}
            >
              <div 
                className="h-full bg-brand-teal rounded-full transition-all group-hover:bg-brand-orange"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={togglePlay}
                  className="text-white hover:bg-white/20 p-2"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20 p-2"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>

                <span className="text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={resetVideo}
                  className="text-white hover:bg-white/20 p-2"
                  title="Restart video"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={downloadVideo}
                  className="text-white hover:bg-white/20 p-2"
                  title="Download video"
                >
                  <Download className="w-4 h-4" />
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/20 p-2"
                >
                  <Maximize className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Video Footer */}
        <div className="p-4 bg-gray-50 border-t">
          <p className="text-sm text-gray-600 text-center">
            {t('demo.video.footer') || 'This demonstration showcases our complete educational platform features and capabilities.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoPlayer;