
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { CheckIcon, StarIcon, UsersIcon, GraduationCapIcon, PauseIcon } from "lucide-react";
import { PricingTier } from "@/services/pricingService";
import { useState } from "react";

interface StudentBasedPricingCardProps {
  tier: PricingTier;
  isAnnual: boolean;
  onSelect: (tierId: string) => void;
  t: (key: string) => string;
}

const StudentBasedPricingCard = ({ 
  tier, 
  isAnnual, 
  onSelect,
  t
}: StudentBasedPricingCardProps) => {
  const [includeHolidayPause, setIncludeHolidayPause] = useState(false);
  
  const monthlyPrice = tier.monthlyPrice / 100;
  const annualPrice = tier.annualPrice ? tier.annualPrice / 100 : monthlyPrice * 12;
  const baseDisplayPrice = isAnnual ? Math.ceil(annualPrice / 12) : monthlyPrice;
  
  // Add €10 to the main price if Holiday Pause is enabled
  const displayPrice = includeHolidayPause ? baseDisplayPrice + 10 : baseDisplayPrice;
  
  // Calculate per student cost
  const pricePerStudent = Math.ceil((isAnnual ? annualPrice : monthlyPrice * 12) / tier.maxStudents);
  
  // Holiday pause calculations - €10 per month for pause feature
  const holidayPauseFee = 10;
  const activeMonths = 9;
  const pauseMonths = 3;
  const totalWithPause = (baseDisplayPrice * activeMonths) + (holidayPauseFee * pauseMonths);
  const savings = (baseDisplayPrice * 12) - totalWithPause;

  return (
    <Card className={`relative transition-all duration-200 hover:shadow-lg ${
      tier.isPopular ? 'border-brand-orange ring-2 ring-brand-orange/20' : 'border-gray-200'
    }`}>
      {tier.isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-brand-orange text-white px-4 py-1 flex items-center gap-1">
            <StarIcon className="w-3 h-3" />
            Most Popular
          </Badge>
        </div>
      )}
      
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold text-brand-dark">{tier.name}</CardTitle>
        <CardDescription className="text-gray-600">{tier.description}</CardDescription>
        
        <div className="mt-4">
          <div className="text-4xl font-bold text-brand-dark">
            €{displayPrice}
            <span className="text-sm font-normal text-muted-foreground">/month</span>
          </div>
          
          <div className="text-sm text-muted-foreground mt-1">
            {tier.studentRange} students • Up to {tier.maxTeachers} teachers
          </div>
          
          <div className="text-brand-teal font-semibold mt-2">
            €{pricePerStudent}/student/year
          </div>
          
          {isAnnual && (
            <div className="text-green-600 text-sm mt-1">
              Save €{Math.ceil((monthlyPrice * 12) - annualPrice)}/year (20% off)
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Holiday Pause Option */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <PauseIcon className="w-4 h-4 text-purple-600" />
              <span className="font-medium text-purple-800">Holiday Pause</span>
            </div>
            <Switch 
              checked={includeHolidayPause}
              onCheckedChange={setIncludeHolidayPause}
              className="data-[state=checked]:bg-purple-600"
            />
          </div>
          <div className="text-sm text-purple-700">
            +€{holidayPauseFee}/month • Pause up to {pauseMonths} months/year
          </div>
          {includeHolidayPause && (
            <div className="mt-2 text-sm">
              <div className="text-green-700 font-medium">
                Annual savings: €{savings}
              </div>
              <div className="text-purple-600">
                Pay €{totalWithPause}/year instead of €{baseDisplayPrice * 12}
              </div>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="space-y-2">
          {tier.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <CheckIcon className="w-4 h-4 text-brand-teal flex-shrink-0" />
              <span className="text-brand-dark">{feature}</span>
            </div>
          ))}
        </div>
        
        <div className="pt-4">
          <Button 
            onClick={() => onSelect(tier.id)}
            className={`w-full ${
              tier.isPopular 
                ? 'bg-brand-orange hover:bg-brand-orange/90 text-white' 
                : 'bg-brand-teal hover:bg-brand-teal/90 text-white'
            }`}
          >
            Choose {tier.name}
          </Button>
        </div>
        
        <div className="text-xs text-center text-muted-foreground">
          30-day free trial included
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentBasedPricingCard;
