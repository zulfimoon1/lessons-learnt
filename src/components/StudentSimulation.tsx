
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
  ArrowRightIcon
} from "lucide-react";

interface SimulationStep {
  id: string;
  title: string;
  description: string;
  duration: number;
  component: React.ReactNode;
}

const StudentSimulation = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // Simulation steps
  const steps: SimulationStep[] = [
    {
      id: "dashboard",
      title: "Student Dashboard",
      description: "Emma logs into her student dashboard and sees her overview",
      duration: 3000,
      component: <DashboardStep />
    },
    {
      id: "schedule",
      title: "Class Schedule",
      description: "Emma views her today's class schedule",
      duration: 2500,
      component: <ScheduleStep />
    },
    {
      id: "select-class",
      title: "Select Completed Class",
      description: "Emma clicks on her completed Mathematics class",
      duration: 2000,
      component: <SelectClassStep />
    },
    {
      id: "feedback-form",
      title: "Feedback Form",
      description: "Emma opens the lesson feedback form",
      duration: 2000,
      component: <FeedbackFormStep />
    },
    {
      id: "fill-understanding",
      title: "Rate Understanding",
      description: "Emma rates her understanding of the lesson",
      duration: 2500,
      component: <FillUnderstandingStep />
    },
    {
      id: "fill-interest",
      title: "Rate Interest",
      description: "Emma rates how interesting the lesson was",
      duration: 2500,
      component: <FillInterestStep />
    },
    {
      id: "emotional-state",
      title: "Emotional Check-in",
      description: "Emma selects her emotional state",
      duration: 2500,
      component: <EmotionalStateStep />
    },
    {
      id: "written-feedback",
      title: "Written Feedback",
      description: "Emma writes detailed feedback about the lesson",
      duration: 4000,
      component: <WrittenFeedbackStep />
    },
    {
      id: "submit",
      title: "Submit Feedback",
      description: "Emma submits her feedback successfully",
      duration: 2000,
      component: <SubmitStep />
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
            <span>Student Journey Simulation</span>
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
const DashboardStep = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <BookOpenIcon className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Welcome back, Emma!</h3>
          <p className="text-sm text-gray-600">Grade 10 Student</p>
        </div>
      </div>
    </div>
    
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-blue-50 p-4 rounded-lg text-center">
        <div className="text-2xl font-bold text-blue-600">Grade 10</div>
        <div className="text-sm text-blue-800">Current Grade</div>
      </div>
      <div className="bg-green-50 p-4 rounded-lg text-center">
        <div className="text-2xl font-bold text-green-600">4</div>
        <div className="text-sm text-green-800">Classes Today</div>
      </div>
      <div className="bg-purple-50 p-4 rounded-lg text-center">
        <div className="text-2xl font-bold text-purple-600">3</div>
        <div className="text-sm text-purple-800">Pending Feedback</div>
      </div>
    </div>
  </div>
);

const ScheduleStep = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold flex items-center gap-2">
      <CalendarIcon className="w-5 h-5" />
      Today's Schedule
    </h3>
    <div className="space-y-3">
      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
        <div>
          <div className="font-medium">Mathematics</div>
          <div className="text-sm text-gray-600">9:00 AM - Algebra II</div>
        </div>
        <Badge className="bg-green-100 text-green-700">Completed</Badge>
      </div>
      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
        <div>
          <div className="font-medium">Chemistry</div>
          <div className="text-sm text-gray-600">10:30 AM - Lab Work</div>
        </div>
        <Badge className="bg-blue-100 text-blue-700">In Progress</Badge>
      </div>
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-l-4 border-gray-300">
        <div>
          <div className="font-medium">History</div>
          <div className="text-sm text-gray-600">2:00 PM - World War I</div>
        </div>
        <Badge variant="outline">Upcoming</Badge>
      </div>
    </div>
  </div>
);

const SelectClassStep = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Select Class for Feedback</h3>
    <div className="space-y-3">
      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border-l-4 border-green-500 ring-2 ring-green-300 ring-offset-2">
        <div>
          <div className="font-medium">Mathematics</div>
          <div className="text-sm text-gray-600">9:00 AM - Algebra II</div>
          <div className="text-xs text-green-600 mt-1">Click to provide feedback</div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-100 text-green-700">Completed</Badge>
          <ArrowRightIcon className="w-4 h-4 text-green-600" />
        </div>
      </div>
    </div>
  </div>
);

const FeedbackFormStep = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Lesson Feedback - Mathematics</h3>
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
      <p className="text-sm text-blue-800">Your feedback helps improve teaching and learning</p>
    </div>
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium text-gray-700">How well did you understand today's lesson?</label>
        <div className="flex gap-1 mt-2">
          {[1,2,3,4,5].map(star => (
            <StarIcon key={star} className="w-6 h-6 text-gray-300" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

const FillUnderstandingStep = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Rating Understanding</h3>
    <div>
      <label className="text-sm font-medium text-gray-700">How well did you understand today's lesson?</label>
      <div className="flex gap-1 mt-2">
        {[1,2,3,4,5].map(star => (
          <StarIcon 
            key={star} 
            className={`w-6 h-6 ${star <= 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
          />
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-1">Emma rates 4 stars - Good understanding</p>
    </div>
  </div>
);

const FillInterestStep = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Rating Interest</h3>
    <div>
      <label className="text-sm font-medium text-gray-700">How interesting was today's lesson?</label>
      <div className="flex gap-1 mt-2">
        {[1,2,3,4,5].map(star => (
          <StarIcon 
            key={star} 
            className={`w-6 h-6 ${star <= 5 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
          />
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-1">Emma rates 5 stars - Very interesting!</p>
    </div>
  </div>
);

const EmotionalStateStep = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Emotional Check-in</h3>
    <div>
      <label className="text-sm font-medium text-gray-700">How are you feeling about this lesson?</label>
      <div className="flex gap-3 mt-3">
        <Button size="sm" className="bg-green-100 text-green-700 hover:bg-green-200">😊 Happy</Button>
        <Button size="sm" variant="outline">😐 Neutral</Button>
        <Button size="sm" variant="outline">😟 Confused</Button>
        <Button size="sm" variant="outline">😔 Frustrated</Button>
      </div>
      <p className="text-xs text-gray-500 mt-2">Emma selects "Happy" - feeling good about the lesson</p>
    </div>
  </div>
);

const WrittenFeedbackStep = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Written Feedback</h3>
    <div>
      <label className="text-sm font-medium text-gray-700">What went well in today's lesson?</label>
      <textarea 
        className="w-full p-3 border rounded-md text-sm mt-2" 
        rows={3}
        value="The algebra concepts were explained very clearly with good examples. I especially liked the real-world applications shown in the problems."
        readOnly
      />
    </div>
    <div>
      <label className="text-sm font-medium text-gray-700">Any suggestions for improvement?</label>
      <textarea 
        className="w-full p-3 border rounded-md text-sm mt-2" 
        rows={2}
        value="Maybe more practice problems would help reinforce the concepts."
        readOnly
      />
    </div>
  </div>
);

const SubmitStep = () => (
  <div className="space-y-4 text-center">
    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
      <CheckCircleIcon className="w-8 h-8 text-green-600" />
    </div>
    <h3 className="text-lg font-semibold text-green-600">Feedback Submitted Successfully!</h3>
    <p className="text-gray-600">Thank you Emma! Your feedback helps improve the learning experience.</p>
    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
      <p className="text-sm text-green-800">Your teacher will review this feedback to enhance future lessons.</p>
    </div>
  </div>
);

export default StudentSimulation;
