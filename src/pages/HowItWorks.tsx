
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { GraduationCapIcon, Users, BookOpen, Calendar, MessageSquare, UserCheck, Heart, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ComplianceFooter from '@/components/ComplianceFooter';

const HowItWorks = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2">
              <GraduationCapIcon className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Lessons Learnt</h1>
            </Link>
            <Link to="/">
              <Button variant="outline">
                {t('navigation.home')}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* How It Works Section */}
      <section className="bg-background py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              {t('howItWorks.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* For School Administrators */}
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-8 text-center">
                {t('howItWorks.forAdmins')}
              </h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div className="flex items-start gap-3">
                    <UserCheck className="w-5 h-5 text-primary mt-1" />
                    <p className="text-muted-foreground">
                      {t('howItWorks.admin.step1')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-primary mt-1" />
                    <p className="text-muted-foreground">
                      {t('howItWorks.admin.step2')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div className="flex items-start gap-3">
                    <BookOpen className="w-5 h-5 text-primary mt-1" />
                    <p className="text-muted-foreground">
                      {t('howItWorks.admin.step3')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-primary mt-1" />
                    <p className="text-muted-foreground">
                      {t('howItWorks.admin.step4')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                    5
                  </div>
                  <div className="flex items-start gap-3">
                    <Heart className="w-5 h-5 text-primary mt-1" />
                    <p className="text-muted-foreground">
                      {t('howItWorks.admin.step5')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                    6
                  </div>
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-5 h-5 text-primary mt-1" />
                    <p className="text-muted-foreground">
                      {t('howItWorks.admin.step6')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Students */}
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-8 text-center">
                {t('howItWorks.forStudents')}
              </h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-secondary mt-1" />
                    <p className="text-muted-foreground">
                      {t('howItWorks.student.step1')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-secondary mt-1" />
                    <p className="text-muted-foreground">
                      {t('howItWorks.student.step2')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div className="flex items-start gap-3">
                    <BookOpen className="w-5 h-5 text-secondary mt-1" />
                    <p className="text-muted-foreground">
                      {t('howItWorks.student.step3')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                  <div className="flex items-start gap-3">
                    <Heart className="w-5 h-5 text-secondary mt-1" />
                    <p className="text-muted-foreground">
                      {t('howItWorks.student.step4')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center font-bold">
                    5
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-secondary mt-1" />
                    <p className="text-muted-foreground">
                      {t('howItWorks.student.step5')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-16">
            <Link to="/teacher-login">
              <Button size="lg" className="text-lg px-8 py-3">
                {t('auth.getStarted')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Compliance Footer */}
      <ComplianceFooter />
    </div>
  );
};

export default HowItWorks;
