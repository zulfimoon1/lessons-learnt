
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const useVoiceover = () => {
  const { toast } = useToast();
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  const playVoiceover = (text: string) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Text-to-Speech not supported in this browser');
      return null;
    }

    // Cancel any existing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
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
        speechSynthesis.onvoiceschanged = null; // Remove listener after first call
      };
    }

    // Add error handling
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
    };

    utterance.onstart = () => {
      console.log('Speech started');
    };

    utterance.onend = () => {
      console.log('Speech ended');
      setCurrentUtterance(null);
    };

    return utterance;
  };

  const stopVoiceover = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    setCurrentUtterance(null);
  };

  return {
    playVoiceover,
    stopVoiceover,
    currentUtterance,
    setCurrentUtterance
  };
};
