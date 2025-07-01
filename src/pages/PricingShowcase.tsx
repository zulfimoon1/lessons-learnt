
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { CheckIcon, StarIcon, UsersIcon, BookOpenIcon, BarChart3Icon, ShieldIcon, GlobeIcon, HeartIcon, ArrowLeft, GraduationCapIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ComplianceFooter from "@/components/ComplianceFooter";
import StudentBasedPricingCard from "@/components/StudentBasedPricingCard";
import HolidayPauseBenefits from "@/components/HolidayPauseBenefits";
import { PRICING_TIERS, getMinPricePerStudent } from "@/services/pricingService";

const PricingShowcase = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = useState(false);
  const minPricePerStudent = getMinPricePerStudent();

  const handleStartFreeTrial = () => {
    console.log('Start Free Trial button clicked - navigating to teacher-login signup tab');
    try {
      navigate('/teacher-login?tab=signup');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handleSelectPlan = (tierId: string) => {
    console.log(`Plan selected: ${tierId} - navigating to teacher-login signup tab`);
    try {
      navigate('/teacher-login?tab=signup');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                asChild
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <Link to="/">
                  <ArrowLeft className="h-4 w-4" />
                  {t('navigation.backToHome')}
                </Link>
              </Button>
              <Link to="/" className="flex items-center gap-2">
                <BookOpenIcon className="w-8 h-8 text-brand-teal" />
                <span className="text-2xl font-bold text-brand-dark">{t('welcome.title')}</span>
              </Link>
            </div>
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
            Student-Based Pricing
          </Badge>
          
          <h1 className="text-5xl font-bold mb-6 text-white drop-shadow-lg">
            Transform your school from less than
          </h1>
          <div className="text-6xl font-black text-white mb-2 drop-shadow-lg">
            € {minPricePerStudent} per student per year
          </div>
          <p className="text-xl text-white/90 mb-8 drop-shadow-md">
            Flexible pricing that grows with your school, with smart holiday pause options
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-white drop-shadow-lg">3</div>
              <div className="text-white/90 font-medium">Pricing Tiers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white drop-shadow-lg">30</div>
              <div className="text-white/90 font-medium">{t('pricing.freeTrial')} {t('common.days')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white drop-shadow-lg">€180</div>
              <div className="text-white/90 font-medium">Holiday Savings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white drop-shadow-lg">24/7</div>
              <div className="text-white/90 font-medium">{t('pricing.supportIncluded')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Student Capacity Overview */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-brand-dark mb-4">
              Pricing That Scales With Your School
            </h2>
            <p className="text-xl text-gray-700">
              Choose the perfect plan based on your student population
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-brand-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GraduationCapIcon className="w-8 h-8 text-brand-teal" />
                </div>
                <div className="text-brand-dark font-semibold text-lg mb-2">Basic Schools</div>
                <div className="text-3xl font-bold text-brand-dark">1-30</div>
                <div className="text-gray-600">Students</div>
                <div className="text-brand-teal font-semibold mt-2">€{minPricePerStudent}/student/year</div>
              </div>
              
              <div className="text-center bg-brand-orange/5 rounded-lg p-4">
                <div className="w-16 h-16 bg-brand-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UsersIcon className="w-8 h-8 text-brand-orange" />
                </div>
                <div className="text-brand-dark font-semibold text-lg mb-2">Growing Schools</div>
                <div className="text-3xl font-bold text-brand-orange">31-100</div>
                <div className="text-gray-600">Students</div>
                <div className="text-brand-orange font-semibold mt-2">€{(25000 / 100 / 100).toFixed(2)}/student/year</div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3Icon className="w-8 h-8 text-purple-600" />
                </div>
                <div className="text-brand-dark font-semibold text-lg mb-2">Large Schools</div>
                <div className="text-3xl font-bold text-purple-600">101-250</div>
                <div className="text-gray-600">Students</div>
                <div className="text-purple-600 font-semibold mt-2">€{(50000 / 250 / 100).toFixed(2)}/student/year</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
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
              <Badge className="bg-brand-orange text-white">Save 20%!</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {PRICING_TIERS.map((tier) => (
              <StudentBasedPricingCard
                key={tier.id}
                tier={tier}
                isAnnual={isAnnual}
                onSelect={handleSelectPlan}
                t={t}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Holiday Pause Benefits */}
      <HolidayPauseBenefits />

      {/* Annual Upgrade CTA */}
      <section className="py-16 bg-gradient-to-r from-brand-teal to-brand-orange text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-4 drop-shadow-lg">
            Upgrade to Annual and Get Holiday Pause FREE
          </h2>
          <p className="text-xl text-white/90 mb-8 drop-shadow-md">
            Annual customers save 20% on their subscription plus get holiday pause included at no extra cost
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">Monthly + Holiday Pause</h3>
              <div className="text-3xl font-bold">€1,320</div>
              <div className="text-white/80">€100/month + €10 pause fee</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 border-2 border-white/30">
              <h3 className="text-xl font-semibold mb-2">Annual with FREE Pause</h3>
              <div className="text-3xl font-bold">€960</div>
              <div className="text-white/80">20% off + holiday pause included</div>
            </div>
          </div>
          <Button 
            onClick={handleStartFreeTrial}
            className="bg-white text-brand-teal hover:bg-gray-100 text-lg px-8 py-3 font-semibold"
          >
            Start Your 30-Day Free Trial
          </Button>
        </div>
      </section>

      {/* Ready to Transform Section */}
      <section className="py-24 bg-brand-gradient text-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6 drop-shadow-lg">
            Ready to Transform Your School?
          </h2>
          <p className="text-xl text-white/90 mb-12 drop-shadow-md">
            Join thousands of educators already using our platform
          </p>
          <Button 
            onClick={handleStartFreeTrial}
            className="bg-brand-orange hover:bg-brand-orange/90 text-white text-lg px-8 py-3"
          >
            Start Free Trial Now
          </Button>
        </div>
      </section>

      <ComplianceFooter />
    </div>
  );
};

export default PricingShowcase;
