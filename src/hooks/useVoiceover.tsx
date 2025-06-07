
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

export const useVoiceover = () => {
  const { toast } = useToast();
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  const playVoiceover = (text: string, autoplay: boolean = false) => {
    console.log('playVoiceover called with text:', text.substring(0, 50) + '...', 'autoplay:', autoplay);
    
    if (!('speechSynthesis' in window)) {
      console.warn('Text-to-Speech not supported in this browser');
      toast({
        title: "Audio not supported",
        description: "Your browser doesn't support text-to-speech",
        variant: "destructive"
      });
      return null;
    }

    // Cancel any existing speech
    speechSynthesis.cancel();
    setIsPlaying(false);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Set voice with better selection logic
    const setVoice = () => {
      const voices = speechSynthesis.getVoices();
      console.log('Available voices:', voices.length);
      
      if (voices.length === 0) {
        console.warn('No voices available');
        return;
      }

      // Try to find a female voice, fallback to any English voice, then any voice
      const femaleVoice = voices.find(voice => {
        const name = voice.name.toLowerCase();
        const lang = voice.lang.toLowerCase();
        return lang.startsWith('en') && (
          name.includes('female') ||
          name.includes('woman') ||
          name.includes('zira') ||
          name.includes('hazel') ||
          name.includes('samantha') ||
          name.includes('karen') ||
          name.includes('susan') ||
          name.includes('sarah')
        );
      });

      const englishVoice = voices.find(voice => voice.lang.toLowerCase().startsWith('en'));
      const selectedVoice = femaleVoice || englishVoice || voices[0];

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log('Using voice:', selectedVoice.name, 'Language:', selectedVoice.lang);
      }
    };

    // Set voice when available
    if (speechSynthesis.getVoices().length > 0) {
      setVoice();
    } else {
      speechSynthesis.onvoiceschanged = () => {
        setVoice();
        speechSynthesis.onvoiceschanged = null;
      };
    }

    utterance.onstart = () => {
      console.log('Speech started');
      setIsPlaying(true);
      setIsReady(true);
    };

    utterance.onend = () => {
      console.log('Speech ended');
      setIsPlaying(false);
      setCurrentUtterance(null);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsPlaying(false);
      setCurrentUtterance(null);
      toast({
        title: "Audio error",
        description: `Speech error: ${event.error}. Try clicking the play button to start audio.`,
        variant: "destructive"
      });
    };

    setCurrentUtterance(utterance);
    setIsReady(true);

    // Only autoplay if explicitly requested and user has interacted
    if (autoplay && hasUserInteracted) {
      try {
        console.log('Attempting to speak automatically');
        speechSynthesis.speak(utterance);
      } catch (error) {
        console.error('Error speaking:', error);
        toast({
          title: "Audio error",
          description: "Click the play button to hear the voiceover",
          variant: "default"
        });
      }
    }

    return utterance;
  };

  const startPlayback = () => {
    console.log('startPlayback called, currentUtterance:', !!currentUtterance, 'isPlaying:', isPlaying);
    
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
    }

    if (currentUtterance && !isPlaying) {
      try {
        console.log('Starting speech playback');
        speechSynthesis.speak(currentUtterance);
      } catch (error) {
        console.error('Error starting playback:', error);
        toast({
          title: "Audio error",
          description: "Unable to play audio. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const stopVoiceover = () => {
    console.log('stopVoiceover called');
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setCurrentUtterance(null);
  };

  return {
    playVoiceover,
    startPlayback,
    stopVoiceover,
    currentUtterance,
    setCurrentUtterance,
    isPlaying,
    isReady,
    hasUserInteracted
  };
};
