
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, School, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { usePlatformAdmin } from '@/contexts/PlatformAdminContext';
import { securePlatformAdminService } from '@/services/securePlatformAdminService';

interface School {
  name: string;
  teacher_count: number;
  student_count: number;
}

interface SchoolManagementProps {
  onDataChange?: () => void;
}

const SchoolManagement: React.FC<SchoolManagementProps> = ({ onDataChange }) => {
  const { admin } = usePlatformAdmin();
  const [schools, setSchools] = useState<School[]>([]);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermissionError, setHasPermissionError] = useState(false);

  const fetchSchools = async () => {
    if (!admin?.email) {
      console.warn('No admin email available');
      return;
    }

    try {
      console.log('🏫 Fetching schools...');
      setHasPermissionError(false);
      
      const schoolData = await securePlatformAdminService.getSchoolData(admin.email);
      setSchools(schoolData);
      console.log(`✅ Schools loaded: ${schoolData.length} schools`);
      
    } catch (error) {
      console.error('❌ Error fetching schools:', error);
      
      if (error instanceof Error && error.message.includes('permission denied')) {
        setHasPermissionError(true);
        toast.error('Database permissions issue detected. Some features may be limited.');
      } else {
        toast.error(`Failed to load schools: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      setSchools([]);
    }
  };

  const addSchool = async () => {
    if (!newSchoolName.trim()) {
      toast.error('Please enter a school name');
      return;
    }

    if (!admin?.email) {
      toast.error('Admin authentication required');
      return;
    }

    setIsLoading(true);
    try {
      console.log('➕ Adding school:', newSchoolName.trim());
      
      await securePlatformAdminService.createSchool(admin.email, newSchoolName.trim());

      console.log('✅ School created successfully');
      toast.success(`School "${newSchoolName}" added successfully`);
      setNewSchoolName('');
      await fetchSchools();
      
      if (onDataChange) {
        onDataChange();
      }
    } catch (error: any) {
      console.error('❌ Error adding school:', error);
      
      let errorMessage = 'Failed to add school';
      
      if (error.message?.includes('already exists')) {
        errorMessage = 'School administrator already exists';
      } else if (error.message?.includes('permission denied')) {
        errorMessage = 'Database access denied - please check permissions';
        setHasPermissionError(true);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSchool = async (schoolName: string) => {
    if (!confirm(`Are you sure you want to delete ${schoolName} and all associated data?`)) {
      return;
    }

    if (!admin?.email) {
      toast.error('Admin authentication required');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🗑️ Deleting school:', schoolName);
      
      await securePlatformAdminService.deleteSchool(admin.email, schoolName);

      console.log('✅ School deleted successfully');
      toast.success(`School "${schoolName}" deleted successfully`);
      
      await fetchSchools();
      
      if (onDataChange) {
        setTimeout(() => {
          onDataChange();
        }, 100);
      }
      
    } catch (error: any) {
      console.error('❌ Error deleting school:', error);
      
      let errorMessage = 'Failed to delete school';
      if (error.message?.includes('permission denied')) {
        errorMessage = 'Database access denied - please check permissions';
        setHasPermissionError(true);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <School className="w-5 h-5" />
          School Management
          {hasPermissionError && (
            <div className="flex items-center gap-1 text-orange-600">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs">Limited Access</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {hasPermissionError && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-orange-800">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">Database Permission Notice</span>
              </div>
              <p className="text-xs text-orange-700 mt-1">
                Some database operations may be restricted. The system is using fallback data where possible.
              </p>
            </div>
          )}

          {/* Add new school */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="schoolName">School Name</Label>
              <Input
                id="schoolName"
                value={newSchoolName}
                onChange={(e) => setNewSchoolName(e.target.value)}
                placeholder="Enter school name"
                disabled={isLoading}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !isLoading && newSchoolName.trim()) {
                    addSchool();
                  }
                }}
              />
            </div>
            <Button 
              onClick={addSchool} 
              disabled={isLoading || !newSchoolName.trim()}
              className="mt-6"
            >
              <Plus className="w-4 h-4 mr-2" />
              {isLoading ? 'Adding...' : 'Add School'}
            </Button>
          </div>

          {/* Schools list */}
          <div className="space-y-2">
            <h3 className="font-medium">Existing Schools ({schools.length})</h3>
            {schools.length === 0 ? (
              <div className="text-center py-8">
                <School className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-muted-foreground">No schools found</p>
                {hasPermissionError && (
                  <p className="text-xs text-orange-600 mt-1">
                    This may be due to database permission restrictions
                  </p>
                )}
              </div>
            ) : (
              schools.map((school) => (
                <div key={school.name} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <h4 className="font-medium">{school.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {school.teacher_count} teachers, {school.student_count} students
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteSchool(school.name)}
                    disabled={isLoading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SchoolManagement;
