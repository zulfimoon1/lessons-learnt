
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeftIcon, 
  CheckIcon, 
  StarIcon, 
  DollarSignIcon,
  CalendarIcon,
  PauseIcon,
  TrendingDownIcon,
  BookOpenIcon,
  UsersIcon,
  ShieldIcon,
  ZapIcon
} from "lucide-react";

const PricingShowcase = () => {
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = useState(false);

  const features = [
    "Unlimited class scheduling",
    "Real-time student feedback",
    "Mental health monitoring",
    "Advanced analytics & reporting",
    "Multi-language support",
    "24/7 customer support"
  ];

  const adminFeatures = [
    "Everything in Teacher plan",
    "School-wide dashboard",
    "Teacher management",
    "Advanced reporting suite",
    "Mental health article management",
    "Priority support"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Home
            </Button>
            <div className="flex items-center gap-3">
              <BookOpenIcon className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">LessonLens</span>
            </div>
          </div>
          <Button 
            onClick={() => navigate('/enhanced-pricing')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4 bg-green-100 text-green-800">
            Limited Time: 30-Day Free Trial
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Amazing Value,
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              {" "}Maximum Impact
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Transform your classroom for less than the cost of a coffee per day. 
            Get premium educational tools with the flexibility educators need.
          </p>

          {/* Value Props */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="flex flex-col items-center p-6 bg-white/60 rounded-lg">
              <TrendingDownIcon className="w-12 h-12 text-green-600 mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Incredibly Affordable</h3>
              <p className="text-gray-600 text-sm text-center">
                Starting at just $7.99/month with volume discounts
              </p>
            </div>
            <div className="flex flex-col items-center p-6 bg-white/60 rounded-lg">
              <PauseIcon className="w-12 h-12 text-blue-600 mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">School Holiday Pause</h3>
              <p className="text-gray-600 text-sm text-center">
                Unique feature: Pause subscriptions during breaks
              </p>
            </div>
            <div className="flex flex-col items-center p-6 bg-white/60 rounded-lg">
              <ZapIcon className="w-12 h-12 text-purple-600 mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Instant Results</h3>
              <p className="text-gray-600 text-sm text-center">
                See improvements in student engagement from day one
              </p>
            </div>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={!isAnnual ? 'font-semibold text-gray-900' : 'text-gray-600'}>Monthly</span>
            <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
            <span className={isAnnual ? 'font-semibold text-gray-900' : 'text-gray-600'}>
              Annual
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">Save $20</Badge>
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-8 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Teacher Plan */}
          <Card className="relative border-2 border-blue-200 hover:border-blue-300 transition-colors">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <UsersIcon className="w-6 h-6 text-blue-600" />
                <CardTitle className="text-2xl text-blue-900">Teacher Plan</CardTitle>
              </div>
              <CardDescription className="text-base">Perfect for individual teachers</CardDescription>
              
              <div className="mt-6">
                <div className="text-4xl font-bold text-gray-900">
                  ${isAnnual ? '8.25' : '9.99'}
                  <span className="text-lg font-normal text-gray-600">/month</span>
                </div>
                {isAnnual && (
                  <div className="text-sm text-gray-600 mt-1">
                    <span className="line-through">$9.99/month</span>
                    <span className="text-green-600 ml-2">Save $20/year</span>
                  </div>
                )}
                <div className="mt-4 space-y-2">
                  <Badge variant="outline" className="mr-2">
                    <DollarSignIcon className="w-3 h-3 mr-1" />
                    Volume Discounts Available
                  </Badge>
                  <div className="text-sm text-gray-600">
                    <div>5+ teachers: $8.99 each</div>
                    <div>10+ teachers: $7.99 each</div>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
              
              <div className="pt-4">
                <Button 
                  onClick={() => navigate('/enhanced-pricing')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
                >
                  Start Free Trial
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Admin Plan */}
          <Card className="relative border-2 border-purple-300 hover:border-purple-400 transition-colors">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-purple-600 text-white px-4 py-1 flex items-center gap-1">
                <StarIcon className="w-3 h-3" />
                Most Popular
              </Badge>
            </div>
            
            <CardHeader className="text-center pb-4 pt-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <ShieldIcon className="w-6 h-6 text-purple-600" />
                <CardTitle className="text-2xl text-purple-900">School Admin Bundle</CardTitle>
              </div>
              <CardDescription className="text-base">For principals and administrators</CardDescription>
              
              <div className="mt-6">
                <div className="text-4xl font-bold text-gray-900">
                  ${isAnnual ? '12.41' : '14.99'}
                  <span className="text-lg font-normal text-gray-600">/month</span>
                </div>
                {isAnnual && (
                  <div className="text-sm text-gray-600 mt-1">
                    <span className="line-through">$14.99/month</span>
                    <span className="text-green-600 ml-2">Save $30/year</span>
                  </div>
                )}
                <div className="mt-4">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    Best Value for Schools
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {adminFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
              
              <div className="pt-4">
                <Button 
                  onClick={() => navigate('/enhanced-pricing')}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg py-6"
                >
                  Start Free Trial
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Unique Features */}
      <section className="py-16 px-4 bg-white/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Educators Choose LessonLens
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-green-200">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <CalendarIcon className="w-8 h-8 text-green-600" />
                  <CardTitle className="text-green-900">30-Day Free Trial</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Try everything risk-free. No credit card required to start.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Full access to all features</li>
                  <li>• Cancel anytime during trial</li>
                  <li>• Dedicated onboarding support</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <PauseIcon className="w-8 h-8 text-blue-600" />
                  <CardTitle className="text-blue-900">School Holiday Pause</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Unique feature: Pause subscriptions during summer and winter breaks.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Pause for 2-3 months during breaks</li>
                  <li>• No charges during pause period</li>
                  <li>• Perfect for academic calendars</li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          {/* ROI Section */}
          <div className="mt-12 p-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-4">
              Incredible Return on Investment
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-green-600">$7.99</div>
                <div className="text-gray-600">Per teacher/month</div>
                <div className="text-sm text-gray-500 mt-1">Less than a coffee per day</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">20%</div>
                <div className="text-gray-600">Avg. engagement increase</div>
                <div className="text-sm text-gray-500 mt-1">Improved learning outcomes</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">5hrs</div>
                <div className="text-gray-600">Time saved per week</div>
                <div className="text-sm text-gray-500 mt-1">Automated reporting</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Teaching?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of educators who've revolutionized their classrooms with LessonLens
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/enhanced-pricing')}
            className="bg-white text-blue-600 hover:bg-blue-50 text-xl px-12 py-6"
          >
            Start Your Free Trial Today
          </Button>
          <p className="text-blue-100 mt-4 text-sm">
            No credit card required • Cancel anytime • Full support included
          </p>
        </div>
      </section>
    </div>
  );
};

export default PricingShowcase;
