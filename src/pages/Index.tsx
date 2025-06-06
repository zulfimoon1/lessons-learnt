
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpenIcon, MessageCircleIcon, StarIcon, GraduationCapIcon, UserIcon } from "lucide-react";
import LessonFeedbackForm from "@/components/LessonFeedbackForm";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [student, setStudent] = useState<{ name: string; email: string } | null>(null);
  const [isAnonymousMode, setIsAnonymousMode] = useState(false);
  const [submittedFeedback, setSubmittedFeedback] = useState<any[]>([]);
  const { toast } = useToast();
  const { teacher, student: loggedInStudent } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleFeedbackSubmit = (feedbackData: any) => {
    const submissionData = {
      ...feedbackData,
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      studentName: isAnonymousMode ? "Anonymous" : student?.name || "Anonymous",
      studentEmail: isAnonymousMode ? "anonymous" : student?.email || "anonymous",
      isAnonymous: isAnonymousMode
    };
    
    setSubmittedFeedback(prev => [...prev, submissionData]);
    setShowFeedbackForm(false);
    toast({
      title: "Feedback Submitted Successfully! 🎉",
      description: isAnonymousMode 
        ? "Your anonymous feedback has been sent to your teacher."
        : "Your feedback has been sent to your teacher.",
    });
  };

  const handleStartFeedback = () => {
    if (loggedInStudent) {
      setStudent({ 
        name: loggedInStudent.full_name, 
        email: `${loggedInStudent.full_name}@${loggedInStudent.school}` 
      });
      setIsAnonymousMode(false);
      setShowFeedbackForm(true);
    } else {
      navigate("/student-login");
    }
  };

  const handleAnonymousContinue = () => {
    setStudent(null);
    setIsAnonymousMode(true);
    setShowFeedbackForm(true);
  };

  if (teacher) {
    navigate("/teacher-dashboard");
    return null;
  }

  if (loggedInStudent) {
    navigate("/student-dashboard");
    return null;
  }

  if (showFeedbackForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <LessonFeedbackForm 
          onSubmit={handleFeedbackSubmit}
          onCancel={() => {
            setShowFeedbackForm(false);
            setStudent(null);
            setIsAnonymousMode(false);
          }}
          studentInfo={isAnonymousMode ? null : student}
          isAnonymous={isAnonymousMode}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <MessageCircleIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('app.title')}</h1>
                <p className="text-gray-600">{t('app.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <div className="flex gap-2">
                <Button 
                  onClick={() => navigate("/student-login")}
                  variant="outline"
                  className="border-green-200 text-green-600 hover:bg-green-50"
                >
                  <UserIcon className="w-4 h-4 mr-2" />
                  {t('student.login')}
                </Button>
                <Button 
                  onClick={() => navigate("/teacher-login")}
                  variant="outline"
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <GraduationCapIcon className="w-4 h-4 mr-2" />
                  {t('teacher.login')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t('home.welcome')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t('home.description')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="bg-white/70 backdrop-blur-sm border-blue-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mx-auto flex items-center justify-center mb-4">
                <BookOpenIcon className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl text-gray-900">{t('feature.understanding.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-gray-600 leading-relaxed">
                {t('feature.understanding.description')}
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-green-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full mx-auto flex items-center justify-center mb-4">
                <StarIcon className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl text-gray-900">{t('feature.engagement.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-gray-600 leading-relaxed">
                {t('feature.engagement.description')}
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-purple-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full mx-auto flex items-center justify-center mb-4">
                <MessageCircleIcon className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl text-gray-900">{t('feature.emotional.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-gray-600 leading-relaxed">
                {t('feature.emotional.description')}
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center mb-8">
          <Button 
            onClick={handleStartFeedback}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <MessageCircleIcon className="w-5 h-5 mr-2" />
            {t('home.giveFeedback')}
          </Button>
        </div>

        {/* Anonymous Option Notice */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-2 rounded-lg border border-orange-200">
            <UserIcon className="w-4 h-4" />
            <span className="text-sm font-medium">
              {t('home.anonymousNotice')}
            </span>
          </div>
          <div className="mt-4">
            <Button 
              onClick={handleAnonymousContinue}
              variant="outline"
              size="sm"
              className="text-orange-600 border-orange-200 hover:bg-orange-50"
            >
              {t('home.continueAnonymously')}
            </Button>
          </div>
        </div>

        {/* Recent Feedback */}
        {submittedFeedback.length > 0 && (
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Recent Feedback</h3>
            <div className="grid gap-6 max-w-4xl mx-auto">
              {submittedFeedback.slice(-3).reverse().map((feedback) => (
                <Card key={feedback.id} className="bg-white/70 backdrop-blur-sm border-gray-200">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{feedback.subject} - {feedback.lessonTopic}</CardTitle>
                        <CardDescription>{feedback.date} • {feedback.studentName}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Submitted
                        </Badge>
                        {feedback.isAnonymous && (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                            Anonymous
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Understanding:</span>
                        <div className="flex text-yellow-500 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon key={i} className={`w-4 h-4 ${i < feedback.understanding ? 'fill-current' : ''}`} />
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Interest:</span>
                        <div className="flex text-yellow-500 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon key={i} className={`w-4 h-4 ${i < feedback.interest ? 'fill-current' : ''}`} />
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Educational Growth:</span>
                        <div className="flex text-yellow-500 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon key={i} className={`w-4 h-4 ${i < feedback.educationalGrowth ? 'fill-current' : ''}`} />
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Emotional State:</span>
                        <div className="text-sm font-medium text-gray-800 mt-1 capitalize">
                          {feedback.emotionalState}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
