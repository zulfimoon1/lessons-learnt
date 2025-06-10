
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, TrendingUp, Shield, CheckCircle, Star, DollarSign, Calendar, Pause } from 'lucide-react';
import DemoSection from '@/components/DemoSection';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-blue-100 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">LessonLens</span>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => navigate('/enhanced-pricing')}
              variant="outline"
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              Pricing
            </Button>
            <Button 
              onClick={() => navigate('/demo')}
              variant="outline"
              className="border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              Demo
            </Button>
            <Button 
              onClick={() => navigate('/teacher-login')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-800">
            Transform Education Today
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Real-Time Student Feedback &
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}Mental Health Monitoring
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Empower teachers with instant insights into student understanding and wellbeing. 
            Create supportive learning environments with our comprehensive educational platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => navigate('/enhanced-pricing')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6"
            >
              View Pricing - Starting at $7.99
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate('/demo')}
              className="text-lg px-8 py-6 border-2"
            >
              Watch Demo
            </Button>
          </div>
          
          {/* Quick Value Props */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="flex items-center gap-3 justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
              <span className="text-gray-700">From $7.99/month per teacher</span>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
              <span className="text-gray-700">30-day free trial</span>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <Pause className="w-6 h-6 text-purple-600" />
              <span className="text-gray-700">Pause for school holidays</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need for Modern Education
            </h2>
            <p className="text-lg text-gray-600">
              Comprehensive tools for teachers, administrators, and students
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-blue-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="w-12 h-12 text-blue-600 mb-4" />
                <CardTitle className="text-blue-900">Real-Time Feedback</CardTitle>
                <CardDescription>
                  Instant student responses and understanding checks during lessons
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Live polls and quizzes
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Anonymous feedback options
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Instant analytics
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-purple-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="w-12 h-12 text-purple-600 mb-4" />
                <CardTitle className="text-purple-900">Mental Health Monitoring</CardTitle>
                <CardDescription>
                  Early intervention tools for student wellbeing and support
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Mood tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Alert system
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Resource library
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-green-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <TrendingUp className="w-12 h-12 text-green-600 mb-4" />
                <CardTitle className="text-green-900">Advanced Analytics</CardTitle>
                <CardDescription>
                  Comprehensive reporting and insights for data-driven decisions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Performance trends
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Custom reports
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Export capabilities
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <DemoSection />

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Classroom?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of educators already using LessonLens to improve student outcomes
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => navigate('/enhanced-pricing')}
              className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6"
            >
              Start Your Free Trial
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate('/demo')}
              className="border-white text-white hover:bg-white/10 text-lg px-8 py-6"
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">LessonLens</span>
          </div>
          <p className="text-gray-400 mb-6">
            Empowering educators with real-time insights and mental health support tools
          </p>
          <div className="flex justify-center gap-6 text-sm">
            <button onClick={() => navigate('/enhanced-pricing')} className="hover:text-white">
              Pricing
            </button>
            <button onClick={() => navigate('/demo')} className="hover:text-white">
              Demo
            </button>
            <span className="hover:text-white cursor-pointer">Support</span>
            <span className="hover:text-white cursor-pointer">Privacy</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
