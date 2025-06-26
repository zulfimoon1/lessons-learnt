
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { MessageSquare, TrendingUp, Users, Star } from 'lucide-react';

interface FeedbackDashboardProps {
  teacher: {
    id: string;
    school: string;
    name: string;
    role: string;
  };
}

const FeedbackDashboard: React.FC<FeedbackDashboardProps> = ({ teacher }) => {
  const { t } = useLanguage();
  const [feedbackData, setFeedbackData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalFeedback: 0,
    avgUnderstanding: 0,
    avgInterest: 0,
    avgGrowth: 0
  });

  useEffect(() => {
    fetchFeedbackData();
  }, [teacher.school]);

  const fetchFeedbackData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('lesson_feedback')
        .select('*')
        .eq('school', teacher.school)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setFeedbackData(data || []);
      
      if (data && data.length > 0) {
        const totalFeedback = data.length;
        const avgUnderstanding = data.reduce((sum, item) => sum + (item.understanding_rating || 0), 0) / totalFeedback;
        const avgInterest = data.reduce((sum, item) => sum + (item.interest_rating || 0), 0) / totalFeedback;
        const avgGrowth = data.reduce((sum, item) => sum + (item.educational_growth_rating || 0), 0) / totalFeedback;
        
        setStats({
          totalFeedback,
          avgUnderstanding: Math.round(avgUnderstanding * 10) / 10,
          avgInterest: Math.round(avgInterest * 10) / 10,
          avgGrowth: Math.round(avgGrowth * 10) / 10
        });
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">{t('teacher.feedback.loading')}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Section - Matching AI Insights Style */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-brand-teal to-brand-orange flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Student Feedback Dashboard</h2>
            <p className="text-gray-600">
              Monitor student feedback and engagement insights
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-brand-teal/5 to-brand-teal/10 hover:from-brand-teal/10 hover:to-brand-teal/20">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-teal/10 flex items-center justify-center group-hover:bg-brand-teal/20 transition-colors">
                <Users className="w-4 h-4 text-brand-teal" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-900">Total Feedback</CardTitle>
                <CardDescription className="text-2xl font-bold text-brand-teal">{stats.totalFeedback}</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-brand-orange/5 to-brand-orange/10 hover:from-brand-orange/10 hover:to-brand-orange/20">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-orange/10 flex items-center justify-center group-hover:bg-brand-orange/20 transition-colors">
                <TrendingUp className="w-4 h-4 text-brand-orange" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-900">Understanding</CardTitle>
                <CardDescription className="text-2xl font-bold text-brand-orange">{stats.avgUnderstanding}/5</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-purple-500/5 to-purple-500/10 hover:from-purple-500/10 hover:to-purple-500/20">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                <Star className="w-4 h-4 text-purple-500" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-900">Interest</CardTitle>
                <CardDescription className="text-2xl font-bold text-purple-500">{stats.avgInterest}/5</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-green-500/5 to-green-500/10 hover:from-green-500/10 hover:to-green-500/20">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-900">Growth</CardTitle>
                <CardDescription className="text-2xl font-bold text-green-500">{stats.avgGrowth}/5</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Recent Feedback */}
      <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-gray-50/50 to-white hover:from-gray-50 hover:to-gray-50/50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
              <MessageSquare className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <CardTitle className="text-lg text-gray-900">Recent Feedback</CardTitle>
              <CardDescription className="text-sm">Latest student responses and comments</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {feedbackData.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              {t('teacher.feedback.noFeedback')}
            </p>
          ) : (
            <div className="space-y-4">
              {feedbackData.slice(0, 5).map((feedback) => (
                <div key={feedback.id} className="border-l-4 border-brand-teal pl-4 py-2">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{feedback.lesson_title || 'Lesson Feedback'}</h4>
                    <div className="flex gap-2">
                      <Badge variant="outline">U: {feedback.understanding_rating}/5</Badge>
                      <Badge variant="outline">I: {feedback.interest_rating}/5</Badge>
                      <Badge variant="outline">G: {feedback.educational_growth_rating}/5</Badge>
                    </div>
                  </div>
                  {feedback.what_went_well && (
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">What went well:</span> {feedback.what_went_well}
                    </p>
                  )}
                  {feedback.suggestions && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Suggestions:</span> {feedback.suggestions}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackDashboard;
