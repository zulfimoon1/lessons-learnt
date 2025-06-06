
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeftIcon, CheckIcon, UsersIcon, CreditCardIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";

const PricingPage = () => {
  const { teacher } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [teacherCount, setTeacherCount] = useState(1);
  const [discountCode, setDiscountCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);

  const basePrice = 9.99;
  const subtotal = teacherCount * basePrice;
  const discountAmount = subtotal * (discount / 100);
  const total = subtotal - discountAmount;

  // Remove the teacher role check - allow anyone to access pricing
  // useEffect(() => {
  //   if (!teacher || teacher.role !== 'admin') {
  //     navigate('/teacher-login');
  //   }
  // }, [teacher, navigate]);

  const validateDiscountCode = async () => {
    if (!discountCode.trim()) {
      setDiscount(0);
      return;
    }

    setIsValidatingDiscount(true);
    try {
      const validCodes: Record<string, number> = {
        'EDUCATION10': 10,
        'NEWSCHOOL15': 15,
        'BULK20': 20
      };
      
      const discountValue = validCodes[discountCode.toUpperCase()];
      if (discountValue) {
        setDiscount(discountValue);
        toast({
          title: t('pricing.discountApplied'),
          description: t('pricing.discountAppliedDesc').replace('{percent}', discountValue.toString()),
        });
      } else {
        setDiscount(0);
        toast({
          title: t('pricing.invalidDiscount'),
          description: t('pricing.invalidDiscountDesc'),
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
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast({
        title: t('pricing.paymentError'),
        description: t('pricing.paymentErrorDesc'),
        variant: "destructive",
      });
    } finally {
      setIsCreatingCheckout(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate(teacher ? '/admin-dashboard' : '/')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              {teacher ? t('pricing.backToDashboard') : 'Back to Home'}
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">{t('pricing.title')}</h1>
          </div>
          <div className="flex items-center gap-4">
            {teacher && (
              <span className="text-sm text-gray-600">{t('pricing.welcome')}, {teacher?.name}</span>
            )}
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t('pricing.choosePlan')}
          </h2>
          <p className="text-lg text-gray-600 mb-2">
            {t('pricing.subtitle')}
          </p>
          {teacher && (
            <p className="text-sm text-gray-500">
              {t('pricing.school')}: <Badge variant="outline" className="ml-1">{teacher.school}</Badge>
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Pricing Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UsersIcon className="w-5 h-5" />
                {t('pricing.configurePlan')}
              </CardTitle>
              <CardDescription>
                {t('pricing.configureDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="teacherCount" className="text-base font-medium">
                  {t('pricing.numberOfTeachers')}
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
                  {t('pricing.teacherDesc')}
                </p>
              </div>

              <div>
                <Label htmlFor="discountCode" className="text-base font-medium">
                  {t('pricing.discountCode')}
                </Label>
                <div className="mt-2 flex gap-2">
                  <Input
                    id="discountCode"
                    placeholder={t('pricing.enterDiscount')}
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                    onBlur={validateDiscountCode}
                  />
                  <Button
                    onClick={validateDiscountCode}
                    variant="outline"
                    disabled={isValidatingDiscount}
                  >
                    {isValidatingDiscount ? t('pricing.validating') : t('pricing.apply')}
                  </Button>
                </div>
                {discount > 0 && (
                  <div className="mt-2 flex items-center gap-2 text-green-600">
                    <CheckIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">{discount}% {t('pricing.discountAppliedShort')}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <p className="font-medium">{t('pricing.whatsIncluded')}:</p>
                <ul className="space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckIcon className="w-4 h-4 text-green-600" />
                    {t('pricing.unlimitedClasses')}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="w-4 h-4 text-green-600" />
                    {t('pricing.feedbackCollection')}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="w-4 h-4 text-green-600" />
                    {t('pricing.analytics')}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="w-4 h-4 text-green-600" />
                    {t('pricing.mentalHealth')}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="w-4 h-4 text-green-600" />
                    {t('pricing.multiLanguage')}
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
                {t('pricing.orderSummary')}
              </CardTitle>
              <CardDescription>
                {t('pricing.reviewDetails')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>{t('pricing.teachers')} ({teacherCount})</span>
                  <span>${basePrice} {t('pricing.each')}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span>{t('pricing.subtotal')}</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>{t('pricing.discount')} ({discount}%)</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                
                <hr className="my-2" />
                <div className="flex justify-between text-xl font-bold">
                  <span>{t('pricing.totalMonthly')}</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>{t('pricing.billing')}:</strong> {t('pricing.billingDesc').replace('{amount}', total.toFixed(2))}
                </p>
              </div>

              <Button
                onClick={handleCreateSubscription}
                disabled={isCreatingCheckout}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg py-6"
              >
                {isCreatingCheckout ? t('pricing.processing') : `${t('pricing.subscribeFor')} $${total.toFixed(2)}/month`}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                {t('pricing.securePayment')}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PricingPage;
