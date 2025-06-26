
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MicIcon, KeyboardIcon } from 'lucide-react';
import { VoiceRecorder } from './VoiceRecorder';
import { voiceService } from '@/services/voiceService';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface VoiceInputToggleProps {
  onVoiceComplete: (audioUrl: string, transcription?: string, duration?: number) => void;
  onTextMode: () => void;
  disabled?: boolean;
  className?: string;
  showTextMode?: boolean;
}

export const VoiceInputToggle: React.FC<VoiceInputToggleProps> = ({
  onVoiceComplete,
  onTextMode,
  disabled = false,
  className,
  showTextMode = true
}) => {
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleVoiceRecordingComplete = async (audioBlob: Blob, duration: number) => {
    console.log('VoiceInputToggle: Processing voice recording...');
    setIsProcessing(true);

    try {
      // Validate audio
      const validation = voiceService.validateAudioBlob(audioBlob);
      if (!validation.valid) {
        toast({
          title: "Oops! Something went wrong with your recording",
          description: validation.error,
          variant: "destructive"
        });
        return;
      }

      console.log('VoiceInputToggle: Audio validation passed, uploading...');
      
      // Upload audio quickly without transcription for now
      const result = await voiceService.processAndUploadAudio(audioBlob, 'feedback', false);
      
      console.log('VoiceInputToggle: Voice processing completed:', result);
      
      toast({
        title: "Got it! Your voice message is saved",
        description: "We've recorded what you said successfully.",
      });

      onVoiceComplete(result.audioUrl, result.transcription, result.duration);
      setInputMode('text'); // Switch back to text mode after recording
      
    } catch (error) {
      console.error('VoiceInputToggle: Error processing voice:', error);
      
      let errorMessage = "Something went wrong with your recording. Want to try again?";
      if (error instanceof Error) {
        if (error.message.includes('storage')) {
          errorMessage = "Having trouble saving your recording. Let's try again in a moment.";
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = "Check your internet connection and try recording again.";
        }
      }
      
      toast({
        title: "Recording didn't work",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoiceRecordingCancel = () => {
    console.log('VoiceInputToggle: Voice recording cancelled');
    setInputMode('text');
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Mode Toggle Buttons */}
      <div className="flex gap-2 justify-center">
        {showTextMode && (
          <Button
            onClick={() => {
              setInputMode('text');
              onTextMode();
            }}
            variant={inputMode === 'text' ? 'default' : 'outline'}
            size="sm"
            disabled={disabled || isProcessing}
          >
            <KeyboardIcon className="w-4 h-4 mr-2" />
            Type My Answer
          </Button>
        )}
        
        <Button
          onClick={() => setInputMode('voice')}
          variant={inputMode === 'voice' ? 'default' : 'outline'}
          size="sm"
          disabled={disabled || isProcessing}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <MicIcon className="w-4 h-4 mr-2" />
          Record My Voice
        </Button>
      </div>

      {/* Voice Recorder */}
      {inputMode === 'voice' && (
        <VoiceRecorder
          onRecordingComplete={handleVoiceRecordingComplete}
          onRecordingCancel={handleVoiceRecordingCancel}
          disabled={disabled || isProcessing}
          maxDuration={300} // 5 minutes
        />
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="text-center py-2">
          <div className="inline-flex items-center gap-2 text-sm text-purple-600">
            <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
            Saving what you said...
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceInputToggle;
