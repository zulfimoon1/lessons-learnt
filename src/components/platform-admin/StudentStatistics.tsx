
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp, Calendar, Award } from 'lucide-react';
import { usePlatformAdmin } from '@/contexts/PlatformAdminContext';
import { secureStudentService } from '@/services/secureStudentService';
import { StudentStatistics } from '@/types/adminTypes';

const StudentStatisticsComponent = () => {
  const { admin } = usePlatformAdmin();
  const [statistics, setStatistics] = useState<StudentStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      if (!admin?.email) {
        setError('Admin authentication required');
        setIsLoading(false);
        return;
      }

      try {
        console.log('🔍 Fetching student statistics securely...');
        const stats = await secureStudentService.getStudentStatistics(admin.email);
        setStatistics(stats);
        setError(null);
      } catch (err) {
        console.error('❌ Error fetching student statistics:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatistics();
  }, [admin]);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="text-red-600 text-center">
            <Users className="w-8 h-8 mx-auto mb-2" />
            <p>Error loading student statistics: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!statistics) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-gray-500 text-center">
            <Users className="w-8 h-8 mx-auto mb-2" />
            <p>No student statistics available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Across all schools
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.activeStudents}</div>
            <p className="text-xs text-muted-foreground">
              Active in last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.studentsThisWeek}</div>
            <p className="text-xs text-muted-foreground">
              Students joined this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.averageGrade}</div>
            <p className="text-xs text-muted-foreground">
              Across all schools
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Schools by Student Count</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {statistics.topPerformingSchools.map((school, index) => (
              <div key={school.school} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                  <span className="font-medium">{school.school}</span>
                </div>
                <span className="text-sm text-gray-600">{school.studentCount} students</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentStatisticsComponent;
