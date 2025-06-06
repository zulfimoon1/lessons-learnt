
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { HeartHandshakeIcon, EditIcon, TrashIcon } from "lucide-react";

interface SchoolPsychologist {
  id: string;
  name: string;
  email: string;
  phone?: string;
  office_location?: string;
  availability_hours?: string;
}

interface SchoolPsychologistFormProps {
  school: string;
}

const SchoolPsychologistForm = ({ school }: SchoolPsychologistFormProps) => {
  const [psychologists, setPsychologists] = useState<SchoolPsychologist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    office_location: '',
    availability_hours: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadPsychologists();
  }, [school]);

  const loadPsychologists = async () => {
    try {
      const { data, error } = await supabase
        .from('school_psychologists')
        .select('*')
        .eq('school', school);

      if (error) throw error;
      setPsychologists(data || []);
    } catch (error) {
      console.error('Error loading psychologists:', error);
      toast({
        title: "Error",
        description: "Failed to load school psychologists",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isEditing) {
        const { error } = await supabase
          .from('school_psychologists')
          .update({
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim() || null,
            office_location: formData.office_location.trim() || null,
            availability_hours: formData.availability_hours.trim() || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', isEditing);

        if (error) throw error;

        toast({
          title: "Success",
          description: "School psychologist updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('school_psychologists')
          .insert({
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim() || null,
            office_location: formData.office_location.trim() || null,
            availability_hours: formData.availability_hours.trim() || null,
            school
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "School psychologist added successfully",
        });
      }

      resetForm();
      loadPsychologists();
    } catch (error) {
      console.error('Error saving psychologist:', error);
      toast({
        title: "Error",
        description: `Failed to save psychologist: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (psychologist: SchoolPsychologist) => {
    setFormData({
      name: psychologist.name,
      email: psychologist.email,
      phone: psychologist.phone || '',
      office_location: psychologist.office_location || '',
      availability_hours: psychologist.availability_hours || ''
    });
    setIsEditing(psychologist.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this psychologist?')) return;

    try {
      const { error } = await supabase
        .from('school_psychologists')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "School psychologist deleted successfully",
      });
      loadPsychologists();
    } catch (error) {
      console.error('Error deleting psychologist:', error);
      toast({
        title: "Error",
        description: "Failed to delete psychologist",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      office_location: '',
      availability_hours: ''
    });
    setIsEditing(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HeartHandshakeIcon className="w-5 h-5" />
          School Psychologist Management
        </CardTitle>
        <CardDescription>
          Manage mental health professionals for {school}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Dr. Jane Smith"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="jane.smith@school.edu"
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <Label htmlFor="office_location">Office Location</Label>
              <Input
                id="office_location"
                value={formData.office_location}
                onChange={(e) => setFormData(prev => ({ ...prev, office_location: e.target.value }))}
                placeholder="Room 101, Building A"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="availability_hours">Availability Hours</Label>
            <Textarea
              id="availability_hours"
              value={formData.availability_hours}
              onChange={(e) => setFormData(prev => ({ ...prev, availability_hours: e.target.value }))}
              placeholder="Monday-Friday: 9:00 AM - 5:00 PM"
              rows={3}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : isEditing ? 'Update Psychologist' : 'Add Psychologist'}
            </Button>
            {isEditing && (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>
        </form>

        {psychologists.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Current Psychologists</h3>
            <div className="space-y-3">
              {psychologists.map((psychologist) => (
                <div key={psychologist.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium">{psychologist.name}</h4>
                      <p className="text-sm text-gray-600">{psychologist.email}</p>
                      {psychologist.phone && (
                        <p className="text-sm text-gray-600">Phone: {psychologist.phone}</p>
                      )}
                      {psychologist.office_location && (
                        <p className="text-sm text-gray-600">Office: {psychologist.office_location}</p>
                      )}
                      {psychologist.availability_hours && (
                        <p className="text-sm text-gray-600">Hours: {psychologist.availability_hours}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(psychologist)}
                      >
                        <EditIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(psychologist.id)}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SchoolPsychologistForm;
