
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PauseIcon, CalendarIcon, CreditCardIcon, TrendingUpIcon, BellIcon, LayoutDashboardIcon, StarIcon } from "lucide-react";

const HolidayPauseBenefits = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-purple-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="bg-purple-100 text-purple-800 border-purple-200 mb-4">
            Smart Savings Feature
          </Badge>
          <h2 className="text-4xl font-bold text-brand-dark mb-4">
            Holiday Pause: Save Money During School Breaks
          </h2>
          <p className="text-xl text-gray-700">
            Pause your subscription during holidays and save up to €180 per year
          </p>
        </div>

        {/* How It Works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <PauseIcon className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Easy Activation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Add Holiday Pause for just €10/month to unlock the ability to freeze billing
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <CalendarIcon className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Flexible Pausing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Pause billing for up to 3 months annually during summer or winter breaks
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <TrendingUpIcon className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-lg">Automatic Restart</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Service automatically reactivates after your pause period ends
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Comparison */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Smart Savings Calculator</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Without Pause */}
              <div className="text-center">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 text-red-700">Without Holiday Pause</h3>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-red-600">€1,200</div>
                    <div className="text-gray-600">12 months × €100/month</div>
                    <div className="text-sm text-gray-500">Pay full price year-round</div>
                  </div>
                </div>
              </div>

              {/* With Pause */}
              <div className="text-center">
                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 text-green-700">With Holiday Pause</h3>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-green-600">€1,020</div>
                    <div className="text-gray-600">9 months × €100 + €30 pause fee</div>
                    <div className="text-sm text-green-600 font-semibold">Save €180 per year (15%)</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-6">
              <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                Forgot to pause? Costs €300 instead of €30 for 3 months
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Implementation Tips */}
        <Card className="bg-blue-50 border border-blue-200">
          <CardHeader>
            <CardTitle className="text-xl text-blue-800">Implementation Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <BellIcon className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-blue-800">Smart Reminders</h4>
                  <p className="text-blue-700 text-sm">Auto-email reminders 2 weeks before school breaks</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <LayoutDashboardIcon className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-blue-800">Dashboard Notifications</h4>
                  <p className="text-blue-700 text-sm">"Summer break coming! Activate pause now" alerts</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">Success Statistics</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">65%</div>
                  <div className="text-sm text-blue-700">Schools activate pause</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">€180</div>
                  <div className="text-sm text-blue-700">Average annual savings</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">90%</div>
                  <div className="text-sm text-blue-700">Customer satisfaction</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default HolidayPauseBenefits;
