import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  UsersIcon,
  BookOpenIcon,
  HeartIcon,
  MessageCircleIcon,
  BarChart3Icon,
  StarIcon,
  CalendarIcon,
  ClockIcon
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface DemoFeature {
  id: string;
  titleKey: string;
  descriptionKey: string;
  userType: "student" | "teacher" | "psychologist";
  icon: any;
  mockupComponent: React.ReactNode;
}

const DemoSection = () => {
  const { t } = useLanguage();
  const [currentFeature, setCurrentFeature] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Student Feedback Mockup
  const StudentFeedbackMockup = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">{t('demo.mockup.lessonFeedback')}</h3>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">{t('demo.mockup.understandingLevel')}</label>
          <div className="flex gap-1 mt-1">
            {[1,2,3,4,5].map(star => (
              <StarIcon key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">{t('demo.mockup.howFeeling')}</label>
          <div className="flex gap-2 mt-2">
            <div className="bg-green-100 px-3 py-1 rounded-full text-sm">{t('demo.mockup.happy')}</div>
            <div className="bg-gray-100 px-3 py-1 rounded-full text-sm">{t('demo.mockup.neutral')}</div>
          </div>
        </div>
        <textarea className="w-full p-3 border rounded-md text-sm" placeholder={t('demo.mockup.whatWentWell')} rows={3}></textarea>
        <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm">{t('demo.mockup.submitFeedback')}</button>
      </div>
    </div>
  );

  // Teacher Dashboard Mockup
  const TeacherDashboardMockup = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">{t('demo.mockup.teacherAnalytics')}</h3>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">87%</div>
          <div className="text-sm text-blue-800">{t('demo.mockup.avgUnderstanding')}</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-green-600">23</div>
          <div className="text-sm text-green-800">{t('demo.mockup.activeStudents')}</div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
          <span className="text-sm">{t('demo.mockup.mathClass')}</span>
          <span className="text-xs text-gray-500">4.2★</span>
        </div>
        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
          <span className="text-sm">{t('demo.mockup.scienceLab')}</span>
          <span className="text-xs text-gray-500">4.7★</span>
        </div>
      </div>
    </div>
  );

  // Mental Health Support Mockup
  const MentalHealthMockup = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">{t('demo.mockup.anonymousSupport')}</h3>
      <div className="space-y-4">
        <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium">{t('demo.mockup.drSarahOnline')}</span>
          </div>
          <p className="text-sm text-purple-700">{t('demo.mockup.availableChat')}</p>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 font-medium">{t('demo.mockup.identityProtected')}</p>
          <p className="text-xs text-blue-600 mt-1">{t('demo.mockup.conversationsConfidential')}</p>
        </div>
        <div className="space-y-2">
          <button className="w-full bg-purple-600 text-white p-3 rounded-md text-sm">{t('demo.mockup.startAnonymousChat')}</button>
          <button className="w-full border border-purple-600 text-purple-600 p-3 rounded-md text-sm">{t('demo.mockup.bookAnonymousAppointment')}</button>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600">{t('demo.mockup.crisisSupport')}</p>
        </div>
      </div>
    </div>
  );

  // Class Management Mockup
  const ClassManagementMockup = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">{t('demo.mockup.classSchedule')}</h3>
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
          <ClockIcon className="w-5 h-5 text-blue-600" />
          <div>
            <div className="font-medium text-sm">{t('demo.mockup.mathematics')}</div>
            <div className="text-xs text-gray-600">9:00 AM - 10:30 AM</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
          <ClockIcon className="w-5 h-5 text-green-600" />
          <div>
            <div className="font-medium text-sm">{t('demo.mockup.scienceLab2')}</div>
            <div className="text-xs text-gray-600">11:00 AM - 12:30 PM</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <CalendarIcon className="w-5 h-5 text-gray-400" />
          <div>
            <div className="font-medium text-sm text-gray-500">{t('demo.mockup.freePeriod')}</div>
            <div className="text-xs text-gray-400">1:00 PM - 2:00 PM</div>
          </div>
        </div>
      </div>
    </div>
  );

  // Live Chat Mockup
  const LiveChatMockup = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">{t('demo.mockup.anonymousChat')}</h3>
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4">
        <p className="text-sm text-blue-800 font-medium">{t('demo.mockup.anonymousConfidential')}</p>
        <p className="text-xs text-blue-600">{t('demo.mockup.identityCompletelyProtected')}</p>
      </div>
      <div className="bg-gray-50 rounded-lg p-4 h-40 mb-4 overflow-y-auto">
        <div className="space-y-3">
          <div className="bg-purple-100 p-2 rounded-lg max-w-xs">
            <p className="text-sm">{t('demo.mockup.helloSafeSpace')}</p>
            <span className="text-xs text-gray-500">{t('demo.mockup.drSarah')}</span>
          </div>
          <div className="bg-blue-100 p-2 rounded-lg max-w-xs ml-auto">
            <p className="text-sm">{t('demo.mockup.feelingOverwhelmed')}</p>
            <span className="text-xs text-gray-500">{t('demo.mockup.anonymousStudent')}</span>
          </div>
          <div className="bg-purple-100 p-2 rounded-lg max-w-xs">
            <p className="text-sm">{t('demo.mockup.understandValid')}</p>
            <span className="text-xs text-gray-500">{t('demo.mockup.drSarah')}</span>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <input className="flex-1 p-2 border rounded-md text-sm" placeholder={t('demo.mockup.typeAnonymousMessage')} />
        <button className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm">{t('demo.mockup.send')}</button>
      </div>
    </div>
  );

  const demoFeatures: DemoFeature[] = [
    {
      id: "student-feedback",
      titleKey: "demo.studentFeedback.title",
      descriptionKey: "demo.studentFeedback.description",
      userType: "student",
      icon: UsersIcon,
      mockupComponent: <StudentFeedbackMockup />
    },
    {
      id: "teacher-insights",
      titleKey: "demo.teacherAnalytics.title",
      descriptionKey: "demo.teacherAnalytics.description",
      userType: "teacher",
      icon: BarChart3Icon,
      mockupComponent: <TeacherDashboardMockup />
    },
    {
      id: "mental-health-support",
      titleKey: "demo.mentalHealthSupport.title",
      descriptionKey: "demo.mentalHealthSupport.description",
      userType: "psychologist",
      icon: HeartIcon,
      mockupComponent: <MentalHealthMockup />
    },
    {
      id: "class-management",
      titleKey: "demo.classManagement.title",
      descriptionKey: "demo.classManagement.description",
      userType: "teacher",
      icon: BookOpenIcon,
      mockupComponent: <ClassManagementMockup />
    },
    {
      id: "live-chat",
      titleKey: "demo.liveChat.title",
      descriptionKey: "demo.liveChat.description",
      userType: "student",
      icon: MessageCircleIcon,
      mockupComponent: <LiveChatMockup />
    }
  ];

  // Auto-play with automatic progression
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentFeature((current) => (current + 1) % demoFeatures.length);
    }, 5000); // Change feature every 5 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [demoFeatures.length]);

  const handleFeatureSelect = (index: number) => {
    setCurrentFeature(index);
  };

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case "student": return "bg-blue-100 text-blue-700 border-blue-200";
      case "teacher": return "bg-green-100 text-green-700 border-green-200";
      case "psychologist": return "bg-purple-100 text-purple-700 border-purple-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getUserTypeLabel = (userType: string) => {
    return t(`demo.userType.${userType}`);
  };

  const currentDemo = demoFeatures[currentFeature];

  return (
    <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xl text-black font-bold max-w-3xl mx-auto">
            {t('demo.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Video Demo Area */}
          <div className="order-2 lg:order-1">
            <Card className="overflow-hidden border-2 border-primary/20">
              <CardContent className="p-0">
                {/* Live Mockup Display */}
                <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 aspect-video p-6 flex items-center justify-center">
                  <div className="w-full max-w-md">
                    {currentDemo.mockupComponent}
                  </div>
                  
                  {/* Feature Badge */}
                  <div className="absolute top-4 right-4">
                    <Badge className={getUserTypeColor(currentDemo.userType)}>
                      {getUserTypeLabel(currentDemo.userType)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feature Selection */}
          <div className="order-1 lg:order-2">
            <div className="space-y-4">
              <div className="space-y-3">
                {demoFeatures.map((feature, index) => (
                  <Card 
                    key={feature.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      currentFeature === index 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleFeatureSelect(index)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          currentFeature === index ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}>
                          <feature.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{t(feature.titleKey)}</h4>
                          <p className="text-sm text-muted-foreground">{t(feature.descriptionKey)}</p>
                        </div>
                        <Badge className={getUserTypeColor(feature.userType)}>
                          {getUserTypeLabel(feature.userType)}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Demo Statistics */}
        <div className="mt-16 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">5+</div>
              <p className="text-muted-foreground">{t('demo.stats.features')}</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">3</div>
              <p className="text-muted-foreground">{t('demo.stats.userTypes')}</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <p className="text-muted-foreground">{t('demo.stats.support')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;
