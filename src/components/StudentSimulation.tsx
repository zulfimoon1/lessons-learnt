
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
  ClockIcon,
  MessageCircleIcon,
  HeartIcon,
  BellIcon,
  SettingsIcon
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const StudentSimulation = () => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const totalSteps = 10;

  const simulationSteps = [
    { id: 1, name: t('demo.simulation.steps.1') },
    { id: 2, name: t('demo.simulation.steps.2') },
    { id: 3, name: t('demo.simulation.steps.3') },
    { id: 4, name: t('demo.simulation.steps.4') },
    { id: 5, name: t('demo.simulation.steps.5') },
    { id: 6, name: t('demo.simulation.steps.6') },
    { id: 7, name: t('demo.simulation.steps.7') },
    { id: 8, name: t('demo.simulation.steps.8') },
    { id: 9, name: t('demo.simulation.steps.9') },
    { id: 10, name: t('demo.simulation.steps.10') }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStep(prev => prev < totalSteps ? prev + 1 : 1);
      }, 3000);
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
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <MessageCircleIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{t('demo.dashboard.studentDashboard')}</h3>
                <p className="text-sm text-gray-600">{t('demo.dashboard.welcomeBack')}</p>
              </div>
              <div className="ml-auto flex gap-2">
                <BellIcon className="w-5 h-5 text-gray-400" />
                <SettingsIcon className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{t('demo.dashboard.grade10')}</div>
                <div className="text-sm text-gray-600">{t('demo.dashboard.currentGrade')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">5</div>
                <div className="text-sm text-gray-600">{t('demo.dashboard.classesToday')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 flex items-center justify-center gap-1">
                  4.2<StarIcon className="w-4 h-4 fill-purple-600" />
                </div>
                <div className="text-sm text-gray-600">{t('demo.dashboard.avgRating')}</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">{t('demo.dashboard.todaysSchedule')}</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <div className="flex items-center gap-3">
                    <ClockIcon className="w-4 h-4 text-green-600" />
                    <div>
                      <div className="font-medium">{t('demo.dashboard.mathematics')}</div>
                      <div className="text-sm text-gray-600">9:00 AM - {t('demo.dashboard.algebraII')}</div>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700">{t('demo.dashboard.completed')}</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-center gap-3">
                    <ClockIcon className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="font-medium">{t('demo.dashboard.chemistry')}</div>
                      <div className="text-sm text-gray-600">10:30 AM - {t('demo.dashboard.labWork')}</div>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">{t('demo.dashboard.current')}</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <ClockIcon className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-600">{t('demo.dashboard.history')}</div>
                      <div className="text-sm text-gray-500">2:00 PM - {t('demo.dashboard.worldWarI')}</div>
                    </div>
                  </div>
                  <Badge variant="outline">{t('demo.dashboard.upcoming')}</Badge>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h5 className="font-medium mb-2">{t('demo.dashboard.quickLessonFeedback')}</h5>
              <p className="text-sm text-gray-600 mb-3">{t('demo.dashboard.howDidYouFind')}</p>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(star => (
                  <StarIcon key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400 cursor-pointer" />
                ))}
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="bg-white p-6 rounded-lg shadow-lg border">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircleIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {simulationSteps[currentStep - 1]?.name}
              </h3>
              <p className="text-gray-600 text-sm">
                {t('demo.simulation.emmaLogsInto')}
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
              {t('demo.simulation.studentJourney')}
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
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
            {simulationSteps.slice(0, 5).map((step) => (
              <Button
                key={step.id}
                variant={currentStep === step.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleStepClick(step.id)}
                className="text-xs p-2 h-auto"
              >
                <div className="text-center">
                  <div>{step.id}. {step.name.split(' ').slice(0, 2).join(' ')}</div>
                </div>
              </Button>
            ))}
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
            {simulationSteps.slice(5).map((step) => (
              <Button
                key={step.id}
                variant={currentStep === step.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleStepClick(step.id)}
                className="text-xs p-2 h-auto"
              >
                <div className="text-center">
                  <div>{step.id}. {step.name.split(' ').slice(0, 2).join(' ')}</div>
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

export default StudentSimulation;
