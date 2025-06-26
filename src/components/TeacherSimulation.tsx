
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users,
  BarChart3,
  MessageSquare,
  Calendar,
  AlertTriangle,
  TrendingUp,
  BookOpen,
  Heart,
  Star
} from "lucide-react";

interface TeacherSimulationProps {
  isPlaying: boolean;
}

const TeacherSimulation: React.FC<TeacherSimulationProps> = ({ isPlaying }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = [
    {
      title: "Teacher Dashboard",
      description: "Teacher views their dashboard with class schedule and student feedback overview",
      component: "dashboard"
    },
    {
      title: "Live Feedback",
      description: "Teacher monitors real-time student feedback during and after lessons",
      component: "feedback"
    },
    {
      title: "Student Analytics",
      description: "Teacher analyzes student performance and engagement trends",
      component: "analytics"
    },
    {
      title: "Wellness Monitoring",
      description: "Teacher reviews student wellness alerts and mental health insights",
      component: "wellness"
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
          <h1 className="text-3xl font-bold mb-2">Welcome back, Ms. Johnson!</h1>
          <p className="text-xl text-white/90 mb-2">Lincoln High School - Mathematics Teacher</p>
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            Ready to teach
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-teal/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-brand-teal" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-brand-dark">127</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-orange/10 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-brand-orange" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Feedback Received</p>
                <p className="text-2xl font-bold text-brand-dark">89</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Engagement</p>
                <p className="text-2xl font-bold text-brand-dark">4.3/5</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Wellness Alerts</p>
                <p className="text-2xl font-bold text-red-600">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-teal" />
            Today's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-brand-teal/5 rounded-lg border border-brand-teal/20">
              <div>
                <h3 className="font-semibold text-brand-dark">Algebra II - Period 1</h3>
                <p className="text-sm text-gray-600">Room 201 • 9:00 - 9:50 AM</p>
              </div>
              <Badge className="bg-brand-teal text-white">In Progress</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-semibold text-brand-dark">Geometry - Period 3</h3>
                <p className="text-sm text-gray-600">Room 201 • 11:00 - 11:50 AM</p>
              </div>
              <Badge variant="outline">Upcoming</Badge>
            </div>
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
            <MessageSquare className="w-5 h-5 text-brand-orange" />
            Live Student Feedback
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800">Understanding</h3>
              <p className="text-2xl font-bold text-green-600">4.2/5</p>
              <div className="flex mt-2">
                {[1, 2, 3, 4].map((star) => (
                  <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
                <Star className="w-4 h-4 text-gray-300" />
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800">Interest</h3>
              <p className="text-2xl font-bold text-blue-600">3.8/5</p>
              <div className="flex mt-2">
                {[1, 2, 3].map((star) => (
                  <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
                {[4, 5].map((star) => (
                  <Star key={star} className="w-4 h-4 text-gray-300" />
                ))}
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-purple-800">Growth</h3>
              <p className="text-2xl font-bold text-purple-600">4.5/5</p>
              <div className="flex mt-2">
                {[1, 2, 3, 4].map((star) => (
                  <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Recent Comments:</h4>
            <div className="space-y-2">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700">"The examples really helped me understand quadratic functions better!" - Emma S.</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700">"Could you go slower through the factoring steps?" - Anonymous</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700">"I love how you connect math to real-world problems!" - Mike R.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brand-teal" />
            Student Performance Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Class Performance Trends</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Understanding</span>
                  <div className="flex items-center gap-2">
                    <Progress value={84} className="w-20" />
                    <span className="text-sm font-medium">84%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Interest</span>
                  <div className="flex items-center gap-2">
                    <Progress value={76} className="w-20" />
                    <span className="text-sm font-medium">76%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Growth</span>
                  <div className="flex items-center gap-2">
                    <Progress value={90} className="w-20" />
                    <span className="text-sm font-medium">90%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Top Performing Topics</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                  <span className="text-sm">Linear Equations</span>
                  <Badge className="bg-green-100 text-green-800">4.6/5</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                  <span className="text-sm">Graphing</span>
                  <Badge className="bg-blue-100 text-blue-800">4.3/5</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                  <span className="text-sm">Factoring</span>
                  <Badge className="bg-yellow-100 text-yellow-800">3.8/5</Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-brand-teal/5 p-4 rounded-lg border border-brand-teal/20">
            <h4 className="font-semibold text-brand-dark mb-2">AI Insights</h4>
            <p className="text-sm text-gray-700">
              "Students are showing strong improvement in problem-solving skills. Consider introducing more challenging word problems to maintain engagement."
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderWellness = () => (
    <div className="space-y-6">
      <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-brand-orange" />
            Student Wellness Monitor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
              <h3 className="font-semibold text-green-800">Positive</h3>
              <p className="text-2xl font-bold text-green-600">78%</p>
              <p className="text-xs text-green-600">Students feeling good</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-center">
              <h3 className="font-semibold text-yellow-800">Neutral</h3>
              <p className="text-2xl font-bold text-yellow-600">18%</p>
              <p className="text-xs text-yellow-600">Average mood</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-center">
              <h3 className="font-semibold text-red-800">Needs Support</h3>
              <p className="text-2xl font-bold text-red-600">4%</p>
              <p className="text-xs text-red-600">Require attention</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Recent Wellness Alerts:</h4>
            <div className="space-y-2">
              <div className="border border-orange-200 rounded-lg p-3 bg-orange-50/30">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-brand-dark">Student - Sarah M.</span>
                  <Badge variant="secondary">Medium Priority</Badge>
                </div>
                <p className="text-sm text-gray-700">"Feeling overwhelmed with upcoming exams and having trouble sleeping."</p>
              </div>
              
              <div className="border border-red-200 rounded-lg p-3 bg-red-50/30">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-brand-dark">Anonymous Student</span>
                  <Badge variant="destructive">High Priority</Badge>
                </div>
                <p className="text-sm text-gray-700">"Struggling with social anxiety and finding it hard to participate in class."</p>
              </div>
            </div>
          </div>

          <Button className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white">
            Contact School Counselor
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const getCurrentComponent = () => {
    switch (steps[currentStep].component) {
      case "dashboard": return renderDashboard();
      case "feedback": return renderFeedback();
      case "analytics": return renderAnalytics();
      case "wellness": return renderWellness();
      default: return renderDashboard();
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-brand-dark">Teacher Experience Demo</h3>
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

export default TeacherSimulation;
