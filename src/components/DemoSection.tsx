
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
  BarChart3Icon,
  StarIcon,
  CalendarIcon,
  ClockIcon
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Student Feedback Mockup
  const StudentFeedbackMockup = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Lesson Feedback</h3>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Understanding Level</label>
          <div className="flex gap-1 mt-1">
            {[1,2,3,4,5].map(star => (
              <StarIcon key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">How are you feeling?</label>
          <div className="flex gap-2 mt-2">
            <div className="bg-green-100 px-3 py-1 rounded-full text-sm">😊 Happy</div>
            <div className="bg-gray-100 px-3 py-1 rounded-full text-sm">😐 Neutral</div>
          </div>
        </div>
        <textarea className="w-full p-3 border rounded-md text-sm" placeholder="What went well in today's lesson?" rows={3}></textarea>
        <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm">Submit Feedback</button>
      </div>
    </div>
  );

  // Teacher Dashboard Mockup
  const TeacherDashboardMockup = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Teacher Analytics</h3>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">87%</div>
          <div className="text-sm text-blue-800">Avg Understanding</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-green-600">23</div>
          <div className="text-sm text-green-800">Active Students</div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
          <span className="text-sm">Math Class - Period 3</span>
          <span className="text-xs text-gray-500">4.2★</span>
        </div>
        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
          <span className="text-sm">Science Lab - Period 5</span>
          <span className="text-xs text-gray-500">4.7★</span>
        </div>
      </div>
    </div>
  );

  // Mental Health Support Mockup
  const MentalHealthMockup = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Mental Health Support</h3>
      <div className="space-y-4">
        <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium">Dr. Sarah - Online</span>
          </div>
          <p className="text-sm text-purple-700">Available for live chat support</p>
        </div>
        <div className="space-y-2">
          <button className="w-full bg-purple-600 text-white p-3 rounded-md text-sm">Start Live Chat</button>
          <button className="w-full border border-purple-600 text-purple-600 p-3 rounded-md text-sm">Book Appointment</button>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600">24/7 crisis support available</p>
        </div>
      </div>
    </div>
  );

  // Class Management Mockup
  const ClassManagementMockup = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Class Schedule</h3>
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
          <ClockIcon className="w-5 h-5 text-blue-600" />
          <div>
            <div className="font-medium text-sm">Mathematics</div>
            <div className="text-xs text-gray-600">9:00 AM - 10:30 AM</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
          <ClockIcon className="w-5 h-5 text-green-600" />
          <div>
            <div className="font-medium text-sm">Science Lab</div>
            <div className="text-xs text-gray-600">11:00 AM - 12:30 PM</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <CalendarIcon className="w-5 h-5 text-gray-400" />
          <div>
            <div className="font-medium text-sm text-gray-500">Free Period</div>
            <div className="text-xs text-gray-400">1:00 PM - 2:00 PM</div>
          </div>
        </div>
      </div>
    </div>
  );

  // Live Chat Mockup
  const LiveChatMockup = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Live Chat with Dr. Sarah</h3>
      <div className="bg-gray-50 rounded-lg p-4 h-40 mb-4 overflow-y-auto">
        <div className="space-y-3">
          <div className="bg-purple-100 p-2 rounded-lg max-w-xs">
            <p className="text-sm">Hello! How can I help you today?</p>
            <span className="text-xs text-gray-500">Dr. Sarah</span>
          </div>
          <div className="bg-blue-100 p-2 rounded-lg max-w-xs ml-auto">
            <p className="text-sm">I'm feeling overwhelmed with my studies...</p>
            <span className="text-xs text-gray-500">You</span>
          </div>
          <div className="bg-purple-100 p-2 rounded-lg max-w-xs">
            <p className="text-sm">I understand. Let's talk about some strategies that might help...</p>
            <span className="text-xs text-gray-500">Dr. Sarah</span>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <input className="flex-1 p-2 border rounded-md text-sm" placeholder="Type your message..." />
        <button className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm">Send</button>
      </div>
    </div>
  );

  const demoFeatures: DemoFeature[] = [
    {
      id: "student-feedback",
      title: "Student Feedback System",
      description: "Students provide real-time feedback on lessons and emotional state",
      userType: "student",
      icon: UsersIcon,
      videoDescription: "Student dashboard showing feedback forms and emotional state tracking",
      voiceoverText: "Welcome to our comprehensive student feedback system. Students can easily share their thoughts about lessons and track their emotional well-being in a safe, supportive environment.",
      mockupComponent: <StudentFeedbackMockup />
    },
    {
      id: "teacher-insights",
      title: "Teacher Analytics Dashboard",
      description: "Teachers access detailed insights and performance analytics",
      userType: "teacher",
      icon: BarChart3Icon,
      videoDescription: "Teacher dashboard with analytics, class schedules, and student insights",
      voiceoverText: "Our teacher dashboard provides powerful analytics and insights, helping educators understand student progress and adapt their teaching methods for maximum effectiveness.",
      mockupComponent: <TeacherDashboardMockup />
    },
    {
      id: "mental-health-support",
      title: "Mental Health Support",
      description: "Integrated mental health resources and professional support",
      userType: "psychologist",
      icon: HeartIcon,
      videoDescription: "Mental health support interface with live chat and resource access",
      voiceoverText: "Mental health support is seamlessly integrated into our platform, connecting students with qualified professionals through our Ask the Doctor live chat feature.",
      mockupComponent: <MentalHealthMockup />
    },
    {
      id: "class-management",
      title: "Class Schedule Management",
      description: "Comprehensive class scheduling and management tools",
      userType: "teacher",
      icon: BookOpenIcon,
      videoDescription: "Class scheduling interface and calendar management",
      voiceoverText: "Efficient class management tools help teachers organize schedules, track attendance, and manage lesson plans all in one integrated platform.",
      mockupComponent: <ClassManagementMockup />
    },
    {
      id: "live-chat",
      title: "Live Mental Health Chat",
      description: "Instant access to mental health professionals",
      userType: "student",
      icon: MessageCircleIcon,
      videoDescription: "Live chat interface connecting students with mental health professionals",
      voiceoverText: "Students have instant access to mental health support through our live chat system, ensuring help is always available when needed.",
      mockupComponent: <LiveChatMockup />
    }
  ];

  // Text-to-speech functionality with improved female voice selection
  const playVoiceover = (text: string) => {
    if (!('speechSynthesis' in window)) {
      toast({
        title: "Text-to-Speech Not Supported",
        description: "Your browser doesn't support text-to-speech functionality",
        variant: "destructive"
      });
      return null;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.pitch = 1.2;
    utterance.volume = isMuted ? 0 : 0.9; // Increased volume
    
    // Enhanced female voice selection
    const voices = speechSynthesis.getVoices();
    const femaleVoice = voices.find(voice => 
      voice.name.toLowerCase().includes('female') || 
      voice.name.toLowerCase().includes('woman') ||
      voice.name.toLowerCase().includes('zira') ||
      voice.name.toLowerCase().includes('susan') ||
      voice.name.toLowerCase().includes('samantha') ||
      voice.name.toLowerCase().includes('karen') ||
      voice.name.toLowerCase().includes('moira') ||
      voice.name.toLowerCase().includes('tessa') ||
      voice.name.toLowerCase().includes('fiona') ||
      voice.name.toLowerCase().includes('microsoft zira') ||
      voice.name.toLowerCase().includes('google uk english female')
    ) || voices.find(voice => voice.lang.includes('en') && voice.name.includes('f'));
    
    if (femaleVoice) {
      utterance.voice = femaleVoice;
      console.log('Using female voice:', femaleVoice.name);
    } else {
      // Fallback: try to find any English voice that might be female
      const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));
      if (englishVoices.length > 0) {
        utterance.voice = englishVoices[0];
        console.log('Using fallback voice:', englishVoices[0].name);
      }
    }

    return utterance;
  };

  // Video/audio simulation with automatic progression
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            // Move to next feature
            setCurrentFeature((current) => (current + 1) % demoFeatures.length);
            return 0;
          }
          return prev + 1.5; // Slower progression for longer viewing
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
    if (isPlaying) {
      // Pause
      setIsPlaying(false);
      if (currentAudio) {
        speechSynthesis.cancel();
        setCurrentAudio(null);
      }
    } else {
      // Play
      setIsPlaying(true);
      const utterance = playVoiceover(demoFeatures[currentFeature].voiceoverText);
      if (utterance) {
        utterance.onend = () => {
          setCurrentAudio(null);
        };
        speechSynthesis.speak(utterance);
        setCurrentAudio(utterance as any);
      }
    }
  };

  const handleFeatureSelect = (index: number) => {
    // Stop current audio
    if (currentAudio) {
      speechSynthesis.cancel();
      setCurrentAudio(null);
    }
    
    setCurrentFeature(index);
    setProgress(0);
    
    // If playing, start new voiceover
    if (isPlaying) {
      const utterance = playVoiceover(demoFeatures[index].voiceoverText);
      if (utterance) {
        utterance.onend = () => {
          setCurrentAudio(null);
        };
        speechSynthesis.speak(utterance);
        setCurrentAudio(utterance as any);
      }
    }
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    if (currentAudio) {
      speechSynthesis.cancel();
      setCurrentAudio(null);
      if (isPlaying) {
        // Restart with new volume setting
        const utterance = playVoiceover(demoFeatures[currentFeature].voiceoverText);
        if (utterance) {
          utterance.volume = !isMuted ? 0 : 0.9;
          speechSynthesis.speak(utterance);
          setCurrentAudio(utterance as any);
        }
      }
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
                  
                  {/* Progress Bar and Controls */}
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
                        onClick={handleMuteToggle}
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
