import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpenIcon, 
  CalendarIcon, 
  HeartIcon, 
  MessageSquareIcon,
  StarIcon,
  ClockIcon,
  TrendingUpIcon,
  UserIcon,
  MicIcon,
  VolumeIcon,
  MessageCircleIcon,
  ShieldCheckIcon,
  PhoneIcon
} from "lucide-react";
import VoiceDemoCard from './voice/VoiceDemoCard';

interface StudentSimulationProps {
  isPlaying: boolean;
}

const StudentSimulation: React.FC<StudentSimulationProps> = ({ isPlaying }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = [
    {
      title: "Welcome Dashboard",
      description: "Student views their personalized dashboard with upcoming classes and wellness check",
      component: "dashboard"
    },
    {
      title: "Voice Feedback Demo",
      description: "Student discovers the new voice recording feature for easier feedback",
      component: "voice"
    },
    {
      title: "Lesson Feedback",
      description: "Student provides feedback on today's math lesson using interactive forms",
      component: "feedback"
    },
    {
      title: "Wellness Check",
      description: "Student completes daily wellness check-in with mood tracking",
      component: "wellness"
    },
    {
      title: "Weekly Summary",
      description: "Student reviews their progress and writes weekly reflection",
      component: "summary"
    },
    {
      title: "Anonymous Chat Support",
      description: "Student discovers they can chat anonymously with a school doctor for mental health support",
      component: "chat"
    }
  ];

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        const next = (prev + 1) % steps.length;
        setProgress((next / (steps.length - 1)) * 100);
        return next;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [isPlaying, steps.length]);

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-teal to-brand-orange p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Welcome back, Emma!</h1>
          <p className="text-xl text-white/90 mb-2">Lincoln High School - Grade 10</p>
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            Ready to learn today
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Classes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-brand-teal/20 bg-brand-teal/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-teal rounded-lg flex items-center justify-center">
                  <BookOpenIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-brand-dark">Mathematics</h3>
                  <p className="text-sm text-gray-600">Room 201 • 9:00 AM</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-brand-orange/20 bg-brand-orange/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-orange rounded-lg flex items-center justify-center">
                  <BookOpenIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-brand-dark">English Literature</h3>
                  <p className="text-sm text-gray-600">Room 105 • 11:00 AM</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderVoiceDemo = () => (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-100 to-blue-100 border-purple-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <MicIcon className="w-6 h-6" />
            🎉 New Feature: Voice Recording!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-2">Why Voice Recording is Amazing:</h3>
            <ul className="space-y-2 text-sm text-purple-800">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Express emotions and tone that text can't capture
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Faster than typing - just speak your thoughts
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Perfect for students with dyslexia or writing challenges
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Your voice is automatically transcribed for teachers
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <VoiceDemoCard
              title="Express Feelings"
              description="Record how you really feel about lessons"
              mockTranscription="I was feeling a bit confused during the algebra section, but when you explained it with the pizza example, everything clicked! Can we do more real-world examples like that?"
              variant="student"
            />
            
            <VoiceDemoCard
              title="Quick Feedback"
              description="Share thoughts instantly after class"
              mockTranscription="Today's chemistry lab was awesome! I loved the volcano experiment. It made me understand chemical reactions so much better than just reading about them."
              variant="student"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderFeedback = () => (
    <div className="space-y-6">
      <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquareIcon className="w-5 h-5 text-brand-orange" />
            Lesson Feedback - Mathematics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">How well did you understand today's lesson?</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon key={star} className="w-6 h-6 text-yellow-400 fill-current" />
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">How interesting was the lesson?</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((star) => (
                <StarIcon key={star} className="w-6 h-6 text-yellow-400 fill-current" />
              ))}
              <StarIcon className="w-6 h-6 text-gray-300" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Share your thoughts (Text or Voice)</label>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <MicIcon className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Voice message recorded</span>
                <Badge className="bg-purple-100 text-purple-700">NEW!</Badge>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-lg p-3">
                <VolumeIcon className="w-4 h-4 text-purple-600" />
                <div className="flex-1">
                  <div className="flex gap-1 mb-1">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className={`w-1 rounded-full bg-purple-400 ${i < 5 ? 'h-4' : 'h-2'}`}></div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600">0:12 / 0:45</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 italic mt-2">
                "The quadratic equations were challenging but I feel like I'm getting better with practice. I love how you use real examples!"
              </p>
            </div>
          </div>

          <Button className="w-full bg-brand-teal hover:bg-brand-dark text-white">
            Submit Feedback
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderWellness = () => (
    <div className="space-y-6">
      <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartIcon className="w-5 h-5 text-brand-orange" />
            Daily Wellness Check
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">How are you feeling today?</label>
            <div className="grid grid-cols-5 gap-2">
              {['😢', '😕', '😐', '😊', '😄'].map((emoji, index) => (
                <Button
                  key={index}
                  variant={index === 3 ? "default" : "outline"}
                  className={`h-12 text-2xl ${index === 3 ? 'bg-brand-teal text-white' : ''}`}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Energy Level</label>
            <Progress value={75} className="h-3" />
            <p className="text-sm text-gray-600 mt-1">High energy today!</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Anything on your mind?</label>
            <div className="bg-gray-50 p-3 rounded-lg border">
              <p className="text-sm text-gray-700 italic">
                "Excited about the science fair next week. A bit nervous about presenting though."
              </p>
            </div>
          </div>

          <Button className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white">
            Complete Check-in
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderSummary = () => (
    <div className="space-y-6">
      <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUpIcon className="w-5 h-5 text-brand-teal" />
            Weekly Progress Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-brand-teal/10 p-4 rounded-lg">
              <h3 className="font-semibold text-brand-dark">Classes Attended</h3>
              <p className="text-2xl font-bold text-brand-teal">23/25</p>
            </div>
            <div className="bg-brand-orange/10 p-4 rounded-lg">
              <h3 className="font-semibold text-brand-dark">Feedback Given</h3>
              <p className="text-2xl font-bold text-brand-orange">18</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">This week's reflection</label>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <p className="text-sm text-gray-700">
                "This week I made good progress in mathematics and really enjoyed our literature discussions. 
                I'm feeling more confident about asking questions in class when I don't understand something."
              </p>
            </div>
          </div>

          <Badge className="bg-green-100 text-green-800 border-green-200">
            Great Progress This Week! 🎉
          </Badge>
        </CardContent>
      </Card>
    </div>
  );

  const renderChat = () => (
    <div className="space-y-6">
      {/* Introduction to Anonymous Chat */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <MessageCircleIcon className="w-6 h-6" />
            💬 Need Someone to Talk To? Chat Anonymously!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-2">Why Anonymous Chat is Amazing:</h3>
            <ul className="space-y-2 text-sm text-purple-800">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Talk to a real school doctor - they're trained to help students
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Your identity stays completely private and anonymous
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Get support right away when you're feeling overwhelmed
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Everything you share is confidential and secure
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface Demo */}
      <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheckIcon className="w-5 h-5 text-green-600" />
            Anonymous Chat with School Doctor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Privacy Toggle Demo */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="w-4 h-4 text-green-600" />
                <span className="font-medium text-blue-800">Anonymous Mode: ON</span>
                <Badge className="bg-green-100 text-green-700">Protected</Badge>
              </div>
              <div className="text-xs text-blue-600">Your identity is completely hidden</div>
            </div>
          </div>

          {/* Mock Chat Interface */}
          <div className="bg-gray-50 border rounded-lg p-4 h-64 overflow-y-auto">
            <div className="space-y-3">
              {/* System message */}
              <div className="text-center">
                <Badge className="bg-green-100 text-green-800">Connected to Dr. Martinez</Badge>
                <p className="text-xs text-gray-600 mt-1">Your conversation is private and confidential</p>
              </div>

              {/* Doctor's greeting */}
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="bg-blue-100 p-3 rounded-lg max-w-xs">
                    <p className="text-sm text-blue-900">
                      Hi there! I'm Dr. Martinez, the school doctor. I'm here to listen and support you. 
                      What's on your mind today?
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Dr. Martinez • Just now</p>
                </div>
              </div>

              {/* Student response */}
              <div className="flex gap-3 justify-end">
                <div className="flex-1 flex justify-end">
                  <div className="bg-purple-100 p-3 rounded-lg max-w-xs">
                    <p className="text-sm text-purple-900">
                      Hi doctor. I've been feeling really stressed about exams lately and having trouble sleeping. 
                      I don't want anyone to know it's me talking about this...
                    </p>
                  </div>
                </div>
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">A</span>
                </div>
              </div>

              {/* Doctor's supportive response */}
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="bg-blue-100 p-3 rounded-lg max-w-xs">
                    <p className="text-sm text-blue-900">
                      I completely understand, and I want you to know that your privacy is 100% protected here. 
                      Exam stress is very common, and there are effective ways we can help you manage it...
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Dr. Martinez • Just now</p>
                </div>
              </div>

              {/* Typing indicator */}
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-white" />
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chat input area */}
          <div className="border rounded-lg p-3 bg-white">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheckIcon className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700 font-medium">Anonymous Mode Active</span>
            </div>
            <div className="flex gap-2">
              <input 
                className="flex-1 p-2 border rounded text-sm" 
                placeholder="Type your message... Your identity is protected"
                disabled
              />
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <MessageCircleIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Benefits highlighted */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheckIcon className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-800">100% Anonymous</span>
              </div>
              <p className="text-sm text-green-700">
                Dr. Martinez can't see your name or any identifying information
              </p>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <PhoneIcon className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-800">Real Professional</span>
              </div>
              <p className="text-sm text-blue-700">
                Qualified school doctors trained to help students
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-brand-teal to-brand-orange text-white shadow-lg">
        <CardContent className="p-6 text-center">
          <h3 className="font-bold text-xl mb-2">Ready to Get Support?</h3>
          <p className="mb-4 opacity-90">
            Remember: It's completely normal to need help sometimes. You're not alone!
          </p>
          <Button className="bg-white text-brand-teal hover:bg-gray-100 font-semibold">
            <MessageCircleIcon className="w-4 h-4 mr-2" />
            Start Anonymous Chat
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const getCurrentComponent = () => {
    switch (steps[currentStep].component) {
      case "dashboard": return renderDashboard();
      case "voice": return renderVoiceDemo();
      case "feedback": return renderFeedback();
      case "wellness": return renderWellness();
      case "summary": return renderSummary();
      case "chat": return renderChat();
      default: return renderDashboard();
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-brand-dark">Student Experience Demo</h3>
            <Badge variant="outline" className="border-brand-teal text-brand-teal">
              Step {currentStep + 1} of {steps.length}
            </Badge>
          </div>
          <Progress value={progress} className="mb-2" />
          <p className="text-sm text-gray-600">{steps[currentStep].description}</p>
        </CardContent>
      </Card>

      {/* Current Step Content */}
      {getCurrentComponent()}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
        >
          Previous
        </Button>
        <Button
          onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
          disabled={currentStep === steps.length - 1}
          className="bg-brand-teal hover:bg-brand-dark text-white"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default StudentSimulation;
