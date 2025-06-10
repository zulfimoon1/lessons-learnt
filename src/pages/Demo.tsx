
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  UsersIcon,
  BookOpenIcon,
  HeartIcon,
  MessageCircleIcon,
  BarChart3Icon,
  StarIcon,
  CalendarIcon,
  ClockIcon,
  GraduationCapIcon,
  ArrowLeftIcon,
  PlayCircleIcon,
  PauseCircleIcon,
  TrendingUpIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  SchoolIcon,
  BellIcon,
  SettingsIcon
} from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import StudentSimulation from "@/components/StudentSimulation";

const Demo = () => {
  const { t } = useLanguage();
  const [activeDemo, setActiveDemo] = useState("student-simulation");
  const [isPlaying, setIsPlaying] = useState(true);

  // Complete Teacher Dashboard Demo
  const TeacherDashboardDemo = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6 border">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <BookOpenIcon className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Teacher Dashboard</h3>
              <p className="text-sm text-gray-600">Welcome, Ms. Johnson</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-red-100 text-red-700">3 Alerts</Badge>
            <BellIcon className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">156</div>
            <div className="text-sm text-blue-800">Total Students</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">87%</div>
            <div className="text-sm text-green-800">Avg Understanding</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">4.3★</div>
            <div className="text-sm text-purple-800">Lesson Rating</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-yellow-600">12</div>
            <div className="text-sm text-yellow-800">Need Support</div>
          </div>
        </div>

        {/* Today's Classes */}
        <div className="mb-6">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <ClockIcon className="w-4 h-4" />
            Today's Classes
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-4 bg-blue-50 rounded border-l-4 border-blue-500">
              <div>
                <div className="font-medium">Mathematics - Grade 10A</div>
                <div className="text-sm text-gray-600">9:00 AM - Algebra II</div>
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline">25 students</Badge>
                  <Badge className="bg-green-100 text-green-700">Live</Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">89% Understanding</div>
                <div className="text-xs text-gray-500">23 responses</div>
              </div>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded border-l-4 border-gray-300">
              <div>
                <div className="font-medium">Mathematics - Grade 10B</div>
                <div className="text-sm text-gray-600">11:00 AM - Geometry</div>
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline">22 students</Badge>
                  <Badge variant="outline">Upcoming</Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">Previous: 4.5★</div>
                <div className="text-xs text-gray-500">Last lesson</div>
              </div>
            </div>
          </div>
        </div>

        {/* Student Mood Overview */}
        <div className="mb-6">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <HeartIcon className="w-4 h-4" />
            Class Mood Overview
          </h4>
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-green-50 p-3 rounded text-center">
              <div className="text-lg font-bold text-green-600">😊 65%</div>
              <div className="text-xs text-green-800">Happy</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded text-center">
              <div className="text-lg font-bold text-yellow-600">😐 25%</div>
              <div className="text-xs text-yellow-800">Neutral</div>
            </div>
            <div className="bg-orange-50 p-3 rounded text-center">
              <div className="text-lg font-bold text-orange-600">😟 8%</div>
              <div className="text-xs text-orange-800">Stressed</div>
            </div>
            <div className="bg-red-50 p-3 rounded text-center">
              <div className="text-lg font-bold text-red-600">😔 2%</div>
              <div className="text-xs text-red-800">Need Support</div>
            </div>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="mb-6">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <AlertTriangleIcon className="w-4 h-4" />
            Recent Alerts
          </h4>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded border border-red-200">
              <AlertTriangleIcon className="w-4 h-4 text-red-600" />
              <div className="flex-1">
                <div className="text-sm font-medium">Student showing signs of distress</div>
                <div className="text-xs text-gray-600">Grade 10A - Anonymous student</div>
              </div>
              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">Review</Button>
            </div>
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded border border-yellow-200">
              <AlertTriangleIcon className="w-4 h-4 text-yellow-600" />
              <div className="flex-1">
                <div className="text-sm font-medium">Low understanding in Chemistry</div>
                <div className="text-xs text-gray-600">15 students struggling with today's topic</div>
              </div>
              <Button size="sm" variant="outline">Address</Button>
            </div>
          </div>
        </div>

        {/* Performance Trends */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <TrendingUpIcon className="w-4 h-4" />
            Weekly Performance Trends
          </h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Understanding Level</span>
                <span>87%</span>
              </div>
              <Progress value={87} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Student Engagement</span>
                <span>92%</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Lesson Satisfaction</span>
                <span>94%</span>
              </div>
              <Progress value={94} className="h-2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Enhanced Mental Health Support Demo
  const MentalHealthDemo = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6 border">
        <h3 className="text-lg font-semibold mb-4">Mental Health Support Center</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">Dr. Sarah Wilson - Online</span>
            </div>
            <p className="text-sm text-purple-700">School Psychologist</p>
            <div className="mt-2">
              <Badge className="bg-green-100 text-green-700">Available Now</Badge>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm font-medium">Mr. James Chen - Busy</span>
            </div>
            <p className="text-sm text-blue-700">Counselor</p>
            <div className="mt-2">
              <Badge className="bg-yellow-100 text-yellow-700">Back at 2:00 PM</Badge>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4">
          <p className="text-sm text-blue-800 font-medium">🔒 Complete Privacy Guaranteed</p>
          <p className="text-xs text-blue-600 mt-1">All conversations are confidential and anonymous</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 h-64 mb-4 overflow-y-auto">
          <div className="space-y-3">
            <div className="bg-purple-100 p-3 rounded-lg max-w-xs">
              <p className="text-sm">Hello! This is a safe space for you to share anything that's on your mind. How are you feeling today?</p>
              <span className="text-xs text-gray-500">Dr. Sarah - 2:30 PM</span>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg max-w-xs ml-auto">
              <p className="text-sm">I've been feeling really overwhelmed with schoolwork lately. I can't seem to keep up and it's affecting my sleep.</p>
              <span className="text-xs text-gray-500">Anonymous Student - 2:32 PM</span>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg max-w-xs">
              <p className="text-sm">I understand that feeling overwhelmed can be really challenging. It's completely normal to feel this way sometimes. Would you like to talk about what specific aspects of your schoolwork are causing the most stress?</p>
              <span className="text-xs text-gray-500">Dr. Sarah - 2:33 PM</span>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg max-w-xs ml-auto">
              <p className="text-sm">Mostly the upcoming exams. I feel like no matter how much I study, I'm not retaining the information.</p>
              <span className="text-xs text-gray-500">Anonymous Student - 2:35 PM</span>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg max-w-xs">
              <p className="text-sm">That sounds really frustrating. Let's work on some study strategies that might help you feel more confident. Have you tried breaking your study sessions into smaller chunks?</p>
              <span className="text-xs text-gray-500">Dr. Sarah - 2:36 PM</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex gap-2">
            <input 
              className="flex-1 p-2 border rounded-md text-sm" 
              placeholder="Type your anonymous message..." 
            />
            <Button size="sm">Send</Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button className="bg-purple-600 hover:bg-purple-700">Start Anonymous Chat</Button>
            <Button variant="outline">Book Private Appointment</Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="text-sm">Self-Help Resources</Button>
            <Button variant="outline" className="text-sm">Mood Tracking</Button>
          </div>
          
          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
            <p className="text-xs text-red-700 font-medium">🚨 Crisis Support: If you're in immediate danger, call 988 (24/7 crisis helpline)</p>
          </div>
        </div>
      </div>
    </div>
  );

  const demos = [
    {
      id: "student-simulation",
      title: "Interactive Student Journey",
      description: "Watch a complete simulation of a student's full experience including dashboard and feedback",
      icon: UsersIcon,
      component: <StudentSimulation />
    },
    {
      id: "teacher-dashboard",
      title: "Complete Teacher Dashboard",
      description: "Comprehensive teacher view with analytics, alerts, and class management",
      icon: BarChart3Icon,
      component: <TeacherDashboardDemo />
    },
    {
      id: "mental-health",
      title: "Mental Health Support Center",
      description: "Full mental health support system with counselors and crisis support",
      icon: HeartIcon,
      component: <MentalHealthDemo />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <ArrowLeftIcon className="w-5 h-5" />
                <span>Back to Home</span>
              </Link>
              <div className="h-6 border-l border-gray-300"></div>
              <div className="flex items-center gap-2">
                <GraduationCapIcon className="w-8 h-8 text-primary" />
                <h1 className="text-2xl font-bold">Interactive Platform Demo</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-2"
              >
                {isPlaying ? <PauseCircleIcon className="w-4 h-4" /> : <PlayCircleIcon className="w-4 h-4" />}
                {isPlaying ? "Pause Demo" : "Play Demo"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Introduction */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Interactive Platform Experience
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience how students interact with our platform through an interactive simulation, 
            plus explore comprehensive demos of all platform features.
          </p>
        </div>

        {/* Demo Navigation */}
        <Tabs value={activeDemo} onValueChange={setActiveDemo} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            {demos.map((demo) => (
              <TabsTrigger key={demo.id} value={demo.id} className="flex items-center gap-2">
                <demo.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{demo.title}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {demos.map((demo) => (
            <TabsContent key={demo.id} value={demo.id}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Demo Description */}
                <div>
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <demo.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle>{demo.title}</CardTitle>
                          <p className="text-muted-foreground">{demo.description}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Key Features Shown:</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {demo.id === "student-simulation" && (
                              <>
                                <li>• Complete student dashboard with all features</li>
                                <li>• Step-by-step feedback form completion</li>
                                <li>• Interactive rating system for understanding and interest</li>
                                <li>• Emotional state check-ins</li>
                                <li>• Written feedback submission process</li>
                                <li>• Mental health support widget access</li>
                              </>
                            )}
                            {demo.id === "teacher-dashboard" && (
                              <>
                                <li>• Comprehensive class analytics</li>
                                <li>• Real-time student mood monitoring</li>
                                <li>• Alert system for at-risk students</li>
                                <li>• Performance trend analysis</li>
                                <li>• Multi-class management</li>
                                <li>• Engagement metrics tracking</li>
                              </>
                            )}
                            {demo.id === "mental-health" && (
                              <>
                                <li>• Multiple counselor availability</li>
                                <li>• Anonymous chat system</li>
                                <li>• Crisis support protocols</li>
                                <li>• Self-help resource library</li>
                                <li>• Mood tracking tools</li>
                                <li>• Appointment scheduling</li>
                              </>
                            )}
                          </ul>
                        </div>
                        
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-sm text-blue-800">
                            {demo.id === "student-simulation" ? (
                              <><strong>Interactive Simulation:</strong> Watch a complete student journey from 
                              dashboard login to feedback submission, including access to mental health support.</>
                            ) : (
                              <><strong>Full Integration:</strong> All components work seamlessly together, 
                              sharing data securely while maintaining complete privacy for mental health services.</>
                            )}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Interactive Demo */}
                <div>
                  {demo.component}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Experience the Complete Platform</h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                From interactive student simulations to comprehensive teacher analytics, 
                see how our platform creates a supportive and engaging learning environment.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/teacher-login">
                  <Button size="lg" className="px-8">
                    Start Free Trial
                  </Button>
                </Link>
                <Link to="/student-login">
                  <Button size="lg" variant="outline" className="px-8">
                    Student Access
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Demo;
