
import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  PlayIcon, 
  PauseIcon, 
  VolumeIcon, 
  Volume2Icon,
  UsersIcon,
  BookOpenIcon,
  HeartIcon,
  GraduationCapIcon,
  MessageCircleIcon,
  BarChart3Icon
} from "lucide-react";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { useLanguage } from "@/contexts/LanguageContext";

interface DemoFeature {
  id: string;
  title: string;
  description: string;
  userType: "student" | "teacher" | "psychologist";
  icon: any;
  videoDescription: string;
  voiceoverText: string;
}

const DemoSection = () => {
  const { t } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  const demoFeatures: DemoFeature[] = [
    {
      id: "student-feedback",
      title: "Student Feedback System",
      description: "Students provide real-time feedback on lessons and emotional state",
      userType: "student",
      icon: UsersIcon,
      videoDescription: "Student dashboard showing feedback forms and emotional state tracking",
      voiceoverText: "Welcome to our comprehensive student feedback system. Students can easily share their thoughts about lessons and track their emotional well-being in a safe, supportive environment."
    },
    {
      id: "teacher-insights",
      title: "Teacher Analytics Dashboard",
      description: "Teachers access detailed insights and performance analytics",
      userType: "teacher",
      icon: BarChart3Icon,
      videoDescription: "Teacher dashboard with analytics, class schedules, and student insights",
      voiceoverText: "Our teacher dashboard provides powerful analytics and insights, helping educators understand student progress and adapt their teaching methods for maximum effectiveness."
    },
    {
      id: "mental-health-support",
      title: "Mental Health Support",
      description: "Integrated mental health resources and professional support",
      userType: "psychologist",
      icon: HeartIcon,
      videoDescription: "Mental health support interface with live chat and resource access",
      voiceoverText: "Mental health support is seamlessly integrated into our platform, connecting students with qualified professionals through our 'Ask the Doctor' live chat feature."
    },
    {
      id: "class-management",
      title: "Class Schedule Management",
      description: "Comprehensive class scheduling and management tools",
      userType: "teacher",
      icon: BookOpenIcon,
      videoDescription: "Class scheduling interface and calendar management",
      voiceoverText: "Efficient class management tools help teachers organize schedules, track attendance, and manage lesson plans all in one integrated platform."
    },
    {
      id: "live-chat",
      title: "Live Mental Health Chat",
      description: "Instant access to mental health professionals",
      userType: "student",
      icon: MessageCircleIcon,
      videoDescription: "Live chat interface connecting students with mental health professionals",
      voiceoverText: "Students have instant access to mental health support through our live chat system, ensuring help is always available when needed."
    }
  ];

  // Simulate video playback with automatic progression
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            // Move to next feature
            setCurrentFeature((current) => (current + 1) % demoFeatures.length);
            return 0;
          }
          return prev + 2; // Progress 2% every 100ms (5 seconds per feature)
        });
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, demoFeatures.length]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    
    // Simulate voiceover (in a real implementation, this would be actual audio)
    if (!isPlaying) {
      console.log(`Playing voiceover: ${demoFeatures[currentFeature].voiceoverText}`);
    }
  };

  const handleFeatureSelect = (index: number) => {
    setCurrentFeature(index);
    setProgress(0);
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
    <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Platform Demo
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Experience our comprehensive education platform through this interactive demonstration showcasing features for students, teachers, and mental health professionals.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Video Demo Area */}
          <div className="order-2 lg:order-1">
            <Card className="overflow-hidden border-2 border-primary/20">
              <CardContent className="p-0">
                {/* Simulated Video Player */}
                <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 aspect-video">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <currentDemo.icon className="w-16 h-16 mx-auto mb-4 text-primary" />
                      <h3 className="text-2xl font-bold mb-2">{currentDemo.title}</h3>
                      <p className="text-gray-300 mb-4">{currentDemo.videoDescription}</p>
                      <Badge className={getUserTypeColor(currentDemo.userType)}>
                        {currentDemo.userType.charAt(0).toUpperCase() + currentDemo.userType.slice(1)} View
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-4">
                    <div className="flex items-center gap-4">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={handlePlayPause}
                        className="flex-shrink-0"
                      >
                        {isPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                      </Button>
                      
                      <div className="flex-1 bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-100"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setIsMuted(!isMuted)}
                        className="flex-shrink-0"
                      >
                        {isMuted ? <VolumeIcon className="w-4 h-4" /> : <Volume2Icon className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Voiceover Transcript */}
            <Card className="mt-4 border border-purple-200 bg-purple-50/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Volume2Icon className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">Voiceover Transcript</span>
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
