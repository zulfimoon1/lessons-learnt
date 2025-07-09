import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeftIcon, CheckIcon, UsersIcon, CreditCardIcon, StarIcon, PhoneIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { discountCodeService } from "@/services/discountCodeService";

const PricingPage = () => {
  const { teacher } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [teacherCount, setTeacherCount] = useState(1);
  const [discountCode, setDiscountCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [discountError, setDiscountError] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);

  const basePrice = 9.99;
  const subtotal = teacherCount * basePrice;
  const discountAmount = subtotal * (discount / 100);
  const total = subtotal - discountAmount;

  const validateDiscountCode = async (code: string) => {
    if (!code.trim()) {
      setDiscountError(t('form.enterDiscountCode'));
      return;
    }

    setIsValidatingDiscount(true);
    setDiscountError("");

    try {
      // Pass teacher email for enhanced validation
      const result = await discountCodeService.validateDiscountCode(code.trim(), teacher?.email);
      
      if (result.valid) {
        setDiscountPercent(result.discountPercent);
        setDiscountCode(code.trim().toUpperCase());
        setDiscount(result.discountPercent); // Set the discount state as well
        toast({
          title: t('messages.success'),
          description: t('pricing.discountAppliedMessage', { percent: result.discountPercent.toString() }),
        });
      } else {
        setDiscountError(result.error);
        setDiscountPercent(0);
        setDiscountCode("");
        setDiscount(0);
      }
    } catch (error) {
      console.error('Error validating discount code:', error);
      setDiscountError(t('pricing.discountValidationFailed'));
      setDiscountPercent(0);
      setDiscountCode("");
      setDiscount(0);
    } finally {
      setIsValidatingDiscount(false);
    }
  };

  const handleCreateSubscription = async () => {
    if (!teacher?.email || !teacher?.school) {
      toast({
        title: t('messages.authenticationRequired'),
        description: t('pricing.signUpEducatorFirst'),
        variant: "destructive",
      });
      navigate('/teacher-login');
      return;
    }

    try {
      setIsCreatingCheckout(true);
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          teacherCount,
          discountCode: discountCode.trim() || null,
          discountPercent: discount,
          teacherEmail: teacher.email,
          teacherName: teacher.name,
          schoolName: teacher.school
        }
      });
      
      if (error) throw error;
      
      if (data?.url) {
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

  const handleSignUpEducator = () => {
    console.log('Admin signup button clicked - navigating to teacher-login');
    try {
      navigate('/teacher-login');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handleStartFreeTrial = () => {
    console.log('Teacher signup button clicked - navigating to teacher-login');
    try {
      navigate('/teacher-login');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handleTransformYourSchool = () => {
    console.log('Transform Your School button clicked - navigating to teacher-login');
    try {
      navigate('/teacher-login');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handleStartFreeTrialNow = () => {
    console.log('Start Free Trial Now button clicked - navigating to teacher-login');
    try {
      navigate('/teacher-login');
    } catch (error) {
      console.error('Navigation error:', error);
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
              {teacher ? t('pricing.backToDashboard') : t('pricing.backToHome')}
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
                    onBlur={() => validateDiscountCode(discountCode)}
                  />
                  <Button
                    onClick={() => validateDiscountCode(discountCode)}
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
                  <span>€{basePrice} {t('pricing.each')}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span>{t('pricing.subtotal')}</span>
                  <span>€{subtotal.toFixed(2)}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>{t('pricing.discount')} ({discount}%)</span>
                    <span>-€{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                
                <hr className="my-2" />
                <div className="flex justify-between text-xl font-bold">
                  <span>{t('pricing.totalMonthly')}</span>
                  <span>€{total.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>{t('pricing.billing')}:</strong> {t('pricing.billingDesc').replace('{amount}', total.toFixed(2))}
                </p>
              </div>

              {/* Action Buttons - Same Height */}
              <div className="space-y-3">
                <Button
                  onClick={handleCreateSubscription}
                  disabled={isCreatingCheckout || !teacher}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg py-6"
                >
                  {isCreatingCheckout ? t('pricing.processing') : t('pricing.startThirtyDayTrial')}
                </Button>

                {!teacher && (
                  <Button
                    onClick={handleSignUpEducator}
                    variant="outline"
                    className="w-full text-lg py-6 border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    {t('pricing.signUpEducator')}
                  </Button>
                )}
              </div>

              <p className="text-xs text-gray-500 text-center">
                {teacher ? 
                  t('pricing.thirtyDayTrial') :
                  t('pricing.createEducatorAccount')
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Custom Pricing Banner */}
        <div className="mt-12">
          <Card className="bg-gradient-to-r from-purple-100 to-blue-100 border-purple-200">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <Badge className="bg-purple-600 text-white px-4 py-2 text-sm font-semibold">
                    <StarIcon className="w-4 h-4 mr-2" />
                    {t('pricing.customPricingAvailableShort')}
                  </Badge>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {t('pricing.needCustomSolutionOrg')}
                </h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  {t('pricing.tailoredPricingFeatures')}
                </p>
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  <Button
                    variant="outline"
                    className="text-lg px-8 py-3 border-2 border-purple-600 text-purple-600 hover:bg-purple-50"
                      onClick={() => {
                        toast({
                          title: t('pricing.comingSoonTitle'),
                          description: t('pricing.customPricingFormDescription'),
                        });
                      }}
                  >
                    <PhoneIcon className="w-5 h-5 mr-2" />
                    {t('pricing.requestCustomPricingButton')}
                  </Button>
                  <div className="text-sm text-gray-500">
                    {t('pricing.perfectFiftyTeachers')}
                  </div>
                </div>
                
                {/* Bottom CTA Section */}
                <div className="mt-8 pt-8 border-t border-purple-200">
                  <h4 className="text-xl font-semibold text-gray-900 mb-4">
                    {t('pricing.readyGetStarted')}
                  </h4>
                  <div className="flex gap-4 justify-center flex-wrap">
                    <Button
                      onClick={handleStartFreeTrialNow}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-8 py-3"
                    >
                      {t('pricing.startFreeTrialNowButton')}
                    </Button>
                    <Button
                      onClick={handleTransformYourSchool}
                      variant="outline"
                      className="border-2 border-green-600 text-green-600 hover:bg-green-50 text-lg px-8 py-3"
                    >
                      {t('pricing.transformYourSchoolButton')}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {t('pricing.noCreditCard')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PricingPage;
