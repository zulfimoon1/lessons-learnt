
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
  title: string;
  description: string;
  userType: "student" | "teacher" | "psychologist";
  icon: any;
  videoDescription: string;
  voiceoverText: string;
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
      title: "Student Feedback System",
      description: "Students provide real-time feedback on lessons and emotional state",
      userType: "student",
      icon: UsersIcon,
      videoDescription: "Student dashboard showing feedback forms and emotional state tracking",
      voiceoverText: "Welcome to our comprehensive student feedback system. Students can easily share their thoughts about lessons and track their emotional well-being in a safe, supportive environment. All feedback is completely anonymous and helps teachers improve their teaching methods.",
      mockupComponent: <StudentFeedbackMockup />
    },
    {
      id: "teacher-insights",
      title: "Teacher Analytics Dashboard",
      description: "Teachers access detailed insights and performance analytics",
      userType: "teacher",
      icon: BarChart3Icon,
      videoDescription: "Teacher dashboard with analytics, class schedules, and student insights",
      voiceoverText: "Our teacher dashboard provides powerful analytics and insights, helping educators understand student progress and adapt their teaching methods for maximum effectiveness. Real-time data helps identify students who may need additional support.",
      mockupComponent: <TeacherDashboardMockup />
    },
    {
      id: "mental-health-support",
      title: "Anonymous Mental Health Support",
      description: "Integrated mental health resources with complete anonymity and GDPR compliance",
      userType: "psychologist",
      icon: HeartIcon,
      videoDescription: "Mental health support interface with anonymous chat and compliance features",
      voiceoverText: "Mental health support is seamlessly integrated into our platform with complete anonymity protection. Our GDPR, SOC 2, and HIPAA compliant system connects students with qualified professionals through secure, anonymous live chat features.",
      mockupComponent: <MentalHealthMockup />
    },
    {
      id: "class-management",
      title: "Class Schedule Management",
      description: "Comprehensive class scheduling and management tools",
      userType: "teacher",
      icon: BookOpenIcon,
      videoDescription: "Class scheduling interface and calendar management",
      voiceoverText: "Efficient class management tools help teachers organize schedules, track attendance, and manage lesson plans all in one integrated platform. Students can easily view their daily schedules and upcoming assignments.",
      mockupComponent: <ClassManagementMockup />
    },
    {
      id: "live-chat",
      title: "Anonymous Live Mental Health Chat",
      description: "Instant anonymous access to mental health professionals",
      userType: "student",
      icon: MessageCircleIcon,
      videoDescription: "Anonymous live chat interface connecting students with mental health professionals",
      voiceoverText: "Students have instant access to mental health support through our completely anonymous live chat system. Our robust, compliant platform ensures help is always available when needed while protecting student privacy.",
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
    const utterance = playVoiceover(demoFeatures[currentFeature].voiceoverText);
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
  }, [currentFeature]);

  const handleFeatureSelect = (index: number) => {
    // Stop current audio
    stopVoiceover();
    
    setCurrentFeature(index);
    
    // Start new voiceover
    const utterance = playVoiceover(demoFeatures[index].voiceoverText);
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
            Experience our comprehensive education platform through this interactive demonstration showcasing features for students, teachers, and mental health professionals.
          </p>
          
          {/* Compliance Banner */}
          <div className="flex justify-center gap-3 mt-6">
            <Badge className="bg-blue-50 text-blue-700 border border-blue-200">
              <ShieldIcon className="w-3 h-3 mr-1" />
              GDPR Compliant
            </Badge>
            <Badge className="bg-green-50 text-green-700 border border-green-200">
              <LockIcon className="w-3 h-3 mr-1" />
              SOC 2 Certified
            </Badge>
            <Badge className="bg-purple-50 text-purple-700 border border-purple-200">
              <FileCheckIcon className="w-3 h-3 mr-1" />
              HIPAA Compliant
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Robust, secure platform with enterprise-grade compliance
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
                      {currentDemo.userType.charAt(0).toUpperCase() + currentDemo.userType.slice(1)} View
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
                  <span className="text-sm font-medium text-purple-700">Live Voiceover</span>
                </div>
                <p className="text-sm text-purple-600 italic">
                  "{currentDemo.voiceoverText}"
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Feature Selection */}
          <div className="order-1 lg:order-2">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-foreground mb-6">
                Explore Platform Features
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
                          <h4 className="font-semibold text-foreground">{feature.title}</h4>
                          <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                        <Badge className={getUserTypeColor(feature.userType)}>
                          {feature.userType}
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
              <p className="text-muted-foreground">Core Features</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">3</div>
              <p className="text-muted-foreground">User Types</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <p className="text-muted-foreground">Mental Health Support</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;
