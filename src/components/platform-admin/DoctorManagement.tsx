
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { usePlatformAdmin } from '@/contexts/PlatformAdminContext';

interface Doctor {
  id: string;
  name: string;
  email: string;
  school: string;
  specialization?: string;
  license_number?: string;
  is_available: boolean;
}

const DoctorManagement: React.FC = () => {
  const { admin } = usePlatformAdmin();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [schools, setSchools] = useState<string[]>([]);
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    email: '',
    school: '',
    specialization: '',
    license_number: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchDoctorsViaEdgeFunction = async () => {
    try {
      console.log('🔄 Fetching doctors via edge function...');
      const { data, error } = await supabase.functions.invoke('platform-admin', {
        body: {
          operation: 'getDoctors',
          adminEmail: admin?.email
        }
      });

      if (error) throw error;
      
      if (data?.success) {
        console.log('✅ Doctors fetched:', data.data?.length || 0);
        setDoctors(data.data || []);
      } else {
        throw new Error(data?.error || 'Failed to fetch doctors');
      }
    } catch (error) {
      console.error('❌ Error fetching doctors:', error);
      toast.error('Failed to fetch doctors');
      setDoctors([]);
    }
  };

  const fetchSchoolsViaEdgeFunction = async () => {
    try {
      console.log('🔄 Fetching schools via edge function...');
      const { data, error } = await supabase.functions.invoke('platform-admin', {
        body: {
          operation: 'getSchoolData',
          adminEmail: admin?.email
        }
      });

      if (error) throw error;
      
      if (data?.success) {
        const schoolNames = (data.data || []).map((school: any) => school.name);
        console.log('✅ Schools fetched:', schoolNames.length);
        setSchools(schoolNames);
      } else {
        throw new Error(data?.error || 'Failed to fetch schools');
      }
    } catch (error) {
      console.error('❌ Error fetching schools:', error);
      setSchools([]);
    }
  };

  const addDoctor = async () => {
    if (!newDoctor.name || !newDoctor.email || !newDoctor.school || !newDoctor.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!admin?.email) {
      toast.error('Admin authentication required');
      return;
    }

    setIsLoading(true);
    try {
      console.log('👩‍⚕️ Creating new doctor:', newDoctor.name);

      const { data, error } = await supabase.functions.invoke('platform-admin', {
        body: {
          operation: 'createDoctor',
          adminEmail: admin.email,
          doctorData: newDoctor
        }
      });

      if (error) throw error;
      
      if (data?.success) {
        console.log('✅ Doctor created successfully');
        toast.success('Doctor added successfully');
        
        setNewDoctor({
          name: '',
          email: '',
          school: '',
          specialization: '',
          license_number: '',
          password: ''
        });
        
        fetchDoctorsViaEdgeFunction();
      } else {
        throw new Error(data?.error || 'Failed to create doctor');
      }
    } catch (error) {
      console.error('💥 Error adding doctor:', error);
      if (error.message?.includes('unique constraint')) {
        toast.error('A doctor with this email already exists');
      } else {
        toast.error(`Failed to add doctor: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDoctor = async (doctorId: string, doctorName: string) => {
    if (!confirm(`Are you sure you want to delete Dr. ${doctorName}?`)) {
      return;
    }

    if (!admin?.email) {
      toast.error('Admin authentication required');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🗑️ Deleting doctor:', doctorName);
      
      const { data, error } = await supabase.functions.invoke('platform-admin', {
        body: {
          operation: 'deleteDoctor',
          adminEmail: admin.email,
          doctorId: doctorId
        }
      });

      if (error) throw error;
      
      if (data?.success) {
        console.log('✅ Doctor deleted successfully');
        toast.success('Doctor deleted successfully');
        fetchDoctorsViaEdgeFunction();
      } else {
        throw new Error(data?.error || 'Failed to delete doctor');
      }
    } catch (error) {
      console.error('💥 Error deleting doctor:', error);
      toast.error(`Failed to delete doctor: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (admin?.email) {
      console.log('🚀 Starting doctor management data fetch...');
      fetchDoctorsViaEdgeFunction();
      fetchSchoolsViaEdgeFunction();
    }
  }, [admin?.email]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Doctor Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Add new doctor form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded">
            <div>
              <Label htmlFor="doctorName">Name *</Label>
              <Input
                id="doctorName"
                value={newDoctor.name}
                onChange={(e) => setNewDoctor(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Dr. John Smith"
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="doctorEmail">Email *</Label>
              <Input
                id="doctorEmail"
                type="email"
                value={newDoctor.email}
                onChange={(e) => setNewDoctor(prev => ({ ...prev, email: e.target.value }))}
                placeholder="doctor@hospital.com"
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="doctorSchool">School/Hospital *</Label>
              <Select
                value={newDoctor.school}
                onValueChange={(value) => setNewDoctor(prev => ({ ...prev, school: value }))}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select school/hospital" />
                </SelectTrigger>
                <SelectContent>
                  {schools.length > 0 ? (
                    schools.map((school) => (
                      <SelectItem key={school} value={school}>
                        {school}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="__no_schools__" disabled>
                      No schools available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="doctorSpecialization">Specialization</Label>
              <Input
                id="doctorSpecialization"
                value={newDoctor.specialization}
                onChange={(e) => setNewDoctor(prev => ({ ...prev, specialization: e.target.value }))}
                placeholder="Psychology, Psychiatry, etc."
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="doctorLicense">License Number</Label>
              <Input
                id="doctorLicense"
                value={newDoctor.license_number}
                onChange={(e) => setNewDoctor(prev => ({ ...prev, license_number: e.target.value }))}
                placeholder="Medical license number"
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="doctorPassword">Password *</Label>
              <Input
                id="doctorPassword"
                type="password"
                value={newDoctor.password}
                onChange={(e) => setNewDoctor(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Password"
                disabled={isLoading}
              />
            </div>
            <div className="md:col-span-2">
              <Button onClick={addDoctor} disabled={isLoading} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                {isLoading ? 'Adding...' : 'Add Doctor'}
              </Button>
            </div>
          </div>

          {/* Doctors list */}
          <div className="space-y-2">
            <h3 className="font-medium">Existing Doctors ({doctors.length})</h3>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {doctors.length === 0 ? (
                <p className="text-muted-foreground">No doctors found</p>
              ) : (
                doctors.map((doctor) => (
                  <div key={doctor.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <h4 className="font-medium">Dr. {doctor.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {doctor.email} • {doctor.school}
                        {doctor.specialization && ` • ${doctor.specialization}`}
                        {doctor.license_number && ` • License: ${doctor.license_number}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Status: {doctor.is_available ? 'Available' : 'Unavailable'}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteDoctor(doctor.id, doctor.name)}
                      disabled={isLoading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DoctorManagement;
