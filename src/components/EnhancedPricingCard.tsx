
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, StarIcon } from "lucide-react";
import { PricingTier } from "@/services/pricingService";

interface EnhancedPricingCardProps {
  tier: PricingTier;
  teacherCount: number;
  isAnnual: boolean;
  pricing: any;
  onSelect: (tierId: string) => void;
  isSelected?: boolean;
}

const EnhancedPricingCard = ({ 
  tier, 
  teacherCount, 
  isAnnual, 
  pricing, 
  onSelect, 
  isSelected 
}: EnhancedPricingCardProps) => {
  const displayPrice = isAnnual 
    ? (pricing.finalPrice / 100).toFixed(2)
    : (pricing.finalPrice / 100).toFixed(2);
  
  const originalPrice = isAnnual 
    ? (pricing.monthlyTotal / 100).toFixed(2)
    : null;

  return (
    <Card className={`relative transition-all duration-200 ${
      isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'
    } ${tier.isPopular ? 'border-primary' : ''}`}>
      {tier.isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground px-3 py-1 flex items-center gap-1">
            <StarIcon className="w-3 h-3" />
            Most Popular
          </Badge>
        </div>
      )}
      
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl font-bold">{tier.name}</CardTitle>
        <CardDescription className="text-sm">{tier.description}</CardDescription>
        
        <div className="mt-4">
          <div className="text-3xl font-bold">
            ${displayPrice}
            <span className="text-sm font-normal text-muted-foreground">
              /{isAnnual ? 'month' : 'month'}
            </span>
          </div>
          
          {teacherCount > 1 && (
            <div className="text-sm text-muted-foreground">
              for {teacherCount} teacher{teacherCount > 1 ? 's' : ''}
            </div>
          )}
          
          {isAnnual && originalPrice && (
            <div className="text-sm text-muted-foreground">
              <span className="line-through">${originalPrice}/month</span>
              <span className="text-green-600 ml-2">
                Save ${((parseFloat(originalPrice) - parseFloat(displayPrice)) * 12).toFixed(0)}/year
              </span>
            </div>
          )}
          
          {pricing.discountPercent > 0 && (
            <Badge variant="secondary" className="mt-2">
              {pricing.discountPercent}% Volume Discount
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {tier.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <CheckIcon className="w-4 h-4 text-green-600" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
        
        <div className="pt-4">
          <Button 
            onClick={() => onSelect(tier.id)}
            className={`w-full ${tier.isPopular ? 'bg-primary hover:bg-primary/90' : ''}`}
            variant={tier.isPopular ? 'default' : 'outline'}
          >
            {isSelected ? 'Selected' : 'Choose Plan'}
          </Button>
        </div>
        
        <div className="text-xs text-center text-muted-foreground">
          30-day free trial included
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedPricingCard;
