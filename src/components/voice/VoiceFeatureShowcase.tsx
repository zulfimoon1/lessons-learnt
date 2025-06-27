import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MicIcon, 
  VolumeIcon, 
  MessageSquareIcon, 
  HeartIcon,
  TrendingUpIcon,
  SparklesIcon,
  CheckCircleIcon
} from "lucide-react";
import VoiceDemoCard from './VoiceDemoCard';
import { useDeviceType } from '@/hooks/use-device';

interface VoiceFeatureShowcaseProps {
  isPlaying?: boolean;
}

const VoiceFeatureShowcase: React.FC<VoiceFeatureShowcaseProps> = ({ isPlaying = false }) => {
  const [selectedFeature, setSelectedFeature] = useState<string>('overview');
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';

  // Auto-play through features when isPlaying is true
  useEffect(() => {
    if (!isPlaying) return;

    const features = ['overview', 'student', 'teacher', 'analytics', 'wellness'];
    let currentIndex = features.indexOf(selectedFeature);
    
    if (currentIndex === -1) {
      currentIndex = 0;
      setSelectedFeature('overview');
    }

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % features.length;
      setSelectedFeature(features[currentIndex]);
    }, 4000); // Change feature every 4 seconds

    return () => clearInterval(interval);
  }, [isPlaying, selectedFeature]);

  const features = [
    {
      id: 'overview',
      title: 'Voice Revolution',
      shortTitle: 'Overview',
      icon: <SparklesIcon className="w-4 h-4 md:w-5 md:h-5" />,
      description: 'Transform education with voice-powered feedback'
    },
    {
      id: 'student',
      title: 'Student Experience',
      shortTitle: 'Student',
      icon: <MicIcon className="w-4 h-4 md:w-5 md:h-5" />,
      description: 'Natural, expressive student feedback'
    },
    {
      id: 'teacher',
      title: 'Teacher Tools',
      shortTitle: 'Teacher',
      icon: <VolumeIcon className="w-4 h-4 md:w-5 md:h-5" />,
      description: 'Advanced voice message management'
    },
    {
      id: 'analytics',
      title: 'Voice Analytics',
      shortTitle: 'Analytics',
      icon: <TrendingUpIcon className="w-4 h-4 md:w-5 md:h-5" />,
      description: 'Insights from voice communications'
    },
    {
      id: 'wellness',
      title: 'Emotional Intelligence',
      shortTitle: 'Wellness',
      icon: <HeartIcon className="w-4 h-4 md:w-5 md:h-5" />,
      description: 'Detect and support student wellbeing'
    }
  ];

  const renderOverview = () => (
    <div className="space-y-4 md:space-y-6">
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="text-xl md:text-2xl font-bold text-center">
            🎤 Voice-Powered Education Platform
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-3 md:space-y-4 pt-0">
          <p className="text-lg md:text-xl text-white/90">
            The first educational platform designed for the voice-first generation
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mt-4 md:mt-6">
            <div className="bg-white/10 rounded-lg p-3 md:p-4">
              <CheckCircleIcon className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2" />
              <h3 className="font-semibold mb-1 text-sm md:text-base">Faster Feedback</h3>
              <p className="text-xs md:text-sm text-white/80">Students share thoughts 3x faster than typing</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3 md:p-4">
              <CheckCircleIcon className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2" />
              <h3 className="font-semibold mb-1 text-sm md:text-base">Emotional Context</h3>
              <p className="text-xs md:text-sm text-white/80">Capture tone and emotion that text can't convey</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3 md:p-4">
              <CheckCircleIcon className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2" />
              <h3 className="font-semibold mb-1 text-sm md:text-base">Inclusive Learning</h3>
              <p className="text-xs md:text-sm text-white/80">Perfect for students with writing challenges</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStudentExperience = () => (
    <div className="space-y-4 md:space-y-6">
      <Card>
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <MicIcon className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
            Student Voice Experience
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
            <VoiceDemoCard
              title="Express True Feelings"
              description="Share authentic emotions about lessons"
              mockTranscription="I was so confused at first, but when you used the pizza example for fractions, I finally got it! My face literally lit up - I wish you could have seen it!"
              variant="student"
            />
            
            <VoiceDemoCard
              title="Quick Class Feedback"
              description="Instant thoughts after each lesson"
              mockTranscription="Today's science experiment was incredible! The volcano reaction was way cooler than I expected. Can we do more hands-on experiments like this?"
              variant="student"
            />
          </div>
          
          <div className="mt-4 md:mt-6 bg-purple-50 rounded-lg p-3 md:p-4">
            <h3 className="font-semibold text-purple-800 mb-2 text-sm md:text-base">Why Students Love Voice:</h3>
            <ul className="space-y-1 text-xs md:text-sm text-purple-700">
              <li>• Express complex thoughts without worrying about spelling</li>
              <li>• Share excitement and emotions naturally</li>
              <li>• Faster than typing on mobile devices</li>
              <li>• Perfect for students with dyslexia or writing difficulties</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTeacherTools = () => (
    <div className="space-y-4 md:space-y-6">
      <Card>
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <VolumeIcon className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
            Teacher Voice Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 md:space-y-4 pt-0">
          <div className="bg-orange-50 rounded-lg p-3 md:p-4">
            <h3 className="font-semibold text-orange-800 mb-2 text-sm md:text-base">Advanced Voice Tools:</h3>
            <ul className="space-y-1 text-xs md:text-sm text-orange-700">
              <li>• Automatic transcription with 95% accuracy</li>
              <li>• Playback speed control (0.5x to 2x)</li>
              <li>• Emotional tone analysis and alerts</li>
              <li>• Smart categorization and search</li>
              <li>• Priority flagging for urgent messages</li>
            </ul>
          </div>

          <div className="bg-white border-2 border-orange-200 rounded-lg p-3 md:p-4">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MicIcon className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm md:text-base truncate">Emma S. - Math Feedback</p>
                  <p className="text-xs md:text-sm text-gray-600">High engagement detected</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800 text-xs flex-shrink-0">Positive</Badge>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 mb-3">
              <p className="text-xs md:text-sm italic text-gray-700">
                "I was really struggling with quadratic equations, but your basketball example made it click! I actually understand parabolas now!"
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="text-xs">Play 1.5x</Button>
              <Button size="sm" variant="outline" className="text-xs">Reply</Button>
              <Button size="sm" variant="outline" className="text-xs">Add Note</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-4 md:space-y-6">
      <Card>
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <TrendingUpIcon className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
            Voice Analytics Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 md:space-y-4 pt-0">
          <div className="grid grid-cols-3 gap-2 md:gap-4">
            <div className="bg-blue-50 rounded-lg p-3 md:p-4 text-center">
              <p className="text-xl md:text-2xl font-bold text-blue-600">73%</p>
              <p className="text-xs md:text-sm text-blue-800">Voice Adoption</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 md:p-4 text-center">
              <p className="text-xl md:text-2xl font-bold text-green-600">+127%</p>
              <p className="text-xs md:text-sm text-green-800">Feedback Volume</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 md:p-4 text-center">
              <p className="text-xl md:text-2xl font-bold text-purple-600">4.8/5</p>
              <p className="text-xs md:text-sm text-purple-800">Satisfaction</p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-3 md:p-4">
            <h3 className="font-semibold text-blue-800 mb-2 text-sm md:text-base">Voice vs Text Insights:</h3>
            <ul className="space-y-1 text-xs md:text-sm text-blue-700">
              <li>• Voice messages are 40% more detailed than text</li>
              <li>• Students share emotions 5x more in voice</li>
              <li>• Voice feedback has 85% higher engagement scores</li>
              <li>• Teachers respond 2x faster to voice messages</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderWellness = () => (
    <div className="space-y-4 md:space-y-6">
      <Card>
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <HeartIcon className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
            Emotional Intelligence & Wellness
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 md:space-y-4 pt-0">
          <div className="bg-red-50 rounded-lg p-3 md:p-4">
            <h3 className="font-semibold text-red-800 mb-2 text-sm md:text-base">AI-Powered Emotional Detection:</h3>
            <ul className="space-y-1 text-xs md:text-sm text-red-700">
              <li>• Analyze tone and pace to detect distress</li>
              <li>• Flag messages indicating anxiety or sadness</li>
              <li>• Identify students who need extra support</li>
              <li>• Generate wellness alerts for counselors</li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="bg-white border-2 border-yellow-200 rounded-lg p-3 md:p-4">
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <p className="font-medium text-gray-900 text-sm md:text-base">Sarah M. - Wellness Alert</p>
                <Badge className="bg-yellow-100 text-yellow-800 text-xs">Medium Priority</Badge>
              </div>
              <p className="text-xs md:text-sm text-gray-700 italic mb-2">
                Voice analysis detected: slow speech, lower energy, keywords: "tired", "overwhelmed"
              </p>
              <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs">
                Schedule Check-in
              </Button>
            </div>

            <div className="bg-white border-2 border-red-200 rounded-lg p-3 md:p-4">
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <p className="font-medium text-gray-900 text-sm md:text-base">Anonymous Student</p>
                <Badge className="bg-red-100 text-red-800 text-xs">High Priority</Badge>
              </div>
              <p className="text-xs md:text-sm text-gray-700 italic mb-2">
                Emotional distress detected: trembling voice, keywords: "can't handle", "giving up"
              </p>
              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white text-xs">
                Immediate Intervention
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderFeatureContent = () => {
    switch (selectedFeature) {
      case 'overview': return renderOverview();
      case 'student': return renderStudentExperience();
      case 'teacher': return renderTeacherTools();
      case 'analytics': return renderAnalytics();
      case 'wellness': return renderWellness();
      default: return renderOverview();
    }
  };

  if (isMobile) {
    return (
      <div className="space-y-4">
        <Tabs value={selectedFeature} onValueChange={setSelectedFeature} className="w-full">
          <Card>
            <CardContent className="p-3">
              <TabsList className="grid w-full grid-cols-5 h-auto p-1">
                {features.map((feature) => (
                  <TabsTrigger
                    key={feature.id}
                    value={feature.id}
                    className="flex flex-col items-center gap-1 p-2 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    disabled={isPlaying}
                  >
                    {feature.icon}
                    <span className="hidden xs:inline">{feature.shortTitle}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
              {isPlaying && (
                <div className="mt-2 text-center">
                  <Badge variant="outline" className="text-brand-teal border-brand-teal animate-pulse text-xs">
                    Auto-playing: {features.find(f => f.id === selectedFeature)?.shortTitle}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {features.map((feature) => (
            <TabsContent key={feature.id} value={feature.id} className="mt-4">
              {renderFeatureContent()}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    );
  }

  // Desktop and tablet view (original layout with responsive improvements)
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Feature Navigation */}
      <Card>
        <CardContent className="p-3 md:p-4">
          <div className={`flex ${isTablet ? 'flex-wrap' : ''} gap-2`}>
            {features.map((feature) => (
              <Button
                key={feature.id}
                onClick={() => setSelectedFeature(feature.id)}
                variant={selectedFeature === feature.id ? "default" : "outline"}
                className="flex items-center gap-2 text-sm"
                disabled={isPlaying}
                size={isTablet ? "sm" : "default"}
              >
                {feature.icon}
                <span className={`${isTablet ? 'hidden md:inline' : ''}`}>
                  {isTablet ? feature.shortTitle : feature.title}
                </span>
              </Button>
            ))}
          </div>
          {isPlaying && (
            <div className="mt-3 text-center">
              <Badge variant="outline" className="text-brand-teal border-brand-teal animate-pulse">
                Auto-playing demo: {features.find(f => f.id === selectedFeature)?.title}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feature Content */}
      {renderFeatureContent()}
    </div>
  );
};

export default VoiceFeatureShowcase;
