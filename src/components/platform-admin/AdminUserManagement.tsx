
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserPlus, Search, Shield } from 'lucide-react';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  school: string;
  role: string;
  subscription_status: string;
  created_at: string;
}

const AdminUserManagement: React.FC = () => {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchAdminUsers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('platform-admin', {
        body: {
          operation: 'getAdminUsers',
          adminEmail: 'zulfimoon1@gmail.com'
        }
      });

      if (error) throw error;

      if (data?.success && data?.data) {
        setAdminUsers(data.data.admins || []);
        console.log('📊 Loaded admin users:', data.data.admins?.length || 0);
      }
    } catch (error: any) {
      console.error('Error fetching admin users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch admin users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  const filteredAdminUsers = adminUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    return <Badge variant="default" className="bg-purple-100 text-purple-800">Platform Admin</Badge>;
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
        <h2 className="text-2xl font-bold">Platform Admin Users</h2>
        <Button className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Add Admin User
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search admin users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Platform Admin Users ({filteredAdminUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Name</th>
                  <th className="text-left p-3 font-medium">Email</th>
                  <th className="text-left p-3 font-medium">Role</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdminUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{user.name}</td>
                    <td className="p-3 text-gray-600">{user.email}</td>
                    <td className="p-3">{getRoleBadge(user.role)}</td>
                    <td className="p-3">{getStatusBadge(user.subscription_status)}</td>
                    <td className="p-3 text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredAdminUsers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No admin users found</p>
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

export default AdminUserManagement;
