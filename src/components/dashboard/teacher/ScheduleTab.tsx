
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ClassScheduleForm from '@/components/ClassScheduleForm';
import BulkScheduleUpload from '@/components/BulkScheduleUpload';
import ClassScheduleCalendar from './ClassScheduleCalendar';
import { Calendar, Clock, Eye } from 'lucide-react';

interface ScheduleTabProps {
  teacher: {
    id: string;
    school: string;
    name: string;
    role: string;
  };
}

const ScheduleTab: React.FC<ScheduleTabProps> = ({ teacher }) => {
  const handleUploadComplete = () => {
    console.log('Schedule upload completed');
    // Refresh schedules or show success message
    window.location.reload(); // Simple refresh for now
  };

  return (
    <div className="space-y-6">
      {/* Header Section - Matching AI Insights Style */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-brand-teal to-brand-orange flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Class Schedule</h2>
            <p className="text-gray-600">
              Create, manage, and view your class schedules
            </p>
          </div>
        </div>
      </div>

      {/* Calendar View Section */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Eye className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg text-gray-900">Schedule Overview</CardTitle>
              <CardDescription className="text-sm">View and manage your scheduled classes</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ClassScheduleCalendar teacher={teacher} />
        </CardContent>
      </Card>

      {/* Create & Upload Section */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {/* Create Schedule */}
        <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-brand-teal/5 to-brand-teal/10 hover:from-brand-teal/10 hover:to-brand-teal/20">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-teal/10 flex items-center justify-center group-hover:bg-brand-teal/20 transition-colors">
                <Calendar className="w-4 h-4 text-brand-teal" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-900">Create Schedule</CardTitle>
                <CardDescription className="text-sm">Schedule individual classes</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ClassScheduleForm teacher={teacher} />
          </CardContent>
        </Card>

        {/* Bulk Upload */}
        <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-brand-orange/5 to-brand-orange/10 hover:from-brand-orange/10 hover:to-brand-orange/20">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-orange/10 flex items-center justify-center group-hover:bg-brand-orange/20 transition-colors">
                <Clock className="w-4 h-4 text-brand-orange" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-900">Bulk Upload</CardTitle>
                <CardDescription className="text-sm">Upload multiple schedules at once</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <BulkScheduleUpload teacher={teacher} onUploadComplete={handleUploadComplete} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ScheduleTab;
