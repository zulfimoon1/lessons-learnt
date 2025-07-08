
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Heart, Smile, Meh, Frown, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import VoiceInputToggle from '@/components/voice/VoiceInputToggle';
import AudioPlayer from '@/components/voice/AudioPlayer';

interface MoodEntry {
  mood: 'great' | 'good' | 'okay' | 'poor' | 'terrible';
  notes?: string;
  audioUrl?: string;
  transcription?: string;
  audioDuration?: number;
  timestamp: Date;
}

interface WellnessTrackerProps {
  onMoodSubmit: (entry: MoodEntry) => void;
  recentEntries?: MoodEntry[];
}

const WellnessTracker: React.FC<WellnessTrackerProps> = ({
  onMoodSubmit,
  recentEntries = []
}) => {
  const [selectedMood, setSelectedMood] = useState<MoodEntry['mood'] | null>(null);
  const [notes, setNotes] = useState('');
  const [audioData, setAudioData] = useState<{
    audioUrl?: string;
    transcription?: string;
    duration?: number;
  }>({});
  const { t } = useLanguage();

  const moods = [
    { value: 'great', icon: Smile, label: 'Awesome!', color: 'text-green-500' },
    { value: 'good', icon: Smile, label: 'Pretty Good', color: 'text-blue-500' },
    { value: 'okay', icon: Meh, label: 'Okay', color: 'text-yellow-500' },
    { value: 'poor', icon: Frown, label: 'Not Great', color: 'text-orange-500' },
    { value: 'terrible', icon: AlertTriangle, label: 'Really Bad', color: 'text-red-500' }
  ] as const;

  const handleVoiceComplete = (audioUrl: string, transcription?: string, duration?: number) => {
    setAudioData({ audioUrl, transcription, duration });
    if (transcription) {
      setNotes(transcription);
    }
  };

  const handleTextMode = () => {
    setAudioData({});
  };

  const handleSubmit = () => {
    if (!selectedMood) return;

    const entry: MoodEntry = {
      mood: selectedMood,
      notes: notes.trim() || undefined,
      audioUrl: audioData.audioUrl,
      transcription: audioData.transcription,
      audioDuration: audioData.duration,
      timestamp: new Date()
    };

    onMoodSubmit(entry);
    setSelectedMood(null);
    setNotes('');
    setAudioData({});
  };

  const getMoodIcon = (mood: MoodEntry['mood']) => {
    const moodConfig = moods.find(m => m.value === mood);
    return moodConfig ? moodConfig.icon : Meh;
  };

  const getMoodColor = (mood: MoodEntry['mood']) => {
    const moodConfig = moods.find(m => m.value === mood);
    return moodConfig ? moodConfig.color : 'text-gray-500';
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-brand-orange" />
          How Are You Feeling Today?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mood Selection */}
        <div>
          <h4 className="text-sm font-medium mb-3">
            Pick the one that feels right:
          </h4>
          <div className="grid grid-cols-5 gap-2">
            {moods.map((mood) => {
              const Icon = mood.icon;
              return (
                <Button
                  key={mood.value}
                  variant={selectedMood === mood.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedMood(mood.value)}
                  className={`flex flex-col items-center gap-1 h-auto p-3 ${
                    selectedMood === mood.value ? 'bg-brand-teal text-white' : ''
                  }`}
                >
                  <Icon className={`w-5 h-5 ${selectedMood === mood.value ? 'text-white' : mood.color}`} />
                  <span className="text-xs">{mood.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Notes with Voice Option */}
        {selectedMood && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium mb-2">
              Want to tell us more? (You don't have to!)
            </h4>
            
            <VoiceInputToggle
              onVoiceComplete={handleVoiceComplete}
              onTextMode={handleTextMode}
              disabled={false}
              className="mb-4"
            />

            {audioData.audioUrl && (
              <AudioPlayer
                audioUrl={audioData.audioUrl}
                transcription={audioData.transcription}
                duration={audioData.duration}
                title="Your voice message"
                showTranscription={true}
                className="mb-4"
              />
            )}

            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What's going on? How are things at school or home? Anything you want to share..."
              className="resize-none"
              rows={3}
            />
          </div>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={!selectedMood}
          className="w-full bg-brand-teal hover:bg-brand-teal/90"
        >
          Share How I'm Feeling
        </Button>

        {/* Recent Entries */}
        {recentEntries.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3">
              How You've Been Feeling Lately:
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {recentEntries.slice(0, 5).map((entry, index) => {
                const Icon = getMoodIcon(entry.mood);
                return (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded text-sm">
                    <Icon className={`w-4 h-4 ${getMoodColor(entry.mood)}`} />
                    <span className="font-medium capitalize">{entry.mood}</span>
                    <span className="text-gray-500 text-xs">
                      {entry.timestamp.toLocaleDateString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WellnessTracker;
