
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Users, BarChart3, Heart, MessageSquare, BookOpen, Star, ChevronRight, Zap, Eye, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePlatformAdmin } from "@/contexts/PlatformAdminContext";
import SecurityStatusIndicator from "@/components/SecurityStatusIndicator";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const Index = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();
  const { teacher, student } = useAuth();
  const { admin } = usePlatformAdmin();

  // If user is already logged in, redirect to appropriate dashboard
  if (teacher) {
    navigate('/teacher-dashboard');
    return null;
  }
  
  if (student) {
    navigate('/student-dashboard');
    return null;
  }

  if (admin) {
    navigate('/platform-admin');
    return null;
  }

  const features = [
    {
      icon: Users,
      title: "Student Wellbeing",
      description: "Monitor and support student mental health with real-time feedback and early intervention systems."
    },
    {
      icon: BarChart3,
      title: "Performance Analytics",
      description: "Comprehensive insights into academic performance with detailed reporting and trend analysis."
    },
    {
      icon: Heart,
      title: "Mental Health Support",
      description: "Professional mental health resources and direct access to qualified school psychologists."
    },
    {
      icon: MessageSquare,
      title: "Real-time Communication",
      description: "Secure messaging platform connecting students, teachers, and mental health professionals."
    },
    {
      icon: BookOpen,
      title: "Educational Resources",
      description: "Curated mental health articles and educational content tailored for different age groups."
    },
    {
      icon: Shield,
      title: "Privacy & Security",
      description: "Bank-level security with end-to-end encryption and GDPR-compliant data protection."
    }
  ];

  const stats = [
    { label: "Schools Protected", value: "1,200+", icon: Shield },
    { label: "Students Supported", value: "50,000+", icon: Users },
    { label: "Mental Health Alerts", value: "2,500+", icon: Heart },
    { label: "Success Rate", value: "96%", icon: Star }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  EduCare Analytics
                </h1>
                <p className="text-xs text-gray-500">Student Wellbeing Platform</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <Link to="/teacher-login">
                <Button variant="outline" size="sm">Teacher Login</Button>
              </Link>
              <Link to="/student-login">
                <Button size="sm">Student Access</Button>
              </Link>
              <Link to="/console">
                <Button variant="ghost" size="sm">
                  <Lock className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-200">
            Trusted by 1,200+ Schools Worldwide
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Protecting Student
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Mental Health
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Advanced AI-powered platform that monitors student wellbeing, detects early warning signs, 
            and connects students with professional mental health support when they need it most.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/demo">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Eye className="w-5 h-5 mr-2" />
                View Live Demo
              </Button>
            </Link>
            <Link to="/how-it-works">
              <Button size="lg" variant="outline">
                Learn More
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Security Status for Development */}
          <div className="flex justify-center mb-8">
            <SecurityStatusIndicator />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/60 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Comprehensive Student Protection</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform combines advanced technology with human expertise to create a safe, 
              supportive environment for every student.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Protect Your Students?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of educators who trust EduCare Analytics to keep their students safe and supported.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/demo">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                <Zap className="w-5 h-5 mr-2" />
                Start Free Trial
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold">EduCare Analytics</span>
              </div>
              <p className="text-gray-400 text-sm">
                Protecting student mental health with advanced technology and compassionate care.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/how-it-works" className="hover:text-white transition-colors">How it Works</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/demo" className="hover:text-white transition-colors">Demo</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Access</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/teacher-login" className="hover:text-white transition-colors">Teacher Portal</Link></li>
                <li><Link to="/student-login" className="hover:text-white transition-colors">Student Access</Link></li>
                <li><Link to="/console" className="hover:text-white transition-colors">Admin Console</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Security</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>GDPR Compliant</li>
                <li>End-to-End Encryption</li>
                <li>SOC 2 Certified</li>
                <li>24/7 Monitoring</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 EduCare Analytics. All rights reserved. Protecting student privacy and wellbeing.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
