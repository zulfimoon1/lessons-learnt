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
  ClockIcon,
  ShieldIcon,
  LockIcon,
  FileCheckIcon,
  EyeOffIcon
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
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Student Feedback Mockup
  const StudentFeedbackMockup = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Today's Lesson Feedback</h3>
        <Badge className="bg-blue-100 text-blue-700">Mathematics - Grade 8</Badge>
      </div>
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <label className="text-sm font-medium text-blue-900 mb-2 block">How well did you understand today's lesson?</label>
          <div className="flex gap-1">
            {[1,2,3,4,5].map(star => (
              <StarIcon key={star} className="w-6 h-6 fill-yellow-400 text-yellow-400 cursor-pointer" />
            ))}
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <label className="text-sm font-medium text-green-900 mb-2 block">How are you feeling emotionally?</label>
          <div className="flex gap-2 flex-wrap">
            <div className="bg-green-200 px-3 py-2 rounded-full text-sm border-2 border-green-400">😊 Happy</div>
            <div className="bg-gray-100 px-3 py-2 rounded-full text-sm cursor-pointer hover:bg-gray-200">😐 Neutral</div>
            <div className="bg-gray-100 px-3 py-2 rounded-full text-sm cursor-pointer hover:bg-gray-200">😔 Overwhelmed</div>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">What went well in today's lesson?</label>
          <textarea 
            className="w-full p-3 border border-gray-300 rounded-md text-sm resize-none" 
            placeholder="The algebra examples were really clear and helped me understand..."
            rows={3}
            value="The algebra examples were really clear and helped me understand the concepts better."
          ></textarea>
        </div>
        <button className="w-full bg-green-600 text-white px-4 py-3 rounded-md text-sm font-medium hover:bg-green-700 transition-colors">
          Submit Anonymous Feedback
        </button>
      </div>
    </div>
  );

  // Teacher Dashboard Mockup
  const TeacherDashboardMockup = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Class Performance Analytics</h3>
        <Badge className="bg-green-100 text-green-700">Live Data</Badge>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border-l-4 border-blue-500">
          <div className="text-3xl font-bold text-blue-600">87%</div>
          <div className="text-sm text-blue-800">Average Understanding</div>
          <div className="text-xs text-blue-600 mt-1">↑ 5% from last week</div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border-l-4 border-green-500">
          <div className="text-3xl font-bold text-green-600">23</div>
          <div className="text-sm text-green-800">Active Students</div>
          <div className="text-xs text-green-600 mt-1">100% attendance today</div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
          <div>
            <span className="text-sm font-medium">Math Class - Period 3</span>
            <div className="text-xs text-gray-500">Algebra & Functions</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-green-600">92% understood</span>
            <span className="text-xs text-gray-500">4.2★</span>
          </div>
        </div>
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
          <div>
            <span className="text-sm font-medium">Science Lab - Period 5</span>
            <div className="text-xs text-gray-500">Chemical Reactions</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-green-600">89% understood</span>
            <span className="text-xs text-gray-500">4.7★</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Mental Health Support Mockup - Enhanced with anonymity and compliance
  const MentalHealthMockup = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Anonymous Mental Health Support</h3>
        <div className="flex items-center gap-1">
          <EyeOffIcon className="w-4 h-4 text-purple-600" />
          <Badge className="bg-purple-100 text-purple-700">100% Anonymous</Badge>
        </div>
      </div>
      
      {/* Compliance Badges */}
      <div className="flex gap-2 mb-4">
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

      <div className="space-y-4">
        <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Dr. Sarah - Online Now</span>
            <Badge className="bg-white text-purple-700 text-xs">Licensed Therapist</Badge>
          </div>
          <p className="text-sm text-purple-700">Available for anonymous live chat support</p>
          <p className="text-xs text-purple-600 mt-1">🔒 Your identity remains completely private</p>
        </div>
        
        <div className="space-y-2">
          <button className="w-full bg-purple-600 text-white p-3 rounded-md text-sm font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
            <MessageCircleIcon className="w-4 h-4" />
            Start Anonymous Chat
          </button>
          <button className="w-full border border-purple-600 text-purple-600 p-3 rounded-md text-sm font-medium hover:bg-purple-50 transition-colors">
            Schedule Private Appointment
          </button>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg border">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <p className="text-xs font-medium text-gray-700">24/7 Crisis Support Available</p>
          </div>
          <p className="text-xs text-gray-600">Emergency support with certified professionals</p>
        </div>
      </div>
    </div>
  );

  // Class Management Mockup
  const ClassManagementMockup = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Today's Schedule</h3>
        <Badge className="bg-blue-100 text-blue-700">Grade 8A</Badge>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
          <ClockIcon className="w-6 h-6 text-blue-600" />
          <div className="flex-1">
            <div className="font-medium text-sm">Mathematics</div>
            <div className="text-xs text-gray-600">Algebra & Linear Equations</div>
            <div className="text-xs text-blue-600 font-medium">9:00 AM - 10:30 AM</div>
          </div>
          <Badge className="bg-blue-100 text-blue-700">Current</Badge>
        </div>
        
        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
          <ClockIcon className="w-6 h-6 text-green-600" />
          <div className="flex-1">
            <div className="font-medium text-sm">Science Lab</div>
            <div className="text-xs text-gray-600">Chemical Reactions & Experiments</div>
            <div className="text-xs text-green-600 font-medium">11:00 AM - 12:30 PM</div>
          </div>
          <Badge className="bg-green-100 text-green-700">Next</Badge>
        </div>
        
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border-l-4 border-gray-300">
          <CalendarIcon className="w-6 h-6 text-gray-400" />
          <div className="flex-1">
            <div className="font-medium text-sm text-gray-500">Lunch Break</div>
            <div className="text-xs text-gray-400">Free time for students</div>
            <div className="text-xs text-gray-400">1:00 PM - 2:00 PM</div>
          </div>
        </div>
      </div>
    </div>
  );

  // Live Chat Mockup - Enhanced with anonymity features
  const LiveChatMockup = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Anonymous Live Chat</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-green-600 font-medium">Secure Connection</span>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4 h-48 mb-4 overflow-y-auto border">
        <div className="space-y-3">
          <div className="bg-purple-100 p-3 rounded-lg max-w-xs border">
            <p className="text-sm">Hello! I'm Dr. Sarah. This is a completely anonymous and secure space. How can I help you today?</p>
            <div className="flex items-center gap-1 mt-1">
              <LockIcon className="w-3 h-3 text-purple-600" />
              <span className="text-xs text-purple-600">Licensed Therapist</span>
            </div>
          </div>
          
          <div className="bg-blue-100 p-3 rounded-lg max-w-xs ml-auto border">
            <p className="text-sm">I'm feeling overwhelmed with my studies and social pressure...</p>
            <span className="text-xs text-blue-600">Anonymous Student</span>
          </div>
          
          <div className="bg-purple-100 p-3 rounded-lg max-w-xs border">
            <p className="text-sm">I understand completely. Those feelings are very common. Let's explore some coping strategies together...</p>
            <span className="text-xs text-purple-600">Dr. Sarah</span>
          </div>
        </div>
      </div>
      
      <div className="flex gap-2">
        <input 
          className="flex-1 p-3 border border-gray-300 rounded-md text-sm" 
          placeholder="Type your message... (completely anonymous)"
          value=""
        />
        <button className="bg-purple-600 text-white px-4 py-3 rounded-md text-sm font-medium hover:bg-purple-700 transition-colors">
          Send
        </button>
      </div>
      
      <div className="flex items-center gap-1 mt-2">
        <EyeOffIcon className="w-3 h-3 text-gray-500" />
        <span className="text-xs text-gray-500">Your identity is completely protected and anonymous</span>
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

  // Enhanced text-to-speech functionality with better female voice selection and higher volume
  const playVoiceover = (text: string) => {
    if (!('speechSynthesis' in window)) {
      toast({
        title: "Text-to-Speech Not Supported",
        description: "Your browser doesn't support text-to-speech functionality",
        variant: "destructive"
      });
      return null;
    }

    // Cancel any existing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    utterance.pitch = 1.1;
    utterance.volume = isMuted ? 0 : 1.0; // Maximum volume

    // Wait for voices to be loaded
    const setVoice = () => {
      const voices = speechSynthesis.getVoices();
      console.log('Available voices:', voices.map(v => `${v.name} (${v.lang}) - ${v.gender || 'unknown gender'}`));
      
      // Enhanced female voice selection with multiple fallbacks
      const femaleVoice = voices.find(voice => {
        const name = voice.name.toLowerCase();
        const lang = voice.lang.toLowerCase();
        return (
          // Prioritize high-quality female voices
          name.includes('samantha') ||
          name.includes('karen') ||
          name.includes('susan') ||
          name.includes('sarah') ||
          name.includes('emma') ||
          name.includes('female') ||
          name.includes('woman') ||
          name.includes('zira') ||
          name.includes('hazel') ||
          name.includes('moira') ||
          name.includes('tessa') ||
          name.includes('fiona') ||
          name.includes('kate') ||
          name.includes('victoria') ||
          // Google voices
          (name.includes('google') && name.includes('female')) ||
          (name.includes('google') && lang.includes('en') && name.includes('2')) ||
          // Microsoft voices
          name.includes('microsoft zira') ||
          // Natural-sounding voices that are typically female
          (lang.includes('en') && (
            name.includes('natural') ||
            name.includes('neural')
          ))
        );
      });

      if (femaleVoice) {
        utterance.voice = femaleVoice;
        console.log('Using female voice:', femaleVoice.name, 'Language:', femaleVoice.lang);
      } else {
        // Fallback to any English voice
        const englishVoice = voices.find(voice => voice.lang.startsWith('en'));
        if (englishVoice) {
          utterance.voice = englishVoice;
          console.log('Using fallback English voice:', englishVoice.name);
        }
      }
    };

    // Set voice immediately if available, otherwise wait for voices to load
    if (speechSynthesis.getVoices().length > 0) {
      setVoice();
    } else {
      speechSynthesis.onvoiceschanged = setVoice;
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
      if (currentUtterance) {
        speechSynthesis.cancel();
        setCurrentUtterance(null);
      }
    } else {
      // Play
      setIsPlaying(true);
      const utterance = playVoiceover(demoFeatures[currentFeature].voiceoverText);
      if (utterance) {
        utterance.onend = () => {
          setCurrentUtterance(null);
        };
        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event);
          toast({
            title: "Audio Error",
            description: "There was an issue playing the audio. Please try again.",
            variant: "destructive"
          });
        };
        speechSynthesis.speak(utterance);
        setCurrentUtterance(utterance);
      }
    }
  };

  const handleFeatureSelect = (index: number) => {
    // Stop current audio
    if (currentUtterance) {
      speechSynthesis.cancel();
      setCurrentUtterance(null);
    }
    
    setCurrentFeature(index);
    setProgress(0);
    
    // If playing, start new voiceover
    if (isPlaying) {
      const utterance = playVoiceover(demoFeatures[index].voiceoverText);
      if (utterance) {
        utterance.onend = () => {
          setCurrentUtterance(null);
        };
        speechSynthesis.speak(utterance);
        setCurrentUtterance(utterance);
      }
    }
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    if (currentUtterance) {
      speechSynthesis.cancel();
      setCurrentUtterance(null);
      if (isPlaying) {
        // Restart with new volume setting
        setTimeout(() => {
          const utterance = playVoiceover(demoFeatures[currentFeature].voiceoverText);
          if (utterance) {
            utterance.volume = !isMuted ? 0 : 1.0;
            speechSynthesis.speak(utterance);
            setCurrentUtterance(utterance);
          }
        }, 100);
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
