
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import TeacherNotebook from "@/components/TeacherNotebook";
import StatsCard from "@/components/dashboard/StatsCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { BookOpen, NotebookPen, Users, Calendar } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

interface ArticlesTabProps {
  teacher: any;
  subscription?: any;
  onCreateCheckout?: () => void;
  isCreatingCheckout?: boolean;
}

const ArticlesTab: React.FC<ArticlesTabProps> = ({
  teacher,
  subscription,
  onCreateCheckout,
  isCreatingCheckout = false
}) => {
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClasses: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    loadStats();
  }, [teacher]);

  const loadStats = async () => {
    try {
      // Get total students in the school
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('id')
        .eq('school', teacher.school);

      if (studentsError) throw studentsError;

      // Get total classes for this teacher
      const { data: classesData, error: classesError } = await supabase
        .from('class_schedules')
        .select('id')
        .eq('teacher_id', teacher.id);

      if (classesError) throw classesError;

      setStats({
        totalStudents: studentsData?.length || 0,
        totalClasses: classesData?.length || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-brand-teal to-brand-orange flex items-center justify-center">
            <NotebookPen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t('notes.title')}</h2>
            <p className="text-gray-600">
              {t('notes.description')}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <StatsCard
          title="Total Students"
          value={isLoadingStats ? "..." : stats.totalStudents}
          icon={Users}
        />
        <StatsCard
          title="Total Classes"
          value={isLoadingStats ? "..." : stats.totalClasses}
          icon={Calendar}
        />
      </div>

      <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-brand-teal/5 to-brand-orange/10 hover:from-brand-teal/10 hover:to-brand-orange/20">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-teal/10 flex items-center justify-center group-hover:bg-brand-teal/20 transition-colors">
              <BookOpen className="w-4 h-4 text-brand-teal" />
            </div>
            <div>
              <CardTitle className="text-lg text-gray-900">{t('notes.title')}</CardTitle>
              <CardDescription className="text-sm">{t('notes.description')}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TeacherNotebook teacher={teacher} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ArticlesTab;
