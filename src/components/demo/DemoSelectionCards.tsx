import React from 'react';
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap,
  Users,
  Heart,
  Settings,
  MicIcon
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import MobileOptimizedCard from "@/components/mobile/MobileOptimizedCard";
import MobileOptimizedButton from "@/components/mobile/MobileOptimizedButton";
import { cn } from "@/lib/utils";

interface DemoSelectionCardsProps {
  isMobile: boolean;
  onDemoSelect: (demoType: string) => void;
}

const DemoSelectionCards: React.FC<DemoSelectionCardsProps> = ({ 
  isMobile, 
  onDemoSelect 
}) => {
  const { t } = useLanguage();

  const renderVoiceCard = () => (
    <MobileOptimizedCard
      title="🎤 Voice Features"
      className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-purple-500 relative"
      icon={<MicIcon className="h-6 w-6 text-purple-600" />}
      actions={
        <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white animate-pulse">
          NEW!
        </Badge>
      }
    >
      <CardDescription className="mb-4">
        Experience revolutionary voice-powered education
      </CardDescription>
      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <p>• Student voice feedback and recording</p>
        <p>• Teacher voice message management</p>
        <p>• AI-powered emotional analysis</p>
        <p>• Voice accessibility features</p>
      </div>
      <MobileOptimizedButton 
        onClick={() => onDemoSelect('voice')}
        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
        fullWidth={true}
      >
        <MicIcon className="w-4 h-4 mr-2" />
        Try Voice Experience
      </MobileOptimizedButton>
    </MobileOptimizedCard>
  );

  const renderStudentCard = () => (
    <MobileOptimizedCard
      title={t('demo.simulation.student.title') || 'Student Experience'}
      className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-brand-teal relative"
      icon={<GraduationCap className="h-6 w-6 text-brand-teal" />}
      actions={
        <Badge className="bg-brand-teal/10 text-brand-teal border-brand-teal/20">
          {t('demo.userType.student') || 'Student'}
        </Badge>
      }
    >
      <CardDescription className="mb-4">
        {t('demo.simulation.student.description') || 'Experience the platform from a student\'s perspective'}
      </CardDescription>
      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <p>• Complete student dashboard with modern design</p>
        <p>• Interactive feedback forms with real-time updates</p>
        <p>• Wellness tracking and support features</p>
        <p>• Progress monitoring and achievements</p>
      </div>
      <MobileOptimizedButton 
        onClick={() => onDemoSelect('student')}
        className="bg-brand-teal hover:bg-brand-dark text-white"
        fullWidth={true}
      >
        <Play className="w-4 h-4 mr-2" />
        Try Student Experience
      </MobileOptimizedButton>
    </MobileOptimizedCard>
  );

  const renderTeacherCard = () => (
    <MobileOptimizedCard
      title={t('demo.simulation.teacher.title') || 'Teacher Experience'}
      className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-brand-orange relative"
      icon={<Users className="h-6 w-6 text-brand-orange" />}
      actions={
        <Badge className="bg-brand-orange/10 text-brand-orange border-brand-orange/20">
          {t('demo.userType.teacher') || 'Teacher'}
        </Badge>
      }
    >
      <CardDescription className="mb-4">
        {t('demo.simulation.teacher.description') || 'Explore comprehensive teaching tools and analytics'}
      </CardDescription>
      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <p>• Advanced analytics dashboard with insights</p>
        <p>• Real-time student feedback monitoring</p>
        <p>• Performance tracking and trends</p>
        <p>• Student wellness alerts and support</p>
      </div>
      <MobileOptimizedButton 
        onClick={() => onDemoSelect('teacher')}
        className="bg-brand-orange hover:bg-brand-orange/90 text-white"
        fullWidth={true}
      >
        <Play className="w-4 h-4 mr-2" />
        Try Teacher Experience
      </MobileOptimizedButton>
    </MobileOptimizedCard>
  );

  const renderAdminCard = () => (
    <MobileOptimizedCard
      title="School Administrator"
      className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-purple-500 relative"
      icon={<Settings className="h-6 w-6 text-purple-600" />}
      actions={
        <Badge className="bg-purple-100 text-purple-700 border-purple-200">
          Administrator
        </Badge>
      }
    >
      <CardDescription className="mb-4">
        Comprehensive school management and oversight tools
      </CardDescription>
      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <p>• School-wide performance analytics</p>
        <p>• Teacher management and invitations</p>
        <p>• System configuration and settings</p>
        <p>• Compliance monitoring and reporting</p>
      </div>
      <MobileOptimizedButton 
        onClick={() => onDemoSelect('admin')}
        className="bg-purple-600 hover:bg-purple-700 text-white"
        fullWidth={true}
      >
        <Play className="w-4 h-4 mr-2" />
        Try Administrator Tools
      </MobileOptimizedButton>
    </MobileOptimizedCard>
  );

  const renderDoctorCard = () => (
    <MobileOptimizedCard
      title="Doctor Experience"
      className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-green-500 relative"
      icon={<Heart className="h-6 w-6 text-green-600" />}
      actions={
        <Badge className="bg-green-100 text-green-700 border-green-200">
          Medical Professional
        </Badge>
      }
    >
      <CardDescription className="mb-4">
        Specialized medical support and mental health tools
      </CardDescription>
      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <p>• Mental health alert monitoring</p>
        <p>• Secure live chat with students</p>
        <p>• Wellness tracking and reports</p>
        <p>• HIPAA-compliant data handling</p>
      </div>
      <MobileOptimizedButton 
        onClick={() => onDemoSelect('doctor')}
        className="bg-green-600 hover:bg-green-700 text-white"
        fullWidth={true}
      >
        <Play className="w-4 h-4 mr-2" />
        Try Medical Tools
      </MobileOptimizedButton>
    </MobileOptimizedCard>
  );

  if (isMobile) {
    return (
      <div className="grid grid-cols-1 gap-6">
        {renderVoiceCard()}
        {renderStudentCard()}
        {renderTeacherCard()}
        {renderAdminCard()}
        {renderDoctorCard()}
      </div>
    );
  }

  return (
    <>
      {/* Desktop: First row - 2 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {renderVoiceCard()}
        {renderStudentCard()}
      </div>

      {/* Desktop: Second row - 3 cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {renderTeacherCard()}
        {renderAdminCard()}
        {renderDoctorCard()}
      </div>
    </>
  );
};

export default DemoSelectionCards;
