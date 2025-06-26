
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import TeacherNotebook from "@/components/TeacherNotebook";
import { useLanguage } from "@/contexts/LanguageContext";
import { BookOpen, NotebookPen } from 'lucide-react';

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

  return (
    <div className="space-y-6">
      {/* Header Section - Matching AI Insights Style */}
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
