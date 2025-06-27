import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, UserCheck, UserX, MoreVertical, Pause, Trash2, Users, Calendar, CreditCard, Mail } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import TeacherInvitationForm from "./TeacherInvitationForm";
import PendingInvitations from "./PendingInvitations";

interface Teacher {
  id: string;
  name: string;
  email: string;
  role: string;
  specialization?: string;
  is_available?: boolean;
  pause_start_date?: string;
  pause_end_date?: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  subscription_status?: string;
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
  const [showIndividualPauseDialog, setShowIndividualPauseDialog] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [pauseStartDate, setPauseStartDate] = useState<Date>();
  const [pauseEndDate, setPauseEndDate] = useState<Date>();
  const [bulkPauseStartDate, setBulkPauseStartDate] = useState<Date>();
  const [bulkPauseEndDate, setBulkPauseEndDate] = useState<Date>();
  const [isProcessingStripe, setIsProcessingStripe] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'teacher',
    specialization: '',
    password: ''
  });
  const { toast } = useToast();
  const { t } = useLanguage();
  const [invitationRefreshTrigger, setInvitationRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchTeachers();
  }, [school]);

  const fetchTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('school', school)
        .neq('role', 'admin');

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
      const passwordHash = btoa(formData.password);

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

  const manageTeacherSubscription = async (teacherId: string, action: 'pause' | 'resume', startDate?: Date, endDate?: Date) => {
    setIsProcessingStripe(true);
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) throw new Error("Authentication required");

      const { data: adminData } = await supabase
        .from('teachers')
        .select('email')
        .eq('id', currentUser.user.id)
        .single();

      if (!adminData) throw new Error("Admin verification failed");

      const requestBody = {
        action,
        teacherId,
        pauseStartDate: startDate?.toISOString(),
        pauseEndDate: endDate?.toISOString(),
        adminEmail: adminData.email
      };

      const { data, error } = await supabase.functions.invoke('manage-teacher-subscription', {
        body: requestBody
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Success",
          description: data.message + (action === 'pause' && data.billingPaused ? " (Billing paused)" : 
                                     action === 'resume' && data.billingResumed ? " (Billing resumed)" : ""),
        });
        
        fetchTeachers();
      } else {
        throw new Error(data.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error managing teacher subscription:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to manage subscription",
        variant: "destructive",
      });
    } finally {
      setIsProcessingStripe(false);
    }
  };

  const toggleAvailability = async (teacherId: string, currentStatus: boolean) => {
    if (!currentStatus) {
      // If activating, resume subscription
      await manageTeacherSubscription(teacherId, 'resume');
    } else {
      // If pausing, show date selection dialog
      setSelectedTeacherId(teacherId);
      setPauseStartDate(new Date());
      setPauseEndDate(undefined);
      setShowIndividualPauseDialog(true);
    }
  };

  const handleIndividualPause = async () => {
    if (!selectedTeacherId || !pauseStartDate) {
      toast({
        title: "Error",
        description: "Please select start date",
        variant: "destructive",
      });
      return;
    }

    await manageTeacherSubscription(selectedTeacherId, 'pause', pauseStartDate, pauseEndDate);
    
    setShowIndividualPauseDialog(false);
    setSelectedTeacherId(null);
    setPauseStartDate(undefined);
    setPauseEndDate(undefined);
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

    if (bulkAction === 'pause') {
      if (!bulkPauseStartDate) {
        toast({
          title: "Error",
          description: "Please select start date for pause period",
          variant: "destructive",
        });
        return;
      }

      // Process each teacher individually for proper Stripe handling
      for (const teacherId of selectedTeachers) {
        await manageTeacherSubscription(teacherId, 'pause', bulkPauseStartDate, bulkPauseEndDate);
      }

      toast({
        title: "Success",
        description: `${selectedTeachers.length} staff member(s) paused successfully`,
      });
    } else {
      // Activate (resume) selected teachers
      for (const teacherId of selectedTeachers) {
        await manageTeacherSubscription(teacherId, 'resume');
      }

      toast({
        title: "Success",
        description: `${selectedTeachers.length} staff member(s) activated successfully`,
      });
    }

    setSelectedTeachers([]);
    setShowBulkDialog(false);
    setBulkPauseStartDate(undefined);
    setBulkPauseEndDate(undefined);
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

  const handleInvitationSent = () => {
    setInvitationRefreshTrigger(prev => prev + 1);
  };

  if (isLoading) {
    return <div>Loading teachers...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>School Staff Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="manage" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="manage">Manage Staff</TabsTrigger>
              <TabsTrigger value="invite">Send Invitations</TabsTrigger>
              <TabsTrigger value="pending">Pending Invitations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="manage" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Current Staff Members</h3>
                <div className="flex gap-2">
                  <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" disabled={selectedTeachers.length === 0}>
                        <Users className="w-4 h-4 mr-2" />
                        Bulk Actions ({selectedTeachers.length})
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Bulk Staff Management</DialogTitle>
                        <DialogDescription>
                          Select an action to apply to {selectedTeachers.length} selected staff member(s).
                          {bulkAction === 'pause' && " (This will also pause Stripe billing where applicable)"}
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

                        {bulkAction === 'pause' && (
                          <>
                            <div>
                              <Label>Pause Start Date *</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !bulkPauseStartDate && "text-muted-foreground"
                                    )}
                                  >
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {bulkPauseStartDate ? format(bulkPauseStartDate, "PPP") : "Select start date"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <CalendarComponent
                                    mode="single"
                                    selected={bulkPauseStartDate}
                                    onSelect={setBulkPauseStartDate}
                                    initialFocus
                                    className="pointer-events-auto"
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>

                            <div>
                              <Label>Pause End Date (Optional)</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !bulkPauseEndDate && "text-muted-foreground"
                                    )}
                                  >
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {bulkPauseEndDate ? format(bulkPauseEndDate, "PPP") : "Select end date (optional)"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <CalendarComponent
                                    mode="single"
                                    selected={bulkPauseEndDate}
                                    onSelect={setBulkPauseEndDate}
                                    disabled={(date) => bulkPauseStartDate ? date < bulkPauseStartDate : false}
                                    initialFocus
                                    className="pointer-events-auto"
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                          </>
                        )}
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleBulkAction} disabled={isProcessingStripe}>
                          {isProcessingStripe ? 'Processing...' : `Apply to ${selectedTeachers.length} Staff Member(s)`}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button onClick={() => setShowAddForm(!showAddForm)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Staff Member
                  </Button>
                </div>
              </div>

              {/* Individual Pause Dialog */}
              <Dialog open={showIndividualPauseDialog} onOpenChange={setShowIndividualPauseDialog}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Pause Staff Member</DialogTitle>
                    <DialogDescription>
                      Set the pause period for this staff member. This will also pause Stripe billing if applicable.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Pause Start Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !pauseStartDate && "text-muted-foreground"
                            )}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {pauseStartDate ? format(pauseStartDate, "PPP") : "Select start date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={pauseStartDate}
                            onSelect={setPauseStartDate}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <Label>Pause End Date (Optional)</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !pauseEndDate && "text-muted-foreground"
                            )}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {pauseEndDate ? format(pauseEndDate, "PPP") : "Select end date (optional)"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={pauseEndDate}
                            onSelect={setPauseEndDate}
                            disabled={(date) => pauseStartDate ? date < pauseStartDate : false}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowIndividualPauseDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleIndividualPause} disabled={isProcessingStripe}>
                      {isProcessingStripe ? 'Processing...' : 'Pause Staff Member'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

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
                        onCheckedChange={() => {
                          if (selectedTeachers.length === teachers.length) {
                            setSelectedTeachers([]);
                          } else {
                            setSelectedTeachers(teachers.map(t => t.id));
                          }
                        }}
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
                            onCheckedChange={() => {
                              setSelectedTeachers(prev => 
                                prev.includes(teacher.id) 
                                  ? prev.filter(id => id !== teacher.id)
                                  : [...prev, teacher.id]
                              );
                            }}
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
                              {teacher.stripe_subscription_id && (
                                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded flex items-center gap-1">
                                  <CreditCard className="w-3 h-3" />
                                  {teacher.subscription_status || 'Billing Active'}
                                </span>
                              )}
                              {!teacher.is_available && teacher.pause_start_date && (
                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                  {format(new Date(teacher.pause_start_date), "MMM d")}
                                  {teacher.pause_end_date && ` - ${format(new Date(teacher.pause_end_date), "MMM d")}`}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" disabled={isProcessingStripe}>
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => toggleAvailability(teacher.id, teacher.is_available || false)}
                                disabled={isProcessingStripe}
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
                                disabled={isProcessingStripe}
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
            </TabsContent>
            
            <TabsContent value="invite" className="space-y-6">
              <TeacherInvitationForm 
                school={school} 
                onInvitationSent={handleInvitationSent}
              />
            </TabsContent>
            
            <TabsContent value="pending" className="space-y-6">
              <PendingInvitations 
                school={school} 
                refreshTrigger={invitationRefreshTrigger}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherManagement;
