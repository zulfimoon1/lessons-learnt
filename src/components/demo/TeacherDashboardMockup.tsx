
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";

const TeacherDashboardMockup = () => {
  const { t } = useLanguage();
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{t('demo.mockups.teacherDashboard.title')}</h3>
        <Badge className="bg-green-100 text-green-700">{t('demo.mockups.teacherDashboard.live')}</Badge>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border-l-4 border-blue-500">
          <div className="text-3xl font-bold text-blue-600">87%</div>
          <div className="text-sm text-blue-800">{t('demo.mockups.teacherDashboard.understanding')}</div>
          <div className="text-xs text-blue-600 mt-1">{t('demo.mockups.teacherDashboard.improvement')}</div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border-l-4 border-green-500">
          <div className="text-3xl font-bold text-green-600">23</div>
          <div className="text-sm text-green-800">{t('demo.mockups.teacherDashboard.students')}</div>
          <div className="text-xs text-green-600 mt-1">{t('demo.mockups.teacherDashboard.attendance')}</div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
          <div>
            <span className="text-sm font-medium">{t('demo.mockups.teacherDashboard.mathClass')}</span>
            <div className="text-xs text-gray-500">{t('demo.mockups.teacherDashboard.mathTopic')}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-green-600">{t('demo.mockups.teacherDashboard.mathUnderstood')}</span>
            <span className="text-xs text-gray-500">4.2★</span>
          </div>
        </div>
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
          <div>
            <span className="text-sm font-medium">{t('demo.mockups.teacherDashboard.scienceClass')}</span>
            <div className="text-xs text-gray-500">{t('demo.mockups.teacherDashboard.scienceTopic')}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-green-600">{t('demo.mockups.teacherDashboard.scienceUnderstood')}</span>
            <span className="text-xs text-gray-500">4.7★</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboardMockup;
