
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, X, CheckCircle, Calendar, MessageSquare, BarChart, Heart } from 'lucide-react';

interface WelcomeTourProps {
  userType: 'student' | 'teacher';
  onComplete: () => void;
  isVisible: boolean;
}

const WelcomeTour: React.FC<WelcomeTourProps> = ({ userType, onComplete, isVisible }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isVisible) return null;

  const studentSteps = [
    {
      title: "Welcome to Your Dashboard!",
      description: "Let's take a quick tour to help you get started with the platform.",
      icon: <CheckCircle className="w-6 h-6 text-green-500" />,
      content: "You can track your classes, submit feedback, and monitor your wellbeing all in one place."
    },
    {
      title: "View Your Classes",
      description: "Check upcoming classes and see what's planned for today.",
      icon: <Calendar className="w-6 h-6 text-blue-500" />,
      content: "Click on the Classes tab to see your schedule and join virtual sessions."
    },
    {
      title: "Submit Feedback",
      description: "Share how each class went and help improve your learning experience.",
      icon: <MessageSquare className="w-6 h-6 text-purple-500" />,
      content: "Your feedback helps teachers understand what's working and what needs improvement."
    },
    {
      title: "Monitor Your Progress",
      description: "Track your learning journey with detailed analytics and insights.",
      icon: <BarChart className="w-6 h-6 text-orange-500" />,
      content: "See your progress over time and identify areas where you're excelling."
    },
    {
      title: "Mental Health Support",
      description: "Access wellness resources and connect with support when you need it.",
      icon: <Heart className="w-6 h-6 text-red-500" />,
      content: "Your wellbeing matters. Use this space to check in with yourself and access support."
    }
  ];

  const teacherSteps = [
    {
      title: "Welcome to Your Teaching Hub!",
      description: "Your complete toolkit for managing classes and supporting students.",
      icon: <CheckCircle className="w-6 h-6 text-green-500" />,
      content: "Manage schedules, view feedback, and access AI insights to enhance your teaching."
    },
    {
      title: "Schedule Management",
      description: "Create and manage your class schedules efficiently.",
      icon: <Calendar className="w-6 h-6 text-blue-500" />,
      content: "Add classes, set recurring schedules, and keep your students informed."
    },
    {
      title: "Student Feedback",
      description: "Review feedback from students to improve your teaching methods.",
      icon: <MessageSquare className="w-6 h-6 text-purple-500" />,
      content: "Get insights into what's working well and areas for improvement."
    },
    {
      title: "AI Insights",
      description: "Leverage AI-powered analytics to understand student engagement.",
      icon: <BarChart className="w-6 h-6 text-orange-500" />,
      content: "Identify patterns and get recommendations for better student outcomes."
    },
    {
      title: "Mental Health Monitoring",
      description: "Support student wellbeing with early intervention tools.",
      icon: <Heart className="w-6 h-6 text-red-500" />,
      content: "Access alerts and resources to help students who may need additional support."
    }
  ];

  const steps = userType === 'student' ? studentSteps : teacherSteps;
  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="absolute right-2 top-2 h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            {currentStepData.icon}
            <div>
              <CardTitle className="text-lg">{currentStepData.title}</CardTitle>
              <CardDescription>{currentStepData.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {currentStepData.content}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            
            <Badge variant="outline">
              {currentStep + 1} of {steps.length}
            </Badge>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleSkip}>
              Skip Tour
            </Button>
            <Button onClick={handleNext}>
              {currentStep < steps.length - 1 ? (
                <>
                  Next <ArrowRight className="w-4 h-4 ml-1" />
                </>
              ) : (
                'Get Started'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WelcomeTour;
