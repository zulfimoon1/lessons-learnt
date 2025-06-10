import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { 
  PlayIcon,
  PauseIcon,
  RotateCcwIcon,
  StarIcon,
  ClockIcon,
  MessageCircleIcon,
  HeartIcon,
  BellIcon,
  SettingsIcon,
  BookOpenIcon,
  UserIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  SmileIcon,
  MehIcon,
  FrownIcon
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const StudentSimulation = () => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [understanding, setUnderstanding] = useState([8]);
  const [engagement, setEngagement] = useState([7]);
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [writtenFeedback, setWrittenFeedback] = useState('');
  const totalSteps = 10;

  const simulationSteps = [
    { id: 1, name: t('demo.simulation.steps.1'), shortName: t('demo.simulation.steps.1').split(' ')[0] },
    { id: 2, name: t('demo.simulation.steps.2'), shortName: t('demo.simulation.steps.2').split(' ')[0] },
    { id: 3, name: t('demo.simulation.steps.3'), shortName: t('demo.simulation.steps.3').split(' ')[0] },
    { id: 4, name: t('demo.simulation.steps.4'), shortName: t('demo.simulation.steps.4').split(' ')[0] },
    { id: 5, name: t('demo.simulation.steps.5'), shortName: t('demo.simulation.steps.5').split(' ')[0] },
    { id: 6, name: t('demo.simulation.steps.6'), shortName: t('demo.simulation.steps.6').split(' ')[0] },
    { id: 7, name: t('demo.simulation.steps.7'), shortName: t('demo.simulation.steps.7').split(' ')[0] },
    { id: 8, name: t('demo.simulation.steps.8'), shortName: t('demo.simulation.steps.8').split(' ')[0] },
    { id: 9, name: t('demo.simulation.steps.9'), shortName: t('demo.simulation.steps.9').split(' ')[0] },
    { id: 10, name: t('demo.simulation.steps.10'), shortName: t('demo.simulation.steps.10').split(' ')[0] }
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
                <UserIcon className="w-5 h-5 text-blue-600" />
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
          </div>
        );

      case 2:
        return (
          <div className="bg-white p-6 rounded-lg shadow-lg border">
            <h3 className="text-lg font-semibold mb-4">{t('demo.dashboard.todaysSchedule')}</h3>
            <div className="space-y-3">
              {[
                { subject: t('demo.dashboard.mathematics'), time: '9:00 AM', topic: t('demo.dashboard.algebraII'), status: t('demo.dashboard.completed'), color: 'green' },
                { subject: t('demo.dashboard.chemistry'), time: '10:30 AM', topic: t('demo.dashboard.labWork'), status: t('demo.dashboard.current'), color: 'blue' },
                { subject: t('demo.dashboard.history'), time: '2:00 PM', topic: t('demo.dashboard.worldWarI'), status: t('demo.dashboard.upcoming'), color: 'gray' }
              ].map((lesson, index) => (
                <div key={index} className={`p-3 rounded-lg border-l-4 ${
                  lesson.color === 'green' ? 'bg-green-50 border-green-500' :
                  lesson.color === 'blue' ? 'bg-blue-50 border-blue-500' :
                  'bg-gray-50 border-gray-300'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ClockIcon className={`w-4 h-4 ${
                        lesson.color === 'green' ? 'text-green-600' :
                        lesson.color === 'blue' ? 'text-blue-600' :
                        'text-gray-400'
                      }`} />
                      <div>
                        <div className="font-medium">{lesson.subject}</div>
                        <div className="text-sm text-gray-600">{lesson.time} - {lesson.topic}</div>
                      </div>
                    </div>
                    <Badge className={
                      lesson.color === 'green' ? 'bg-green-100 text-green-700' :
                      lesson.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }>{lesson.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="bg-white p-6 rounded-lg shadow-lg border">
            <h3 className="text-lg font-semibold mb-4">{t('demo.simulation.steps.3')}</h3>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200 cursor-pointer hover:bg-green-100 transition-colors">
              <div className="flex items-center gap-3">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
                <div>
                  <div className="font-medium text-green-800">{t('demo.dashboard.mathematics')} - {t('demo.dashboard.algebraII')}</div>
                  <div className="text-sm text-green-600">9:00 AM - 10:00 AM</div>
                  <div className="text-sm text-green-600">{t('demo.dashboard.completed')} ✓</div>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-3">{t('demo.simulation.selectCompletedLesson')}</p>
          </div>
        );

      case 4:
        return (
          <div className="bg-white p-6 rounded-lg shadow-lg border">
            <h3 className="text-lg font-semibold mb-4">{t('demo.mockup.lessonFeedback')}</h3>
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <div className="flex items-center gap-2 mb-2">
                <BookOpenIcon className="w-5 h-5 text-blue-600" />
                <span className="font-medium">{t('demo.dashboard.mathematics')} - {t('demo.dashboard.algebraII')}</span>
              </div>
              <p className="text-sm text-gray-600">9:00 AM - 10:00 AM</p>
            </div>
            <p className="text-gray-600 mb-4">{t('demo.dashboard.howDidYouFind')}</p>
            <div className="text-center">
              <Button className="bg-blue-600 text-white">{t('demo.simulation.steps.4')}</Button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="bg-white p-6 rounded-lg shadow-lg border">
            <h3 className="text-lg font-semibold mb-4">{t('demo.mockup.understandingLevel')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('demo.mockup.understandingLevel')}: {understanding[0]}/10
                </label>
                <Slider
                  value={understanding}
                  onValueChange={setUnderstanding}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span>5</span>
                  <span>10</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{understanding[0]}/10</div>
                <div className="text-sm text-gray-600">
                  {understanding[0] >= 8 ? t('demo.simulation.excellent') : 
                   understanding[0] >= 6 ? t('demo.simulation.good') :
                   understanding[0] >= 4 ? t('demo.simulation.average') :
                   t('demo.simulation.needsImprovement')}
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="bg-white p-6 rounded-lg shadow-lg border">
            <h3 className="text-lg font-semibold mb-4">{t('demo.simulation.steps.6')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('demo.simulation.engagementLevel')}: {engagement[0]}/10
                </label>
                <Slider
                  value={engagement}
                  onValueChange={setEngagement}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span>5</span>
                  <span>10</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{engagement[0]}/10</div>
                <div className="text-sm text-gray-600">
                  {engagement[0] >= 8 ? t('demo.simulation.veryEngaged') : 
                   engagement[0] >= 6 ? t('demo.simulation.engaged') :
                   engagement[0] >= 4 ? t('demo.simulation.somewhatEngaged') :
                   t('demo.simulation.notEngaged')}
                </div>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="bg-white p-6 rounded-lg shadow-lg border">
            <h3 className="text-lg font-semibold mb-4">{t('demo.mockup.howFeeling')}</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              {[
                { emotion: 'happy', icon: SmileIcon, color: 'green', label: t('demo.mockup.happy') },
                { emotion: 'neutral', icon: MehIcon, color: 'yellow', label: t('demo.mockup.neutral') },
                { emotion: 'sad', icon: FrownIcon, color: 'red', label: t('demo.simulation.sad') }
              ].map(({ emotion, icon: Icon, color, label }) => (
                <button
                  key={emotion}
                  onClick={() => setSelectedEmotion(emotion)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedEmotion === emotion 
                      ? `border-${color}-500 bg-${color}-50` 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`w-8 h-8 mx-auto mb-2 ${
                    color === 'green' ? 'text-green-600' :
                    color === 'yellow' ? 'text-yellow-600' :
                    'text-red-600'
                  }`} />
                  <div className="text-sm font-medium">{label}</div>
                </button>
              ))}
            </div>
            {selectedEmotion && (
              <div className="text-center text-sm text-gray-600">
                {t('demo.simulation.emotionSelected')}: {
                  selectedEmotion === 'happy' ? t('demo.mockup.happy') :
                  selectedEmotion === 'neutral' ? t('demo.mockup.neutral') :
                  t('demo.simulation.sad')
                }
              </div>
            )}
          </div>
        );

      case 8:
        return (
          <div className="bg-white p-6 rounded-lg shadow-lg border">
            <h3 className="text-lg font-semibold mb-4">{t('demo.simulation.steps.8')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('demo.mockup.whatWentWell')}
                </label>
                <Textarea
                  value={writtenFeedback}
                  onChange={(e) => setWrittenFeedback(e.target.value)}
                  placeholder={t('demo.simulation.writeFeedbackPlaceholder')}
                  className="w-full h-24"
                />
              </div>
              <div className="text-sm text-gray-500">
                {writtenFeedback.length}/500 {t('demo.simulation.characters')}
              </div>
            </div>
          </div>
        );

      case 9:
        return (
          <div className="bg-white p-6 rounded-lg shadow-lg border">
            <h3 className="text-lg font-semibold mb-4">{t('demo.simulation.steps.9')}</h3>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center gap-3 mb-3">
                <HeartIcon className="w-6 h-6 text-purple-600" />
                <div>
                  <h4 className="font-medium text-purple-800">{t('demo.mockup.anonymousSupport')}</h4>
                  <p className="text-sm text-purple-600">{t('demo.mockup.identityProtected')}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Button variant="outline" className="w-full">
                  {t('demo.mockup.startAnonymousChat')}
                </Button>
                <Button variant="outline" className="w-full">
                  {t('demo.mockup.bookAnonymousAppointment')}
                </Button>
              </div>
              <div className="mt-3 text-xs text-purple-600">
                {t('demo.mockup.crisisSupport')}
              </div>
            </div>
          </div>
        );

      case 10:
        return (
          <div className="bg-white p-6 rounded-lg shadow-lg border">
            <h3 className="text-lg font-semibold mb-4">{t('demo.simulation.steps.10')}</h3>
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">{t('demo.simulation.feedbackSummary')}</h4>
                <div className="space-y-2 text-sm">
                  <div>✓ {t('demo.mockup.understandingLevel')}: {understanding[0]}/10</div>
                  <div>✓ {t('demo.simulation.engagementLevel')}: {engagement[0]}/10</div>
                  <div>✓ {t('demo.simulation.emotion')}: {selectedEmotion || t('demo.simulation.notSelected')}</div>
                  <div>✓ {t('demo.simulation.writtenFeedback')}: {writtenFeedback ? t('demo.simulation.provided') : t('demo.simulation.notProvided')}</div>
                </div>
              </div>
              <Button className="w-full bg-green-600 text-white">
                {t('demo.mockup.submitFeedback')}
              </Button>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-6">
            {simulationSteps.slice(0, 5).map((step) => (
              <Button
                key={step.id}
                variant={currentStep === step.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleStepClick(step.id)}
                className="text-xs p-2 h-auto min-h-[60px] flex flex-col items-center justify-center"
              >
                <div className="text-center">
                  <div className="font-medium">{step.id}.</div>
                  <div className="break-words">{step.shortName}</div>
                </div>
              </Button>
            ))}
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-6">
            {simulationSteps.slice(5).map((step) => (
              <Button
                key={step.id}
                variant={currentStep === step.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleStepClick(step.id)}
                className="text-xs p-2 h-auto min-h-[60px] flex flex-col items-center justify-center"
              >
                <div className="text-center">
                  <div className="font-medium">{step.id}.</div>
                  <div className="break-words">{step.shortName}</div>
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
