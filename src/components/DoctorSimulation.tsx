
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Heart,
  MessageCircle,
  AlertTriangle,
  Stethoscope,
  Shield,
  Eye,
  Calendar,
  User,
  Clock,
  Activity
} from "lucide-react";

interface DoctorSimulationProps {
  isPlaying: boolean;
}

const DoctorSimulation: React.FC<DoctorSimulationProps> = ({ isPlaying }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = [
    {
      title: "Medical Dashboard",
      description: "Doctor views student wellness overview and mental health alerts requiring attention",
      component: "dashboard"
    },
    {
      title: "Wellness Monitoring",
      description: "Doctor reviews student wellness check-ins and identifies support needs",
      component: "wellness"
    },
    {
      title: "Live Chat Support",
      description: "Doctor provides real-time support through secure chat with students",
      component: "chat"
    },
    {
      title: "Health Reports",
      description: "Doctor generates confidential health reports and recommendations",
      component: "reports"
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
          <h1 className="text-3xl font-bold mb-2">Welcome, Dr. Martinez!</h1>
          <p className="text-xl text-white/90 mb-2">Lincoln High School - School Doctor</p>
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            Ready to support student health
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-teal/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-brand-teal" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Weekly Summaries</p>
                <p className="text-2xl font-bold text-brand-dark">47</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-orange/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-brand-orange" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Mental Health Alerts</p>
                <p className="text-2xl font-bold text-brand-dark">8</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Unreviewed</p>
                <p className="text-2xl font-bold text-red-600">3</p>
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
                <p className="text-sm text-gray-600">High Risk</p>
                <p className="text-2xl font-bold text-red-600">2</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-brand-orange" />
            Mental Health Alerts - Requiring Attention
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border border-red-200 rounded-lg p-4 bg-red-50/30">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-brand-dark">Sarah Chen</h3>
                  <Badge variant="destructive">High Risk</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Grade 11
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    2 hours ago
                  </span>
                </div>
              </div>
              <Button size="sm" variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
                <Eye className="w-4 h-4 mr-2" />
                Review
              </Button>
            </div>
            <div className="bg-red-100/50 p-3 rounded border-l-4 border-red-300">
              <p className="text-sm text-red-800">
                "Feeling overwhelming anxiety about college applications. Having panic attacks and trouble sleeping for the past week."
              </p>
            </div>
          </div>

          <div className="border border-orange-200 rounded-lg p-4 bg-orange-50/30">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-brand-dark">Anonymous Student</h3>
                  <Badge variant="secondary">Medium Risk</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Grade 9
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    5 hours ago
                  </span>
                </div>
              </div>
              <Button size="sm" variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
                <Eye className="w-4 h-4 mr-2" />
                Review
              </Button>
            </div>
            <div className="bg-orange-100/50 p-3 rounded border-l-4 border-orange-300">
              <p className="text-sm text-orange-800">
                "Been feeling really down lately. Friends don't seem to understand me and I feel isolated at school."
              </p>
            </div>
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
          <p className="text-sm text-gray-600">
            Recent wellness check-ins requiring medical attention (5 entries)
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-brand-dark">Emma Johnson</span>
                  <Badge variant="outline" className="text-xs">9th</Badge>
                  <Badge variant="destructive" className="text-xs">High Priority</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500">30 minutes ago</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Terrible</Badge>
              </div>
              
              <div className="bg-red-50 p-3 rounded border-l-4 border-red-300">
                <p className="text-sm text-gray-700">"Really struggling with bullying issues and feeling isolated"</p>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-brand-dark">Michael Chen</span>
                  <Badge variant="outline" className="text-xs">10th</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500">2 hours ago</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-yellow-500" />
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Okay</Badge>
              </div>
              
              <div className="bg-gray-50 p-3 rounded border-l-4 border-brand-teal">
                <p className="text-sm text-gray-700">"A bit worried about upcoming exams but trying to stay positive"</p>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-brand-dark">Sarah Wilson</span>
                  <Badge variant="outline" className="text-xs">11th</Badge>
                  <Badge variant="secondary" className="text-xs">Medium Priority</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500">4 hours ago</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">Poor</Badge>
              </div>
              
              <div className="bg-orange-50 p-3 rounded border-l-4 border-orange-300">
                <p className="text-sm text-gray-700">"Having trouble sleeping and feeling anxious about college applications"</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderChat = () => (
    <div className="space-y-6">
      <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-brand-orange" />
            Live Chat Dashboard - Medical Support
          </CardTitle>
          <p className="text-sm text-gray-600">
            Manage student chat sessions and provide medical guidance
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Waiting Sessions */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Students Waiting (2)
              </h3>
              <div className="space-y-3">
                <Card className="border-orange-200 bg-orange-50/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span className="font-medium">Anonymous Student</span>
                        <Badge variant="secondary">Anonymous</Badge>
                      </div>
                      <Badge variant="outline">11th</Badge>
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      Waiting since: 15 minutes ago
                    </div>
                    <Button className="w-full bg-green-600 hover:bg-green-700" size="sm">
                      <Stethoscope className="w-4 h-4 mr-2" />
                      Provide Support
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-orange-200 bg-orange-50/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span className="font-medium">Jamie Peterson</span>
                      </div>
                      <Badge variant="outline">9th</Badge>
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      Waiting since: 8 minutes ago
                    </div>
                    <Button className="w-full bg-green-600 hover:bg-green-700" size="sm">
                      <Stethoscope className="w-4 h-4 mr-2" />
                      Provide Support
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Active Sessions */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Stethoscope className="w-4 h-4" />
                Your Active Sessions (1)
              </h3>
              <div className="space-y-3">
                <Card className="border-green-200 bg-green-50/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span className="font-medium">Sarah Chen</span>
                      </div>
                      <Badge variant="outline">11th</Badge>
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      Started: 10 minutes ago
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700" size="sm">
                      Continue Session
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Chat Preview */}
          <div className="mt-6 bg-gray-50 p-4 rounded-lg border">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-600" />
              Secure Chat Preview
            </h4>
            <div className="space-y-2 text-sm">
              <div className="bg-blue-100 p-2 rounded-lg">
                <strong>Dr. Martinez:</strong> "Hello Sarah, I'm here to support you. Can you tell me more about what's been causing your anxiety?"
              </div>
              <div className="bg-white p-2 rounded-lg">
                <strong>Sarah:</strong> "Thank you doctor. I've been having trouble sleeping and feeling overwhelmed with college prep..."
              </div>
              <div className="bg-blue-100 p-2 rounded-lg">
                <strong>Dr. Martinez:</strong> "That sounds very stressful. Let's work through some coping strategies together..."
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-brand-teal" />
            Health Reports & Recommendations
          </CardTitle>
          <p className="text-sm text-gray-600">
            Generate confidential health reports and intervention recommendations
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Weekly Health Summary</h4>
              <div className="space-y-3">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h5 className="font-medium text-green-800 mb-2">Students in Good Health</h5>
                  <p className="text-2xl font-bold text-green-600">1,189 (95.3%)</p>
                  <p className="text-sm text-green-600">No immediate concerns</p>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h5 className="font-medium text-yellow-800 mb-2">Monitoring Required</h5>
                  <p className="text-2xl font-bold text-yellow-600">42 (3.4%)</p>
                  <p className="text-sm text-yellow-600">Regular check-ins needed</p>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h5 className="font-medium text-red-800 mb-2">Immediate Attention</h5>
                  <p className="text-2xl font-bold text-red-600">16 (1.3%)</p>
                  <p className="text-sm text-red-600">Intervention required</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Recommended Actions</h4>
              <div className="space-y-3">
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <h5 className="font-medium">High Priority Cases</h5>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Schedule individual counseling for 3 students</li>
                    <li>• Parent/guardian notifications for 2 cases</li>
                    <li>• Collaborate with external mental health services</li>
                  </ul>
                </div>
                
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-4 h-4 text-blue-500" />
                    <h5 className="font-medium">Prevention Programs</h5>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Stress management workshops</li>
                    <li>• Peer support group expansion</li>
                    <li>• Teacher wellness training</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-brand-teal/5 p-4 rounded-lg border border-brand-teal/20">
            <h4 className="font-semibold text-brand-dark mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Confidentiality Notice
            </h4>
            <p className="text-sm text-gray-700">
              All health reports are generated in compliance with HIPAA and FERPA regulations. 
              Student privacy is maintained at all times with secure, encrypted data handling.
            </p>
          </div>

          <div className="flex gap-3">
            <Button className="bg-brand-teal hover:bg-brand-dark text-white">
              Generate Weekly Report
            </Button>
            <Button variant="outline" className="border-brand-orange text-brand-orange">
              Export Recommendations
            </Button>
            <Button variant="outline">
              Schedule Follow-ups
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const getCurrentComponent = () => {
    switch (steps[currentStep].component) {
      case "dashboard": return renderDashboard();
      case "wellness": return renderWellness();
      case "chat": return renderChat();
      case "reports": return renderReports();
      default: return renderDashboard();
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-brand-dark">Doctor Experience Demo</h3>
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

export default DoctorSimulation;
