
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  PlayIcon,
  PauseIcon,
  RotateCcwIcon,
  BarChart3Icon,
  TrendingUpIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  UsersIcon,
  HeartIcon,
  FileTextIcon,
  CalendarIcon,
  ClockIcon
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const TeacherSimulation = () => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const totalSteps = 8;

  const simulationSteps = [
    { id: 1, name: t('demo.features.teacher.1') },
    { id: 2, name: t('demo.features.teacher.2') },
    { id: 3, name: t('demo.features.teacher.3') },
    { id: 4, name: t('demo.features.teacher.4') },
    { id: 5, name: t('demo.features.teacher.5') },
    { id: 6, name: t('demo.features.teacher.6') },
    { id: 7, name: t('demo.features.teacher.7') },
    { id: 8, name: t('demo.features.teacher.8') }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStep(prev => prev < totalSteps ? prev + 1 : 1);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, totalSteps]);

  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId);
  };

  const getCurrentStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="bg-white p-6 rounded-lg shadow-lg border">
            <h3 className="text-lg font-semibold mb-4">Teacher Dashboard Overview</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <UsersIcon className="w-8 h-8 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold text-blue-600">142</div>
                    <div className="text-sm text-blue-800">Total Students</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUpIcon className="w-8 h-8 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold text-green-600">87%</div>
                    <div className="text-sm text-green-800">Avg. Understanding</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangleIcon className="w-8 h-8 text-red-600" />
                  <div>
                    <div className="text-2xl font-bold text-red-600">3</div>
                    <div className="text-sm text-red-800">Students Need Support</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Recent Class Performance</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">Mathematics - Algebra II</span>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-700">4.2★</Badge>
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="font-medium">Chemistry - Lab Work</span>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-yellow-100 text-yellow-700">3.8★</Badge>
                    <AlertTriangleIcon className="w-4 h-4 text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="bg-white p-6 rounded-lg shadow-lg border">
            <h3 className="text-lg font-semibold mb-4">Real-time Class Activity Monitoring</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <BarChart3Icon className="w-6 h-6 text-blue-600 mb-2" />
                <div className="text-lg font-bold text-blue-600">Mathematics Class</div>
                <div className="text-sm text-blue-800">28 students active</div>
                <div className="mt-2">
                  <div className="text-xs text-gray-600">Understanding Level</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '85%'}}></div>
                  </div>
                  <div className="text-xs text-right text-gray-600">85%</div>
                </div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <BarChart3Icon className="w-6 h-6 text-purple-600 mb-2" />
                <div className="text-lg font-bold text-purple-600">Chemistry Class</div>
                <div className="text-sm text-purple-800">24 students active</div>
                <div className="mt-2">
                  <div className="text-xs text-gray-600">Understanding Level</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div className="bg-purple-600 h-2 rounded-full" style={{width: '78%'}}></div>
                  </div>
                  <div className="text-xs text-right text-gray-600">78%</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Live Student Feedback</h4>
              <div className="space-y-1">
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                  <span>Emma K. - Math feedback</span>
                  <Badge className="bg-green-100 text-green-700 text-xs">5★</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                  <span>John S. - Chemistry feedback</span>
                  <Badge className="bg-yellow-100 text-yellow-700 text-xs">3★</Badge>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="bg-white p-6 rounded-lg shadow-lg border">
            <h3 className="text-lg font-semibold mb-4">Mental Health Alert System</h3>
            
            <div className="space-y-3">
              <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangleIcon className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-red-800">High Priority Alert</span>
                </div>
                <div className="text-sm text-red-700">
                  <div className="font-medium">Alex M. - Struggling with Algebra concepts</div>
                  <div className="text-xs mt-1">Consistently low understanding scores (2.1/5)</div>
                </div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                <div className="flex items-center gap-2 mb-2">
                  <HeartIcon className="w-5 h-5 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Well-being Concern</span>
                </div>
                <div className="text-sm text-yellow-700">
                  <div className="font-medium">Sarah L. - Mood declining over past week</div>
                  <div className="text-xs mt-1">Recommend check-in with counselor</div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUpIcon className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-800">Positive Trend</span>
                </div>
                <div className="text-sm text-blue-700">
                  <div className="font-medium">Maria G. - Significant improvement</div>
                  <div className="text-xs mt-1">Understanding increased from 3.2 to 4.8</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="bg-white p-6 rounded-lg shadow-lg border">
            <h3 className="text-lg font-semibold mb-4">Student Mood & Emotional State Tracking</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl">😊</div>
                  <div className="text-sm font-medium">Happy</div>
                  <div className="text-lg font-bold text-green-600">65%</div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl">😐</div>
                  <div className="text-sm font-medium">Neutral</div>
                  <div className="text-lg font-bold text-gray-600">25%</div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-yellow-50 p-3 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl">😰</div>
                  <div className="text-sm font-medium">Stressed</div>
                  <div className="text-lg font-bold text-yellow-600">8%</div>
                </div>
              </div>
              
              <div className="bg-red-50 p-3 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl">😢</div>
                  <div className="text-sm font-medium">Sad</div>
                  <div className="text-lg font-bold text-red-600">2%</div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-800">Class Mood Trend</div>
              <div className="text-xs text-blue-600">Overall positive trend over past week (+12%)</div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="bg-white p-6 rounded-lg shadow-lg border">
            <h3 className="text-lg font-semibold mb-4">Individual Student Feedback Analysis</h3>
            
            <div className="space-y-3">
              <div className="border rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Emma Thompson</span>
                  <Badge className="bg-green-100 text-green-700">Excellent</Badge>
                </div>
                <div className="text-sm text-gray-600">
                  <div>Understanding: 4.8/5 | Engagement: High</div>
                  <div className="text-xs mt-1">Consistently provides thoughtful feedback</div>
                </div>
              </div>
              
              <div className="border rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">David Kim</span>
                  <Badge className="bg-yellow-100 text-yellow-700">Needs Support</Badge>
                </div>
                <div className="text-sm text-gray-600">
                  <div>Understanding: 2.8/5 | Engagement: Medium</div>
                  <div className="text-xs mt-1">May benefit from additional explanations</div>
                </div>
              </div>
              
              <div className="border rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Lisa Chang</span>
                  <Badge className="bg-blue-100 text-blue-700">Good Progress</Badge>
                </div>
                <div className="text-sm text-gray-600">
                  <div>Understanding: 4.1/5 | Engagement: High</div>
                  <div className="text-xs mt-1">Shows steady improvement</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="bg-white p-6 rounded-lg shadow-lg border">
            <h3 className="text-lg font-semibold mb-4">Action Planning Based on Student Needs</h3>
            
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileTextIcon className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-800">Recommended Actions</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Schedule one-on-one session with Alex M.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>Create additional practice materials for Algebra</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Acknowledge Emma's excellent progress</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="font-medium text-purple-800 mb-2">Upcoming Tasks</div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Review David's homework</span>
                    <span className="text-xs text-gray-500">Today</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Prepare extra materials</span>
                    <span className="text-xs text-gray-500">Tomorrow</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Parent conference with Alex</span>
                    <span className="text-xs text-gray-500">Friday</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="bg-white p-6 rounded-lg shadow-lg border">
            <h3 className="text-lg font-semibold mb-4">Weekly Activity Trends Analysis</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUpIcon className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">Positive Trends</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div>• Overall understanding: +5%</div>
                  <div>• Student engagement: +12%</div>
                  <div>• Lesson satisfaction: +8%</div>
                </div>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangleIcon className="w-5 h-5 text-orange-600" />
                  <span className="font-medium text-orange-800">Areas for Focus</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div>• Complex problem solving</div>
                  <div>• Group work dynamics</div>
                  <div>• Homework completion rates</div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-800">Weekly Summary</div>
              <div className="text-xs text-blue-600 mt-1">
                Students show strong progress in basic concepts but need additional support with advanced applications.
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="bg-white p-6 rounded-lg shadow-lg border">
            <h3 className="text-lg font-semibold mb-4">Lesson Improvement Planning</h3>
            
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarIcon className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-800">Next Lesson Suggestions</span>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Mathematics - Quadratic Equations</div>
                  <div className="text-xs text-gray-600 mt-1">
                    Focus on visual representations based on student feedback
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="font-medium text-green-800 mb-2">Recommended Activities</div>
                <div className="space-y-1 text-sm">
                  <div>• Interactive graphing exercises</div>
                  <div>• Peer problem-solving sessions</div>
                  <div>• Real-world application examples</div>
                </div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="font-medium text-yellow-800 mb-2">Support Materials Needed</div>
                <div className="space-y-1 text-sm">
                  <div>• Visual aids for struggling students</div>
                  <div>• Advanced problems for high achievers</div>
                  <div>• Group activity worksheets</div>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="bg-white p-6 rounded-lg shadow-lg border">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3Icon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Teacher Analytics Dashboard
              </h3>
              <p className="text-gray-600 text-sm">
                Teachers analyze student performance and well-being data
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {t('demo.simulation.teacher.title')}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-2"
              >
                {isPlaying ? (
                  <>
                    <PauseIcon className="w-4 h-4" />
                    {t('demo.simulation.pause')}
                  </>
                ) : (
                  <>
                    <PlayIcon className="w-4 h-4" />
                    {t('demo.simulation.play')}
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-2"
              >
                <RotateCcwIcon className="w-4 h-4" />
                {t('demo.simulation.reset')}
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{t('demo.simulation.step')} {currentStep} {t('demo.simulation.of')} {totalSteps}</span>
            <span>Step {currentStep}: Teacher Dashboard</span>
          </div>
          <Progress value={(currentStep / totalSteps) * 100} className="mt-2" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
            {simulationSteps.map((step, index) => (
              <Button
                key={step.id}
                variant={currentStep === step.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleStepClick(step.id)}
                className="text-xs p-2 h-auto"
              >
                <div className="text-center">
                  <div>{step.id}. Step {index + 1}</div>
                </div>
              </Button>
            ))}
          </div>
          
          {getCurrentStepContent()}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherSimulation;
