
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users,
  BarChart3,
  Settings,
  UserPlus,
  TrendingUp,
  Calendar,
  AlertTriangle,
  School,
  Shield,
  FileText
} from "lucide-react";

interface AdminSimulationProps {
  isPlaying: boolean;
}

const AdminSimulation: React.FC<AdminSimulationProps> = ({ isPlaying }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = [
    {
      title: "Admin Dashboard",
      description: "School administrator views comprehensive school overview and key metrics",
      component: "dashboard"
    },
    {
      title: "Teacher Management",
      description: "Administrator manages teacher accounts and invites new staff members",
      component: "teachers"
    },
    {
      title: "School Analytics",
      description: "Administrator analyzes school-wide performance and feedback trends",
      component: "analytics"
    },
    {
      title: "System Settings",
      description: "Administrator configures school settings and compliance features",
      component: "settings"
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
          <h1 className="text-3xl font-bold mb-2">Welcome, Dr. Williams!</h1>
          <p className="text-xl text-white/90 mb-2">Lincoln High School - Principal</p>
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            Managing 1,247 students & 78 teachers
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
                <p className="text-2xl font-bold text-brand-dark">1,247</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-orange/10 rounded-lg flex items-center justify-center">
                <School className="w-6 h-6 text-brand-orange" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Teachers</p>
                <p className="text-2xl font-bold text-brand-dark">78</p>
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
                <p className="text-sm text-gray-600">School Rating</p>
                <p className="text-2xl font-bold text-brand-dark">4.6/5</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Weekly Feedback</p>
                <p className="text-2xl font-bold text-brand-dark">2,341</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-teal" />
              Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Student Engagement</span>
                <div className="flex items-center gap-2">
                  <Progress value={87} className="w-20" />
                  <span className="text-sm font-medium">87%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Teacher Satisfaction</span>
                <div className="flex items-center gap-2">
                  <Progress value={92} className="w-20" />
                  <span className="text-sm font-medium">92%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">System Utilization</span>
                <div className="flex items-center gap-2">
                  <Progress value={78} className="w-20" />
                  <span className="text-sm font-medium">78%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-brand-orange" />
              Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-yellow-50 rounded border border-yellow-200">
                <span className="text-sm">New teacher pending approval</span>
                <Badge className="bg-yellow-100 text-yellow-800">1</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-200">
                <span className="text-sm">System update available</span>
                <Badge className="bg-blue-100 text-blue-800">New</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                <span className="text-sm">Compliance check passed</span>
                <Badge className="bg-green-100 text-green-800">✓</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderTeachers = () => (
    <div className="space-y-6">
      <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-teal" />
            Teacher Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold">Active Teachers (78)</h4>
            <Button className="bg-brand-teal hover:bg-brand-dark text-white">
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Teacher
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-teal rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">SJ</span>
                </div>
                <div>
                  <h3 className="font-semibold">Sarah Johnson</h3>
                  <p className="text-sm text-gray-600">Mathematics • 5 years</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800">Active</Badge>
                <Button variant="outline" size="sm">Manage</Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-orange rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">MW</span>
                </div>
                <div>
                  <h3 className="font-semibold">Michael Williams</h3>
                  <p className="text-sm text-gray-600">English Literature • 8 years</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800">Active</Badge>
                <Button variant="outline" size="sm">Manage</Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">ER</span>
                </div>
                <div>
                  <h3 className="font-semibold">Emily Rodriguez</h3>
                  <p className="text-sm text-gray-600">Science • Pending Approval</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                <Button variant="outline" size="sm" className="border-yellow-300">Approve</Button>
              </div>
            </div>
          </div>

          <div className="bg-brand-teal/5 p-4 rounded-lg border border-brand-teal/20">
            <h4 className="font-semibold text-brand-dark mb-2">Invite New Teacher</h4>
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Email address" className="px-3 py-2 border rounded-lg text-sm" />
              <select className="px-3 py-2 border rounded-lg text-sm">
                <option>Select Subject</option>
                <option>Mathematics</option>
                <option>English</option>
                <option>Science</option>
                <option>History</option>
              </select>
            </div>
            <Button className="mt-3 bg-brand-teal hover:bg-brand-dark text-white">
              Send Invitation
            </Button>
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
            <BarChart3 className="w-5 h-5 text-brand-orange" />
            School-wide Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Department Performance</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                  <span className="text-sm">Mathematics</span>
                  <Badge className="bg-green-100 text-green-800">4.7/5</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                  <span className="text-sm">English</span>
                  <Badge className="bg-blue-100 text-blue-800">4.5/5</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                  <span className="text-sm">Science</span>
                  <Badge className="bg-purple-100 text-purple-800">4.3/5</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                  <span className="text-sm">History</span>
                  <Badge className="bg-yellow-100 text-yellow-800">4.1/5</Badge>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Monthly Trends</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Student Engagement</span>
                  <div className="flex items-center gap-2">
                    <Progress value={89} className="w-20" />
                    <span className="text-sm font-medium text-green-600">+5%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Feedback Response Rate</span>
                  <div className="flex items-center gap-2">
                    <Progress value={76} className="w-20" />
                    <span className="text-sm font-medium text-blue-600">+2%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Teacher Satisfaction</span>
                  <div className="flex items-center gap-2">
                    <Progress value={94} className="w-20" />
                    <span className="text-sm font-medium text-green-600">+3%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-brand-orange/5 p-4 rounded-lg border border-brand-orange/20">
            <h4 className="font-semibold text-brand-dark mb-2">AI School Insights</h4>
            <p className="text-sm text-gray-700 mb-2">
              "Overall school performance is trending positively. Mathematics department shows exceptional engagement. 
              Consider expanding successful teaching methods to other departments."
            </p>
            <Button variant="outline" size="sm" className="border-brand-orange text-brand-orange">
              View Detailed Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-brand-teal" />
            School Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">General Settings</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div>
                    <h5 className="font-medium">Anonymous Feedback</h5>
                    <p className="text-sm text-gray-600">Allow students to submit anonymous feedback</p>
                  </div>
                  <div className="w-12 h-6 bg-brand-teal rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div>
                    <h5 className="font-medium">Real-time Notifications</h5>
                    <p className="text-sm text-gray-600">Instant alerts for wellness concerns</p>
                  </div>
                  <div className="w-12 h-6 bg-brand-teal rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Compliance & Security</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <div>
                      <h5 className="font-medium text-green-800">FERPA Compliance</h5>
                      <p className="text-sm text-green-600">Active & Monitored</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">✓ Active</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <div>
                      <h5 className="font-medium text-blue-800">Data Encryption</h5>
                      <p className="text-sm text-blue-600">256-bit AES Encryption</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">✓ Secure</Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-3">School Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">School Name</label>
                <input value="Lincoln High School" className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Academic Year</label>
                <select className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option>2024-2025</option>
                  <option>2025-2026</option>
                </select>
              </div>
            </div>
            <Button className="mt-4 bg-brand-teal hover:bg-brand-dark text-white">
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const getCurrentComponent = () => {
    switch (steps[currentStep].component) {
      case "dashboard": return renderDashboard();
      case "teachers": return renderTeachers();
      case "analytics": return renderAnalytics();
      case "settings": return renderSettings();
      default: return renderDashboard();
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-brand-dark">School Administrator Demo</h3>
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

export default AdminSimulation;
