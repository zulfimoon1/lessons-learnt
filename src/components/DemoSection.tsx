
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpenIcon, UserIcon, BarChart3Icon, HeartIcon, PlayIcon, ShieldCheckIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const DemoSection = () => {
  const { t } = useLanguage();

  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex justify-center items-center gap-3 mb-6">
            <Badge variant="outline" className="bg-brand-teal/10 border-brand-teal text-brand-teal px-4 py-2">
              <PlayIcon className="w-4 h-4 mr-2" />
              {t('demo.title')}
            </Badge>
          </div>
          <h2 className="text-4xl font-bold text-brand-dark mb-6">
            {t('demo.subtitle')}
          </h2>
          
          {/* Make this text much more visible */}
          <div className="bg-brand-gradient text-white rounded-lg p-6 max-w-md mx-auto mb-12">
            <p className="text-2xl font-black tracking-wide">
              5+ Features, 3 User Types
            </p>
            <p className="text-lg font-semibold mt-2 opacity-90">
              Experience the complete platform
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-brand-teal/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <UserIcon className="w-6 h-6 text-brand-teal" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-brand-dark mb-2">Student Experience</h3>
                <p className="text-gray-600">
                  Submit lesson feedback, share weekly summaries, and access mental health support - all in a safe, anonymous environment.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-brand-teal/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpenIcon className="w-6 h-6 text-brand-teal" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-brand-dark mb-2">Teacher Dashboard</h3>
                <p className="text-gray-600">
                  Monitor student engagement, track learning progress, and identify students who need additional support.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-brand-orange/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <BarChart3Icon className="w-6 h-6 text-brand-orange" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-brand-dark mb-2">Admin Overview</h3>
                <p className="text-gray-600">
                  School-wide analytics, teacher management, and comprehensive insights into educational outcomes.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-brand-gradient-soft rounded-2xl p-8">
            <Card className="bg-white/90 backdrop-blur-sm border-brand-teal/20">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-brand-teal rounded-full flex items-center justify-center">
                    <HeartIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-brand-dark">Demo Features</CardTitle>
                    <CardDescription className="text-gray-600">Try before you commit</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <ShieldCheckIcon className="w-5 h-5 text-brand-teal" />
                  <span className="text-brand-dark">No registration required</span>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheckIcon className="w-5 h-5 text-brand-teal" />
                  <span className="text-brand-dark">Full feature access</span>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheckIcon className="w-5 h-5 text-brand-teal" />
                  <span className="text-brand-dark">Sample data included</span>
                </div>
                
                <div className="pt-4">
                  <Button 
                    className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white"
                    onClick={() => window.open('/demo', '_blank')}
                  >
                    <PlayIcon className="w-4 h-4 mr-2" />
                    {t('demo.enterDemo')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;
