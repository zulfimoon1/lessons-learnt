
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { CardDescription } from "@/components/ui/card";
import { 
  GraduationCap,
  Users,
  Heart,
  Settings,
  MicIcon,
  Play
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import MobileOptimizedCard from "@/components/mobile/MobileOptimizedCard";
import MobileOptimizedButton from "@/components/mobile/MobileOptimizedButton";

interface DemoSelectionCardsProps {
  isMobile: boolean;
  onDemoSelect: (demoType: string) => void;
}

const DemoSelectionCards: React.FC<DemoSelectionCardsProps> = ({ 
  isMobile, 
  onDemoSelect 
}) => {
  const { t } = useLanguage();

  const demoCards = [
    {
      id: 'voice',
      title: '🎤 Voice Features',
      description: 'Experience revolutionary voice-powered education',
      icon: <MicIcon className="h-6 w-6 text-purple-600" />,
      badgeText: 'NEW!',
      badgeClass: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white animate-pulse',
      buttonClass: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white',
      borderClass: 'hover:border-purple-500',
      features: [
        'Student voice feedback and recording',
        'Teacher voice message management',
        'AI-powered emotional analysis',
        'Voice accessibility features'
      ]
    },
    {
      id: 'student',
      title: t('demo.simulation.student.title') || 'Student Experience',
      description: t('demo.simulation.student.description') || 'Experience the platform from a student\'s perspective',
      icon: <GraduationCap className="h-6 w-6 text-brand-teal" />,
      badgeText: t('demo.userType.student') || 'Student',
      badgeClass: 'bg-brand-teal/10 text-brand-teal border-brand-teal/20',
      buttonClass: 'bg-brand-teal hover:bg-brand-dark text-white',
      borderClass: 'hover:border-brand-teal',
      features: [
        'Complete student dashboard with modern design',
        'Interactive feedback forms with real-time updates',
        'Wellness tracking and support features',
        'Progress monitoring and achievements'
      ]
    },
    {
      id: 'teacher',
      title: t('demo.simulation.teacher.title') || 'Teacher Experience',
      description: t('demo.simulation.teacher.description') || 'Explore comprehensive teaching tools and analytics',
      icon: <Users className="h-6 w-6 text-brand-orange" />,
      badgeText: t('demo.userType.teacher') || 'Teacher',
      badgeClass: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20',
      buttonClass: 'bg-brand-orange hover:bg-brand-orange/90 text-white',
      borderClass: 'hover:border-brand-orange',
      features: [
        'Advanced analytics dashboard with insights',
        'Real-time student feedback monitoring',
        'Performance tracking and trends',
        'Student wellness alerts and support'
      ]
    },
    {
      id: 'admin',
      title: 'School Administrator',
      description: 'Comprehensive school management and oversight tools',
      icon: <Settings className="h-6 w-6 text-purple-600" />,
      badgeText: 'Administrator',
      badgeClass: 'bg-purple-100 text-purple-700 border-purple-200',
      buttonClass: 'bg-purple-600 hover:bg-purple-700 text-white',
      borderClass: 'hover:border-purple-500',
      features: [
        'School-wide performance analytics',
        'Teacher management and invitations',
        'System configuration and settings',
        'Compliance monitoring and reporting'
      ]
    },
    {
      id: 'doctor',
      title: 'Doctor Experience',
      description: 'Specialized medical support and mental health tools',
      icon: <Heart className="h-6 w-6 text-green-600" />,
      badgeText: 'Medical Professional',
      badgeClass: 'bg-green-100 text-green-700 border-green-200',
      buttonClass: 'bg-green-600 hover:bg-green-700 text-white',
      borderClass: 'hover:border-green-500',
      features: [
        'Mental health alert monitoring',
        'Secure live chat with students',
        'Wellness tracking and reports',
        'HIPAA-compliant data handling'
      ]
    }
  ];

  const renderCard = (card: typeof demoCards[0]) => (
    <MobileOptimizedCard
      key={card.id}
      title={card.title}
      className={`cursor-pointer hover:shadow-lg transition-all duration-300 border-2 ${card.borderClass} relative`}
      icon={card.icon}
      actions={
        <Badge className={card.badgeClass}>
          {card.badgeText}
        </Badge>
      }
    >
      <CardDescription className="mb-4">
        {card.description}
      </CardDescription>
      <div className="space-y-2 text-sm text-gray-600 mb-4">
        {card.features.map((feature, index) => (
          <p key={index}>• {feature}</p>
        ))}
      </div>
      <MobileOptimizedButton 
        onClick={() => onDemoSelect(card.id)}
        className={card.buttonClass}
        fullWidth={true}
      >
        <Play className="w-4 h-4 mr-2" />
        Try {card.badgeText} Experience
      </MobileOptimizedButton>
    </MobileOptimizedCard>
  );

  if (isMobile) {
    return (
      <div className="grid grid-cols-1 gap-6">
        {demoCards.map(renderCard)}
      </div>
    );
  }

  return (
    <>
      {/* Desktop: First row - 2 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {demoCards.slice(0, 2).map(renderCard)}
      </div>

      {/* Desktop: Second row - 3 cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {demoCards.slice(2).map(renderCard)}
      </div>
    </>
  );
};

export default DemoSelectionCards;
