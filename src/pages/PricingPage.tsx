
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeftIcon, CheckIcon, UsersIcon, CreditCardIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const PricingPage = () => {
  const { teacher } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [teacherCount, setTeacherCount] = useState(1);
  const [discountCode, setDiscountCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);

  const basePrice = 9.99;
  const subtotal = teacherCount * basePrice;
  const discountAmount = subtotal * (discount / 100);
  const total = subtotal - discountAmount;

  useEffect(() => {
    if (!teacher || teacher.role !== 'admin') {
      navigate('/teacher-login');
    }
  }, [teacher, navigate]);

  const validateDiscountCode = async () => {
    if (!discountCode.trim()) {
      setDiscount(0);
      return;
    }

    setIsValidatingDiscount(true);
    try {
      // Mock discount validation - in real app this would call your backend
      const validCodes = {
        'EDUCATION10': 10,
        'NEWSCHOOL15': 15,
        'BULK20': 20
      };
      
      const discountValue = validCodes[discountCode.toUpperCase() as keyof typeof validCodes];
      if (discountValue) {
        setDiscount(discountValue);
        toast({
          title: "Discount Applied!",
          description: `${discountValue}% discount has been applied to your order.`,
        });
      } else {
        setDiscount(0);
        toast({
          title: "Invalid Discount Code",
          description: "The discount code you entered is not valid.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error validating discount:", error);
      setDiscount(0);
    } finally {
      setIsValidatingDiscount(false);
    }
  };

  const handleCreateSubscription = async () => {
    try {
      setIsCreatingCheckout(true);
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          teacherCount,
          discountCode: discountCode.trim() || null,
          discountPercent: discount
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
        description: "Failed to create subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingCheckout(false);
    }
  };

  if (!teacher) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/admin-dashboard')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Subscription Pricing</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {teacher?.name}</span>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Choose Your School Plan
          </h2>
          <p className="text-lg text-gray-600 mb-2">
            Simple, transparent pricing for your entire school
          </p>
          <p className="text-sm text-gray-500">
            School: <Badge variant="outline" className="ml-1">{teacher.school}</Badge>
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Pricing Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UsersIcon className="w-5 h-5" />
                Configure Your Plan
              </CardTitle>
              <CardDescription>
                Customize your subscription based on the number of teachers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="teacherCount" className="text-base font-medium">
                  Number of Teachers
                </Label>
                <div className="mt-2">
                  <Input
                    id="teacherCount"
                    type="number"
                    min="1"
                    max="100"
                    value={teacherCount}
                    onChange={(e) => setTeacherCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="text-lg"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Each teacher can create unlimited classes and collect student feedback
                </p>
              </div>

              <div>
                <Label htmlFor="discountCode" className="text-base font-medium">
                  Discount Code (Optional)
                </Label>
                <div className="mt-2 flex gap-2">
                  <Input
                    id="discountCode"
                    placeholder="Enter discount code"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                    onBlur={validateDiscountCode}
                  />
                  <Button
                    onClick={validateDiscountCode}
                    variant="outline"
                    disabled={isValidatingDiscount}
                  >
                    {isValidatingDiscount ? "Validating..." : "Apply"}
                  </Button>
                </div>
                {discount > 0 && (
                  <div className="mt-2 flex items-center gap-2 text-green-600">
                    <CheckIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">{discount}% discount applied!</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <p className="font-medium">What's included:</p>
                <ul className="space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckIcon className="w-4 h-4 text-green-600" />
                    Unlimited class schedules
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="w-4 h-4 text-green-600" />
                    Student feedback collection
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="w-4 h-4 text-green-600" />
                    Analytics and reporting
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="w-4 h-4 text-green-600" />
                    Mental health monitoring
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="w-4 h-4 text-green-600" />
                    Multi-language support
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCardIcon className="w-5 h-5" />
                Order Summary
              </CardTitle>
              <CardDescription>
                Review your subscription details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Teachers ({teacherCount})</span>
                  <span>${basePrice} each</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({discount}%)</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                
                <hr className="my-2" />
                <div className="flex justify-between text-xl font-bold">
                  <span>Total (Monthly)</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Billing:</strong> You will be charged ${total.toFixed(2)} monthly. 
                  You can cancel or modify your subscription at any time.
                </p>
              </div>

              <Button
                onClick={handleCreateSubscription}
                disabled={isCreatingCheckout}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg py-6"
              >
                {isCreatingCheckout ? "Processing..." : `Subscribe for $${total.toFixed(2)}/month`}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                Secure payment powered by Stripe. Cancel anytime.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PricingPage;
