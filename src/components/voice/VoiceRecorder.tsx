
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MicIcon, Square, PlayIcon, PauseIcon, TrashIcon, UploadIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number) => void;
  onRecordingCancel?: () => void;
  className?: string;
  maxDuration?: number; // in seconds
  disabled?: boolean;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  onRecordingCancel,
  className,
  maxDuration = 300, // 5 minutes default
  disabled = false
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    // Check if MediaRecorder is supported
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      setIsSupported(false);
      toast({
        title: "Voice recording not supported",
        description: "Your browser doesn't support voice recording. Please use a modern browser.",
        variant: "destructive"
      });
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setDuration(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration(prev => {
          const newDuration = prev + 1;
          if (newDuration >= maxDuration) {
            stopRecording();
          }
          return newDuration;
        });
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording failed",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        
        timerRef.current = setInterval(() => {
          setDuration(prev => {
            const newDuration = prev + 1;
            if (newDuration >= maxDuration) {
              stopRecording();
            }
            return newDuration;
          });
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    }
  };

  const playRecording = () => {
    if (audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setDuration(0);
    setIsPlaying(false);
    onRecordingCancel?.();
  };

  const submitRecording = () => {
    if (audioBlob) {
      onRecordingComplete(audioBlob, duration);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isSupported) {
    return (
      <Card className={cn("border-yellow-200 bg-yellow-50", className)}>
        <CardContent className="p-4 text-center">
          <p className="text-sm text-yellow-800">
            Voice recording is not supported in your browser. Please type your response instead.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-purple-200 bg-purple-50/50", className)}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Recording Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isRecording && (
                <div className={cn(
                  "w-3 h-3 rounded-full animate-pulse",
                  isPaused ? "bg-yellow-500" : "bg-red-500"
                )} />
              )}
              <span className="text-sm font-medium">
                {isRecording ? (isPaused ? 'Paused' : 'Recording...') : 
                 audioBlob ? 'Recording ready' : 'Ready to record'}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              {formatTime(duration)} / {formatTime(maxDuration)}
            </span>
          </div>

          {/* Visual indicator */}
          {isRecording && !isPaused && (
            <div className="flex justify-center">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 bg-purple-500 rounded animate-pulse"
                    style={{
                      height: `${Math.random() * 30 + 10}px`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex justify-center gap-2">
            {!isRecording && !audioBlob && (
              <Button
                onClick={startRecording}
                disabled={disabled}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <MicIcon className="w-4 h-4 mr-2" />
                Start Recording
              </Button>
            )}

            {isRecording && (
              <>
                <Button
                  onClick={pauseRecording}
                  variant="outline"
                  size="sm"
                >
                  {isPaused ? <PlayIcon className="w-4 h-4" /> : <PauseIcon className="w-4 h-4" />}
                </Button>
                <Button
                  onClick={stopRecording}
                  variant="destructive"
                  size="sm"
                >
                  <Square className="w-4 h-4" />
                </Button>
              </>
            )}

            {audioBlob && (
              <>
                <Button
                  onClick={playRecording}
                  variant="outline"
                  size="sm"
                >
                  {isPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                </Button>
                <Button
                  onClick={deleteRecording}
                  variant="outline"
                  size="sm"
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
                <Button
                  onClick={submitRecording}
                  className="bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  <UploadIcon className="w-4 h-4 mr-2" />
                  Use Recording
                </Button>
              </>
            )}
          </div>

          {/* Hidden audio element for playback */}
          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceRecorder;
