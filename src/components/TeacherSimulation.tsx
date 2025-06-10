
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
  UserIcon,
  ClockIcon,
  BookOpenIcon,
  MessageSquareIcon,
  CalendarIcon,
  FileTextIcon
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const TeacherSimulation = () => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const totalSteps = 8;

  const simulationSteps = [
    { id: 1, name: t('demo.teacher.steps.1') },
    { id: 2, name: t('demo.teacher.steps.2') },
    { id: 3, name: t('demo.teacher.steps.3') },
    { id: 4, name: t('demo.teacher.steps.4') },
    { id: 5, name: t('demo.teacher.steps.5') },
    { id: 6, name: t('demo.teacher.steps.6') },
    { id: 7, name: t('demo.teacher.steps.7') },
    { id: 8, name: t('demo.teacher.steps.8') }
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
            <h3 className="text-lg font-semibold mb-4">{t('demo.teacher.dashboardOverview')}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <UsersIcon className="w-8 h-8 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold text-blue-600">142</div>
                    <div className="text-sm text-blue-800">{t('demo.teacher.totalStudents')}</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUpIcon className="w-8 h-8 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold text-green-600">87%</div>
                    <div className="text-sm text-green-800">{t('demo.teacher.avgUnderstanding')}</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangleIcon className="w-8 h-8 text-red-600" />
                  <div>
                    <div className="text-2xl font-bold text-red-600">3</div>
                    <div className="text-sm text-red-800">{t('demo.teacher.studentsNeedSupport')}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">{t('demo.teacher.recentClassPerformance')}</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">{t('demo.teacher.mathematicsAlgebra')}</span>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-700">4.2★</Badge>
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="font-medium">{t('demo.teacher.chemistryLabWork')}</span>
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
            <h3 className="text-lg font-semibold mb-4">{t('demo.teacher.steps.2')}</h3>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">{t('demo.teacher.mathematicsAlgebra')}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-blue-600">{t('demo.teacher.avgUnderstanding')}</div>
                    <div className="text-2xl font-bold text-blue-800">8.2/10</div>
                  </div>
                  <div>
                    <div className="text-sm text-blue-600">{t('demo.teacher.activeStudents')}</div>
                    <div className="text-2xl font-bold text-blue-800">28/30</div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '82%' }}></div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">{t('demo.teacher.chemistryLabWork')}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-yellow-600">{t('demo.teacher.avgUnderstanding')}</div>
                    <div className="text-2xl font-bold text-yellow-800">6.8/10</div>
                  </div>
                  <div>
                    <div className="text-sm text-yellow-600">{t('demo.teacher.activeStudents')}</div>
                    <div className="text-2xl font-bold text-yellow-800">25/30</div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-yellow-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="bg-white p-6 rounded-lg shadow-lg border">
            <h3 className="text-lg font-semibold mb-4">{t('demo.teacher.steps.3')}</h3>
            <div className="space-y-3">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-center gap-3">
                  <AlertTriangleIcon className="w-6 h-6 text-red-600" />
                  <div className="flex-1">
                    <div className="font-medium text-red-800">Emma Johnson</div>
                    <div className="text-sm text-red-600">{t('demo.teacher.lowEngagement')}</div>
                    <div className="text-xs text-red-500">{t('demo.teacher.lastWeek')}</div>
                  </div>
                  <Button size="sm" variant="outline" className="text-red-600 border-red-200">
                    {t('demo.teacher.contactStudent')}
                  </Button>
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <div className="flex items-center gap-3">
                  <UserIcon className="w-6 h-6 text-orange-600" />
                  <div className="flex-1">
                    <div className="font-medium text-orange-800">Alex Smith</div>
                    <div className="text-sm text-orange-600">{t('demo.teacher.strugglingMath')}</div>
                    <div className="text-xs text-orange-500">{t('demo.teacher.needsSupport')}</div>
                  </div>
                  <Button size="sm" variant="outline" className="text-orange-600 border-orange-200">
                    {t('demo.teacher.scheduleHelp')}
                  </Button>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-3">
                  <HeartIcon className="w-6 h-6 text-yellow-600" />
                  <div className="flex-1">
                    <div className="font-medium text-yellow-800">Maria Garcia</div>
                    <div className="text-sm text-yellow-600">{t('demo.teacher.moodChange')}</div>
                    <div className="text-xs text-yellow-500">{t('demo.teacher.monitorClosely')}</div>
                  </div>
                  <Button size="sm" variant="outline" className="text-yellow-600 border-yellow-200">
                    {t('demo.teacher.checkIn')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="bg-white p-6 rounded-lg shadow-lg border">
            <h3 className="text-lg font-semibold mb-4">{t('demo.teacher.steps.4')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-800 mb-3">{t('demo.teacher.positiveWeek')}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">{t('demo.teacher.happyStudents')}</span>
                    <span className="font-medium text-green-600">78%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">{t('demo.teacher.engagedLearners')}</span>
                    <span className="font-medium text-green-600">85%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">{t('demo.teacher.completedTasks')}</span>
                    <span className="font-medium text-green-600">92%</span>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-medium text-red-800 mb-3">{t('demo.teacher.needsAttention')}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">{t('demo.teacher.stressedStudents')}</span>
                    <span className="font-medium text-red-600">12%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">{t('demo.teacher.lowMood')}</span>
                    <span className="font-medium text-red-600">8%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">{t('demo.teacher.missingTasks')}</span>
                    <span className="font-medium text-red-600">15%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="bg-white p-6 rounded-lg shadow-lg border">
            <h3 className="text-lg font-semibold mb-4">{t('demo.teacher.steps.5')}</h3>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <UserIcon className="w-6 h-6 text-blue-600" />
                  <div>
                    <div className="font-medium">Emma Johnson</div>
                    <div className="text-sm text-gray-600">{t('demo.teacher.weeklyReport')}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">{t('demo.teacher.avgUnderstanding')}</div>
                    <div className="font-medium">7.2/10</div>
                  </div>
                  <div>
                    <div className="text-gray-600">{t('demo.teacher.participation')}</div>
                    <div className="font-medium">65%</div>
                  </div>
                  <div>
                    <div className="text-gray-600">{t('demo.teacher.moodRating')}</div>
                    <div className="font-medium">6.8/10</div>
                  </div>
                  <div>
                    <div className="text-gray-600">{t('demo.teacher.tasksCompleted')}</div>
                    <div className="font-medium">8/10</div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">{t('demo.teacher.recommendations')}</h4>
                <ul className="text-sm space-y-1 text-yellow-700">
                  <li>• {t('demo.teacher.encourageParticipation')}</li>
                  <li>• {t('demo.teacher.provideFeedback')}</li>
                  <li>• {t('demo.teacher.checkWellbeing')}</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="bg-white p-6 rounded-lg shadow-lg border">
            <h3 className="text-lg font-semibold mb-4">{t('demo.teacher.steps.6')}</h3>
            <div className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-800 mb-3">{t('demo.teacher.actionPlan')}</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <div className="font-medium">{t('demo.teacher.scheduleOneOnOne')}</div>
                      <div className="text-sm text-gray-600">{t('demo.teacher.withEmmaJohnson')}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <ClockIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <div className="font-medium">{t('demo.teacher.createStudyGroup')}</div>
                      <div className="text-sm text-gray-600">{t('demo.teacher.forMathStruggling')}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <MessageSquareIcon className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div>
                      <div className="font-medium">{t('demo.teacher.contactParents')}</div>
                      <div className="text-sm text-gray-600">{t('demo.teacher.discussProgress')}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="bg-white p-6 rounded-lg shadow-lg border">
            <h3 className="text-lg font-semibold mb-4">{t('demo.teacher.steps.7')}</h3>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">{t('demo.teacher.weeklyTrends')}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <TrendingUpIcon className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">{t('demo.teacher.improving')}</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {t('demo.teacher.understanding')} +12%
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <TrendingUpIcon className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">{t('demo.teacher.engagement')}</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      +8% {t('demo.teacher.thisWeek')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-medium text-orange-800 mb-2">{t('demo.teacher.areasForImprovement')}</h4>
                <ul className="text-sm space-y-1 text-orange-700">
                  <li>• {t('demo.teacher.chemistryLabNeedsFocus')}</li>
                  <li>• {t('demo.teacher.increaseInteractivity')}</li>
                  <li>• {t('demo.teacher.moreFrequentCheckins')}</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="bg-white p-6 rounded-lg shadow-lg border">
            <h3 className="text-lg font-semibold mb-4">{t('demo.teacher.steps.8')}</h3>
            <div className="space-y-4">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h4 className="font-medium text-indigo-800 mb-3">{t('demo.teacher.nextWeekPlanning')}</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 bg-white rounded border">
                    <BookOpenIcon className="w-5 h-5 text-indigo-600" />
                    <div className="flex-1">
                      <div className="font-medium">{t('demo.teacher.revisitAlgebra')}</div>
                      <div className="text-sm text-gray-600">{t('demo.teacher.focusOnStrugglingStudents')}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-2 bg-white rounded border">
                    <UserIcon className="w-5 h-5 text-indigo-600" />
                    <div className="flex-1">
                      <div className="font-medium">{t('demo.teacher.interactiveLab')}</div>
                      <div className="text-sm text-gray-600">{t('demo.teacher.improveChemistryEngagement')}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-2 bg-white rounded border">
                    <CalendarIcon className="w-5 h-5 text-indigo-600" />
                    <div className="flex-1">
                      <div className="font-medium">{t('demo.teacher.wellbeingCheckins')}</div>
                      <div className="text-sm text-gray-600">{t('demo.teacher.scheduledTuesdayThursday')}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircleIcon className="w-5 h-5" />
                  <span className="font-medium">{t('demo.teacher.planningComplete')}</span>
                </div>
                <div className="text-sm text-green-600 mt-1">
                  {t('demo.teacher.readyForNextWeek')}
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
                {t('demo.teacher.analyzeDescription')}
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
