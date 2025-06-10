
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
import TeacherSimulation from "@/components/TeacherSimulation";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";

const Demo = () => {
  const { t } = useLanguage();
  const [activeDemo, setActiveDemo] = useState("student-simulation");
  const [isPlaying, setIsPlaying] = useState(true);

  // Breadcrumb items
  const breadcrumbItems = [
    {
      label: t('demo.page.interactivePlatformDemo'),
      current: true
    }
  ];

  // Enhanced Mental Health Support Demo
  const MentalHealthDemo = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6 border">
        <h3 className="text-lg font-semibold mb-4">{t('demo.simulation.mentalHealth.title')}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">{t('demo.mockup.drSarahOnline')}</span>
            </div>
            <p className="text-sm text-purple-700">{t('demo.mentalHealth.schoolPsychologist')}</p>
            <div className="mt-2">
              <Badge className="bg-green-100 text-green-700">{t('demo.mockup.availableChat')}</Badge>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm font-medium">{t('demo.mentalHealth.mrJamesChen')}</span>
            </div>
            <p className="text-sm text-blue-700">{t('demo.mentalHealth.counselor')}</p>
            <div className="mt-2">
              <Badge className="bg-yellow-100 text-yellow-700">{t('demo.mentalHealth.backAt2PM')}</Badge>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4">
          <p className="text-sm text-blue-800 font-medium">🔒 {t('demo.mockup.identityProtected')}</p>
          <p className="text-xs text-blue-600 mt-1">{t('demo.mockup.conversationsConfidential')}</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 h-64 mb-4 overflow-y-auto">
          <div className="space-y-3">
            <div className="bg-purple-100 p-3 rounded-lg max-w-xs">
              <p className="text-sm">{t('demo.mockup.helloSafeSpace')}</p>
              <span className="text-xs text-gray-500">{t('demo.mockup.drSarah')} - 2:30 PM</span>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg max-w-xs ml-auto">
              <p className="text-sm">{t('demo.mockup.feelingOverwhelmed')}</p>
              <span className="text-xs text-gray-500">{t('demo.mockup.anonymousStudent')} - 2:32 PM</span>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg max-w-xs">
              <p className="text-sm">{t('demo.mockup.understandValid')}</p>
              <span className="text-xs text-gray-500">{t('demo.mockup.drSarah')} - 2:33 PM</span>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg max-w-xs ml-auto">
              <p className="text-sm">{t('demo.mentalHealth.upcomingExams')}</p>
              <span className="text-xs text-gray-500">{t('demo.mockup.anonymousStudent')} - 2:35 PM</span>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg max-w-xs">
              <p className="text-sm">{t('demo.mentalHealth.studyStrategies')}</p>
              <span className="text-xs text-gray-500">{t('demo.mockup.drSarah')} - 2:36 PM</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex gap-2">
            <input 
              className="flex-1 p-2 border rounded-md text-sm" 
              placeholder={t('demo.mockup.typeAnonymousMessage')}
            />
            <Button size="sm">{t('demo.mockup.send')}</Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button className="bg-purple-600 hover:bg-purple-700">{t('demo.mockup.startAnonymousChat')}</Button>
            <Button variant="outline">{t('demo.mockup.bookAnonymousAppointment')}</Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="text-sm">{t('demo.mentalHealth.selfHelpResources')}</Button>
            <Button variant="outline" className="text-sm">{t('demo.mentalHealth.moodTracking')}</Button>
          </div>
          
          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
            <p className="text-xs text-red-700 font-medium">🚨 {t('demo.mentalHealth.crisisSupport')}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const demos = [
    {
      id: "student-simulation",
      title: t('demo.simulation.student.title'),
      description: t('demo.simulation.student.description'),
      icon: UsersIcon,
      component: <StudentSimulation />
    },
    {
      id: "teacher-simulation",
      title: t('demo.simulation.teacher.title'),
      description: t('demo.simulation.teacher.description'),
      icon: BarChart3Icon,
      component: <TeacherSimulation />
    },
    {
      id: "mental-health",
      title: t('demo.simulation.mentalHealth.title'),
      description: t('demo.simulation.mentalHealth.description'),
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
                <span>{t('demo.page.backToHome')}</span>
              </Link>
              <div className="h-6 border-l border-gray-300"></div>
              <div className="flex items-center gap-2">
                <GraduationCapIcon className="w-8 h-8 text-primary" />
                <h1 className="text-2xl font-bold">{t('demo.page.interactivePlatformDemo')}</h1>
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
                {isPlaying ? t('demo.page.pauseDemo') : t('demo.page.playDemo')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbItems} />

        {/* Introduction */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t('demo.page.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('demo.page.subtitle')}
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
                          <h4 className="font-semibold mb-2">{t('demo.keyFeaturesShown')}:</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {demo.id === "student-simulation" && (
                              <>
                                <li>{t('demo.features.student.1')}</li>
                                <li>{t('demo.features.student.2')}</li>
                                <li>{t('demo.features.student.3')}</li>
                                <li>{t('demo.features.student.4')}</li>
                                <li>{t('demo.features.student.5')}</li>
                                <li>{t('demo.features.student.6')}</li>
                              </>
                            )}
                            {demo.id === "teacher-simulation" && (
                              <>
                                <li>{t('demo.features.teacher.1')}</li>
                                <li>{t('demo.features.teacher.2')}</li>
                                <li>{t('demo.features.teacher.3')}</li>
                                <li>{t('demo.features.teacher.4')}</li>
                                <li>{t('demo.features.teacher.5')}</li>
                                <li>{t('demo.features.teacher.6')}</li>
                                <li>{t('demo.features.teacher.7')}</li>
                                <li>{t('demo.features.teacher.8')}</li>
                              </>
                            )}
                            {demo.id === "mental-health" && (
                              <>
                                <li>{t('demo.features.mentalHealth.1')}</li>
                                <li>{t('demo.features.mentalHealth.2')}</li>
                                <li>{t('demo.features.mentalHealth.3')}</li>
                                <li>{t('demo.features.mentalHealth.4')}</li>
                                <li>{t('demo.features.mentalHealth.5')}</li>
                                <li>{t('demo.features.mentalHealth.6')}</li>
                              </>
                            )}
                          </ul>
                        </div>
                        
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-sm text-blue-800">
                            {demo.id === "student-simulation" ? (
                              <><strong>{t('demo.interactiveSimulation')}:</strong> {t('demo.interactive.student')}</>
                            ) : demo.id === "teacher-simulation" ? (
                              <><strong>{t('demo.teacherWorkflow')}:</strong> {t('demo.interactive.teacher')}</>
                            ) : (
                              <><strong>{t('demo.fullIntegration')}:</strong> {t('demo.interactive.integration')}</>
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
              <h3 className="text-2xl font-bold mb-4">{t('demo.cta.title')}</h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                {t('demo.cta.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/teacher-login">
                  <Button size="lg" className="px-8">
                    {t('demo.cta.startTrial')}
                  </Button>
                </Link>
                <Link to="/student-login">
                  <Button size="lg" variant="outline" className="px-8">
                    {t('demo.cta.studentAccess')}
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
