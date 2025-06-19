
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, StarIcon, PauseIcon, TrendingDownIcon, TrendingUpIcon, ArrowLeftIcon, EuroIcon, PhoneIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { VOLUME_DISCOUNTS } from "@/services/pricingService";

const PricingShowcase = () => {
  const { t } = useLanguage();
  const { teacher } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const features = [
    t('pricing.unlimitedClasses'),
    t('pricing.feedbackCollection'), 
    t('pricing.analytics'),
    t('pricing.mentalHealth'),
    t('pricing.multiLanguage'),
    t('pricing.schoolWideInsights'),
    t('pricing.teacherManagement'),
    t('pricing.privacyCompliant')
  ];

  const formatEuroPrice = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                {t('common.back')} to Home
              </Button>
              <h1 className="text-2xl font-bold text-foreground">{t('pricing.title')}</h1>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <TrendingDownIcon className="w-4 h-4 mr-1" />
              {t('pricing.unbeatable')} {t('pricing.value')}
            </Badge>
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
              <StarIcon className="w-4 h-4 mr-1" />
              {t('pricing.mostPopular')}
            </Badge>
          </div>
          
          <h2 className="text-5xl font-bold text-foreground mb-6">
            {t('pricing.transformSchoolLess')}
            <span className="text-primary block mt-2 flex items-center justify-center gap-2">
              <EuroIcon className="w-12 h-12" />
              10 {t('pricing.perTeacherMonth')}
            </span>
          </h2>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            {t('pricing.worldClass')}
          </p>

          <div className="flex justify-center items-center gap-6 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">85%</div>
              <div className="text-sm text-muted-foreground">{t('pricing.costSavings')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">30 {t('common.days') || 'Days'}</div>
              <div className="text-sm text-muted-foreground">{t('pricing.freeTrial')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">24/7</div>
              <div className="text-sm text-muted-foreground">{t('pricing.supportIncluded')}</div>
            </div>
          </div>
        </div>

        {/* Volume Discount Info */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6 mb-12">
          <div className="text-center mb-4">
            <h3 className="text-2xl font-bold text-foreground mb-2">{t('pricing.volumeDiscounts')}</h3>
            <p className="text-muted-foreground">{t('pricing.moreTeachersMoreSave')}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground flex items-center justify-center gap-1">
                <EuroIcon className="w-6 h-6" />
                {formatEuroPrice(999)}
              </div>
              <div className="text-sm text-muted-foreground">1-4 {t('pricing.teachers')}</div>
              <div className="text-xs text-muted-foreground">{t('pricing.standardPrice')}</div>
            </div>
            <div className="text-center bg-green-100 rounded-lg p-4">
              <div className="text-3xl font-bold text-green-700 flex items-center justify-center gap-1">
                <EuroIcon className="w-6 h-6" />
                {formatEuroPrice(VOLUME_DISCOUNTS[0].pricePerTeacher)}
              </div>
              <div className="text-sm text-green-700 font-medium">5+ {t('pricing.teachers')}</div>
              <div className="text-xs text-green-600">{VOLUME_DISCOUNTS[0].discount}% {t('pricing.discount')}</div>
            </div>
            <div className="text-center bg-blue-100 rounded-lg p-4">
              <div className="text-3xl font-bold text-blue-700 flex items-center justify-center gap-1">
                <EuroIcon className="w-6 h-6" />
                {formatEuroPrice(VOLUME_DISCOUNTS[1].pricePerTeacher)}
              </div>
              <div className="text-sm text-blue-700 font-medium">10+ {t('pricing.teachers')}</div>
              <div className="text-xs text-blue-600">{VOLUME_DISCOUNTS[1].discount}% {t('pricing.discount')}</div>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Teacher Plan */}
          <Card className="relative border-2 border-primary/20 hover:border-primary/40 transition-all">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{t('pricing.teacherPlan')}</CardTitle>
                  <CardDescription>{t('pricing.perfectIndividual')}</CardDescription>
                </div>
                <Badge variant="secondary">{t('pricing.bestValue')}</Badge>
              </div>
              
              <div className="mt-4">
                <div className="flex items-baseline gap-2">
                  <div className="flex items-center gap-1">
                    <EuroIcon className="w-8 h-8 text-foreground" />
                    <span className="text-4xl font-bold text-foreground">9.99</span>
                  </div>
                  <span className="text-muted-foreground">/month per teacher</span>
                </div>
                <div className="text-sm text-green-600 font-medium flex items-center gap-1">
                  {t('pricing.annual')}: <EuroIcon className="w-3 h-3" />99/year ({t('pricing.saveExclamation')})
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {t('pricing.volumeDiscountsDetails')}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-3">
                {features.slice(0, 4).map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckIcon className="w-5 h-5 text-green-600" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Link to="/enhanced-pricing">
                <Button className="w-full bg-primary hover:bg-primary/90 text-lg py-6">
                  {t('pricing.startFreeTrial')}
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Admin Plan */}
          <Card className="relative border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-purple-600 text-white px-4 py-1">
                <TrendingUpIcon className="w-4 h-4 mr-1" />
                {t('pricing.maximumImpact')}
              </Badge>
            </div>
            
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{t('pricing.schoolAdmin')}</CardTitle>
                  <CardDescription>{t('pricing.completeTransformation')}</CardDescription>
                </div>
                <Badge className="bg-purple-100 text-purple-800">{t('pricing.premium')}</Badge>
              </div>
              
              <div className="mt-4">
                <div className="flex items-baseline gap-2">
                  <div className="flex items-center gap-1">
                    <EuroIcon className="w-8 h-8 text-foreground" />
                    <span className="text-4xl font-bold text-foreground">14.99</span>
                  </div>
                  <span className="text-muted-foreground">/month per admin</span>
                </div>
                <div className="text-sm text-green-600 font-medium flex items-center gap-1">
                  {t('pricing.annual')}: <EuroIcon className="w-3 h-3" />149/year ({t('pricing.saveThirty')})
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckIcon className="w-5 h-5 text-green-600" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Link to="/enhanced-pricing">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-lg py-6">
                  {t('pricing.transformYourSchool')}
                </Button>
              </Link>
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
                    {t('pricing.customPricingAvailable')}
                  </Badge>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {t('pricing.needCustomSolution')}
                </h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  {t('pricing.customPricingDescription')}
                </p>
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  <Button
                    variant="outline"
                    className="text-lg px-8 py-3 border-2 border-purple-600 text-purple-600 hover:bg-purple-50"
                    onClick={() => {
                      toast({
                        title: t('pricing.comingSoon'),
                        description: t('pricing.customPricingFormSoon'),
                      });
                    }}
                  >
                    <PhoneIcon className="w-5 h-5 mr-2" />
                    {t('pricing.requestCustomPricing')}
                  </Button>
                  <div className="text-sm text-gray-500">
                    {t('pricing.perfectForLargeOrgs')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Unique Value Propositions */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center bg-green-50 border-green-200">
            <CardHeader>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingDownIcon className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-xl text-green-800">{t('pricing.unbeatablePrice')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-700">
                {t('pricing.lessThanCompetitors')}
              </p>
            </CardContent>
          </Card>

          <Card className="text-center bg-blue-50 border-blue-200">
            <CardHeader>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <PauseIcon className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl text-blue-800">{t('pricing.holidayPause')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-700">
                {t('pricing.pauseSubscription')}
              </p>
            </CardContent>
          </Card>

          <Card className="text-center bg-purple-50 border-purple-200">
            <CardHeader>
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUpIcon className="w-8 h-8 text-purple-600" />
              </div>
              <CardTitle className="text-xl text-purple-800">{t('pricing.maximumRoi')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-purple-700">
                {t('pricing.schoolsSeeImprovement')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h3 className="text-3xl font-bold text-foreground mb-4">
            {t('pricing.readyTransformUnbeatable')}
          </h3>
          <p className="text-lg text-muted-foreground mb-8">
            {t('pricing.startTrialToday')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/enhanced-pricing">
              <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                {t('pricing.startFreeTrialNow')}
              </Button>
            </Link>
            
            {!teacher && (
              <Link to="/teacher-login">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2">
                  {t('pricing.signUpEducator')}
                </Button>
              </Link>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground mt-4">
            {t('pricing.questionsContact')}
          </p>
        </div>
      </main>
    </div>
  );
};

export default PricingShowcase;
