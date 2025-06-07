
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

export const useVoiceover = () => {
  const { toast } = useToast();
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const playVoiceover = (text: string) => {
    if (!('speechSynthesis' in window)) {
      toast({
        title: "Text-to-Speech Not Supported",
        description: "Your browser doesn't support text-to-speech functionality",
        variant: "destructive"
      });
      return null;
    }

    // Cancel any existing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    utterance.pitch = 1.1;
    utterance.volume = isMuted ? 0 : 1.0;

    // Wait for voices to be loaded
    const setVoice = () => {
      const voices = speechSynthesis.getVoices();
      console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));
      
      // Enhanced female voice selection with multiple fallbacks
      const femaleVoice = voices.find(voice => {
        const name = voice.name.toLowerCase();
        const lang = voice.lang.toLowerCase();
        return (
          // Prioritize high-quality female voices
          name.includes('samantha') ||
          name.includes('karen') ||
          name.includes('susan') ||
          name.includes('sarah') ||
          name.includes('emma') ||
          name.includes('female') ||
          name.includes('woman') ||
          name.includes('zira') ||
          name.includes('hazel') ||
          name.includes('moira') ||
          name.includes('tessa') ||
          name.includes('fiona') ||
          name.includes('kate') ||
          name.includes('victoria') ||
          // Google voices
          (name.includes('google') && name.includes('female')) ||
          (name.includes('google') && lang.includes('en') && name.includes('2')) ||
          // Microsoft voices
          name.includes('microsoft zira') ||
          // Natural-sounding voices that are typically female
          (lang.includes('en') && (
            name.includes('natural') ||
            name.includes('neural')
          ))
        );
      });

      if (femaleVoice) {
        utterance.voice = femaleVoice;
        console.log('Using female voice:', femaleVoice.name, 'Language:', femaleVoice.lang);
      } else {
        // Fallback to any English voice
        const englishVoice = voices.find(voice => voice.lang.startsWith('en'));
        if (englishVoice) {
          utterance.voice = englishVoice;
          console.log('Using fallback English voice:', englishVoice.name);
        }
      }
    };

    // Set voice immediately if available, otherwise wait for voices to load
    if (speechSynthesis.getVoices().length > 0) {
      setVoice();
    } else {
      speechSynthesis.onvoiceschanged = setVoice;
    }

    return utterance;
  };

  const stopVoiceover = () => {
    if (currentUtterance) {
      speechSynthesis.cancel();
      setCurrentUtterance(null);
    }
  };

  return {
    playVoiceover,
    stopVoiceover,
    currentUtterance,
    setCurrentUtterance,
    isMuted,
    setIsMuted
  };
};
