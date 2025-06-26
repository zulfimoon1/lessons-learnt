
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, User, Shield, Search, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface StudentLoginActivityProps {
  teacher: {
    id: string;
    name: string;
    school: string;
  };
}

interface LoginActivity {
  id: string;
  student_id: string | null;
  login_timestamp: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  success: boolean | null;
  school: string;
  grade?: string | null;
  student_name?: string;
}

const StudentLoginActivity: React.FC<StudentLoginActivityProps> = ({ teacher }) => {
  const [activities, setActivities] = useState<LoginActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredActivities, setFilteredActivities] = useState<LoginActivity[]>([]);

  useEffect(() => {
    fetchLoginActivity();
  }, [teacher.school]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = activities.filter(activity => 
        activity.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.grade?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredActivities(filtered);
    } else {
      setFilteredActivities(activities);
    }
  }, [searchTerm, activities]);

  const fetchLoginActivity = async () => {
    try {
      setLoading(true);
      
      // Fetch login activities for students in teacher's school
      const { data: loginData, error: loginError } = await supabase
        .from('student_login_activity')
        .select(`
          *,
          students!inner(
            full_name,
            grade,
            session_timeout_minutes,
            grade_level
          )
        `)
        .eq('school', teacher.school)
        .order('login_timestamp', { ascending: false })
        .limit(100);

      if (loginError) throw loginError;

      // Transform the data to include student names with proper typing
      const activitiesWithNames: LoginActivity[] = loginData?.map(activity => ({
        id: activity.id,
        student_id: activity.student_id,
        login_timestamp: activity.login_timestamp,
        ip_address: typeof activity.ip_address === 'string' ? activity.ip_address : null,
        user_agent: activity.user_agent,
        success: activity.success,
        school: activity.school,
        grade: activity.grade,
        student_name: activity.students?.full_name || 'Unknown Student'
      })) || [];

      setActivities(activitiesWithNames);
    } catch (error) {
      console.error('Error fetching login activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (success: boolean | null) => {
    return success ? (
      <Shield className="w-4 h-4 text-green-500" />
    ) : (
      <Shield className="w-4 h-4 text-red-500" />
    );
  };

  const getTimeAgo = (timestamp: string | null) => {
    if (!timestamp) return 'Unknown';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading student activity...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand-teal" />
            Student Login Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              Monitor student login activity to ensure account security and help with password issues.
              Younger students have shorter session timeouts for added security.
            </AlertDescription>
          </Alert>

          {/* Search filter */}
          <div className="flex items-center gap-2">
            <Label htmlFor="search" className="sr-only">Search students</Label>
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by student name or grade..."
                className="pl-10"
              />
            </div>
            <Button onClick={fetchLoginActivity} variant="outline" size="sm">
              Refresh
            </Button>
          </div>

          {/* Activity list */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No student login activity found</p>
                {searchTerm && <p className="text-sm">Try adjusting your search terms</p>}
              </div>
            ) : (
              filteredActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                  <div className="flex items-center gap-3">
                    {getActivityIcon(activity.success)}
                    <div>
                      <p className="font-medium text-gray-900">
                        {activity.student_name}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Badge variant="outline" className="text-xs">
                          {activity.grade}
                        </Badge>
                        <span>•</span>
                        <Calendar className="w-3 h-3" />
                        <span>
                          {activity.login_timestamp 
                            ? format(new Date(activity.login_timestamp), 'MMM d, h:mm a')
                            : 'Unknown time'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Badge 
                      variant={activity.success ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {activity.success ? 'Success' : 'Failed'}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {getTimeAgo(activity.login_timestamp)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-4 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-brand-teal">
                {activities.filter(a => a.success).length}
              </p>
              <p className="text-sm text-gray-600">Successful Logins</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">
                {activities.filter(a => !a.success).length}
              </p>
              <p className="text-sm text-gray-600">Failed Attempts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-700">
                {new Set(activities.map(a => a.student_id).filter(Boolean)).size}
              </p>
              <p className="text-sm text-gray-600">Active Students</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentLoginActivity;
