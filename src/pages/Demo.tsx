
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpenIcon, PlayIcon, Users, MessageCircle, TrendingUp, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Demo = () => {
  const [activeDemo, setActiveDemo] = useState('feedback');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <BookOpenIcon className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">LessonLens</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/pricing" className="text-gray-600 hover:text-blue-600 transition-colors">
              Pricing
            </Link>
            <Link to="/teacher-login">
              <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            See LessonLens in Action
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore how our platform transforms education through interactive demos of our key features.
          </p>
        </div>

        <Tabs value={activeDemo} onValueChange={setActiveDemo} className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="feedback">Feedback System</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="mental-health">Mental Health</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          </TabsList>

          <TabsContent value="feedback" className="mt-8">
            <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                  Real-time Feedback Collection
                </CardTitle>
                <CardDescription>
                  See how students can provide instant feedback during lessons
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 rounded-lg p-8 mb-6">
                  <div className="text-center text-gray-500 mb-4">
                    <PlayIcon className="w-16 h-16 mx-auto mb-2" />
                    Interactive Demo Placeholder
                  </div>
                  <p className="text-sm text-gray-600 text-center">
                    This would show a live demo of the feedback form interface
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Key Features:</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Anonymous feedback options</li>
                      <li>• Real-time submission</li>
                      <li>• Multiple question types</li>
                      <li>• Instant teacher notifications</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Benefits:</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Improve lesson quality immediately</li>
                      <li>• Encourage student participation</li>
                      <li>• Track engagement over time</li>
                      <li>• Data-driven teaching decisions</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-8">
            <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  Advanced Analytics Dashboard
                </CardTitle>
                <CardDescription>
                  Powerful insights to improve your teaching effectiveness
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 rounded-lg p-8 mb-6">
                  <div className="text-center text-gray-500 mb-4">
                    <TrendingUp className="w-16 h-16 mx-auto mb-2" />
                    Analytics Demo Placeholder
                  </div>
                  <p className="text-sm text-gray-600 text-center">
                    This would show interactive charts and graphs
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Analytics Include:</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Engagement trends over time</li>
                      <li>• Subject-specific performance</li>
                      <li>• Student satisfaction scores</li>
                      <li>• Class participation rates</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Insights Help You:</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Identify struggling students</li>
                      <li>• Optimize lesson plans</li>
                      <li>• Track improvement over time</li>
                      <li>• Make data-driven decisions</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mental-health" className="mt-8">
            <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-6 h-6 text-red-500" />
                  Mental Health Monitoring
                </CardTitle>
                <CardDescription>
                  AI-powered detection and professional support system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 rounded-lg p-8 mb-6">
                  <div className="text-center text-gray-500 mb-4">
                    <Heart className="w-16 h-16 mx-auto mb-2" />
                    Mental Health Demo Placeholder
                  </div>
                  <p className="text-sm text-gray-600 text-center">
                    This would show the alert system and support interface
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Detection Features:</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Natural language processing</li>
                      <li>• Sentiment analysis</li>
                      <li>• Risk level assessment</li>
                      <li>• Automatic alert generation</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Support System:</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Immediate professional alerts</li>
                      <li>• Secure communication channels</li>
                      <li>• Crisis intervention protocols</li>
                      <li>• Follow-up tracking</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dashboard" className="mt-8">
            <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-6 h-6 text-purple-600" />
                  Unified Dashboard Experience
                </CardTitle>
                <CardDescription>
                  Everything you need in one comprehensive interface
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 rounded-lg p-8 mb-6">
                  <div className="text-center text-gray-500 mb-4">
                    <Users className="w-16 h-16 mx-auto mb-2" />
                    Dashboard Demo Placeholder
                  </div>
                  <p className="text-sm text-gray-600 text-center">
                    This would show the complete dashboard interface
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Teacher Dashboard:</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Class overview and schedules</li>
                      <li>• Real-time feedback monitoring</li>
                      <li>• Student progress tracking</li>
                      <li>• Mental health alerts</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Student Interface:</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Simple feedback submission</li>
                      <li>• Progress tracking</li>
                      <li>• Anonymous support options</li>
                      <li>• Personalized insights</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-600 mb-6">
            Experience these features in your own classroom today.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/teacher-login">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Start Free Trial
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Demo;
