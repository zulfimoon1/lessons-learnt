
import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  UsersIcon,
  BookOpenIcon,
  HeartIcon,
  GraduationCapIcon,
  MessageCircleIcon,
  BarChart3Icon,
  CalendarIcon,
  ClockIcon,
  ShieldIcon,
  LockIcon,
  FileCheckIcon
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useVoiceover } from "@/hooks/useVoiceover";

// Import mockup components
import StudentFeedbackMockup from "@/components/demo/StudentFeedbackMockup";
import TeacherDashboardMockup from "@/components/demo/TeacherDashboardMockup";
import MentalHealthMockup from "@/components/demo/MentalHealthMockup";
import ClassManagementMockup from "@/components/demo/ClassManagementMockup";
import LiveChatMockup from "@/components/demo/LiveChatMockup";

interface DemoFeature {
  id: string;
  titleKey: string;
  descriptionKey: string;
  userType: "student" | "teacher" | "psychologist";
  icon: any;
  voiceoverKey: string;
  mockupComponent: React.ReactNode;
}

const DemoSection = () => {
  const { t } = useLanguage();
  const [currentFeature, setCurrentFeature] = useState(0);
  const { playVoiceover, stopVoiceover, currentUtterance, setCurrentUtterance } = useVoiceover();
  const intervalRef = useRef<NodeJS.Timeout>();

  const demoFeatures: DemoFeature[] = [
    {
      id: "student-feedback",
      titleKey: "demo.studentFeedback.title",
      descriptionKey: "demo.studentFeedback.description",
      userType: "student",
      icon: UsersIcon,
      voiceoverKey: "demo.studentFeedback.voiceover",
      mockupComponent: <StudentFeedbackMockup />
    },
    {
      id: "teacher-insights",
      titleKey: "demo.teacherInsights.title",
      descriptionKey: "demo.teacherInsights.description",
      userType: "teacher",
      icon: BarChart3Icon,
      voiceoverKey: "demo.teacherInsights.voiceover",
      mockupComponent: <TeacherDashboardMockup />
    },
    {
      id: "mental-health-support",
      titleKey: "demo.mentalHealth.title",
      descriptionKey: "demo.mentalHealth.description",
      userType: "psychologist",
      icon: HeartIcon,
      voiceoverKey: "demo.mentalHealth.voiceover",
      mockupComponent: <MentalHealthMockup />
    },
    {
      id: "class-management",
      titleKey: "demo.classManagement.title",
      descriptionKey: "demo.classManagement.description",
      userType: "teacher",
      icon: BookOpenIcon,
      voiceoverKey: "demo.classManagement.voiceover",
      mockupComponent: <ClassManagementMockup />
    },
    {
      id: "live-chat",
      titleKey: "demo.liveChat.title",
      descriptionKey: "demo.liveChat.description",
      userType: "student",
      icon: MessageCircleIcon,
      voiceoverKey: "demo.liveChat.voiceover",
      mockupComponent: <LiveChatMockup />
    }
  ];

  // Auto-rotate through features
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentFeature((current) => (current + 1) % demoFeatures.length);
    }, 8000); // Change every 8 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [demoFeatures.length]);

  // Auto-play voiceover when feature changes
  useEffect(() => {
    const voiceoverText = t(demoFeatures[currentFeature].voiceoverKey);
    const utterance = playVoiceover(voiceoverText);
    if (utterance) {
      utterance.onend = () => {
        setCurrentUtterance(null);
      };
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
      };
      speechSynthesis.speak(utterance);
      setCurrentUtterance(utterance);
    }

    return () => {
      stopVoiceover();
    };
  }, [currentFeature, t]);

  const handleFeatureSelect = (index: number) => {
    // Stop current audio
    stopVoiceover();
    
    setCurrentFeature(index);
    
    // Start new voiceover
    const voiceoverText = t(demoFeatures[index].voiceoverKey);
    const utterance = playVoiceover(voiceoverText);
    if (utterance) {
      utterance.onend = () => {
        setCurrentUtterance(null);
      };
      speechSynthesis.speak(utterance);
      setCurrentUtterance(utterance);
    }
  };

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case "student": return "bg-blue-100 text-blue-700 border-blue-200";
      case "teacher": return "bg-green-100 text-green-700 border-green-200";
      case "psychologist": return "bg-purple-100 text-purple-700 border-purple-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const currentDemo = demoFeatures[currentFeature];

  return (
    <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('demo.subtitle')}
          </p>
          
          {/* Compliance Banner */}
          <div className="flex justify-center gap-3 mt-6">
            <Badge className="bg-blue-50 text-blue-700 border border-blue-200">
              <ShieldIcon className="w-3 h-3 mr-1" />
              {t('demo.compliance.gdpr')}
            </Badge>
            <Badge className="bg-green-50 text-green-700 border border-green-200">
              <LockIcon className="w-3 h-3 mr-1" />
              {t('demo.compliance.soc2')}
            </Badge>
            <Badge className="bg-purple-50 text-purple-700 border border-purple-200">
              <FileCheckIcon className="w-3 h-3 mr-1" />
              {t('demo.compliance.hipaa')}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {t('demo.compliance.description')}
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
                      {t(`demo.userType.${currentDemo.userType}`)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Voiceover Transcript */}
            <Card className="mt-4 border border-purple-200 bg-purple-50/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-purple-700">{t('demo.liveVoiceover')}</span>
                </div>
                <p className="text-sm text-purple-600 italic">
                  "{t(currentDemo.voiceoverKey)}"
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Feature Selection */}
          <div className="order-1 lg:order-2">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-foreground mb-6">
                {t('demo.exploreFeatures')}
              </h3>
              
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
                          {t(`demo.userType.${feature.userType}`)}
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
              <p className="text-muted-foreground">{t('demo.stats.coreFeatures')}</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">3</div>
              <p className="text-muted-foreground">{t('demo.stats.userTypes')}</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <p className="text-muted-foreground">{t('demo.stats.mentalHealthSupport')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;
