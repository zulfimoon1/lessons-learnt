import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, UserCheck, UserX, MoreVertical, Pause, Trash2, Users } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";

interface Teacher {
  id: string;
  name: string;
  email: string;
  role: string;
  specialization?: string;
  is_available?: boolean;
}

interface TeacherManagementProps {
  school: string;
}

const TeacherManagement: React.FC<TeacherManagementProps> = ({ school }) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [bulkAction, setBulkAction] = useState<'pause' | 'activate'>('pause');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'teacher',
    specialization: '',
    password: ''
  });
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    fetchTeachers();
  }, [school]);

  const fetchTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('school', school)
        .neq('role', 'admin'); // Don't show admins in this list

      if (error) throw error;
      setTeachers(data || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch teachers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Generate a simple password hash (in production, use proper bcrypt)
      const passwordHash = btoa(formData.password); // Simple base64 encoding for demo

      const { data, error } = await supabase
        .from('teachers')
        .insert([{
          name: formData.name,
          email: formData.email,
          school: school,
          role: formData.role,
          specialization: formData.specialization || null,
          password_hash: passwordHash
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: `${formData.role === 'doctor' ? 'Doctor' : 'Teacher'} added successfully`,
      });

      setFormData({ name: '', email: '', role: 'teacher', specialization: '', password: '' });
      setShowAddForm(false);
      fetchTeachers();
    } catch (error) {
      console.error('Error adding teacher:', error);
      toast({
        title: "Error",
        description: "Failed to add teacher. Email might already exist.",
        variant: "destructive",
      });
    }
  };

  const toggleAvailability = async (teacherId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('teachers')
        .update({ is_available: !currentStatus })
        .eq('id', teacherId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Staff member ${currentStatus ? 'paused' : 'activated'} successfully`,
      });

      fetchTeachers();
    } catch (error) {
      console.error('Error updating availability:', error);
      toast({
        title: "Error",
        description: "Failed to update availability",
        variant: "destructive",
      });
    }
  };

  const removeTeacher = async (teacherId: string, teacherName: string) => {
    if (!confirm(`Are you sure you want to remove ${teacherName} from the school? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('teachers')
        .delete()
        .eq('id', teacherId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${teacherName} has been removed from the school`,
      });

      fetchTeachers();
    } catch (error) {
      console.error('Error removing teacher:', error);
      toast({
        title: "Error",
        description: "Failed to remove teacher",
        variant: "destructive",
      });
    }
  };

  const handleBulkAction = async () => {
    if (selectedTeachers.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one staff member",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('teachers')
        .update({ is_available: bulkAction === 'activate' })
        .in('id', selectedTeachers);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${selectedTeachers.length} staff member(s) ${bulkAction === 'activate' ? 'activated' : 'paused'} successfully`,
      });

      setSelectedTeachers([]);
      setShowBulkDialog(false);
      fetchTeachers();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast({
        title: "Error",
        description: "Failed to perform bulk action",
        variant: "destructive",
      });
    }
  };

  const toggleSelectTeacher = (teacherId: string) => {
    setSelectedTeachers(prev => 
      prev.includes(teacherId) 
        ? prev.filter(id => id !== teacherId)
        : [...prev, teacherId]
    );
  };

  const selectAllTeachers = () => {
    if (selectedTeachers.length === teachers.length) {
      setSelectedTeachers([]);
    } else {
      setSelectedTeachers(teachers.map(t => t.id));
    }
  };

  if (isLoading) {
    return <div>Loading teachers...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>School Staff Management</CardTitle>
          <div className="flex gap-2">
            <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={selectedTeachers.length === 0}>
                  <Users className="w-4 h-4 mr-2" />
                  Bulk Actions ({selectedTeachers.length})
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Bulk Staff Management</DialogTitle>
                  <DialogDescription>
                    Select an action to apply to {selectedTeachers.length} selected staff member(s).
                    This is useful for school holidays or temporary suspensions.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="bulkAction">Action</Label>
                    <Select value={bulkAction} onValueChange={(value: 'pause' | 'activate') => setBulkAction(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pause">Pause (School Holiday/Temporary)</SelectItem>
                        <SelectItem value="activate">Activate (Resume)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleBulkAction}>
                    Apply to {selectedTeachers.length} Staff Member(s)
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Staff Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showAddForm && (
            <form onSubmit={handleAddTeacher} className="space-y-4 mb-6 p-4 border rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="doctor">School Psychologist</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="password">Temporary Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              </div>

              {formData.role === 'doctor' && (
                <div>
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    placeholder="e.g., Child Psychology, Counseling"
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit">Add {formData.role === 'doctor' ? 'Psychologist' : 'Teacher'}</Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {teachers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No teachers or staff members added yet.
              </p>
            ) : (
              <>
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Checkbox
                    checked={selectedTeachers.length === teachers.length}
                    onCheckedChange={selectAllTeachers}
                  />
                  <span className="text-sm text-muted-foreground">
                    {selectedTeachers.length === teachers.length ? 'Deselect All' : 'Select All'}
                  </span>
                </div>
                {teachers.map((teacher) => (
                  <div key={teacher.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedTeachers.includes(teacher.id)}
                        onCheckedChange={() => toggleSelectTeacher(teacher.id)}
                      />
                      <div>
                        <h4 className="font-medium">{teacher.name}</h4>
                        <p className="text-sm text-muted-foreground">{teacher.email}</p>
                        <div className="flex gap-2 mt-1">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {teacher.role === 'doctor' ? 'Psychologist' : 'Teacher'}
                          </span>
                          {teacher.specialization && (
                            <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                              {teacher.specialization}
                            </span>
                          )}
                          <span className={`text-xs px-2 py-1 rounded ${
                            teacher.is_available 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {teacher.is_available ? 'Active' : 'Paused'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => toggleAvailability(teacher.id, teacher.is_available || false)}
                          >
                            {teacher.is_available ? (
                              <>
                                <Pause className="w-4 h-4 mr-2" />
                                Pause Staff Member
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-4 h-4 mr-2" />
                                Activate Staff Member
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => removeTeacher(teacher.id, teacher.name)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove from School
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherManagement;
