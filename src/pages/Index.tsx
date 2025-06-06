
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCapIcon, UsersIcon, BookOpenIcon, HeartIcon, BarChart3Icon, ShieldCheckIcon } from "lucide-react";
import { Link } from "react-router-dom";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import CalendarBooking from "@/components/CalendarBooking";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <GraduationCapIcon className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Lessons Learnt</h1>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-5xl font-bold text-foreground mb-6">
            {t('welcome.title')}
          </h2>
          <p className="text-xl text-muted-foreground mb-12">
            {t('welcome.subtitle')}
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-md mx-auto">
            <Link to="/student-login">
              <Button 
                size="lg" 
                className="w-full min-h-16 py-4 px-6 text-lg flex items-center justify-center"
              >
                <UsersIcon className="w-6 h-6 mr-2 flex-shrink-0" />
                <span className="text-center leading-tight">{t('auth.studentLogin')}</span>
              </Button>
            </Link>
            
            <Link to="/teacher-login">
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full border-2 border-border hover:bg-accent min-h-16 py-4 px-6 text-lg flex items-center justify-center"
              >
                <BookOpenIcon className="w-6 h-6 mr-2 flex-shrink-0" />
                <span className="text-center leading-tight">{t('auth.teacherLogin')}</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-card/60 backdrop-blur-sm border-border">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <UsersIcon className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">{t('features.studentFeedback.title')}</CardTitle>
              <CardDescription>
                {t('features.studentFeedback.description')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card/60 backdrop-blur-sm border-border">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <BookOpenIcon className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">{t('features.teacherInsights.title')}</CardTitle>
              <CardDescription>
                {t('features.teacherInsights.description')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card/60 backdrop-blur-sm border-border">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <HeartIcon className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Mental Health</CardTitle>
              <CardDescription>
                Early detection and support for student well-being and mental health concerns
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Platform Overview Section */}
      <section className="bg-muted/30 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Why Schools Choose Lessons Learnt
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our platform empowers schools with actionable insights to create better learning environments, 
              support student well-being, and drive educational excellence through data-driven decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-3xl font-bold text-foreground mb-6">
                Comprehensive Student Insights
              </h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <BarChart3Icon className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Real-Time Analytics</h4>
                    <p className="text-muted-foreground">
                      Track student engagement, learning progress, and classroom dynamics with instant feedback collection and analysis.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <HeartIcon className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Mental Health Monitoring</h4>
                    <p className="text-muted-foreground">
                      Early detection of student well-being concerns through intelligent content analysis and immediate alerts to school counselors.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <ShieldCheckIcon className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Privacy & Security</h4>
                    <p className="text-muted-foreground">
                      Enterprise-grade security ensures student data protection while maintaining compliance with educational privacy standards.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8">
              <div className="text-center">
                <div className="text-6xl font-bold text-primary mb-4">85%</div>
                <p className="text-xl font-semibold mb-2">Improvement in Student Engagement</p>
                <p className="text-muted-foreground">
                  Schools using our platform report significant increases in student participation and learning outcomes.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Ready to Transform Your School?
            </h3>
            <p className="text-lg text-muted-foreground mb-8">
              Join hundreds of schools already using Lessons Learnt to create better learning environments.
            </p>
            <CalendarBooking />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
