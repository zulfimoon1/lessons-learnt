
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Users, Search, UserPlus, Trash2, Shield } from 'lucide-react';

interface Teacher {
  id: string;
  name: string;
  email: string;
  school: string;
  role: string;
  subscription_status: string;
  created_at: string;
}

const TeacherManagement: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [admins, setAdmins] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'teachers' | 'admins'>('teachers');
  const { toast } = useToast();

  const fetchTeachersAndAdmins = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('platform-admin', {
        body: {
          action: 'getTeachers',
          adminEmail: 'zulfimoon1@gmail.com'
        }
      });

      if (error) throw error;

      if (data.teachers) {
        // Separate teachers and admins
        const teachersList = data.teachers.filter((t: Teacher) => t.role === 'teacher');
        const adminsList = data.teachers.filter((t: Teacher) => t.role === 'admin');
        
        setTeachers(teachersList);
        setAdmins(adminsList);
        console.log('📊 Loaded teachers:', teachersList.length, 'admins:', adminsList.length);
      }
    } catch (error: any) {
      console.error('Error fetching teachers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch teachers and admins",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachersAndAdmins();
  }, []);

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.school.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAdmins = admins.filter(admin =>
    admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.school.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Admin</Badge>;
      case 'teacher':
        return <Badge variant="secondary">Teacher</Badge>;
      case 'doctor':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Psychologist</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'teachers' ? 'default' : 'outline'}
            onClick={() => setActiveTab('teachers')}
            className="flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Teachers ({teachers.length})
          </Button>
          <Button
            variant={activeTab === 'admins' ? 'default' : 'outline'}
            onClick={() => setActiveTab('admins')}
            className="flex items-center gap-2"
          >
            <Shield className="w-4 h-4" />
            Admins ({admins.length})
          </Button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {activeTab === 'teachers' ? (
              <>
                <Users className="w-5 h-5" />
                Teachers ({filteredTeachers.length})
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                Platform Admins ({filteredAdmins.length})
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Name</th>
                  <th className="text-left p-3 font-medium">Email</th>
                  <th className="text-left p-3 font-medium">School</th>
                  <th className="text-left p-3 font-medium">Role</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {(activeTab === 'teachers' ? filteredTeachers : filteredAdmins).map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{user.name}</td>
                    <td className="p-3 text-gray-600">{user.email}</td>
                    <td className="p-3">{user.school}</td>
                    <td className="p-3">{getRoleBadge(user.role)}</td>
                    <td className="p-3">{getStatusBadge(user.subscription_status)}</td>
                    <td className="p-3 text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {(activeTab === 'teachers' ? filteredTeachers : filteredAdmins).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No {activeTab} found</p>
                {searchTerm && (
                  <p className="text-sm">Try adjusting your search terms</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherManagement;
