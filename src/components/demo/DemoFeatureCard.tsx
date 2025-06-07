
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";

interface DemoFeature {
  id: string;
  titleKey: string;
  descriptionKey: string;
  userType: "student" | "teacher" | "psychologist";
  icon: any;
  voiceoverKey: string;
  mockupComponent: React.ReactNode;
}

interface DemoFeatureCardProps {
  feature: DemoFeature;
  index: number;
  isActive: boolean;
  onSelect: (index: number) => void;
}

const DemoFeatureCard: React.FC<DemoFeatureCardProps> = ({ 
  feature, 
  index, 
  isActive, 
  onSelect 
}) => {
  const { t } = useLanguage();

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case "student": return "bg-blue-100 text-blue-700 border-blue-200";
      case "teacher": return "bg-green-100 text-green-700 border-green-200";
      case "psychologist": return "bg-purple-100 text-purple-700 border-purple-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isActive 
          ? 'border-primary bg-primary/5' 
          : 'border-border hover:border-primary/50'
      }`}
      onClick={() => onSelect(index)}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isActive ? 'bg-primary text-primary-foreground' : 'bg-muted'
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
  );
};

export default DemoFeatureCard;
