
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const VoiceFeatureShowcase: React.FC = () => {
  const [selectedFeature, setSelectedFeature] = useState<string>('overview');

  const features = [
    {
      id: 'overview',
      title: 'Voice Revolution',
      icon: <SparklesIcon className="w-5 h-5" />,
      description: 'Transform education with voice-powered feedback'
    },
    {
      id: 'student',
      title: 'Student Experience',
      icon: <MicIcon className="w-5 h-5" />,
      description: 'Natural, expressive student feedback'
    },
    {
      id: 'teacher',
      title: 'Teacher Tools',
      icon: <VolumeIcon className="w-5 h-5" />,
      description: 'Advanced voice message management'
    },
    {
      id: 'analytics',
      title: 'Voice Analytics',
      icon: <TrendingUpIcon className="w-5 h-5" />,
      description: 'Insights from voice communications'
    },
    {
      id: 'wellness',
      title: 'Emotional Intelligence',
      icon: <HeartIcon className="w-5 h-5" />,
      description: 'Detect and support student wellbeing'
    }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            🎤 Voice-Powered Education Platform
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-xl text-white/90">
            The first educational platform designed for the voice-first generation
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 rounded-lg p-4">
              <CheckCircleIcon className="w-8 h-8 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Faster Feedback</h3>
              <p className="text-sm text-white/80">Students share thoughts 3x faster than typing</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <CheckCircleIcon className="w-8 h-8 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Emotional Context</h3>
              <p className="text-sm text-white/80">Capture tone and emotion that text can't convey</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <CheckCircleIcon className="w-8 h-8 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Inclusive Learning</h3>
              <p className="text-sm text-white/80">Perfect for students with writing challenges</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStudentExperience = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MicIcon className="w-5 h-5 text-purple-600" />
            Student Voice Experience
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          
          <div className="mt-6 bg-purple-50 rounded-lg p-4">
            <h3 className="font-semibold text-purple-800 mb-2">Why Students Love Voice:</h3>
            <ul className="space-y-1 text-sm text-purple-700">
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <VolumeIcon className="w-5 h-5 text-orange-600" />
            Teacher Voice Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-orange-50 rounded-lg p-4">
            <h3 className="font-semibold text-orange-800 mb-2">Advanced Voice Tools:</h3>
            <ul className="space-y-1 text-sm text-orange-700">
              <li>• Automatic transcription with 95% accuracy</li>
              <li>• Playback speed control (0.5x to 2x)</li>
              <li>• Emotional tone analysis and alerts</li>
              <li>• Smart categorization and search</li>
              <li>• Priority flagging for urgent messages</li>
            </ul>
          </div>

          <div className="bg-white border-2 border-orange-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <MicIcon className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium">Emma S. - Math Feedback</p>
                  <p className="text-sm text-gray-600">High engagement detected</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">Positive</Badge>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 mb-3">
              <p className="text-sm italic text-gray-700">
                "I was really struggling with quadratic equations, but your basketball example made it click! I actually understand parabolas now!"
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button size="sm" variant="outline">Play 1.5x</Button>
              <Button size="sm" variant="outline">Reply</Button>
              <Button size="sm" variant="outline">Add Note</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUpIcon className="w-5 h-5 text-blue-600" />
            Voice Analytics Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">73%</p>
              <p className="text-sm text-blue-800">Voice Adoption</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-600">+127%</p>
              <p className="text-sm text-green-800">Feedback Volume</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">4.8/5</p>
              <p className="text-sm text-purple-800">Satisfaction</p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Voice vs Text Insights:</h3>
            <ul className="space-y-1 text-sm text-blue-700">
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartIcon className="w-5 h-5 text-red-600" />
            Emotional Intelligence & Wellness
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 rounded-lg p-4">
            <h3 className="font-semibold text-red-800 mb-2">AI-Powered Emotional Detection:</h3>
            <ul className="space-y-1 text-sm text-red-700">
              <li>• Analyze tone and pace to detect distress</li>
              <li>• Flag messages indicating anxiety or sadness</li>
              <li>• Identify students who need extra support</li>
              <li>• Generate wellness alerts for counselors</li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="bg-white border-2 border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-gray-900">Sarah M. - Wellness Alert</p>
                <Badge className="bg-yellow-100 text-yellow-800">Medium Priority</Badge>
              </div>
              <p className="text-sm text-gray-700 italic mb-2">
                Voice analysis detected: slow speech, lower energy, keywords: "tired", "overwhelmed"
              </p>
              <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white">
                Schedule Check-in
              </Button>
            </div>

            <div className="bg-white border-2 border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-gray-900">Anonymous Student</p>
                <Badge className="bg-red-100 text-red-800">High Priority</Badge>
              </div>
              <p className="text-sm text-gray-700 italic mb-2">
                Emotional distress detected: trembling voice, keywords: "can't handle", "giving up"
              </p>
              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
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

  return (
    <div className="space-y-6">
      {/* Feature Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {features.map((feature) => (
              <Button
                key={feature.id}
                onClick={() => setSelectedFeature(feature.id)}
                variant={selectedFeature === feature.id ? "default" : "outline"}
                className="flex items-center gap-2"
              >
                {feature.icon}
                <span className="hidden sm:inline">{feature.title}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feature Content */}
      {renderFeatureContent()}
    </div>
  );
};

export default VoiceFeatureShowcase;
