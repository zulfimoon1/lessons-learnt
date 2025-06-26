
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeftIcon, InfoIcon, CreditCardIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { discountCodeService } from "@/services/discountCodeService";
import { calculatePricing, PRICING_TIERS, getTrialInfo, getSummerPauseInfo } from "@/services/pricingService";
import EnhancedPricingCard from "@/components/EnhancedPricingCard";
import MobileOptimizedLayout from "@/components/mobile/MobileOptimizedLayout";
import MobileOptimizedCard from "@/components/mobile/MobileOptimizedCard";
import MobileOptimizedButton from "@/components/mobile/MobileOptimizedButton";
import EnhancedLazyLoader from "@/components/performance/EnhancedLazyLoader";
import { useDeviceType } from "@/hooks/use-device";
import { cn } from "@/lib/utils";

const EnhancedPricingPage = () => {
  const { teacher } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';
  
  const [teacherCount, setTeacherCount] = useState(1);
  const [selectedTier, setSelectedTier] = useState<'teacher' | 'admin'>('teacher');
  const [isAnnual, setIsAnnual] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);

  const pricing = calculatePricing(selectedTier, teacherCount, isAnnual);
  const trialInfo = getTrialInfo();
  const summerPauseInfo = getSummerPauseInfo();

  const validateDiscountCode = async (code: string) => {
    if (!code.trim()) return;

    setIsValidatingDiscount(true);
    try {
      const result = await discountCodeService.validateDiscountCode(code.trim(), teacher?.email);
      if (result.valid) {
        setDiscountPercent(result.discountPercent);
        toast({
          title: "Success",
          description: `${result.discountPercent}% discount applied!`,
        });
      } else {
        setDiscountPercent(0);
        toast({
          title: "Invalid Code",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error validating discount code:', error);
      setDiscountPercent(0);
    } finally {
      setIsValidatingDiscount(false);
    }
  };

  const handleCreateSubscription = async () => {
    if (!teacher?.email || !teacher?.school) {
      toast({
        title: "Authentication Required",
        description: "Please log in to continue with subscription",
        variant: "destructive",
      });
      navigate('/teacher-login');
      return;
    }

    try {
      setIsCreatingCheckout(true);
      
      const finalAmount = Math.round(pricing.finalPrice * (1 - discountPercent / 100));
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          teacherCount,
          tierType: selectedTier,
          isAnnual,
          discountCode: discountCode.trim() || null,
          discountPercent,
          teacherEmail: teacher.email,
          teacherName: teacher.name,
          schoolName: teacher.school,
          amount: finalAmount,
          trialDays: 30
        }
      });
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast({
        title: "Payment Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingCheckout(false);
    }
  };

  const finalAmount = pricing.finalPrice * (1 - discountPercent / 100) / 100;

  return (
    <MobileOptimizedLayout>
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 p-4">
        <div className={cn(
          'max-w-6xl mx-auto flex justify-between items-center',
          isMobile && 'flex-col gap-4'
        )}>
          <div className="flex items-center gap-4">
            <MobileOptimizedButton
              onClick={() => navigate(teacher ? '/teacher-dashboard' : '/')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              {!isMobile && 'Back'}
            </MobileOptimizedButton>
            <h1 className={cn(
              'font-bold text-gray-900',
              isMobile ? 'text-xl' : 'text-2xl'
            )}>Choose Your Plan</h1>
          </div>
          <div className="flex items-center gap-4">
            {teacher && !isMobile && (
              <span className="text-sm text-gray-600">Welcome, {teacher?.name}</span>
            )}
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className={cn(
        'max-w-6xl mx-auto',
        isMobile ? 'p-4' : 'p-6'
      )}>
        {/* Billing Toggle */}
        <div className={cn(
          'text-center',
          isMobile ? 'mb-6' : 'mb-8'
        )}>
          <div className={cn(
            'flex items-center justify-center gap-4 mb-4',
            isMobile && 'flex-col gap-2'
          )}>
            <span className={!isAnnual ? 'font-semibold' : 'text-muted-foreground'}>Monthly</span>
            <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
            <span className={isAnnual ? 'font-semibold' : 'text-muted-foreground'}>
              Annual
              <Badge variant="secondary" className="ml-2">Save 20%</Badge>
            </span>
          </div>
        </div>

        {/* Teacher Count Input */}
        <EnhancedLazyLoader minHeight={isMobile ? "120px" : "150px"}>
          <MobileOptimizedCard
            title="Number of Teachers"
            description="Volume discounts apply automatically for 5+ teachers"
            className="mb-8"
          >
            <div className={cn(
              'flex items-center gap-4',
              isMobile && 'flex-col items-start gap-2'
            )}>
              <Label htmlFor="teacherCount">Teachers:</Label>
              <Input
                id="teacherCount"
                type="number"
                min="1"
                max="100"
                value={teacherCount}
                onChange={(e) => setTeacherCount(Math.max(1, parseInt(e.target.value) || 1))}
                className={cn(
                  isMobile ? 'w-full' : 'w-32'
                )}
              />
              {teacherCount >= 5 && (
                <Badge variant="secondary">
                  Volume discount: {teacherCount >= 10 ? '20%' : '10%'} off
                </Badge>
              )}
            </div>
          </MobileOptimizedCard>
        </EnhancedLazyLoader>

        {/* Pricing Cards */}
        <EnhancedLazyLoader minHeight={isMobile ? "600px" : "400px"}>
          <div className={cn(
            'gap-8 mb-8',
            isMobile ? 'grid grid-cols-1 gap-6' : 'grid md:grid-cols-2 gap-8'
          )}>
            {PRICING_TIERS.map((tier) => {
              const tierPricing = calculatePricing(tier.id as 'teacher' | 'admin', teacherCount, isAnnual);
              return (
                <EnhancedPricingCard
                  key={tier.id}
                  tier={tier}
                  teacherCount={teacherCount}
                  isAnnual={isAnnual}
                  pricing={tierPricing}
                  onSelect={(tierId) => setSelectedTier(tierId as 'teacher' | 'admin')}
                  isSelected={selectedTier === tier.id}
                />
              );
            })}
          </div>
        </EnhancedLazyLoader>

        {/* Order Summary */}
        <EnhancedLazyLoader minHeight={isMobile ? "400px" : "300px"}>
          <MobileOptimizedCard
            title={
              <div className="flex items-center gap-2">
                <CreditCardIcon className="w-5 h-5" />
                Order Summary
              </div>
            }
            className="mb-8"
          >
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>{PRICING_TIERS.find(t => t.id === selectedTier)?.name} Plan ({teacherCount} teacher{teacherCount > 1 ? 's' : ''})</span>
                <span>${(pricing.finalPrice / 100).toFixed(2)}/month</span>
              </div>
              
              {pricing.savings > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>
                    {isAnnual ? 'Annual' : 'Volume'} Discount
                  </span>
                  <span>-${(pricing.savings / 100).toFixed(2)}/month</span>
                </div>
              )}
              
              {discountPercent > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Promo Code ({discountPercent}%)</span>
                  <span>-${((pricing.finalPrice * discountPercent / 100) / 100).toFixed(2)}/month</span>
                </div>
              )}
              
              <hr />
              <div className={cn(
                'flex justify-between font-bold',
                isMobile ? 'text-lg' : 'text-xl'
              )}>
                <span>Total</span>
                <span>${finalAmount.toFixed(2)}/month</span>
              </div>

              {/* Discount Code Input */}
              <div className="space-y-2">
                <Label htmlFor="discountCode">Promo Code (Optional)</Label>
                <div className={cn(
                  'gap-2',
                  isMobile ? 'flex flex-col' : 'flex gap-2'
                )}>
                  <Input
                    id="discountCode"
                    placeholder="Enter promo code"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                    className={isMobile ? 'w-full' : undefined}
                  />
                  <MobileOptimizedButton
                    onClick={() => validateDiscountCode(discountCode)}
                    variant="outline"
                    disabled={isValidatingDiscount}
                    className={isMobile ? 'w-full' : undefined}
                  >
                    {isValidatingDiscount ? 'Validating...' : 'Apply'}
                  </MobileOptimizedButton>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <MobileOptimizedButton
                  onClick={handleCreateSubscription}
                  disabled={isCreatingCheckout || !teacher}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg py-6"
                  touchOptimized={true}
                >
                  {isCreatingCheckout ? 'Processing...' : `Start ${trialInfo.duration}-Day Free Trial`}
                </MobileOptimizedButton>

                {!teacher && (
                  <MobileOptimizedButton
                    onClick={() => navigate('/teacher-login')}
                    variant="outline"
                    className="w-full text-lg py-6 border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                    touchOptimized={true}
                  >
                    Sign Up as an Educator
                  </MobileOptimizedButton>
                )}
              </div>

              {!teacher && (
                <p className="text-xs text-gray-500 text-center">
                  Create your educator account to start your free trial
                </p>
              )}
            </div>
          </MobileOptimizedCard>
        </EnhancedLazyLoader>

        {/* Additional Information */}
        <EnhancedLazyLoader minHeight={isMobile ? "200px" : "150px"}>
          <div className={cn(
            'gap-6 mb-12',
            isMobile ? 'grid grid-cols-1 gap-4' : 'grid md:grid-cols-2 gap-6'
          )}>
            <MobileOptimizedCard
              title={
                <div className="flex items-center gap-2">
                  <InfoIcon className="w-5 h-5" />
                  Free Trial
                </div>
              }
            >
              <p className="text-sm text-muted-foreground">
                {trialInfo.description}. Cancel anytime during the trial period with no charges.
              </p>
            </MobileOptimizedCard>

            <MobileOptimizedCard
              title={
                <div className="flex items-center gap-2">
                  <InfoIcon className="w-5 h-5" />
                  Summer Break Pause
                </div>
              }
            >
              <p className="text-sm text-muted-foreground">
                {summerPauseInfo.description} ({summerPauseInfo.availability}). 
                Perfect for educators who want to pause billing during vacation periods.
              </p>
            </MobileOptimizedCard>
          </div>
        </EnhancedLazyLoader>

        {/* Custom Pricing Section */}
        <div className="text-center">
          <h3 className={cn(
            'font-bold text-gray-900 mb-4',
            isMobile ? 'text-xl' : 'text-2xl'
          )}>Custom Pricing Available</h3>
          <p className={cn(
            'text-gray-600 mb-6',
            isMobile ? 'text-base' : 'text-lg'
          )}>
            Need a custom solution for your school district or large organization? 
            We offer tailored pricing and features for enterprise customers.
          </p>
          <MobileOptimizedButton
            variant="outline"
            className="text-lg px-8 py-3 border-2 border-gray-300 hover:border-gray-400"
            onClick={() => {
              toast({
                title: "Coming Soon",
                description: "Custom pricing form will be available soon. Please contact support for now.",
              });
            }}
            touchOptimized={true}
          >
            Request Custom Pricing
          </MobileOptimizedButton>
        </div>
      </main>
    </MobileOptimizedLayout>
  );
};

export default EnhancedPricingPage;
