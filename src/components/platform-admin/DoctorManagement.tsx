import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { hashPassword } from '@/services/securePasswordService';
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

  const setAdminContext = async () => {
    if (admin?.email) {
      try {
        await supabase.rpc('set_platform_admin_context', { admin_email: admin.email });
      } catch (error) {
        console.error('Error setting admin context:', error);
      }
    }
  };

  const fetchDoctors = async () => {
    try {
      await setAdminContext();
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('role', 'doctor')
        .order('name');

      if (error) throw error;
      setDoctors(data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Failed to fetch doctors');
    }
  };

  const fetchSchools = async () => {
    try {
      await setAdminContext();
      const { data, error } = await supabase
        .from('teachers')
        .select('school')
        .not('school', 'is', null);

      if (error) throw error;
      
      const uniqueSchools = [...new Set(data?.map(item => item.school) || [])];
      setSchools(uniqueSchools);
    } catch (error) {
      console.error('Error fetching schools:', error);
    }
  };

  const addDoctor = async () => {
    if (!newDoctor.name || !newDoctor.email || !newDoctor.school || !newDoctor.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      await setAdminContext();
      const passwordHash = await hashPassword(newDoctor.password);

      const { error } = await supabase
        .from('teachers')
        .insert({
          name: newDoctor.name,
          email: newDoctor.email,
          school: newDoctor.school,
          role: 'doctor',
          specialization: newDoctor.specialization || null,
          license_number: newDoctor.license_number || null,
          password_hash: passwordHash,
          is_available: true
        });

      if (error) throw error;

      toast.success('Doctor added successfully');
      setNewDoctor({
        name: '',
        email: '',
        school: '',
        specialization: '',
        license_number: '',
        password: ''
      });
      fetchDoctors();
    } catch (error) {
      console.error('Error adding doctor:', error);
      toast.error('Failed to add doctor');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDoctor = async (doctorId: string, doctorName: string) => {
    if (!confirm(`Are you sure you want to delete Dr. ${doctorName}?`)) {
      return;
    }

    setIsLoading(true);
    try {
      await setAdminContext();
      const { error } = await supabase
        .from('teachers')
        .delete()
        .eq('id', doctorId);

      if (error) throw error;

      toast.success('Doctor deleted successfully');
      fetchDoctors();
    } catch (error) {
      console.error('Error deleting doctor:', error);
      toast.error('Failed to delete doctor');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
    fetchSchools();
  }, []);

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
              />
            </div>
            <div>
              <Label htmlFor="doctorSchool">School/Hospital *</Label>
              <Select
                value={newDoctor.school}
                onValueChange={(value) => setNewDoctor(prev => ({ ...prev, school: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select school/hospital" />
                </SelectTrigger>
                <SelectContent>
                  {schools.map((school) => (
                    <SelectItem key={school} value={school}>
                      {school}
                    </SelectItem>
                  ))}
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
              />
            </div>
            <div>
              <Label htmlFor="doctorLicense">License Number</Label>
              <Input
                id="doctorLicense"
                value={newDoctor.license_number}
                onChange={(e) => setNewDoctor(prev => ({ ...prev, license_number: e.target.value }))}
                placeholder="Medical license number"
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
              />
            </div>
            <div className="md:col-span-2">
              <Button onClick={addDoctor} disabled={isLoading} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Doctor
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
