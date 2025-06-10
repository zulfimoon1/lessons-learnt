
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpenIcon, ShieldIcon, Users, TrendingUp, Heart, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Index = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BookOpenIcon className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">LessonLens</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/pricing" className="text-gray-600 hover:text-blue-600 transition-colors">
              Pricing
            </Link>
            <Link to="/teacher-login">
              <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                Teacher Login
              </Button>
            </Link>
            <Link to="/student-login">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Student Login
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Transform Your Classroom with
            <span className="text-blue-600"> AI-Powered Insights</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            LessonLens helps teachers and students create better learning experiences through 
            real-time feedback, mental health monitoring, and intelligent analytics.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/student-login">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8 py-3">
                Get Started Free
              </Button>
            </Link>
            <Link to="/demo">
              <Button size="lg" variant="outline" className="px-8 py-3">
                View Demo
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <MessageCircle className="w-12 h-12 text-blue-600 mb-4" />
              <CardTitle>Real-time Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                Collect instant feedback from students during and after lessons to improve teaching effectiveness.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <Heart className="w-12 h-12 text-red-500 mb-4" />
              <CardTitle>Mental Health Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                AI-powered detection of mental health concerns with automatic alerts to qualified professionals.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <TrendingUp className="w-12 h-12 text-green-600 mb-4" />
              <CardTitle>Analytics Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                Comprehensive insights and trends to help educators make data-driven decisions.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-12 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Teaching?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of educators who are already using LessonLens to create better learning experiences.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/teacher-login">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 px-8 py-3">
                Start Teaching Better
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline" className="px-8 py-3">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
