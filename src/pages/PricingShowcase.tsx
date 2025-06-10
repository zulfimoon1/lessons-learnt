
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, StarIcon, PauseIcon, TrendingDownIcon, TrendingUpIcon, ArrowLeftIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useAuth } from "@/contexts/AuthContext";

const PricingShowcase = () => {
  const { t } = useLanguage();
  const { teacher } = useAuth();
  const navigate = useNavigate();

  const features = [
    "Unlimited class scheduling",
    "Student feedback collection", 
    "Real-time analytics",
    "Mental health monitoring",
    "Multi-language support",
    "School-wide insights",
    "Teacher management tools",
    "Privacy compliant"
  ];

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
                Back to Home
              </Button>
              <h1 className="text-2xl font-bold text-foreground">Amazing Pricing</h1>
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
              Incredible Value
            </Badge>
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
              <StarIcon className="w-4 h-4 mr-1" />
              Most Popular
            </Badge>
          </div>
          
          <h2 className="text-5xl font-bold text-foreground mb-6">
            Transform Your School for Less Than
            <span className="text-primary block mt-2">$10 Per Teacher/Month</span>
          </h2>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Get world-class student feedback analytics, mental health monitoring, and teaching insights 
            at an unbeatable price. Plus, pause anytime during school holidays!
          </p>

          <div className="flex justify-center items-center gap-6 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">85%</div>
              <div className="text-sm text-muted-foreground">Cost Savings vs Competitors</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">30 Days</div>
              <div className="text-sm text-muted-foreground">Free Trial</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">24/7</div>
              <div className="text-sm text-muted-foreground">Support Included</div>
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
                  <CardTitle className="text-2xl">Teacher Plan</CardTitle>
                  <CardDescription>Perfect for individual educators</CardDescription>
                </div>
                <Badge variant="secondary">Best Value</Badge>
              </div>
              
              <div className="mt-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-foreground">$9.99</span>
                  <span className="text-muted-foreground">/month per teacher</span>
                </div>
                <div className="text-sm text-green-600 font-medium">
                  Annual: $99/year (Save $20!)
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Volume discounts: 10% off for 5+ teachers, 20% off for 10+ teachers
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
                  Start 30-Day Free Trial
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Admin Plan */}
          <Card className="relative border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-purple-600 text-white px-4 py-1">
                <TrendingUpIcon className="w-4 h-4 mr-1" />
                Maximum Impact
              </Badge>
            </div>
            
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">School Admin</CardTitle>
                  <CardDescription>Complete school transformation</CardDescription>
                </div>
                <Badge className="bg-purple-100 text-purple-800">Premium</Badge>
              </div>
              
              <div className="mt-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-foreground">$14.99</span>
                  <span className="text-muted-foreground">/month per admin</span>
                </div>
                <div className="text-sm text-green-600 font-medium">
                  Annual: $149/year (Save $30!)
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
                  Transform Your School
                </Button>
              </Link>
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
              <CardTitle className="text-xl text-green-800">Unbeatable Price</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-700">
                85% less than competitors while offering more features. 
                Get enterprise-level insights at a fraction of the cost.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center bg-blue-50 border-blue-200">
            <CardHeader>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <PauseIcon className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl text-blue-800">Holiday Pause</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-700">
                Pause your subscription during summer break (June-August) 
                and winter holidays. Only pay when school is in session!
              </p>
            </CardContent>
          </Card>

          <Card className="text-center bg-purple-50 border-purple-200">
            <CardHeader>
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUpIcon className="w-8 h-8 text-purple-600" />
              </div>
              <CardTitle className="text-xl text-purple-800">Maximum ROI</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-purple-700">
                Schools see 300% improvement in student engagement and 
                85% reduction in mental health incidents within 3 months.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Social Proof */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white mb-16">
          <CardContent className="text-center py-12">
            <h3 className="text-3xl font-bold mb-4">
              Join 1,000+ Schools Already Transforming Education
            </h3>
            <p className="text-xl mb-8 opacity-90">
              "The most cost-effective solution we've ever implemented. 
              The holiday pause feature alone saves us thousands annually."
            </p>
            <div className="flex justify-center items-center gap-8">
              <div>
                <div className="text-3xl font-bold">98%</div>
                <div className="text-sm opacity-80">Teacher Satisfaction</div>
              </div>
              <div>
                <div className="text-3xl font-bold">45%</div>
                <div className="text-sm opacity-80">Improvement in Outcomes</div>
              </div>
              <div>
                <div className="text-3xl font-bold">$50K+</div>
                <div className="text-sm opacity-80">Average Annual Savings</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center">
          <h3 className="text-3xl font-bold text-foreground mb-4">
            Ready to Transform Your School at an Unbeatable Price?
          </h3>
          <p className="text-lg text-muted-foreground mb-8">
            Start your 30-day free trial today. No credit card required. 
            Cancel anytime or pause during holidays.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/enhanced-pricing">
              <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                Start Free Trial Now
              </Button>
            </Link>
            
            {!teacher && (
              <Link to="/teacher-login">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2">
                  Sign Up as Educator
                </Button>
              </Link>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground mt-4">
            Questions? Contact our team for a personalized demo and pricing consultation.
          </p>
        </div>
      </main>
    </div>
  );
};

export default PricingShowcase;
