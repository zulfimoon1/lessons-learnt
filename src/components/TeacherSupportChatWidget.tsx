import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquareIcon, AlertCircleIcon } from "lucide-react";

interface TeacherSupportChatWidgetProps {
  teacher: {
    id: string;
    name: string;
    email: string;
    school: string;
  };
}

const TeacherSupportChatWidget: React.FC<TeacherSupportChatWidgetProps> = ({ teacher }) => {
  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <AlertCircleIcon className="h-5 w-5" />
          Database Setup Required
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-orange-700 mb-4">
          The teacher-psychologist chat feature is ready but requires database tables to be created first.
        </p>
        <p className="text-sm text-orange-600">
          Please approve the database migration to enable this feature.
        </p>
      </CardContent>
    </Card>
  );
};

export default TeacherSupportChatWidget;