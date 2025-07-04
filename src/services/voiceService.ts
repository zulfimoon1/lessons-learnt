import { supabase } from '@/integrations/supabase/client';

export interface VoiceUploadResult {
  audioUrl: string;
  transcription?: string;
  duration: number;
  fileSize: number;
}

export interface TranscriptionResult {
  transcription: string;
  success: boolean;
  error?: string;
}

class VoiceService {
  
  /**
   * Initialize storage bucket if it doesn't exist
   */
  private async ensureBucketExists(): Promise<void> {
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) {
        console.error('VoiceService: Error checking buckets:', error);
        return;
      }

      const bucketExists = buckets?.some(bucket => bucket.id === 'voice-recordings');
      
      if (!bucketExists) {
        console.log('VoiceService: Creating voice-recordings bucket...');
        const { error: createError } = await supabase.storage.createBucket('voice-recordings', {
          public: true,
          allowedMimeTypes: ['audio/webm', 'audio/wav', 'audio/mp3'],
          fileSizeLimit: 10485760 // 10MB
        });
        
        if (createError) {
          console.error('VoiceService: Error creating bucket:', createError);
        } else {
          console.log('VoiceService: Bucket created successfully');
        }
      }
    } catch (error) {
      console.error('VoiceService: Error ensuring bucket exists:', error);
    }
  }

  /**
   * Upload audio file to Supabase storage
   */
  async uploadAudio(audioBlob: Blob, fileName: string): Promise<string> {
    console.log('VoiceService: Uploading audio file:', fileName);
    
    try {
      // Ensure bucket exists
      await this.ensureBucketExists();
      
      const { data, error } = await supabase.storage
        .from('voice-recordings')
        .upload(fileName, audioBlob, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('VoiceService: Upload error:', error);
        throw new Error(`Failed to upload audio: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('voice-recordings')
        .getPublicUrl(data.path);

      console.log('VoiceService: Audio uploaded successfully:', urlData.publicUrl);
      return urlData.publicUrl;
    } catch (error) {
      console.error('VoiceService: Upload failed:', error);
      throw error;
    }
  }

  /**
   * Convert audio blob to a supported format and upload
   */
  async processAndUploadAudio(audioBlob: Blob, prefix: string = 'recording', enableTranscription: boolean = false): Promise<VoiceUploadResult> {
    console.log('VoiceService: Processing audio blob, size:', audioBlob.size);
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileName = `${prefix}_${timestamp}_${randomId}.webm`;

    try {
      // Upload to storage first (fast)
      const audioUrl = await this.uploadAudio(audioBlob, fileName);
      
      // Calculate duration (approximate)
      const duration = await this.calculateAudioDuration(audioBlob);
      
      // Only transcribe if explicitly requested
      let transcription: string | undefined;
      if (enableTranscription) {
        try {
          console.log('VoiceService: Starting transcription...');
          const transcriptionResult = await this.transcribeAudio(audioBlob);
          if (transcriptionResult.success) {
            transcription = transcriptionResult.transcription;
          }
        } catch (transcribeError) {
          console.warn('VoiceService: Transcription failed, continuing without it:', transcribeError);
        }
      } else {
        console.log('VoiceService: Skipping transcription for faster processing');
      }

      return {
        audioUrl,
        transcription,
        duration,
        fileSize: audioBlob.size
      };
    } catch (error) {
      console.error('VoiceService: Failed to process audio:', error);
      throw error;
    }
  }

  /**
   * Calculate audio duration from blob
   */
  private async calculateAudioDuration(audioBlob: Blob): Promise<number> {
    return new Promise((resolve) => {
      const audio = document.createElement('audio');
      const url = URL.createObjectURL(audioBlob);
      
      audio.addEventListener('loadedmetadata', () => {
        URL.revokeObjectURL(url);
        resolve(Math.round(audio.duration));
      });
      
      audio.addEventListener('error', () => {
        URL.revokeObjectURL(url);
        resolve(0); // Fallback to 0 if can't determine duration
      });
      
      audio.src = url;
    });
  }

  /**
   * Transcribe audio using Supabase Edge Function (optional, for when specifically needed)
   */
  async transcribeAudio(audioBlob: Blob): Promise<TranscriptionResult> {
    console.log('VoiceService: Starting transcription...');
    
    try {
      // Convert blob to base64 for transmission
      const audioBuffer = await audioBlob.arrayBuffer();
      const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
      
      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: {
          audio: audioBase64,
          mimeType: audioBlob.type || 'audio/webm'
        }
      });

      if (error) {
        console.error('VoiceService: Transcription error:', error);
        return {
          transcription: '',
          success: false,
          error: error.message
        };
      }

      console.log('VoiceService: Transcription completed:', data);
      return {
        transcription: data.transcription || '',
        success: true
      };
    } catch (error) {
      console.error('VoiceService: Transcription failed:', error);
      return {
        transcription: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Delete audio file from storage
   */
  async deleteAudio(audioUrl: string): Promise<void> {
    try {
      // Extract path from URL
      const urlParts = audioUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      const { error } = await supabase.storage
        .from('voice-recordings')
        .remove([fileName]);

      if (error) {
        console.error('VoiceService: Delete error:', error);
        throw new Error(`Failed to delete audio: ${error.message}`);
      }

      console.log('VoiceService: Audio deleted successfully');
    } catch (error) {
      console.error('VoiceService: Failed to delete audio:', error);
      // Don't throw error for delete failures to avoid blocking user actions
    }
  }

  /**
   * Validate audio blob
   */
  validateAudioBlob(audioBlob: Blob): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB limit
    const minSize = 1024; // 1KB minimum

    if (audioBlob.size > maxSize) {
      return {
        valid: false,
        error: 'Audio file is too large. Maximum size is 10MB.'
      };
    }

    if (audioBlob.size < minSize) {
      return {
        valid: false,
        error: 'Audio file is too small. Please record a longer message.'
      };
    }

    return { valid: true };
  }
}

export const voiceService = new VoiceService();
