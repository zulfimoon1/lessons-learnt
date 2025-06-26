
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
          title: "Invalid recording",
          description: validation.error,
          variant: "destructive"
        });
        return;
      }

      // Upload and process audio
      const result = await voiceService.processAndUploadAudio(audioBlob, 'feedback');
      
      console.log('VoiceInputToggle: Voice processing completed:', result);
      
      toast({
        title: "Voice recording saved",
        description: result.transcription 
          ? "Your voice note has been recorded and transcribed."
          : "Your voice note has been recorded. Transcription is processing.",
      });

      onVoiceComplete(result.audioUrl, result.transcription, result.duration);
      setInputMode('text'); // Switch back to text mode after recording
      
    } catch (error) {
      console.error('VoiceInputToggle: Error processing voice:', error);
      toast({
        title: "Recording failed",
        description: "Failed to process your voice recording. Please try again.",
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
            Type Response
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
          Voice Note
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
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 text-sm text-purple-600">
            <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
            Processing your voice note...
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceInputToggle;
