
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, X, CheckCircle, Calendar, MessageSquare, BarChart, Heart, Play, Pause } from 'lucide-react';
import OptimizedButton from '@/components/shared/OptimizedButton';
import OptimizedCard from '@/components/shared/OptimizedCard';

interface EnhancedWelcomeTourProps {
  userType: 'student' | 'teacher';
  onComplete: () => void;
  isVisible: boolean;
}

const EnhancedWelcomeTour: React.FC<EnhancedWelcomeTourProps> = ({ 
  userType, 
  onComplete, 
  isVisible 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isInteracting, setIsInteracting] = useState(false);
  const [hasInteracted, setHasInteracted] = useState<{[key: number]: boolean}>({});

  if (!isVisible) return null;

  const studentSteps = [
    {
      title: "Welcome to Your Learning Hub!",
      description: "Let's explore your personalized dashboard together.",
      icon: <CheckCircle className="w-6 h-6 text-green-500" />,
      content: "This is your central place for tracking classes, sharing feedback, and monitoring your wellbeing.",
      interactiveElement: "click-demo",
      actionText: "Click to explore",
      tips: ["Navigate using the tabs above", "Your progress is saved automatically"]
    },
    {
      title: "Your Class Schedule",
      description: "Stay organized with your upcoming classes and assignments.",
      icon: <Calendar className="w-6 h-6 text-blue-500" />,
      content: "View today's classes, join virtual sessions, and see what's coming up this week.",
      interactiveElement: "schedule-preview",
      actionText: "Preview schedule",
      tips: ["Green dots indicate today's classes", "Click any class for more details"]
    },
    {
      title: "Share Your Voice",
      description: "Your feedback helps improve your learning experience.",
      icon: <MessageSquare className="w-6 h-6 text-purple-500" />,
      content: "Submit voice or text feedback after each class to help your teachers understand what works.",
      interactiveElement: "feedback-demo",
      actionText: "Try feedback",
      tips: ["Voice messages are processed instantly", "Anonymous feedback is always available"]
    },
    {
      title: "Track Your Progress",
      description: "See how you're growing with detailed insights.",
      icon: <BarChart className="w-6 h-6 text-orange-500" />,
      content: "View your learning analytics, identify strengths, and discover areas for improvement.",
      interactiveElement: "analytics-preview",
      actionText: "View analytics",
      tips: ["Weekly summaries help track trends", "Compare your progress over time"]
    },
    {
      title: "Wellness & Support",
      description: "Your mental health matters - access support when you need it.",
      icon: <Heart className="w-6 h-6 text-red-500" />,
      content: "Check in with yourself, access wellness resources, and connect with support services.",
      interactiveElement: "wellness-demo",
      actionText: "Explore wellness",
      tips: ["Daily check-ins build healthy habits", "Confidential support is always available"]
    }
  ];

  const teacherSteps = [
    {
      title: "Welcome to Your Teaching Command Center!",
      description: "Discover powerful tools to enhance your teaching effectiveness.",
      icon: <CheckCircle className="w-6 h-6 text-green-500" />,
      content: "Manage classes, analyze student feedback, and access AI-powered insights all in one place.",
      interactiveElement: "dashboard-tour",
      actionText: "Start tour",
      tips: ["Customize your dashboard layout", "Quick actions are always accessible"]
    },
    {
      title: "Smart Schedule Management",
      description: "Effortlessly organize your classes and student interactions.",
      icon: <Calendar className="w-6 h-6 text-blue-500" />,
      content: "Create recurring schedules, manage class materials, and track attendance seamlessly.",
      interactiveElement: "schedule-builder",
      actionText: "Build schedule",
      tips: ["Bulk actions save time", "Templates speed up planning"]
    },
    {
      title: "Student Feedback Intelligence",
      description: "Transform student voices into actionable teaching insights.",
      icon: <MessageSquare className="w-6 h-6 text-purple-500" />,
      content: "Review voice and text feedback with AI-powered sentiment analysis and trend detection.",
      interactiveElement: "feedback-analyzer",
      actionText: "Analyze feedback",
      tips: ["Voice feedback reveals emotional context", "Trends help identify learning gaps"]
    },
    {
      title: "AI-Powered Teaching Insights",
      description: "Leverage artificial intelligence to improve student outcomes.",
      icon: <BarChart className="w-6 h-6 text-orange-500" />,
      content: "Get personalized recommendations, predict student needs, and optimize your teaching methods.",
      interactiveElement: "ai-insights",
      actionText: "Explore AI tools",
      tips: ["Weekly AI reports highlight key insights", "Predictive analytics help prevent issues"]
    },
    {
      title: "Student Wellbeing Monitor",
      description: "Support student mental health with early intervention tools.",
      icon: <Heart className="w-6 h-6 text-red-500" />,
      content: "Identify students who may need support and access resources for mental health interventions.",
      interactiveElement: "wellbeing-alerts",
      actionText: "View alerts",
      tips: ["Automated alerts flag concerning patterns", "Collaboration tools connect you with counselors"]
    }
  ];

  const steps = userType === 'student' ? studentSteps : teacherSteps;
  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleInteraction = (stepIndex: number) => {
    setIsInteracting(true);
    setHasInteracted(prev => ({ ...prev, [stepIndex]: true }));
    
    if (!completedSteps.includes(stepIndex)) {
      setCompletedSteps(prev => [...prev, stepIndex]);
    }
    
    setTimeout(() => {
      setIsInteracting(false);
    }, 1000);
  };

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

  const canProceed = hasInteracted[currentStep] || false;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <OptimizedCard className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader className="relative">
          <OptimizedButton
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="absolute right-2 top-2 h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </OptimizedButton>
          
          <div className="flex items-center gap-3 mb-4">
            {currentStepData.icon}
            <div>
              <CardTitle className="text-lg">{currentStepData.title}</CardTitle>
              <CardDescription>{currentStepData.description}</CardDescription>
            </div>
          </div>
          
          <Progress value={progress} className="w-full" />
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {currentStepData.content}
          </p>
          
          {/* Interactive Element */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border-2 border-dashed border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800">Try it yourself:</span>
              {hasInteracted[currentStep] && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Completed
                </Badge>
              )}
            </div>
            
            <OptimizedButton
              onClick={() => handleInteraction(currentStep)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              loading={isInteracting}
              disabled={isInteracting}
            >
              {isInteracting ? <Play className="w-4 h-4 mr-2" /> : null}
              {currentStepData.actionText}
            </OptimizedButton>
          </div>
          
          {/* Tips Section */}
          <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
            <h4 className="text-sm font-semibold text-yellow-800 mb-2">💡 Pro Tips:</h4>
            <ul className="text-xs text-yellow-700 space-y-1">
              {currentStepData.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-yellow-600">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep 
                      ? 'bg-primary' 
                      : completedSteps.includes(index)
                      ? 'bg-green-500'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            
            <Badge variant="outline">
              {currentStep + 1} of {steps.length}
            </Badge>
          </div>
          
          <div className="flex gap-2 justify-end">
            <OptimizedButton variant="outline" onClick={handleSkip}>
              Skip Tour
            </OptimizedButton>
            <OptimizedButton 
              onClick={handleNext}
              disabled={!canProceed}
              className={canProceed ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {currentStep < steps.length - 1 ? (
                <>
                  Next <ArrowRight className="w-4 h-4 ml-1" />
                </>
              ) : (
                'Get Started!'
              )}
            </OptimizedButton>
          </div>
        </CardContent>
      </OptimizedCard>
    </div>
  );
};

export default EnhancedWelcomeTour;
