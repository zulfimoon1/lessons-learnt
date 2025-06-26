
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
  UserIcon
} from "lucide-react";

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
    }, 3000);

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
            <label className="block text-sm font-medium mb-2">Additional Comments</label>
            <div className="bg-gray-50 p-3 rounded-lg border">
              <p className="text-sm text-gray-700 italic">
                "The quadratic equations were challenging but I feel like I'm getting better with practice..."
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

  const getCurrentComponent = () => {
    switch (steps[currentStep].component) {
      case "dashboard": return renderDashboard();
      case "feedback": return renderFeedback();
      case "wellness": return renderWellness();
      case "summary": return renderSummary();
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
