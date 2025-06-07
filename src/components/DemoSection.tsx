
import { useState, useRef, useEffect } from "react";
import { 
  UsersIcon,
  BookOpenIcon,
  HeartIcon,
  MessageCircleIcon,
  BarChart3Icon,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useVoiceover } from "@/hooks/useVoiceover";

// Import new components
import DemoFeatureCard from "@/components/demo/DemoFeatureCard";
import DemoVideoArea from "@/components/demo/DemoVideoArea";
import DemoStats from "@/components/demo/DemoStats";
import ComplianceBadges from "@/components/demo/ComplianceBadges";

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
  const { 
    playVoiceover, 
    startPlayback, 
    stopVoiceover, 
    currentUtterance, 
    isPlaying,
    isReady,
    hasUserInteracted
  } = useVoiceover();
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
    }, 12000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [demoFeatures.length]);

  // Prepare voiceover when feature changes
  useEffect(() => {
    stopVoiceover();
    const voiceoverText = t(demoFeatures[currentFeature].voiceoverKey);
    playVoiceover(voiceoverText, false);
  }, [currentFeature, t]);

  const handleFeatureSelect = (index: number) => {
    stopVoiceover();
    setCurrentFeature(index);
    const voiceoverText = t(demoFeatures[index].voiceoverKey);
    playVoiceover(voiceoverText, false);
  };

  const handlePlayPause = () => {
    console.log('Play/Pause clicked', { isPlaying, currentUtterance: !!currentUtterance });
    
    if (isPlaying) {
      stopVoiceover();
    } else if (currentUtterance) {
      startPlayback();
    } else {
      const voiceoverText = t(demoFeatures[currentFeature].voiceoverKey);
      const utterance = playVoiceover(voiceoverText, false);
      if (utterance) {
        setTimeout(() => startPlayback(), 100);
      }
    }
  };

  const currentDemo = demoFeatures[currentFeature];

  return (
    <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ComplianceBadges />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <DemoVideoArea
              currentDemo={currentDemo}
              isPlaying={isPlaying}
              currentUtterance={currentUtterance}
              isReady={isReady}
              hasUserInteracted={hasUserInteracted}
              onPlayPause={handlePlayPause}
            />
          </div>

          <div className="order-1 lg:order-2">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-foreground mb-6">
                {t('demo.exploreFeatures')}
              </h3>
              
              <div className="space-y-3">
                {demoFeatures.map((feature, index) => (
                  <DemoFeatureCard
                    key={feature.id}
                    feature={feature}
                    index={index}
                    isActive={currentFeature === index}
                    onSelect={handleFeatureSelect}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <DemoStats />
      </div>
    </section>
  );
};

export default DemoSection;
