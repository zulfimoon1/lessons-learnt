
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  PlayIcon,
  PauseIcon,
  RotateCcwIcon,
  StarIcon,
  CalendarIcon,
  ClockIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  MessageCircleIcon,
  HeartIcon,
  AlertTriangleIcon,
  GraduationCapIcon,
  BellIcon,
  SettingsIcon,
  TrendingUpIcon,
  BarChart3Icon,
  UsersIcon
} from "lucide-react";

interface TeacherSimulationStep {
  id: string;
  title: string;
  description: string;
  duration: number;
  component: React.ReactNode;
}

const TeacherSimulation = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // Simulation steps
  const steps: TeacherSimulationStep[] = [
    {
      id: "teacher-dashboard",
      title: "Teacher Dashboard Login",
      description: "Ms. Johnson logs into her comprehensive teacher dashboard",
      duration: 4000,
      component: <TeacherDashboardStep />
    },
    {
      id: "view-alerts",
      title: "Review Alerts",
      description: "Ms. Johnson checks mental health alerts and class performance warnings",
      duration: 3500,
      component: <ViewAlertsStep />
    },
    {
      id: "class-performance",
      title: "Class Performance Analysis",
      description: "Ms. Johnson reviews today's live class performance metrics",
      duration: 3000,
      component: <ClassPerformanceStep />
    },
    {
      id: "student-mood",
      title: "Student Mood Overview",
      description: "Ms. Johnson examines the emotional state of her students",
      duration: 3000,
      component: <StudentMoodStep />
    },
    {
      id: "individual-feedback",
      title: "Individual Student Feedback",
      description: "Ms. Johnson reviews detailed feedback from individual students",
      duration: 4000,
      component: <IndividualFeedbackStep />
    },
    {
      id: "address-concerns",
      title: "Address Student Concerns",
      description: "Ms. Johnson takes action on students needing support",
      duration: 3500,
      component: <AddressConcernsStep />
    },
    {
      id: "weekly-trends",
      title: "Weekly Performance Trends",
      description: "Ms. Johnson analyzes weekly performance and engagement trends",
      duration: 3000,
      component: <WeeklyTrendsStep />
    },
    {
      id: "plan-improvements",
      title: "Plan Lesson Improvements",
      description: "Ms. Johnson plans improvements based on student feedback",
      duration: 3500,
      component: <PlanImprovementsStep />
    }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && currentStep < steps.length - 1) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setCurrentStep(current => current + 1);
            return 0;
          }
          return prev + (100 / (steps[currentStep].duration / 100));
        });
      }, 100);
    }

    return () => clearInterval(interval);
  }, [isPlaying, currentStep, steps]);

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleReset = () => {
    setCurrentStep(0);
    setProgress(0);
    setIsPlaying(false);
  };

  const handleStepSelect = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    setProgress(0);
    setIsPlaying(false);
  };

  return (
    <div className="space-y-6">
      {/* Simulation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Teacher Journey Simulation</span>
            <div className="flex gap-2">
              <Button
                onClick={handlePlay}
                disabled={isPlaying}
                size="sm"
                className="flex items-center gap-2"
              >
                <PlayIcon className="w-4 h-4" />
                Play
              </Button>
              <Button
                onClick={handlePause}
                disabled={!isPlaying}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                <PauseIcon className="w-4 h-4" />
                Pause
              </Button>
              <Button
                onClick={handleReset}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                <RotateCcwIcon className="w-4 h-4" />
                Reset
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{steps[currentStep].title}</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-gray-600">{steps[currentStep].description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Step Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {steps.map((step, index) => (
              <Button
                key={step.id}
                onClick={() => handleStepSelect(index)}
                size="sm"
                variant={currentStep === index ? "default" : "outline"}
                className="text-xs"
              >
                {index + 1}. {step.title}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Simulation Display */}
      <Card className="min-h-[600px]">
        <CardContent className="p-6">
          {steps[currentStep].component}
        </CardContent>
      </Card>
    </div>
  );
};

// Individual step components
const TeacherDashboardStep = () => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow-lg p-6 border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <BookOpenIcon className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Teacher Dashboard</h3>
            <p className="text-sm text-gray-600">Welcome back, Ms. Johnson</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-red-100 text-red-700">3 Alerts</Badge>
          <BellIcon className="w-5 h-5 text-gray-400" />
          <SettingsIcon className="w-5 h-5 text-gray-400" />
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
        </div>
      </div>
    </div>
  </div>
);

const ViewAlertsStep = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold flex items-center gap-2">
      <AlertTriangleIcon className="w-5 h-5 text-red-500" />
      Recent Alerts - Priority Review
    </h3>
    <div className="space-y-3">
      <div className="flex items-center gap-3 p-4 bg-red-50 rounded border border-red-200 ring-2 ring-red-300 ring-offset-2">
        <AlertTriangleIcon className="w-5 h-5 text-red-600" />
        <div className="flex-1">
          <div className="text-sm font-medium">Student showing signs of distress</div>
          <div className="text-xs text-gray-600">Grade 10A - Anonymous student in Mathematics</div>
          <div className="text-xs text-red-600 mt-1">Click to review and take action</div>
        </div>
        <ArrowRightIcon className="w-4 h-4 text-red-600" />
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
);

const ClassPerformanceStep = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Live Class Performance - Mathematics Grade 10A</h3>
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
      <div className="flex justify-between items-center mb-4">
        <span className="font-medium">Current Lesson: Algebra II - Quadratic Equations</span>
        <Badge className="bg-green-100 text-green-700">Live Now</Badge>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">89%</div>
          <div className="text-sm text-blue-800">Understanding</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">92%</div>
          <div className="text-sm text-green-800">Engagement</div>
        </div>
        <div className="text-2xl font-bold text-purple-600 text-center">
          <div>4.5★</div>
          <div className="text-sm text-purple-800">Interest</div>
        </div>
      </div>
    </div>
    <div className="space-y-2">
      <div className="text-sm font-medium">Real-time Feedback (23/25 responses)</div>
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span>Understanding Level</span>
          <span>89%</span>
        </div>
        <Progress value={89} className="h-2" />
      </div>
    </div>
  </div>
);

const StudentMoodStep = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold flex items-center gap-2">
      <HeartIcon className="w-4 h-4" />
      Class Mood Overview - Mathematics Grade 10A
    </h3>
    <div className="grid grid-cols-4 gap-3">
      <div className="bg-green-50 p-4 rounded text-center border border-green-200">
        <div className="text-xl font-bold text-green-600">😊 65%</div>
        <div className="text-xs text-green-800">Happy</div>
        <div className="text-xs text-gray-600">16 students</div>
      </div>
      <div className="bg-yellow-50 p-4 rounded text-center border border-yellow-200">
        <div className="text-xl font-bold text-yellow-600">😐 25%</div>
        <div className="text-xs text-yellow-800">Neutral</div>
        <div className="text-xs text-gray-600">6 students</div>
      </div>
      <div className="bg-orange-50 p-4 rounded text-center border border-orange-200">
        <div className="text-xl font-bold text-orange-600">😟 8%</div>
        <div className="text-xs text-orange-800">Stressed</div>
        <div className="text-xs text-gray-600">2 students</div>
      </div>
      <div className="bg-red-50 p-4 rounded text-center border border-red-200">
        <div className="text-xl font-bold text-red-600">😔 2%</div>
        <div className="text-xs text-red-800">Need Support</div>
        <div className="text-xs text-gray-600">1 student</div>
      </div>
    </div>
    <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
      <p className="text-sm text-purple-800">
        <HeartIcon className="w-4 h-4 inline mr-1" />
        1 student has been automatically referred to the school counselor for support
      </p>
    </div>
  </div>
);

const IndividualFeedbackStep = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Individual Student Feedback Review</h3>
    <div className="space-y-3">
      <div className="p-4 bg-green-50 rounded border-l-4 border-green-500">
        <div className="flex justify-between items-start mb-2">
          <span className="font-medium">Anonymous Student #1</span>
          <div className="flex gap-1">
            {[1,2,3,4,5].map(star => (
              <StarIcon key={star} className={`w-4 h-4 ${star <= 5 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
            ))}
          </div>
        </div>
        <p className="text-sm text-gray-700 mb-2">"Great explanation of quadratic equations! The real-world examples really helped me understand."</p>
        <div className="text-xs text-green-600">Emotional state: Happy 😊</div>
      </div>
      <div className="p-4 bg-yellow-50 rounded border-l-4 border-yellow-500">
        <div className="flex justify-between items-start mb-2">
          <span className="font-medium">Anonymous Student #2</span>
          <div className="flex gap-1">
            {[1,2,3,4,5].map(star => (
              <StarIcon key={star} className={`w-4 h-4 ${star <= 3 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
            ))}
          </div>
        </div>
        <p className="text-sm text-gray-700 mb-2">"I'm still confused about the factoring part. Could we go over it again?"</p>
        <div className="text-xs text-yellow-600">Emotional state: Confused 😟</div>
      </div>
    </div>
  </div>
);

const AddressConcernsStep = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Taking Action on Student Concerns</h3>
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
      <h4 className="font-medium mb-3">Ms. Johnson's Action Plan:</h4>
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <div className="text-sm font-medium">Schedule individual help session</div>
            <div className="text-xs text-gray-600">For students struggling with factoring</div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <div className="text-sm font-medium">Prepare additional practice materials</div>
            <div className="text-xs text-gray-600">Focus on quadratic factoring techniques</div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <div className="text-sm font-medium">Follow up with counselor</div>
            <div className="text-xs text-gray-600">Check on student showing signs of distress</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const WeeklyTrendsStep = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold flex items-center gap-2">
      <TrendingUpIcon className="w-4 h-4" />
      Weekly Performance Trends
    </h3>
    <div className="space-y-4">
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Understanding Level</span>
          <span>87% (+3% from last week)</span>
        </div>
        <Progress value={87} className="h-2" />
      </div>
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Student Engagement</span>
          <span>92% (+5% from last week)</span>
        </div>
        <Progress value={92} className="h-2" />
      </div>
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Lesson Satisfaction</span>
          <span>94% (+2% from last week)</span>
        </div>
        <Progress value={94} className="h-2" />
      </div>
    </div>
    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
      <p className="text-sm text-green-800">
        📈 Great progress! Your interactive teaching methods are showing positive results.
      </p>
    </div>
  </div>
);

const PlanImprovementsStep = () => (
  <div className="space-y-4 text-center">
    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
      <CheckCircleIcon className="w-8 h-8 text-green-600" />
    </div>
    <h3 className="text-lg font-semibold text-green-600">Action Plan Complete!</h3>
    <p className="text-gray-600">Ms. Johnson has successfully reviewed all feedback and created an improvement plan.</p>
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
      <h4 className="font-medium mb-2">Next Week's Focus Areas:</h4>
      <ul className="text-sm text-blue-800 space-y-1">
        <li>• Extra practice session on quadratic factoring</li>
        <li>• More interactive problem-solving activities</li>
        <li>• Check-in with students needing emotional support</li>
        <li>• Continue monitoring student understanding trends</li>
      </ul>
    </div>
  </div>
);

export default TeacherSimulation;
