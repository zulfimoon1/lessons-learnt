import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { CheckIcon, StarIcon, UsersIcon, BookOpenIcon, BarChart3Icon, ShieldIcon, GlobeIcon, HeartIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const PricingShowcase = () => {
  const { t } = useLanguage();
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2">
              <BookOpenIcon className="w-8 h-8 text-brand-teal" />
              <span className="text-2xl font-bold text-brand-dark">Lesson Lens</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/demo">
                <Button variant="outline" size="sm" className="border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white">
                  {t('demo.title')}
                </Button>
              </Link>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-brand-gradient py-20 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <Badge className="bg-white/20 text-white border-white/30 mb-6">
            {t('pricing.unbeatable')} {t('pricing.value')}
          </Badge>
          
          <h1 className="text-5xl font-bold mb-6 text-white drop-shadow-lg">
            {t('pricing.transformSchoolLess')}
          </h1>
          <div className="text-6xl font-black text-white mb-2 drop-shadow-lg">€ 9.99 {t('pricing.perTeacherMonth')}</div>
          <p className="text-xl text-white/90 mb-8 drop-shadow-md">
            {t('pricing.worldClass')}
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-white drop-shadow-lg">85%</div>
              <div className="text-white/90 font-medium">{t('pricing.costSavings')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white drop-shadow-lg">30</div>
              <div className="text-white/90 font-medium">{t('pricing.freeTrial')} {t('common.days')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white drop-shadow-lg">24/7</div>
              <div className="text-white/90 font-medium">{t('pricing.supportIncluded')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white drop-shadow-lg">5+</div>
              <div className="text-white/90 font-medium">{t('pricing.volumeDiscounts')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Volume Discounts Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-brand-dark mb-4">
              {t('pricing.moreTeachersMoreSave')}
            </h2>
            <p className="text-xl text-gray-700">
              {t('pricing.volumeDiscountsDetails')}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-brand-dark font-semibold text-lg mb-2">1-4 {t('pricing.teachers')}</div>
                <div className="text-3xl font-bold text-brand-dark">€9.99</div>
                <div className="text-gray-600">{t('pricing.standardPrice')}</div>
              </div>
              <div className="text-center bg-brand-teal/5 rounded-lg p-4">
                <div className="text-brand-dark font-semibold text-lg mb-2">5-10 {t('pricing.teachers')}</div>
                <div className="text-3xl font-bold text-brand-teal">€8.99</div>
                <div className="text-brand-teal font-semibold">10% {t('pricing.discount')}</div>
              </div>
              <div className="text-center bg-brand-orange/5 rounded-lg p-4">
                <div className="text-brand-dark font-semibold text-lg mb-2">10-20 {t('pricing.teachers')}</div>
                <div className="text-3xl font-bold text-brand-orange">€7.99</div>
                <div className="text-brand-orange font-semibold">20% {t('pricing.discount')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Pricing Plans */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className="text-lg font-semibold text-brand-dark">{t('pricing.monthly')}</span>
              <Switch 
                checked={isAnnual} 
                onCheckedChange={setIsAnnual}
                className="data-[state=checked]:bg-brand-teal"
              />
              <span className="text-lg font-semibold text-brand-dark">{t('pricing.annual')}</span>
              <Badge className="bg-brand-orange text-white">{t('pricing.saveExclamation')}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Teacher Plan */}
            <Card className="relative border-2 border-gray-200 hover:border-brand-teal transition-all">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-brand-dark">{t('pricing.teacherPlan')}</CardTitle>
                <CardDescription className="text-gray-600">
                  {t('pricing.perfectIndividual')}
                </CardDescription>
                <div className="mt-4">
                  <div className="text-4xl font-bold text-brand-dark">
                    €{isAnnual ? '7.99' : '9.99'}
                  </div>
                  <div className="text-gray-600">{t('pricing.perTeacherMonth')}</div>
                  {isAnnual && (
                    <div className="text-brand-teal font-semibold">{t('pricing.saveThirty')}</div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckIcon className="w-5 h-5 text-brand-teal" />
                    <span className="text-brand-dark">{t('pricing.unlimitedClasses')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckIcon className="w-5 h-5 text-brand-teal" />
                    <span className="text-brand-dark">{t('pricing.feedbackCollection')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckIcon className="w-5 h-5 text-brand-teal" />
                    <span className="text-brand-dark">{t('pricing.analytics')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckIcon className="w-5 h-5 text-brand-teal" />
                    <span className="text-brand-dark">{t('pricing.mentalHealth')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckIcon className="w-5 h-5 text-brand-teal" />
                    <span className="text-brand-dark">{t('pricing.multiLanguage')}</span>
                  </div>
                </div>
                <Button className="w-full bg-brand-teal hover:bg-brand-dark text-white">
                  {t('pricing.startFreeTrial')}
                </Button>
              </CardContent>
            </Card>

            {/* School Admin Plan */}
            <Card className="relative border-2 border-brand-orange bg-gradient-to-br from-white to-brand-orange/5">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-brand-orange text-white px-4 py-1">
                  {t('pricing.bestValue')}
                </Badge>
              </div>
              <CardHeader className="text-center pt-8">
                <CardTitle className="text-2xl font-bold text-brand-dark">{t('pricing.schoolAdmin')}</CardTitle>
                <CardDescription className="text-gray-600">
                  {t('pricing.completeTransformation')}
                </CardDescription>
                <div className="mt-4">
                  <div className="text-4xl font-bold text-brand-dark">
                    €{isAnnual ? '11.99' : '14.99'}
                  </div>
                  <div className="text-gray-600">{t('pricing.perTeacherMonth')}</div>
                  {isAnnual && (
                    <div className="text-brand-orange font-semibold">{t('pricing.saveThirty')}</div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckIcon className="w-5 h-5 text-brand-orange" />
                    <span className="text-brand-dark">{t('pricing.schoolWideInsights')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckIcon className="w-5 h-5 text-brand-orange" />
                    <span className="text-brand-dark">{t('pricing.teacherManagement')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckIcon className="w-5 h-5 text-brand-orange" />
                    <span className="text-brand-dark">{t('pricing.privacyCompliant')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckIcon className="w-5 h-5 text-brand-orange" />
                    <span className="text-brand-dark">{t('pricing.volumeDiscounts')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckIcon className="w-5 h-5 text-brand-orange" />
                    <span className="text-brand-dark">{t('pricing.maximumImpact')}</span>
                  </div>
                </div>
                <Button className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white">
                  {t('pricing.transformYourSchool')}
                </Button>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="relative border-2 border-gray-200 hover:border-brand-dark transition-all">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-brand-dark">{t('pricing.premium')}</CardTitle>
                <CardDescription className="text-gray-600">
                  {t('pricing.perfectForLargeOrgs')}
                </CardDescription>
                <div className="mt-4">
                  <div className="text-4xl font-bold text-brand-dark">{t('pricing.customPricingAvailable')}</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <div className="text-lg font-semibold text-brand-dark mb-2">
                    {t('pricing.needCustomSolution')}
                  </div>
                  <p className="text-gray-600 mb-6">
                    {t('pricing.customPricingDescription')}
                  </p>
                  <div className="space-y-3">
                    <div className="text-brand-orange font-bold">{t('pricing.comingSoon')}</div>
                    <div className="text-gray-600">{t('pricing.customPricingFormSoon')}</div>
                  </div>
                </div>
                <Button variant="outline" className="w-full border-brand-dark text-brand-dark hover:bg-brand-dark hover:text-white" disabled>
                  {t('pricing.requestCustomPricing')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Maximum ROI Section */}
      <section className="py-16 bg-brand-gradient-soft">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-brand-dark mb-4">
            {t('pricing.maximumRoi')}
          </h2>
          <p className="text-xl text-gray-700 mb-8">
            {t('pricing.schoolsSeeImprovement')}
          </p>
          <div className="flex justify-center">
            <GlobeIcon className="w-12 h-12 text-brand-teal mr-4" />
            <ShieldIcon className="w-12 h-12 text-brand-orange" />
          </div>
        </div>
      </section>

      {/* Holiday Pause Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-brand-dark mb-4">
            {t('pricing.holidayPause')}
          </h2>
          <p className="text-xl text-gray-700 mb-8">
            {t('pricing.pauseSubscription')}
          </p>
          <HeartIcon className="w-12 h-12 text-brand-orange mx-auto" />
        </div>
      </section>

      {/* Ready to Transform Section */}
      <section className="py-24 bg-brand-gradient text-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6 drop-shadow-lg">
            {t('pricing.readyTransformUnbeatable')}
          </h2>
          <p className="text-xl text-white/90 mb-12 drop-shadow-md">
            {t('pricing.startTrialToday')}
          </p>
          <Link to="/signup">
            <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white text-lg px-8 py-3">
              {t('pricing.startFreeTrialNow')}
            </Button>
          </Link>
        </div>
      </section>

      {/* Questions Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-semibold text-brand-dark mb-4">
            {t('pricing.questionsContact')}
          </h2>
          <p className="text-gray-600">
            {t('pricing.signUpEducator')}
          </p>
        </div>
      </section>
    </div>
  );
};

export default PricingShowcase;
