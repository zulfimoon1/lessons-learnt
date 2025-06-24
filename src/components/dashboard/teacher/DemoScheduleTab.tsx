import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, BookOpen, Upload, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface DemoScheduleTabProps {
  teacher: {
    id: string;
    name: string;
    school: string;
    role: string;
  };
}

const DemoScheduleTab: React.FC<DemoScheduleTabProps> = ({ teacher }) => {
  const [formData, setFormData] = useState({
    grade: '',
    subject: '',
    lesson_topic: '',
    class_date: '',
    class_time: '',
    duration_minutes: '45',
    description: ''
  });
  const [demoSchedules, setDemoSchedules] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      // Simulate successful creation for demo
      const newSchedule = {
        id: `demo-${Date.now()}`,
        teacher_id: teacher.id,
        school: teacher.school,
        ...formData,
        duration_minutes: parseInt(formData.duration_minutes),
        created_at: new Date().toISOString()
      };

      // Add to demo schedules list
      setDemoSchedules(prev => [...prev, newSchedule]);

      // Reset form
      setFormData({
        grade: '',
        subject: '',
        lesson_topic: '',
        class_date: '',
        class_time: '',
        duration_minutes: '45',
        description: ''
      });

      toast({
        title: "Success!",
        description: "Demo class schedule created successfully",
      });

    } catch (error) {
      console.error('Demo schedule creation error:', error);
      toast({
        title: "Demo Success",
        description: "Class schedule created in demo mode",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleBulkUpload = () => {
    // Simulate bulk upload success
    const bulkSchedules = [
      {
        id: `bulk-demo-1-${Date.now()}`,
        teacher_id: teacher.id,
        school: teacher.school,
        grade: '9',
        subject: 'Mathematics',
        lesson_topic: 'Algebra Basics',
        class_date: new Date().toISOString().split('T')[0],
        class_time: '09:00',
        duration_minutes: 45,
        description: 'Introduction to algebraic equations'
      },
      {
        id: `bulk-demo-2-${Date.now()}`,
        teacher_id: teacher.id,
        school: teacher.school,
        grade: '10',
        subject: 'Science',
        lesson_topic: 'Chemistry Lab',
        class_date: new Date().toISOString().split('T')[0],
        class_time: '11:00',
        duration_minutes: 90,
        description: 'Hands-on chemistry experiments'
      }
    ];

    setDemoSchedules(prev => [...prev, ...bulkSchedules]);
    
    toast({
      title: "Bulk Upload Success!",
      description: `${bulkSchedules.length} demo schedules uploaded successfully`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Create Single Schedule Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {t('dashboard.createSchedule') || 'Create Class Schedule'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateSchedule} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="grade">Grade</Label>
                <Select value={formData.grade} onValueChange={(value) => handleInputChange('grade', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(grade => (
                      <SelectItem key={grade} value={grade.toString()}>{grade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder="e.g., Mathematics, Science, English"
                  required
                />
              </div>

              <div>
                <Label htmlFor="lesson_topic">Lesson Topic</Label>
                <Input
                  id="lesson_topic"
                  value={formData.lesson_topic}
                  onChange={(e) => handleInputChange('lesson_topic', e.target.value)}
                  placeholder="e.g., Introduction to Algebra"
                  required
                />
              </div>

              <div>
                <Label htmlFor="class_date">Class Date</Label>
                <Input
                  id="class_date"
                  type="date"
                  value={formData.class_date}
                  onChange={(e) => handleInputChange('class_date', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="class_time">Class Time</Label>
                <Input
                  id="class_time"
                  type="time"
                  value={formData.class_time}
                  onChange={(e) => handleInputChange('class_time', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Select value={formData.duration_minutes} onValueChange={(value) => handleInputChange('duration_minutes', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Additional details about the class..."
                rows={3}
              />
            </div>

            <Button type="submit" disabled={isCreating} className="w-full">
              {isCreating ? 'Creating...' : 'Create Schedule'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Bulk Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            {t('dashboard.bulkUpload') || 'Bulk Upload Schedules'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              In demo mode, click the button below to simulate uploading multiple schedules at once.
            </p>
            <Button onClick={handleBulkUpload} variant="outline" className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              Demo Bulk Upload (2 sample schedules)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing Schedules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            My Class Schedules ({demoSchedules.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {demoSchedules.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No class schedules created yet. Create your first schedule above.
            </p>
          ) : (
            <div className="grid gap-4">
              {demoSchedules.map((schedule) => (
                <Card key={schedule.id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h4 className="font-semibold flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          {schedule.subject} - {schedule.lesson_topic}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Grade {schedule.grade} | {schedule.school}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(schedule.class_date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {schedule.class_time} ({schedule.duration_minutes} min)
                          </span>
                        </div>
                        {schedule.description && (
                          <p className="text-sm text-gray-600 mt-2">
                            {schedule.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DemoScheduleTab;
