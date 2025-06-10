
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  PauseCircleIcon
} from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Demo = () => {
  const { t } = useLanguage();
  const [activeDemo, setActiveDemo] = useState("student-feedback");
  const [isPlaying, setIsPlaying] = useState(true);

  // Student Feedback Demo
  const StudentFeedbackDemo = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6 border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <UsersIcon className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold">Mathematics Lesson Feedback</h3>
          <Badge className="bg-blue-100 text-blue-700">Live Session</Badge>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">How well did you understand today's lesson?</label>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(star => (
                <StarIcon key={star} className="w-6 h-6 fill-yellow-400 text-yellow-400 cursor-pointer" />
              ))}
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">How are you feeling?</label>
            <div className="flex gap-2">
              <Button size="sm" className="bg-green-100 text-green-700 hover:bg-green-200">😊 Happy</Button>
              <Button size="sm" variant="outline">😐 Neutral</Button>
              <Button size="sm" variant="outline">😔 Confused</Button>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">What went well in this lesson?</label>
            <textarea 
              className="w-full p-3 border rounded-md text-sm" 
              placeholder="The examples were clear and helped me understand..."
              rows={3}
              defaultValue="The examples were clear and helped me understand fractions better."
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">What could be improved?</label>
            <textarea 
              className="w-full p-3 border rounded-md text-sm" 
              placeholder="Maybe we could have more practice problems..."
              rows={2}
            />
          </div>
          
          <Button className="w-full">Submit Feedback</Button>
        </div>
      </div>
    </div>
  );

  // Teacher Dashboard Demo
  const TeacherDashboardDemo = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6 border">
        <h3 className="text-lg font-semibold mb-4">Teacher Analytics Dashboard</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">87%</div>
            <div className="text-sm text-blue-800">Average Understanding</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">23</div>
            <div className="text-sm text-green-800">Active Students</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">4.2★</div>
            <div className="text-sm text-purple-800">Lesson Rating</div>
          </div>
        </div>
        
        <div className="space-y-3">
          <h4 className="font-medium">Recent Lessons</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded border-l-4 border-blue-500">
              <div>
                <span className="font-medium">Mathematics - Fractions</span>
                <div className="text-sm text-gray-600">Today, 9:00 AM</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">4.2★</div>
                <div className="text-xs text-gray-500">23 responses</div>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded border-l-4 border-green-500">
              <div>
                <span className="font-medium">Science - Plant Biology</span>
                <div className="text-sm text-gray-600">Yesterday, 2:00 PM</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">4.7★</div>
                <div className="text-xs text-gray-500">25 responses</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Mental Health Support Demo
  const MentalHealthDemo = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6 border">
        <h3 className="text-lg font-semibold mb-4">Anonymous Mental Health Support</h3>
        
        <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium">Dr. Sarah Wilson - Online</span>
          </div>
          <p className="text-sm text-purple-700">School Psychologist available for chat</p>
        </div>
        
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4">
          <p className="text-sm text-blue-800 font-medium">🔒 Your identity is completely protected</p>
          <p className="text-xs text-blue-600 mt-1">All conversations are confidential and anonymous</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 h-48 mb-4 overflow-y-auto">
          <div className="space-y-3">
            <div className="bg-purple-100 p-3 rounded-lg max-w-xs">
              <p className="text-sm">Hello! This is a safe space for you to share anything that's on your mind. How are you feeling today?</p>
              <span className="text-xs text-gray-500">Dr. Sarah - 2:30 PM</span>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg max-w-xs ml-auto">
              <p className="text-sm">I've been feeling really stressed about upcoming exams. I can't seem to focus.</p>
              <span className="text-xs text-gray-500">You - 2:32 PM</span>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg max-w-xs">
              <p className="text-sm">I understand that exam stress can feel overwhelming. Your feelings are completely valid. Let's talk about some strategies that might help you manage this stress.</p>
              <span className="text-xs text-gray-500">Dr. Sarah - 2:33 PM</span>
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
          
          <div className="flex gap-2">
            <Button className="flex-1 bg-purple-600 hover:bg-purple-700">Start Anonymous Chat</Button>
            <Button variant="outline" className="flex-1">Book Appointment</Button>
          </div>
          
          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
            <p className="text-xs text-red-700 font-medium">🚨 Crisis Support: If you're in immediate danger, call 116 123 (24/7 helpline)</p>
          </div>
        </div>
      </div>
    </div>
  );

  const demos = [
    {
      id: "student-feedback",
      title: "Student Feedback Collection",
      description: "Real-time lesson feedback and emotional check-ins",
      icon: UsersIcon,
      component: <StudentFeedbackDemo />
    },
    {
      id: "teacher-dashboard",
      title: "Teacher Analytics Dashboard",
      description: "Comprehensive insights into student engagement and performance",
      icon: BarChart3Icon,
      component: <TeacherDashboardDemo />
    },
    {
      id: "mental-health",
      title: "Mental Health Support",
      description: "Anonymous counseling and psychological support",
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
                <h1 className="text-2xl font-bold">Platform Demo</h1>
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
            Experience Our Platform in Action
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore interactive demos of our key features designed to transform education through student feedback, teacher insights, and mental health support.
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
                          <h4 className="font-semibold mb-2">Key Features:</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {demo.id === "student-feedback" && (
                              <>
                                <li>• Real-time lesson understanding ratings</li>
                                <li>• Emotional state tracking</li>
                                <li>• Anonymous feedback collection</li>
                                <li>• Instant teacher notifications</li>
                              </>
                            )}
                            {demo.id === "teacher-dashboard" && (
                              <>
                                <li>• Student engagement analytics</li>
                                <li>• Lesson performance metrics</li>
                                <li>• Class mood monitoring</li>
                                <li>• Historical trend analysis</li>
                              </>
                            )}
                            {demo.id === "mental-health" && (
                              <>
                                <li>• Anonymous counseling sessions</li>
                                <li>• 24/7 crisis support access</li>
                                <li>• Secure, encrypted communications</li>
                                <li>• Professional mental health staff</li>
                              </>
                            )}
                          </ul>
                        </div>
                        
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Privacy First:</strong> All student data is anonymized and encrypted. 
                            Mental health conversations are completely confidential.
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
              <h3 className="text-2xl font-bold mb-4">Ready to Transform Your School?</h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Join schools worldwide that are already using our platform to improve student outcomes, 
                support mental wellness, and empower educators with actionable insights.
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
