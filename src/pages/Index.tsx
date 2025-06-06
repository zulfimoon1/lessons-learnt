
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCapIcon, UsersIcon, BookOpenIcon, TrendingUpIcon } from "lucide-react";
import { Link } from "react-router-dom";
import LanguageSwitcher from "@/components/LanguageSwitcher";
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
            Transform Your School with Real-Time Feedback
          </h2>
          <p className="text-xl text-muted-foreground mb-12">
            Empower teachers with student insights and help administrators monitor school-wide performance
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-md mx-auto">
            <Link to="/student-login">
              <Button 
                size="lg" 
                className="w-full h-16 text-lg"
              >
                <UsersIcon className="w-6 h-6 mr-2" />
                Student Login
              </Button>
            </Link>
            
            <Link to="/teacher-login">
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full border-2 border-border hover:bg-accent h-16 text-lg"
              >
                <BookOpenIcon className="w-6 h-6 mr-2" />
                Teacher Login
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
              <CardTitle className="text-xl">Student Feedback</CardTitle>
              <CardDescription>
                Students can easily provide feedback on their learning experience
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card/60 backdrop-blur-sm border-border">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <BookOpenIcon className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Teacher Insights</CardTitle>
              <CardDescription>
                Teachers get real-time insights to improve their teaching methods
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card/60 backdrop-blur-sm border-border">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <TrendingUpIcon className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Data Analytics</CardTitle>
              <CardDescription>
                Comprehensive analytics to track student progress and well-being
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Index;
