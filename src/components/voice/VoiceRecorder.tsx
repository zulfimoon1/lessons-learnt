
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MicIcon, Square, PlayIcon, RotateCcwIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number) => void;
  onRecordingCancel?: () => void;
  maxDuration?: number; // in seconds
  disabled?: boolean;
  className?: string;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  onRecordingCancel,
  maxDuration = 300, // 5 minutes default
  disabled = false,
  className
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedDuration, setRecordedDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playbackIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(audioBlob);
        setRecordedDuration(recordingTime);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      intervalRef.current = window.setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= maxDuration) {
            stopRecording();
          }
          return newTime;
        });
      }, 1000);

    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Unable to access your microphone. Please check your browser settings and try again.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  const playRecording = () => {
    if (!recordedBlob) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audioUrl = URL.createObjectURL(recordedBlob);
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onended = () => {
      setIsPlaying(false);
      setPlaybackTime(0);
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
        playbackIntervalRef.current = null;
      }
    };

    audio.play();
    setIsPlaying(true);
    setPlaybackTime(0);

    playbackIntervalRef.current = window.setInterval(() => {
      if (audio.currentTime) {
        setPlaybackTime(Math.floor(audio.currentTime));
      }
    }, 100);
  };

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setPlaybackTime(0);
    
    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current);
      playbackIntervalRef.current = null;
    }
  };

  const discardRecording = () => {
    setRecordedBlob(null);
    setRecordedDuration(0);
    setPlaybackTime(0);
    stopPlayback();
  };

  const handleComplete = () => {
    if (recordedBlob) {
      onRecordingComplete(recordedBlob, recordedDuration);
    }
  };

  const handleCancel = () => {
    discardRecording();
    setRecordingTime(0);
    onRecordingCancel?.();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={cn("bg-purple-50 border-purple-200", className)}>
      <CardContent className="p-4">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {!recordedBlob ? (
            // Recording State
            <div className="text-center space-y-4">
              {!isRecording ? (
                <div>
                  <p className="text-sm text-purple-700 mb-3">
                    Ready to record your voice message? Press the button and start talking!
                  </p>
                  <Button
                    onClick={startRecording}
                    disabled={disabled}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                    size="lg"
                  >
                    <MicIcon className="w-5 h-5 mr-2" />
                    Start Recording
                  </Button>
                  <p className="text-xs text-purple-600 mt-2">
                    You can record up to {Math.floor(maxDuration / 60)} minutes
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse mr-2"></div>
                    <span className="text-lg font-mono text-purple-800">
                      {formatTime(recordingTime)}
                    </span>
                  </div>
                  <p className="text-sm text-purple-700 mb-3">
                    Recording... Speak clearly into your microphone!
                  </p>
                  <Button
                    onClick={stopRecording}
                    variant="destructive"
                    size="lg"
                  >
                    <Square className="w-5 h-5 mr-2" />
                    Stop Recording
                  </Button>
                  <p className="text-xs text-purple-600 mt-2">
                    Time left: {formatTime(maxDuration - recordingTime)}
                  </p>
                </div>
              )}
            </div>
          ) : (
            // Playback & Actions State
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-purple-700 mb-2">
                  Great! Here's what you recorded ({formatTime(recordedDuration)})
                </p>
                
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Button
                    onClick={isPlaying ? stopPlayback : playRecording}
                    variant="outline"
                    size="sm"
                    className="border-purple-300 text-purple-700"
                  >
                    <PlayIcon className="w-4 h-4 mr-1" />
                    {isPlaying ? `Playing... ${formatTime(playbackTime)}` : 'Listen to My Recording'}
                  </Button>
                  
                  <Button
                    onClick={discardRecording}
                    variant="ghost"
                    size="sm"
                    className="text-purple-600"
                  >
                    <RotateCcwIcon className="w-4 h-4 mr-1" />
                    Record Again
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 justify-center">
                <Button
                  onClick={handleComplete}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Use This Recording
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceRecorder;
