
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
  UsersIcon
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const TeacherSimulation = () => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const totalSteps = 8;

  const simulationSteps = [
    { id: 1, name: 'Dashboard Overview' },
    { id: 2, name: 'Class Analytics' },
    { id: 3, name: 'Student Alerts' },
    { id: 4, name: 'Mood Tracking' },
    { id: 5, name: 'Individual Reports' },
    { id: 6, name: 'Action Planning' },
    { id: 7, name: 'Weekly Trends' },
    { id: 8, name: 'Lesson Planning' }
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
      
      default:
        return (
          <div className="bg-white p-6 rounded-lg shadow-lg border">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3Icon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {simulationSteps[currentStep - 1]?.name}
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
            <span>{simulationSteps[currentStep - 1]?.name}</span>
          </div>
          <Progress value={(currentStep / totalSteps) * 100} className="mt-2" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
            {simulationSteps.map((step) => (
              <Button
                key={step.id}
                variant={currentStep === step.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleStepClick(step.id)}
                className="text-xs p-2 h-auto"
              >
                <div className="text-center">
                  <div>{step.id}. {step.name}</div>
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
