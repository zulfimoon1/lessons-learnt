
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, TrendingUp, Users, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface DemoFeedbackTabProps {
  teacher: {
    id: string;
    name: string;
    school: string;
    role: string;
  };
}

const DemoFeedbackTab: React.FC<DemoFeedbackTabProps> = ({ teacher }) => {
  const { t } = useLanguage();
  const [demoFeedback, setDemoFeedback] = useState<any[]>([]);

  useEffect(() => {
    // Generate demo feedback data
    const sampleFeedback = [
      {
        id: 'demo-feedback-1',
        lesson_topic: 'Algebra Basics',
        subject: 'Mathematics',
        class_date: new Date().toISOString().split('T')[0],
        avg_understanding: 4.2,
        avg_interest: 3.8,
        avg_growth: 4.1,
        total_responses: 25,
        feedback_items: [
          { student_name: 'Student A', understanding: 5, interest: 4, growth: 5, comment: 'Great explanation of variables!' },
          { student_name: 'Student B', understanding: 4, interest: 3, growth: 4, comment: 'Could use more examples' },
          { student_name: 'Student C', understanding: 4, interest: 4, growth: 4, comment: 'Helpful lesson overall' }
        ]
      },
      {
        id: 'demo-feedback-2',
        lesson_topic: 'Chemistry Lab',
        subject: 'Science',
        class_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        avg_understanding: 4.5,
        avg_interest: 4.7,
        avg_growth: 4.3,
        total_responses: 22,
        feedback_items: [
          { student_name: 'Student D', understanding: 5, interest: 5, growth: 4, comment: 'Loved the hands-on experiments!' },
          { student_name: 'Student E', understanding: 4, interest: 5, growth: 5, comment: 'Very engaging lesson' },
          { student_name: 'Student F', understanding: 4, interest: 4, growth: 4, comment: 'Fun and educational' }
        ]
      },
      {
        id: 'demo-feedback-3',
        lesson_topic: 'Essay Writing',
        subject: 'English',
        class_date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
        avg_understanding: 3.9,
        avg_interest: 3.5,
        avg_growth: 3.8,
        total_responses: 28,
        feedback_items: [
          { student_name: 'Student G', understanding: 4, interest: 3, growth: 4, comment: 'Helpful writing tips' },
          { student_name: 'Student H', understanding: 3, interest: 4, growth: 3, comment: 'Need more practice time' },
          { student_name: 'Student I', understanding: 4, interest: 3, growth: 4, comment: 'Good structure guidance' }
        ]
      }
    ];

    setDemoFeedback(sampleFeedback);
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 4.0) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (score >= 3.5) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const averageScores = {
    understanding: demoFeedback.reduce((acc, item) => acc + item.avg_understanding, 0) / demoFeedback.length || 0,
    interest: demoFeedback.reduce((acc, item) => acc + item.avg_interest, 0) / demoFeedback.length || 0,
    growth: demoFeedback.reduce((acc, item) => acc + item.avg_growth, 0) / demoFeedback.length || 0,
    totalResponses: demoFeedback.reduce((acc, item) => acc + item.total_responses, 0)
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Understanding</p>
                <p className="text-2xl font-bold">{averageScores.understanding.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Interest</p>
                <p className="text-2xl font-bold">{averageScores.interest.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Growth</p>
                <p className="text-2xl font-bold">{averageScores.growth.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Responses</p>
                <p className="text-2xl font-bold">{averageScores.totalResponses}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback per Lesson */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            {t('dashboard.feedbackPerLesson') || 'Feedback per Lesson'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {demoFeedback.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No feedback data available yet. Feedback will appear here as students submit responses.
              </p>
            ) : (
              demoFeedback.map((lesson) => (
                <div key={lesson.id} className="border rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{lesson.subject} - {lesson.lesson_topic}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(lesson.class_date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {lesson.total_responses} responses
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getScoreColor(lesson.avg_understanding)}>
                        Understanding: {lesson.avg_understanding.toFixed(1)}
                      </Badge>
                      <Badge className={getScoreColor(lesson.avg_interest)}>
                        Interest: {lesson.avg_interest.toFixed(1)}
                      </Badge>
                      <Badge className={getScoreColor(lesson.avg_growth)}>
                        Growth: {lesson.avg_growth.toFixed(1)}
                      </Badge>
                    </div>
                  </div>

                  {/* Sample Student Feedback */}
                  <div className="mt-4">
                    <h4 className="font-medium mb-3">Recent Student Comments:</h4>
                    <div className="space-y-2">
                      {lesson.feedback_items.map((feedback, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded border-l-4 border-blue-200">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium text-sm">{feedback.student_name}</span>
                            <div className="flex gap-1 text-xs">
                              <span className="bg-blue-100 text-blue-800 px-1 rounded">U:{feedback.understanding}</span>
                              <span className="bg-green-100 text-green-800 px-1 rounded">I:{feedback.interest}</span>
                              <span className="bg-purple-100 text-purple-800 px-1 rounded">G:{feedback.growth}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700">{feedback.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Demo Notice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">Demo Feedback Dashboard</h4>
              <p className="text-sm text-blue-800">
                This is sample feedback data to demonstrate the feedback analytics interface. 
                In the full version, you'll see real student responses and detailed analytics for all your classes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DemoFeedbackTab;
