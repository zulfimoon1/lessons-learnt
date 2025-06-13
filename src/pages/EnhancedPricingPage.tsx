
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

const EnhancedPricingPage = () => {
  const { teacher } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
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
      const result = await discountCodeService.validateDiscountCode(code.trim());
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate(teacher ? '/teacher-dashboard' : '/')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Choose Your Plan</h1>
          </div>
          <div className="flex items-center gap-4">
            {teacher && (
              <span className="text-sm text-gray-600">Welcome, {teacher?.name}</span>
            )}
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Billing Toggle */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className={!isAnnual ? 'font-semibold' : 'text-muted-foreground'}>Monthly</span>
            <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
            <span className={isAnnual ? 'font-semibold' : 'text-muted-foreground'}>
              Annual
              <Badge variant="secondary" className="ml-2">Save 20%</Badge>
            </span>
          </div>
        </div>

        {/* Teacher Count Input */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Number of Teachers</CardTitle>
            <CardDescription>
              Volume discounts apply automatically for 5+ teachers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Label htmlFor="teacherCount">Teachers:</Label>
              <Input
                id="teacherCount"
                type="number"
                min="1"
                max="100"
                value={teacherCount}
                onChange={(e) => setTeacherCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-32"
              />
              {teacherCount >= 5 && (
                <Badge variant="secondary">
                  Volume discount: {teacherCount >= 10 ? '20%' : '10%'} off
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
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

        {/* Order Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCardIcon className="w-5 h-5" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
            <div className="flex justify-between text-xl font-bold">
              <span>Total</span>
              <span>${finalAmount.toFixed(2)}/month</span>
            </div>

            {/* Discount Code Input */}
            <div className="space-y-2">
              <Label htmlFor="discountCode">Promo Code (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="discountCode"
                  placeholder="Enter promo code"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                />
                <Button
                  onClick={() => validateDiscountCode(discountCode)}
                  variant="outline"
                  disabled={isValidatingDiscount}
                >
                  {isValidatingDiscount ? 'Validating...' : 'Apply'}
                </Button>
              </div>
            </div>

            {/* Action Buttons - Same Height */}
            <div className="space-y-3">
              <Button
                onClick={handleCreateSubscription}
                disabled={isCreatingCheckout || !teacher}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg py-6"
              >
                {isCreatingCheckout ? 'Processing...' : `Start ${trialInfo.duration}-Day Free Trial`}
              </Button>

              {!teacher && (
                <Button
                  onClick={() => navigate('/teacher-login')}
                  variant="outline"
                  className="w-full text-lg py-6 border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  Sign Up as an Educator
                </Button>
              )}
            </div>

            {!teacher && (
              <p className="text-xs text-gray-500 text-center">
                Create your educator account to start your free trial
              </p>
            )}
          </CardContent>
        </Card>

        {/* Additional Information */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <InfoIcon className="w-5 h-5" />
                Free Trial
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {trialInfo.description}. Cancel anytime during the trial period with no charges.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <InfoIcon className="w-5 h-5" />
                Summer Break Pause
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {summerPauseInfo.description} ({summerPauseInfo.availability}). 
                Perfect for educators who want to pause billing during vacation periods.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Custom Pricing Section */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Custom Pricing Available</h3>
          <p className="text-gray-600 mb-6">
            Need a custom solution for your school district or large organization? 
            We offer tailored pricing and features for enterprise customers.
          </p>
          <Button
            variant="outline"
            className="text-lg px-8 py-3 border-2 border-gray-300 hover:border-gray-400"
            onClick={() => {
              toast({
                title: "Coming Soon",
                description: "Custom pricing form will be available soon. Please contact support for now.",
              });
            }}
          >
            Request Custom Pricing
          </Button>
        </div>
      </main>
    </div>
  );
};

export default EnhancedPricingPage;
